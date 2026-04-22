import {
  IconBolt,
  IconCheck,
  IconEyeOff,
  IconRefresh,
  IconUpload,
} from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';

import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { type PersonOutboundManualAction } from '@/people/outbound-actions/types/PersonOutboundManualAction';
import { validatePersonOutboundManualAction } from '@/people/outbound-actions/utils/validatePersonOutboundManualAction';
import { usePersonOutboundManualActions } from '@/people/outbound-actions/hooks/usePersonOutboundManualActions';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';

const DROPDOWN_ID_PREFIX = 'person-outbound-manual-actions-dropdown';

const ACTION_ITEMS: Array<{
  action: PersonOutboundManualAction;
  label: string;
  LeftIcon: any;
}> = [
  {
    action: 'markReadyForCrm',
    label: 'Mark as Ready for CRM',
    LeftIcon: IconCheck,
  },
  {
    action: 'markCrmPushed',
    label: 'Mark as CRM Pushed',
    LeftIcon: IconUpload,
  },
  {
    action: 'parkLead',
    label: 'Park Lead',
    LeftIcon: IconRefresh,
  },
  {
    action: 'recycleLead',
    label: 'Recycle Lead',
    LeftIcon: IconRefresh,
  },
  {
    action: 'suppressLead',
    label: 'Suppress Lead',
    LeftIcon: IconEyeOff,
  },
  {
    action: 'unsuppressLead',
    label: 'Unsuppress Lead',
    LeftIcon: IconBolt,
  },
];

export const PersonOutboundManualActionsDropdown = ({
  recordId,
}: {
  recordId: string;
}) => {
  const { closeDropdown } = useCloseDropdown();
  const { executeAction } = usePersonOutboundManualActions({
    recordId,
  });

  const currentState = useAtomFamilySelectorValue(recordStoreFamilySelector, {
    recordId,
    fieldName: 'currentState',
  }) as string;

  const crmStatus = useAtomFamilySelectorValue(recordStoreFamilySelector, {
    recordId,
    fieldName: 'crmStatus',
  }) as string;

  const isSuppressed = useAtomFamilySelectorValue(recordStoreFamilySelector, {
    recordId,
    fieldName: 'isSuppressed',
  }) as boolean;

  const parkedUntil = useAtomFamilySelectorValue(recordStoreFamilySelector, {
    recordId,
    fieldName: 'parkedUntil',
  }) as string | null;

  const dropdownId = `${DROPDOWN_ID_PREFIX}-${recordId}`;

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="bottom-start"
      clickableComponent={
        <LightIconButton
          Icon={IconRefresh}
          accent="tertiary"
          aria-label="Lead actions"
        />
      }
      dropdownComponents={
        <DropdownContent widthInPixels={GenericDropdownContentWidth.Large}>
          <DropdownMenuItemsContainer>
            {ACTION_ITEMS.map(({ action, label, LeftIcon }) => {
              const validation = validatePersonOutboundManualAction({
                action,
                snapshot: {
                  currentState,
                  crmStatus,
                  isSuppressed,
                  parkedUntil,
                },
              });

              return (
                <MenuItem
                  key={action}
                  LeftIcon={LeftIcon}
                  text={label}
                  disabled={!validation.isValid}
                  onClick={async () => {
                    await executeAction({
                      action,
                      snapshot: {
                        currentState,
                        crmStatus,
                        isSuppressed,
                        parkedUntil,
                      },
                    });

                    closeDropdown(dropdownId);
                  }}
                />
              );
            })}
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
