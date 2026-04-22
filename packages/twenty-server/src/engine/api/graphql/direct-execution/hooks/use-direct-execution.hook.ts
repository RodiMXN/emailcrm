import * as Sentry from '@sentry/node';
import { type Request } from 'express';
import { DocumentNode, GraphQLError, parse } from 'graphql';
import { type Plugin } from 'graphql-yoga';

import { isNonEmptyString, isNull } from '@sniptt/guards';
import { type DirectExecutionService } from 'src/engine/api/graphql/direct-execution/direct-execution.service';
import { classifyTopLevelFields } from 'src/engine/api/graphql/direct-execution/utils/classify-top-level-fields.util';
import { findOperationDefinition } from 'src/engine/api/graphql/direct-execution/utils/find-operation-definition.util';
import { isSubscriptionOperation } from 'src/engine/api/graphql/direct-execution/utils/is-subscription-operation.util';
import { type FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

export type DirectExecutionPluginConfig = {
  directExecutionService: DirectExecutionService;
  featureFlagService: FeatureFlagService;
};

export function useDirectExecution(
  config: DirectExecutionPluginConfig,
): Plugin {
  return {
    onRequest: async ({ endResponse, serverContext, request }) => {
      const req = (serverContext as unknown as { req: Request }).req;

      const readRequestBodyFromRawString = (
        rawBody: string,
      ):
        | {
            query?: string;
            operationName?: string;
            variables?: Record<string, unknown>;
          }
        | undefined => {
        if (!isNonEmptyString(rawBody)) {
          return undefined;
        }

        const trimmedRawBody = rawBody.trim();

        try {
          const parsedJsonBody = JSON.parse(trimmedRawBody) as {
            query?: string;
            operationName?: string;
            variables?: Record<string, unknown>;
          };

          if (isNonEmptyString(parsedJsonBody?.query)) {
            return parsedJsonBody;
          }
        } catch {
          // The raw body is not JSON. Continue with other parsing strategies.
        }

        const searchParams = new URLSearchParams(trimmedRawBody);
        const queryFromUrlEncodedBody = searchParams.get('query');

        if (isNonEmptyString(queryFromUrlEncodedBody)) {
          const operationNameFromUrlEncodedBody =
            searchParams.get('operationName');

          return {
            query: queryFromUrlEncodedBody,
            operationName: operationNameFromUrlEncodedBody ?? undefined,
          };
        }

        return {
          query: trimmedRawBody,
        };
      };

      let requestBody = req.body as
        | {
            query?: string;
            operationName?: string;
            variables?: Record<string, unknown>;
          }
        | undefined;

      if (!isNonEmptyString(requestBody?.query) && isNonEmptyString(req.body)) {
        requestBody = readRequestBodyFromRawString(req.body);
        req.body = requestBody;
      }

      if (!isNonEmptyString(requestBody?.query)) {
        try {
          const parsedBody = (await request.clone().json()) as
            | {
                query?: string;
                operationName?: string;
                variables?: Record<string, unknown>;
              }
            | undefined;

          if (isNonEmptyString(parsedBody?.query)) {
            requestBody = parsedBody;
            req.body = parsedBody;
          }
        } catch {
          try {
            const parsedRawBody = readRequestBodyFromRawString(
              await request.clone().text(),
            );

            if (isNonEmptyString(parsedRawBody?.query)) {
              requestBody = parsedRawBody;
              req.body = parsedRawBody;
            }
          } catch {
            // Keep legacy behavior when body is not a parseable GraphQL payload.
          }
        }
      }

      if (!isNonEmptyString(requestBody?.query)) {
        const queryFromSearchParams = new URL(request.url).searchParams.get(
          'query',
        );
        const operationNameFromSearchParams = new URL(
          request.url,
        ).searchParams.get('operationName');

        if (isNonEmptyString(queryFromSearchParams)) {
          requestBody = {
            query: queryFromSearchParams,
            operationName: operationNameFromSearchParams ?? undefined,
          };
          req.body = requestBody;
        }
      }

      if (!isNonEmptyString(requestBody?.query)) {
        return;
      }

      const hasWorkspaceIntentHeader = isNonEmptyString(
        req.headers['x-schema-version'] as string | undefined,
      );
      const hasAuthorizationHeader = isNonEmptyString(
        req.headers.authorization,
      );

      if (
        !req.workspace?.id &&
        (hasWorkspaceIntentHeader || hasAuthorizationHeader)
      ) {
        const error = new GraphQLError('Workspace context is missing', {
          extensions: {
            code: 'UNAUTHENTICATED',
          },
        });

        return endResponse(Response.json({ errors: [error.toJSON()] }));
      }

      if (!req.workspace?.id) {
        return;
      }

      const queryString = requestBody.query;
      const operationName = requestBody.operationName;

      let document: DocumentNode;
      try {
        document = parse(queryString);
      } catch {
        return;
      }

      const operationDefinition = findOperationDefinition(
        document,
        operationName,
      );

      if (
        !operationDefinition ||
        isSubscriptionOperation(document, operationName)
      ) {
        return;
      }

      const workspaceResolverNames =
        await config.directExecutionService.getWorkspaceResolverNames(
          req.workspace.id,
        );

      if (!workspaceResolverNames) {
        return;
      }

      const { hasIntrospectionFields, hasWorkspaceFields, hasCoreFields } =
        classifyTopLevelFields(document, operationName, workspaceResolverNames);

      if (hasCoreFields && hasWorkspaceFields) {
        const error = new UserInputError(
          'This query cannot be executed as a single request. Please split it into separate queries.',
        );

        return endResponse(Response.json({ errors: [error.toJSON()] }));
      }

      if (hasCoreFields) {
        return;
      }

      if (Sentry.isInitialized()) {
        const transactionName =
          operationName || operationDefinition.name?.value || '';

        Sentry.setTags({
          operationName: transactionName,
          operation: operationDefinition.operation,
        });
        Sentry.getCurrentScope().setTransactionName(transactionName);
      }

      const result = await config.directExecutionService.execute(
        req,
        document,
        hasIntrospectionFields,
        hasWorkspaceFields,
      );

      if (isNull(result)) {
        return;
      }

      return endResponse(Response.json(result));
    },
  };
}
