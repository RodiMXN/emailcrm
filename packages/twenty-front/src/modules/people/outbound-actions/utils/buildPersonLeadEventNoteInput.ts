import {
  type PersonOutboundManualAction,
  type PersonOutboundStateSnapshot,
} from '@/people/outbound-actions/types/PersonOutboundManualAction';
import { type PersonLeadEventType } from '@/people/outbound-actions/types/PersonLeadEventType';

const MANUAL_ACTION_TO_EVENT_TYPE: Record<
  PersonOutboundManualAction,
  PersonLeadEventType
> = {
  markReadyForCrm: 'lead_manual_action_mark_ready_for_crm',
  markCrmPushed: 'lead_manual_action_mark_crm_pushed',
  parkLead: 'lead_manual_action_park_lead',
  recycleLead: 'lead_manual_action_recycle_lead',
  suppressLead: 'lead_manual_action_suppress_lead',
  unsuppressLead: 'lead_manual_action_unsuppress_lead',
};

export const buildPersonLeadEventNoteInput = ({
  action,
  afterSnapshot,
}: {
  action: PersonOutboundManualAction;
  afterSnapshot: PersonOutboundStateSnapshot;
}) => {
  const eventType = MANUAL_ACTION_TO_EVENT_TYPE[action];

  return {
    eventType,
    title: '[System] Lead workflow event',
    bodyV2: {
      markdown: [
        `- event_type: ${eventType}`,
        `- action: ${action}`,
        `- current_state: ${afterSnapshot.currentState}`,
        `- crm_status: ${afterSnapshot.crmStatus}`,
        `- is_suppressed: ${afterSnapshot.isSuppressed}`,
      ].join('\n'),
      blocknote: null,
    },
  };
};
