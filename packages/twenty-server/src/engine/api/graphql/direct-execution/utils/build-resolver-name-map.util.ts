import { isDefined } from 'twenty-shared/utils';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { workspaceResolverBuilderMethodNames } from 'src/engine/api/graphql/workspace-resolver-builder/factories/factories';
import { type WorkspaceResolverBuilderMethodNames } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  getLegacyResolverName,
  getResolverName,
} from 'src/engine/utils/get-resolver-name.util';

export type ResolverNameMapEntry = {
  objectMetadataUniversalIdentifier: string;
  method: WorkspaceResolverBuilderMethodNames;
  operationType: 'query' | 'mutation';
};

const getCanonicalPersonResolverName = (
  flatObjectMetadata: Pick<
    FlatObjectMetadata,
    'universalIdentifier' | 'nameSingular' | 'namePlural'
  >,
  method: WorkspaceResolverBuilderMethodNames,
) => {
  if (
    flatObjectMetadata.universalIdentifier !==
    STANDARD_OBJECTS.person.universalIdentifier
  ) {
    return null;
  }

  switch (method) {
    case 'findMany':
      return 'people';
    case 'findOne':
      return 'person';
    case 'findDuplicates':
      return 'personDuplicates';
    case 'createOne':
      return 'createPerson';
    case 'createMany':
      return 'createPeople';
    case 'updateOne':
      return 'updatePerson';
    case 'updateMany':
      return 'updatePeople';
    case 'deleteOne':
      return 'deletePerson';
    case 'deleteMany':
      return 'deletePeople';
    case 'destroyOne':
      return 'destroyPerson';
    case 'destroyMany':
      return 'destroyPeople';
    case 'restoreOne':
      return 'restorePerson';
    case 'restoreMany':
      return 'restorePeople';
    case 'mergeMany':
      return 'mergePeople';
    case 'groupBy':
      return 'peopleGroupBy';
    default:
      return null;
  }
};

export const buildResolverNameMap = (
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
): Record<string, ResolverNameMapEntry> => {
  const map: Record<string, ResolverNameMapEntry> = {};

  const allMethods = [
    ...workspaceResolverBuilderMethodNames.queries.map((method) => ({
      method,
      operationType: 'query' as const,
    })),
    ...workspaceResolverBuilderMethodNames.mutations.map((method) => ({
      method,
      operationType: 'mutation' as const,
    })),
  ];

  for (const flatObjectMetadata of Object.values(
    flatObjectMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined)) {
    for (const { method, operationType } of allMethods) {
      const resolverName = getResolverName(flatObjectMetadata, method);

      map[resolverName] = {
        objectMetadataUniversalIdentifier:
          flatObjectMetadata.universalIdentifier,
        method,
        operationType,
      };

      const legacyResolverName = getLegacyResolverName(
        flatObjectMetadata,
        method,
      );

      if (isDefined(legacyResolverName)) {
        map[legacyResolverName] = {
          objectMetadataUniversalIdentifier:
            flatObjectMetadata.universalIdentifier,
          method,
          operationType,
        };
      }

      const canonicalPersonResolverName = getCanonicalPersonResolverName(
        flatObjectMetadata,
        method,
      );

      if (isDefined(canonicalPersonResolverName)) {
        map[canonicalPersonResolverName] = {
          objectMetadataUniversalIdentifier:
            flatObjectMetadata.universalIdentifier,
          method,
          operationType,
        };
      }
    }
  }

  return map;
};
