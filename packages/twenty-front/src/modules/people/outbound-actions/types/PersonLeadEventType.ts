export type PersonLeadEventType =
  | 'lead_manual_action_mark_ready_for_crm'
  | 'lead_manual_action_mark_crm_pushed'
  | 'lead_manual_action_park_lead'
  | 'lead_manual_action_recycle_lead'
  | 'lead_manual_action_suppress_lead'
  | 'lead_manual_action_unsuppress_lead';
