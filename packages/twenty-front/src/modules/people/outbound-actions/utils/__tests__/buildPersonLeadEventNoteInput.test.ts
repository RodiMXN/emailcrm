import { buildPersonLeadEventNoteInput } from '@/people/outbound-actions/utils/buildPersonLeadEventNoteInput';

describe('buildPersonLeadEventNoteInput', () => {
  it('builds a system note payload for manual action', () => {
    const result = buildPersonLeadEventNoteInput({
      action: 'markReadyForCrm',
      afterSnapshot: {
        currentState: 'crm_ready',
        crmStatus: 'ready',
        isSuppressed: false,
        parkedUntil: null,
      },
    });

    expect(result.eventType).toBe('lead_manual_action_mark_ready_for_crm');
    expect(result.title).toBe('[System] Lead workflow event');
    expect(result.bodyV2.markdown).toContain(
      '- event_type: lead_manual_action_mark_ready_for_crm',
    );
  });
});
