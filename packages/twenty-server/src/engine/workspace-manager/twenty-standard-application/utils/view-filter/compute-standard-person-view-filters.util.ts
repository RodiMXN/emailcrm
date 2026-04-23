import { ViewFilterOperand } from 'twenty-shared/types';

import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';
import {
  createStandardViewFilterFlatMetadata,
  type CreateStandardViewFilterArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-filter/create-standard-view-filter-flat-metadata.util';

export const computeStandardPersonViewFilters = (
  args: Omit<CreateStandardViewFilterArgs<'person'>, 'context'>,
): Record<string, FlatViewFilter> => {
  return {
    leadsDueTodayNextActionDateIsNotEmpty: createStandardViewFilterFlatMetadata(
      {
        ...args,
        objectName: 'person',
        context: {
          viewName: 'leadsDueToday',
          viewFilterName: 'nextActionDateIsNotEmpty',
          fieldName: 'nextActionDate',
          operand: ViewFilterOperand.IS_NOT_EMPTY,
          value: JSON.stringify(''),
        },
      },
    ),
    leadsDueTodayNextActionDateIsInPast: createStandardViewFilterFlatMetadata({
      ...args,
      objectName: 'person',
      context: {
        viewName: 'leadsDueToday',
        viewFilterName: 'nextActionDateIsInPast',
        fieldName: 'nextActionDate',
        operand: ViewFilterOperand.IS_IN_PAST,
        value: JSON.stringify(''),
      },
    }),
    leadsDueTodayIsSuppressedIsFalse: createStandardViewFilterFlatMetadata({
      ...args,
      objectName: 'person',
      context: {
        viewName: 'leadsDueToday',
        viewFilterName: 'isSuppressedIsFalse',
        fieldName: 'isSuppressed',
        operand: ViewFilterOperand.IS,
        value: JSON.stringify(false),
      },
    }),
    waitingForFormCompletionIsSuppressedIsFalse:
      createStandardViewFilterFlatMetadata({
        ...args,
        objectName: 'person',
        context: {
          viewName: 'waitingForFormCompletion',
          viewFilterName: 'isSuppressedIsFalse',
          fieldName: 'isSuppressed',
          operand: ViewFilterOperand.IS,
          value: JSON.stringify(false),
        },
      }),
    waitingForFormCompletionFormStatusIsNotNotSent:
      createStandardViewFilterFlatMetadata({
        ...args,
        objectName: 'person',
        context: {
          viewName: 'waitingForFormCompletion',
          viewFilterName: 'formStatusIsNotNotSent',
          fieldName: 'formStatus',
          operand: ViewFilterOperand.IS_NOT,
          value: JSON.stringify('not_sent'),
        },
      }),
    waitingForFormCompletionFormStatusIsNotCompleted:
      createStandardViewFilterFlatMetadata({
        ...args,
        objectName: 'person',
        context: {
          viewName: 'waitingForFormCompletion',
          viewFilterName: 'formStatusIsNotCompleted',
          fieldName: 'formStatus',
          operand: ViewFilterOperand.IS_NOT,
          value: JSON.stringify('completed'),
        },
      }),
    waitingForFormCompletionFormStatusIsNotAbandoned:
      createStandardViewFilterFlatMetadata({
        ...args,
        objectName: 'person',
        context: {
          viewName: 'waitingForFormCompletion',
          viewFilterName: 'formStatusIsNotAbandoned',
          fieldName: 'formStatus',
          operand: ViewFilterOperand.IS_NOT,
          value: JSON.stringify('abandoned'),
        },
      }),
    suppressedLeadsIsSuppressedIsTrue: createStandardViewFilterFlatMetadata({
      ...args,
      objectName: 'person',
      context: {
        viewName: 'suppressedLeads',
        viewFilterName: 'isSuppressedIsTrue',
        fieldName: 'isSuppressed',
        operand: ViewFilterOperand.IS,
        value: JSON.stringify(true),
      },
    }),
    readyForCrmCrmStatusIsReady: createStandardViewFilterFlatMetadata({
      ...args,
      objectName: 'person',
      context: {
        viewName: 'readyForCrm',
        viewFilterName: 'crmStatusIsReady',
        fieldName: 'crmStatus',
        operand: ViewFilterOperand.IS,
        value: JSON.stringify('ready'),
      },
    }),
    readyForCrmIsSuppressedIsFalse: createStandardViewFilterFlatMetadata({
      ...args,
      objectName: 'person',
      context: {
        viewName: 'readyForCrm',
        viewFilterName: 'isSuppressedIsFalse',
        fieldName: 'isSuppressed',
        operand: ViewFilterOperand.IS,
        value: JSON.stringify(false),
      },
    }),
    parkedRecycleQueueCurrentStateIsParked:
      createStandardViewFilterFlatMetadata({
        ...args,
        objectName: 'person',
        context: {
          viewName: 'parkedRecycleQueue',
          viewFilterName: 'currentStateIsParked',
          fieldName: 'currentState',
          operand: ViewFilterOperand.IS,
          value: JSON.stringify('parked'),
        },
      }),
    parkedRecycleQueueParkedUntilIsNotEmpty:
      createStandardViewFilterFlatMetadata({
        ...args,
        objectName: 'person',
        context: {
          viewName: 'parkedRecycleQueue',
          viewFilterName: 'parkedUntilIsNotEmpty',
          fieldName: 'parkedUntil',
          operand: ViewFilterOperand.IS_NOT_EMPTY,
          value: JSON.stringify(''),
        },
      }),
    parkedRecycleQueueIsSuppressedIsFalse:
      createStandardViewFilterFlatMetadata({
        ...args,
        objectName: 'person',
        context: {
          viewName: 'parkedRecycleQueue',
          viewFilterName: 'isSuppressedIsFalse',
          fieldName: 'isSuppressed',
          operand: ViewFilterOperand.IS,
          value: JSON.stringify(false),
        },
      }),
  };
};
