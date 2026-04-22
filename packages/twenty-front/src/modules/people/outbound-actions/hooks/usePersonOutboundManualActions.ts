import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import {
  type PersonOutboundManualAction,
  type PersonOutboundStateSnapshot,
} from '@/people/outbound-actions/types/PersonOutboundManualAction';
import { useCreatePersonLeadEvent } from '@/people/outbound-actions/hooks/useCreatePersonLeadEvent';
import { computePersonOutboundManualActionUpdateInput } from '@/people/outbound-actions/utils/computePersonOutboundManualActionUpdateInput';
import { validatePersonOutboundManualAction } from '@/people/outbound-actions/utils/validatePersonOutboundManualAction';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

export const usePersonOutboundManualActions = ({
  recordId,
}: {
  recordId: string;
}) => {
  const { updateOneRecord } = useUpdateOneRecord();
  const { createPersonLeadEvent } = useCreatePersonLeadEvent({ recordId });
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();

  const executeAction = async ({
    action,
    snapshot,
  }: {
    action: PersonOutboundManualAction;
    snapshot: PersonOutboundStateSnapshot;
  }) => {
    const validation = validatePersonOutboundManualAction({ action, snapshot });

    if (!validation.isValid) {
      enqueueErrorSnackBar({
        message: validation.reason,
      });

      return false;
    }

    const updateOneRecordInput = computePersonOutboundManualActionUpdateInput({
      action,
    });

    const afterSnapshot: PersonOutboundStateSnapshot = {
      ...snapshot,
      ...(Object.fromEntries(
        Object.entries(updateOneRecordInput).filter(([, value]) =>
          ['string', 'boolean'].includes(typeof value) || value === null,
        ),
      ) as Partial<PersonOutboundStateSnapshot>),
    };

    await updateOneRecord({
      objectNameSingular: 'person',
      idToUpdate: recordId,
      updateOneRecordInput,
    });

    await createPersonLeadEvent({
      action,
      afterSnapshot,
    });

    enqueueSuccessSnackBar({
      message: 'Lead updated',
    });

    return true;
  };

  return {
    executeAction,
  };
};
