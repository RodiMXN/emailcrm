export type PersonOutboundManualAction =
  | 'markReadyForCrm'
  | 'markCrmPushed'
  | 'parkLead'
  | 'recycleLead'
  | 'suppressLead'
  | 'unsuppressLead';

export type PersonOutboundStateSnapshot = {
  currentState: string;
  crmStatus: string;
  isSuppressed: boolean;
  parkedUntil: string | null;
};
