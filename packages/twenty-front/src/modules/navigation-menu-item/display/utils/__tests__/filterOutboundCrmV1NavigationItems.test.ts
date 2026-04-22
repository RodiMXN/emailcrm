import { NavigationMenuItemType } from 'twenty-shared/types';

import { filterOutboundCrmV1NavigationItems } from '@/navigation-menu-item/display/utils/filterOutboundCrmV1NavigationItems';

describe('filterOutboundCrmV1NavigationItems', () => {
  it('hides workflows folder and hidden object items without blanket-hiding non-workflow children', () => {
    const items = [
      {
        id: 'folder-1',
        type: NavigationMenuItemType.FOLDER,
        name: 'Workflows',
        folderId: null,
        viewId: null,
        targetObjectMetadataId: null,
      },
      {
        id: 'workflow-child',
        type: NavigationMenuItemType.OBJECT,
        name: null,
        folderId: 'folder-1',
        viewId: null,
        targetObjectMetadataId: 'meta-workflow',
      },
      {
        id: 'opp',
        type: NavigationMenuItemType.OBJECT,
        name: null,
        folderId: null,
        viewId: null,
        targetObjectMetadataId: 'meta-opportunity',
      },
      {
        id: 'people',
        type: NavigationMenuItemType.OBJECT,
        name: null,
        folderId: 'folder-1',
        viewId: null,
        targetObjectMetadataId: 'meta-person',
      },
    ] as any;

    const objectMetadataItems = [
      { id: 'meta-workflow', nameSingular: 'workflow' },
      { id: 'meta-opportunity', nameSingular: 'opportunity' },
      { id: 'meta-person', nameSingular: 'person' },
    ] as any;

    const views = [] as any;

    const filtered = filterOutboundCrmV1NavigationItems({
      navigationMenuItems: items,
      objectMetadataItems,
      views,
    });

    expect(filtered.map((item) => item.id)).toEqual(['people']);
  });
});
