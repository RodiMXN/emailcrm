import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type PersonOutboundManualAction } from '@/people/outbound-actions/types/PersonOutboundManualAction';

export const computePersonOutboundManualActionUpdateInput = ({
  action,
}: {
  action: PersonOutboundManualAction;
}): Partial<ObjectRecord> => {
  switch (action) {
    case 'markReadyForCrm':
      return {
        currentState: 'crm_ready',
        crmStatus: 'ready',
      };
    case 'markCrmPushed':
      return {
        currentState: 'crm_pushed',
        crmStatus: 'pushed',
      };
    case 'parkLead':
      return {
        currentState: 'parked',
      };
    case 'recycleLead':
      return {
        currentState: 'recycled',
        parkedUntil: null,
      };
    case 'suppressLead':
      return {
        isSuppressed: true,
        currentState: 'do_not_contact',
      };
    case 'unsuppressLead':
      return {
        isSuppressed: false,
      };
  }
};
