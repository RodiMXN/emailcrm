import { currentUserState } from '@/auth/states/currentUserState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { lastVisitedObjectMetadataItemIdState } from '@/navigation/states/lastVisitedObjectMetadataItemIdState';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { renderHook, waitFor } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { createElement, useEffect, type ReactNode } from 'react';
import { AppPath } from 'twenty-shared/types';
import {
  ViewOpenRecordIn,
  ViewType,
  ViewVisibility,
} from '~/generated-metadata/graphql';
import { mockedUserData } from '~/testing/mock-data/users';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { setTestViewsInMetadataStore } from '~/testing/utils/setTestViewsInMetadataStore';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';

const Wrapper = ({ children }: { children: ReactNode }) =>
  createElement(JotaiProvider, { store: jotaiStore }, children);

const renderHooks = ({
  withCurrentUser,
  withExistingView,
  lastVisitedObjectMetadataItemId = null,
}: {
  withCurrentUser: boolean;
  withExistingView: boolean;
  lastVisitedObjectMetadataItemId?: string | null;
}) => {
  jotaiStore.set(
    lastVisitedObjectMetadataItemIdState.atom,
    lastVisitedObjectMetadataItemId,
  );

  setTestObjectMetadataItemsInMetadataStore(
    jotaiStore,
    getTestEnrichedObjectMetadataItemsMock(),
  );

  const { result } = renderHook(
    () => {
      const setCurrentUser = useSetAtomState(currentUserState);
      const setCurrentUserWorkspace = useSetAtomState(
        currentUserWorkspaceState,
      );

      useEffect(() => {
        if (withExistingView) {
          setTestViewsInMetadataStore(jotaiStore, [
            {
              id: 'viewId',
              name: 'Test View',
              objectMetadataId: getMockObjectMetadataItemOrThrow('company').id,
              type: ViewType.TABLE,
              key: null,
              isCompact: false,
              openRecordIn: ViewOpenRecordIn.SIDE_PANEL,
              viewFields: [],
              viewFieldGroups: [],
              viewGroups: [],
              viewSorts: [],
              viewFilters: [],
              viewFilterGroups: [],
              kanbanAggregateOperation: AggregateOperations.COUNT,
              icon: '',
              kanbanAggregateOperationFieldMetadataId: '',
              position: 0,
              visibility: ViewVisibility.WORKSPACE,
              createdByUserWorkspaceId: null,
              shouldHideEmptyGroups: false,
            },
          ]);
        } else {
          setTestViewsInMetadataStore(jotaiStore, []);
        }

        if (withCurrentUser) {
          setCurrentUser(mockedUserData);
          setCurrentUserWorkspace(mockedUserData.currentUserWorkspace);
        }
      }, [setCurrentUser, setCurrentUserWorkspace]);

      return useDefaultHomePagePath();
    },
    {
      wrapper: Wrapper,
    },
  );
  return { result };
};

describe('useDefaultHomePagePath', () => {
  it('should return proper path when no currentUser', async () => {
    const { result } = renderHooks({
      withCurrentUser: false,
      withExistingView: false,
    });

    await waitFor(() => {
      expect(result.current.defaultHomePagePath).toEqual(AppPath.SignInUp);
    });
  });
  it('should return proper path when no currentUser and existing view', async () => {
    const { result } = renderHooks({
      withCurrentUser: false,
      withExistingView: true,
    });

    await waitFor(() => {
      expect(result.current.defaultHomePagePath).toEqual(AppPath.SignInUp);
    });
  });
  it('should return proper path when currentUser is defined', async () => {
    const { result } = renderHooks({
      withCurrentUser: true,
      withExistingView: false,
    });

    await waitFor(() => {
      expect(result.current.defaultHomePagePath).toEqual('/objects/people');
    });
  });
  it('should return proper path when currentUser is defined and view exists', async () => {
    const { result } = renderHooks({
      withCurrentUser: true,
      withExistingView: true,
    });

    await waitFor(() => {
      expect(result.current.defaultHomePagePath).toEqual('/objects/people');
    });
  });
  it('should preserve last visited behavior when currentUser is defined', async () => {
    const { result } = renderHooks({
      withCurrentUser: true,
      withExistingView: true,
      lastVisitedObjectMetadataItemId: getMockObjectMetadataItemOrThrow('company')
        .id,
    });

    await waitFor(() => {
      expect(result.current.defaultHomePagePath).toEqual(
        '/objects/companies?viewId=viewId',
      );
    });
  });
});
