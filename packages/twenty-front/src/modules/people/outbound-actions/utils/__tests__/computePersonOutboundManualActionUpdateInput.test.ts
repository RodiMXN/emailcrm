import { computePersonOutboundManualActionUpdateInput } from '@/people/outbound-actions/utils/computePersonOutboundManualActionUpdateInput';

describe('computePersonOutboundManualActionUpdateInput', () => {
  it('builds suppressLead payload', () => {
    expect(
      computePersonOutboundManualActionUpdateInput({
        action: 'suppressLead',
      }),
    ).toEqual({
      isSuppressed: true,
      currentState: 'do_not_contact',
    });
  });

  it('builds unsuppressLead payload', () => {
    expect(
      computePersonOutboundManualActionUpdateInput({
        action: 'unsuppressLead',
      }),
    ).toEqual({
      isSuppressed: false,
    });
  });

  it('builds recycleLead payload', () => {
    expect(
      computePersonOutboundManualActionUpdateInput({
        action: 'recycleLead',
      }),
    ).toEqual({
      currentState: 'recycled',
      parkedUntil: null,
    });
  });
});
