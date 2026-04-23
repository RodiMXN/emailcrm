import { useMemo } from 'react';

import { isOutboundCrmV1UiMode } from '@/app/constants/isOutboundCrmV1UiMode';
import { filterAndSortNavigationMenuItems } from '@/navigation-menu-item/common/utils/filterAndSortNavigationMenuItems';
import { filterOutboundCrmV1NavigationItems } from '@/navigation-menu-item/display/utils/filterOutboundCrmV1NavigationItems';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

import { useNavigationMenuItemsData } from './useNavigationMenuItemsData';

export const useSortedNavigationMenuItems = () => {
  const { navigationMenuItems, workspaceNavigationMenuItems } =
    useNavigationMenuItemsData();
  const views = useAtomStateValue(viewsSelector);
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const filteredNavigationMenuItems = useMemo(() => {
    if (!isOutboundCrmV1UiMode) {
      return navigationMenuItems;
    }

    return filterOutboundCrmV1NavigationItems({
      navigationMenuItems,
      objectMetadataItems,
      views,
    });
  }, [navigationMenuItems, objectMetadataItems, views]);

  const filteredWorkspaceNavigationMenuItems = useMemo(() => {
    if (!isOutboundCrmV1UiMode) {
      return workspaceNavigationMenuItems;
    }

    return filterOutboundCrmV1NavigationItems({
      navigationMenuItems: workspaceNavigationMenuItems,
      objectMetadataItems,
      views,
    });
  }, [workspaceNavigationMenuItems, objectMetadataItems, views]);

  const navigationMenuItemsSorted = useMemo(() => {
    return filterAndSortNavigationMenuItems(
      filteredNavigationMenuItems,
      views,
      objectMetadataItems,
    );
  }, [filteredNavigationMenuItems, views, objectMetadataItems]);

  const workspaceNavigationMenuItemsSorted = useMemo(() => {
    return filterAndSortNavigationMenuItems(
      filteredWorkspaceNavigationMenuItems,
      views,
      objectMetadataItems,
    );
  }, [filteredWorkspaceNavigationMenuItems, views, objectMetadataItems]);

  return {
    navigationMenuItemsSorted,
    workspaceNavigationMenuItemsSorted,
  };
};
