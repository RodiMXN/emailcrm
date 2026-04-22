import { ViewType, ViewKey } from 'twenty-shared/types';

import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import {
  createStandardViewFlatMetadata,
  type CreateStandardViewArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view/create-standard-view-flat-metadata.util';

export const computeStandardPersonViews = (
  args: Omit<CreateStandardViewArgs<'person'>, 'context'>,
): Record<string, FlatView> => {
  return {
    allPeople: createStandardViewFlatMetadata({
      ...args,
      objectName: 'person',
      context: {
        viewName: 'allPeople',
        name: 'All {objectLabelPlural}',
        type: ViewType.TABLE,
        key: ViewKey.INDEX,
        position: 0,
        icon: 'IconList',
      },
    }),
    leadsDueToday: createStandardViewFlatMetadata({
      ...args,
      objectName: 'person',
      context: {
        viewName: 'leadsDueToday',
        name: 'Leads Due Today',
        type: ViewType.TABLE,
        key: null,
        position: 1,
        icon: 'IconCheckbox',
      },
    }),
    waitingForFormCompletion: createStandardViewFlatMetadata({
      ...args,
      objectName: 'person',
      context: {
        viewName: 'waitingForFormCompletion',
        name: 'Waiting for Form Completion',
        type: ViewType.TABLE,
        key: null,
        position: 2,
        icon: 'IconFileDescription',
      },
    }),
    suppressedLeads: createStandardViewFlatMetadata({
      ...args,
      objectName: 'person',
      context: {
        viewName: 'suppressedLeads',
        name: 'Suppressed Leads',
        type: ViewType.TABLE,
        key: null,
        position: 3,
        icon: 'IconBan',
      },
    }),
    readyForCrm: createStandardViewFlatMetadata({
      ...args,
      objectName: 'person',
      context: {
        viewName: 'readyForCrm',
        name: 'Ready for CRM',
        type: ViewType.TABLE,
        key: null,
        position: 4,
        icon: 'IconPlugConnected',
      },
    }),
    parkedRecycleQueue: createStandardViewFlatMetadata({
      ...args,
      objectName: 'person',
      context: {
        viewName: 'parkedRecycleQueue',
        name: 'Parked / Recycle Queue',
        type: ViewType.TABLE,
        key: null,
        position: 5,
        icon: 'IconRotate',
      },
    }),
    personRecordPageFields: createStandardViewFlatMetadata({
      ...args,
      objectName: 'person',
      context: {
        viewName: 'personRecordPageFields',
        name: 'Person Record Page Fields',
        type: ViewType.FIELDS_WIDGET,
        key: null,
        position: 0,
        icon: 'IconList',
      },
    }),
  };
};
