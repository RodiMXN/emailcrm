# Email CRM Spec

## 1. Product Goal

This app is a lightweight outbound lead-state CRM built specifically to monitor email outreach, follow-up timing, form completion, lead parking, lead recycling, and CRM handoff.

The purpose of the app is not to be a full traditional CRM. The purpose is to track every lead through a fixed outreach lifecycle and always show the current status, the next action, and the lead’s event history.

---

## 2. Core Objects

The app should be built around the following core objects:

### Lead
A single person or business being contacted through outbound email.

### Event
A logged action or status change tied to a lead.

Examples:
- intro email sent
- follow-up sent
- positive reply received
- negative reply received
- form sent
- form completed
- lead parked
- lead recycled
- lead pushed to CRM

### Campaign Enrollment
Tracks which campaign or sequence a lead currently belongs to.

A lead should only belong to one active campaign at a time.

### Form Status
Tracks whether the lead has been sent a form, whether the form was completed, and whether reminders were sent.

### Suppression
Tracks whether a lead should no longer be contacted.

Examples:
- unsubscribed
- wrong contact
- negative reply
- do not contact
- duplicate
- already pushed to CRM

### Sending Mailbox
Tracks which sending domain or inbox was used for the lead.

---

## 3. Lead States

The first version of the app should support these lead states:

- `new`
- `intro_sent`
- `waiting_followup`
- `followup_sent`
- `parked`
- `recycled`
- `positive_reply`
- `negative_reply`
- `form_sent`
- `form_reminder_1`
- `form_reminder_final`
- `form_completed`
- `crm_ready`
- `crm_pushed`
- `do_not_contact`

These states should be treated as the main source of truth for where the lead currently stands.

---

## 4. Fixed Transition Rules

Each lead state should have a clear next move.

### Cold outbound flow
- `new` -> send intro email
- `intro_sent` -> move to `waiting_followup`
- `waiting_followup` -> when follow-up date arrives, send follow-up email
- `followup_sent` -> if no reply, move to `parked`
- `parked` -> when parked period expires, move to `recycled`
- `recycled` -> send a new intro with a different angle
- if still no reply after recycle flow -> either remain parked for long-term retry or move to `do_not_contact`

### Reply handling
- any positive reply -> move to `positive_reply`
- any negative reply -> move to `negative_reply`
- unsubscribe / wrong contact / invalid lead -> move to `do_not_contact`

### Form flow
- `positive_reply` -> send form and move to `form_sent`
- `form_sent` -> if no completion, send reminder and move to `form_reminder_1`
- `form_reminder_1` -> if still no completion, send final reminder and move to `form_reminder_final`
- `form_reminder_final` -> if no completion after final reminder, move to `parked` or `do_not_contact`
- form completion at any point -> move to `form_completed`

### CRM handoff
- `form_completed` -> move to `crm_ready`
- `crm_ready` -> push lead to CRM
- pushed successfully -> move to `crm_pushed`

---

## 5. Screens

The first version of the product should focus on only the screens needed to operate the workflow.

### Leads Due Today
Shows leads whose next action date is today or earlier.

### Waiting for Reply
Shows leads currently waiting after intro or follow-up.

### Waiting for Form Completion
Shows leads who received a form but have not completed it yet.

### Parked / Recycle Queue
Shows leads parked for future retry and leads becoming eligible for recycle.

### Ready for CRM
Shows leads who completed the form and should be pushed to CRM.

### Suppressed Leads
Shows leads marked as do not contact, negative reply, unsubscribed, wrong contact, or invalid.

### Lead Detail Page
Shows:
- current state
- lead identity
- sending mailbox
- current campaign
- next action
- next action date
- full event history
