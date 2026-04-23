import { NavigationMenuItemType } from 'twenty-shared/types';

import { getObjectMetadataForNavigationMenuItem } from '@/navigation-menu-item/display/object/utils/getObjectMetadataForNavigationMenuItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type View } from '@/views/types/View';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

const HIDDEN_OBJECT_NAME_SINGULARS = new Set([
  'opportunity',
  'dashboard',
  'workflow',
  'workflowRun',
  'workflowVersion',
]);

export const filterOutboundCrmV1NavigationItems = ({
  navigationMenuItems,
  objectMetadataItems,
  views,
}: {
  navigationMenuItems: NavigationMenuItem[];
  objectMetadataItems: EnrichedObjectMetadataItem[];
  views: Pick<View, 'id' | 'objectMetadataId'>[];
}) => {
  return navigationMenuItems.filter((item) => {
    if (
      item.type === NavigationMenuItemType.FOLDER &&
      item.name?.toLowerCase() === 'workflows'
    ) {
      return false;
    }

    const objectMetadata = getObjectMetadataForNavigationMenuItem(
      {
        type: item.type,
        viewId: item.viewId,
        targetObjectMetadataId: item.targetObjectMetadataId,
      },
      objectMetadataItems,
      views,
    );

    if (!objectMetadata) {
      return true;
    }

    return !HIDDEN_OBJECT_NAME_SINGULARS.has(objectMetadata.nameSingular);
  });
};
