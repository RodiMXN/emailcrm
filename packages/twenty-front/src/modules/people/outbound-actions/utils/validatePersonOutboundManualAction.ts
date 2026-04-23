import {
  type PersonOutboundManualAction,
  type PersonOutboundStateSnapshot,
} from '@/people/outbound-actions/types/PersonOutboundManualAction';

export type PersonOutboundManualActionValidationResult =
  | { isValid: true }
  | { isValid: false; reason: string };

export const validatePersonOutboundManualAction = ({
  action,
  snapshot,
}: {
  action: PersonOutboundManualAction;
  snapshot: PersonOutboundStateSnapshot;
}): PersonOutboundManualActionValidationResult => {
  if (action === 'markReadyForCrm' && snapshot.isSuppressed) {
    return {
      isValid: false,
      reason: 'Cannot mark CRM ready while lead is suppressed.',
    };
  }

  if (action === 'markCrmPushed' && snapshot.crmStatus !== 'ready') {
    return {
      isValid: false,
      reason: 'CRM push requires CRM status to be ready.',
    };
  }

  if (action === 'parkLead' && !snapshot.parkedUntil) {
    return {
      isValid: false,
      reason: 'Set Parked Until before parking this lead.',
    };
  }

  if (action === 'recycleLead' && snapshot.isSuppressed) {
    return {
      isValid: false,
      reason: 'Cannot recycle a suppressed lead.',
    };
  }

  if (action === 'suppressLead' && snapshot.isSuppressed) {
    return {
      isValid: false,
      reason: 'Lead is already suppressed.',
    };
  }

  if (action === 'unsuppressLead' && !snapshot.isSuppressed) {
    return {
      isValid: false,
      reason: 'Lead is not suppressed.',
    };
  }

  return { isValid: true };
};
