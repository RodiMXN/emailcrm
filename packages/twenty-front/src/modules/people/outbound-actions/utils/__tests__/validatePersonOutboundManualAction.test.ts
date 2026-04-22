import { validatePersonOutboundManualAction } from '@/people/outbound-actions/utils/validatePersonOutboundManualAction';

const baseSnapshot = {
  currentState: 'new',
  crmStatus: 'not_ready',
  isSuppressed: false,
  parkedUntil: null,
};

describe('validatePersonOutboundManualAction', () => {
  it('blocks markReadyForCrm when suppressed', () => {
    const result = validatePersonOutboundManualAction({
      action: 'markReadyForCrm',
      snapshot: {
        ...baseSnapshot,
        isSuppressed: true,
      },
    });

    expect(result).toEqual({
      isValid: false,
      reason: 'Cannot mark CRM ready while lead is suppressed.',
    });
  });

  it('blocks recycleLead when suppressed', () => {
    const result = validatePersonOutboundManualAction({
      action: 'recycleLead',
      snapshot: {
        ...baseSnapshot,
        isSuppressed: true,
      },
    });

    expect(result).toEqual({
      isValid: false,
      reason: 'Cannot recycle a suppressed lead.',
    });
  });

  it('accepts recycleLead when unsuppressed', () => {
    const result = validatePersonOutboundManualAction({
      action: 'recycleLead',
      snapshot: baseSnapshot,
    });

    expect(result).toEqual({ isValid: true });
  });
});
