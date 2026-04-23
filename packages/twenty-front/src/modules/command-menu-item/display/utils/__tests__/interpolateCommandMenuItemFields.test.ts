import { interpolateCommandMenuItemFields } from '@/command-menu-item/display/utils/interpolateCommandMenuItemFields';
import { type CommandMenuContextApi } from 'twenty-shared/types';
import {
  EngineComponentKey,
  type CommandMenuItemFieldsFragment,
} from '~/generated-metadata/graphql';

const buildCommandMenuContextApi = (
  objectNameSingular: string,
): CommandMenuContextApi => ({
  pageType: 'INDEX_PAGE',
  isInSidePanel: false,
  isPageInEditMode: false,
  favoriteRecordIds: [],
  isSelectAll: false,
  hasAnySoftDeleteFilterOnView: false,
  numberOfSelectedRecords: 0,
  objectPermissions: {
    objectMetadataId: 'object-metadata-id',
    canUpdateObjectRecords: true,
    canSoftDeleteObjectRecords: true,
    canDestroyObjectRecords: true,
    canReadObjectRecords: true,
    canReadObjectRecordsStatistics: true,
  },
  selectedRecords: [],
  featureFlags: {},
  targetObjectReadPermissions: {},
  targetObjectWritePermissions: {},
  objectMetadataItem: {
    nameSingular: objectNameSingular,
    labelSingular: objectNameSingular,
  },
  objectMetadataLabel: objectNameSingular,
});

const buildCommandMenuItem = (
  engineComponentKey: EngineComponentKey,
): CommandMenuItemFieldsFragment => ({
  __typename: 'CommandMenuItem',
  id: 'cmd-item-id',
  workflowVersionId: null,
  frontComponentId: null,
  frontComponent: null,
  engineComponentKey,
  label: 'Create new ${capitalize(objectMetadataItem.labelSingular)}',
  icon: 'IconPlus',
  shortLabel: 'New ${capitalize(objectMetadataItem.labelSingular)}',
  position: 1,
  isPinned: true,
  payload: null,
  hotKeys: null,
  conditionalAvailabilityExpression: null,
  availabilityType: 'GLOBAL_OBJECT_CONTEXT',
  availabilityObjectMetadataId: null,
  pageLayoutId: null,
});

describe('interpolateCommandMenuItemFields', () => {
  it('should rename person create command labels to lead labels in outbound CRM V1 mode', () => {
    const commandMenuItem = buildCommandMenuItem(
      EngineComponentKey.CREATE_NEW_RECORD,
    );
    const commandMenuContextApi = buildCommandMenuContextApi('person');

    const result = interpolateCommandMenuItemFields(
      commandMenuItem,
      commandMenuContextApi,
    );

    expect(result.label).toBe('Create new lead');
    expect(result.shortLabel).toBe('Add lead');
  });

  it('should keep non-person create command labels unchanged', () => {
    const commandMenuItem = buildCommandMenuItem(
      EngineComponentKey.CREATE_NEW_RECORD,
    );
    const commandMenuContextApi = buildCommandMenuContextApi('company');

    const result = interpolateCommandMenuItemFields(
      commandMenuItem,
      commandMenuContextApi,
    );

    expect(result.label).toBe('Create new Company');
    expect(result.shortLabel).toBe('New Company');
  });
});
