import { isOutboundCrmV1UiMode } from '@/app/constants/isOutboundCrmV1UiMode';
import { RecordIndexCommandMenu } from '@/command-menu-item/components/RecordIndexCommandMenu';
import { SidePanelToggleButton } from '@/side-panel/components/SidePanelToggleButton';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateNewIndexRecord } from '@/object-record/record-table/hooks/useCreateNewIndexRecord';
import { RecordIndexPageHeaderIcon } from '@/object-record/record-index/components/RecordIndexPageHeaderIcon';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledTitleWithSelectedRecords = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  padding-right: ${themeCssVariables.spacing['0.5']};
`;

const StyledSelectedRecordsCount = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  padding-left: ${themeCssVariables.spacing['0.5']};
`;

export const RecordIndexPageHeader = () => {
  const contextStoreNumberOfSelectedRecords = useAtomComponentStateValue(
    contextStoreNumberOfSelectedRecordsComponentState,
  );

  const { objectNamePlural, objectMetadataItem, recordIndexId } =
    useRecordIndexContextOrThrow();
  const { createNewIndexRecord } = useCreateNewIndexRecord({
    objectMetadataItem,
    instanceId: recordIndexId,
  });

  const label = objectMetadataItem?.labelPlural ?? objectNamePlural;
  const shouldShowAddLeadButton =
    isOutboundCrmV1UiMode &&
    objectMetadataItem.nameSingular === CoreObjectNameSingular.Person;

  const handleAddLeadClick = useCallback(() => {
    void createNewIndexRecord({ position: 'first' });
  }, [createNewIndexRecord]);

  const pageHeaderTitle =
    contextStoreNumberOfSelectedRecords > 0 ? (
      <StyledTitleWithSelectedRecords>
        <StyledTitle>{label}</StyledTitle>
        <>{'->'}</>
        <StyledSelectedRecordsCount>
          {t`${contextStoreNumberOfSelectedRecords} selected`}
        </StyledSelectedRecordsCount>
      </StyledTitleWithSelectedRecords>
    ) : (
      label
    );

  const contextStoreCurrentViewId = useAtomComponentStateValue(
    contextStoreCurrentViewIdComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );

  return (
    <PageHeader
      title={pageHeaderTitle}
      Icon={() => (
        <RecordIndexPageHeaderIcon objectMetadataItem={objectMetadataItem} />
      )}
    >
      {isDefined(contextStoreCurrentViewId) && (
        <>
          {shouldShowAddLeadButton && (
            <Button
              Icon={IconPlus}
              title={t`Add lead`}
              variant="secondary"
              onClick={handleAddLeadClick}
            />
          )}
          <RecordIndexCommandMenu />
          {!isLayoutCustomizationModeEnabled && <SidePanelToggleButton />}
        </>
      )}
    </PageHeader>
  );
};
