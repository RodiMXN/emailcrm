# State Machine

## Purpose

This document defines the allowed lead states and the transitions between them for the email CRM.

The lead state machine is the core logic of the system. Every lead should always have one current state and one next action.

---

## Core Rule

A lead can only be in one active lifecycle state at a time.

A lead should not belong to multiple active outbound paths at once.

For example:
- a lead waiting for follow-up should not also be in a form reminder flow
- a lead already pushed to CRM should not still be in outbound recycle
- a suppressed lead should not re-enter active campaigns

---

## Lead States

### Cold Outreach States
- `new`
- `intro_sent`
- `waiting_followup`
- `followup_sent`
- `parked`
- `recycled`

### Reply States
- `positive_reply`
- `negative_reply`

### Form States
- `form_sent`
- `form_reminder_1`
- `form_reminder_final`
- `form_completed`

### CRM States
- `crm_ready`
- `crm_pushed`

### Suppression State
- `do_not_contact`

---

## Allowed Transitions

### Cold Outreach Flow

- `new` -> `intro_sent`
- `intro_sent` -> `waiting_followup`
- `waiting_followup` -> `followup_sent`
- `followup_sent` -> `parked`
- `parked` -> `recycled`

### Recycled Flow

- `recycled` -> `intro_sent`
- `recycled` -> `parked`
- `recycled` -> `do_not_contact`

### Positive Reply Flow

A positive reply can happen after intro, follow-up, parked follow-up, or recycled outreach.

Allowed transitions:
- `intro_sent` -> `positive_reply`
- `waiting_followup` -> `positive_reply`
- `followup_sent` -> `positive_reply`
- `parked` -> `positive_reply`
- `recycled` -> `positive_reply`

### Negative Reply Flow

A negative reply can happen after any outreach stage.

Allowed transitions:
- `intro_sent` -> `negative_reply`
- `waiting_followup` -> `negative_reply`
- `followup_sent` -> `negative_reply`
- `parked` -> `negative_reply`
- `recycled` -> `negative_reply`

### Form Flow

- `positive_reply` -> `form_sent`
- `form_sent` -> `form_reminder_1`
- `form_reminder_1` -> `form_reminder_final`
- `form_sent` -> `form_completed`
- `form_reminder_1` -> `form_completed`
- `form_reminder_final` -> `form_completed`
- `form_reminder_final` -> `parked`
- `form_reminder_final` -> `do_not_contact`

### CRM Flow

- `form_completed` -> `crm_ready`
- `crm_ready` -> `crm_pushed`

### Suppression Flow

The following transitions are always allowed:
- `negative_reply` -> `do_not_contact`
- `intro_sent` -> `do_not_contact`
- `waiting_followup` -> `do_not_contact`
- `followup_sent` -> `do_not_contact`
- `parked` -> `do_not_contact`
- `recycled` -> `do_not_contact`
- `form_sent` -> `do_not_contact`
- `form_reminder_1` -> `do_not_contact`
- `form_reminder_final` -> `do_not_contact`

This state should be used for:
- unsubscribe
- wrong contact
- invalid lead
- manual suppression
- duplicate lead
- bad fit
- already handled elsewhere

---

## Transition Triggers

### Timed triggers
- follow-up due date reached
- parked_until date reached
- form reminder date reached
- final reminder date reached

### Reply triggers
- positive reply detected
- negative reply detected
- unsubscribe detected

### System triggers
- form completed
- lead pushed to CRM
- lead manually suppressed
- lead manually recycled

---

## Forbidden Conditions

The system should prevent the following:

- one lead being in multiple active campaigns
- one lead being both active and suppressed
- one lead being pushed to CRM while still staying in outbound
- one lead receiving cold outreach after form flow started
- one lead re-entering outreach after do_not_contact

---

## Future Extensions

Later versions may support:
- asked_to_follow_up_later
- wrong_contact_replacement
- qualified
- unqualified
- assigned_to_sales
- sales_contacted
- closed_won
- closed_lost
