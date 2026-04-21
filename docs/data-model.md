# Data Model

## Purpose

This document defines the core data model for the email CRM.

The main goal of the system is to track each lead through a fixed outbound lifecycle while preserving:
- one source of truth per lead
- one active lifecycle state per lead
- one next action per lead
- a full event history for auditability and operations

This data model is intentionally simple for version 1.

---

## Core Design Principles

### One Lead, One Record
Each lead should exist once in the main system.

Duplicate records should be prevented where possible.

### One Lead, One Active Path
A lead should not belong to multiple active outreach paths at the same time.

### State First
The lead's current state should always be easy to determine.

### Next Action Driven
The system should always know the next action type and next action date for each active lead.

### Event Logging
Every major action should generate an event record.

---

## Core Tables

- `leads`
- `lead_events`
- `campaign_enrollments`
- `form_tracking`
- `suppression`
- `sending_mailboxes`

Later versions may add CRM sync logs, ownership history, and reply classification tables.

---

## 1. leads

## Purpose
Stores the main source-of-truth record for each lead.

## Fields

### Identity Fields
- `id`
- `full_name`
- `company_name`
- `email`
- `phone`
- `website`
- `industry`
- `location`
- `source`
- `source_external_id`

### Lifecycle Fields
- `current_state`
- `active_campaign_id`
- `next_action_type`
- `next_action_date`
- `priority`
- `owner_user_id`

### Outreach Fields
- `first_intro_sent_at`
- `last_outbound_sent_at`
- `last_reply_at`
- `followup_count`
- `recycle_count`

### Form Fields
- `form_status`
- `form_sent_at`
- `form_completed_at`
- `form_reminder_count`

### Parking Fields
- `parked_until`
- `parked_reason`

### CRM Fields
- `crm_status`
- `crm_pushed_at`
- `crm_external_id`
- `assigned_rep_name`

### Mailbox Fields
- `sending_mailbox_id`
- `sending_domain`

### Control Fields
- `is_suppressed`
- `suppression_reason`
- `is_duplicate`
- `duplicate_of_lead_id`

### Audit Fields
- `created_at`
- `updated_at`

---

## Recommended Enums for leads

### current_state
Allowed values:
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

### next_action_type
Allowed values:
- `send_intro`
- `send_followup`
- `send_form`
- `send_form_reminder`
- `send_final_form_reminder`
- `recycle_lead`
- `push_to_crm`
- `manual_review`
- `none`

### form_status
Allowed values:
- `not_sent`
- `sent_waiting`
- `reminder_1_sent`
- `final_reminder_sent`
- `completed`
- `abandoned`

### crm_status
Allowed values:
- `not_ready`
- `ready`
- `pushed`
- `failed`

### priority
Allowed values:
- `low`
- `normal`
- `high`

---

## 2. lead_events

## Purpose
Stores the full event history for each lead.

Every important state transition or operational action should create a lead event.

## Fields
- `id`
- `lead_id`
- `event_type`
- `from_state`
- `to_state`
- `description`
- `performed_by_user_id`
- `related_campaign_id`
- `related_mailbox_id`
- `occurred_at`
- `metadata_json`

## Recommended event_type values
- `lead_created`
- `intro_sent`
- `followup_sent`
- `positive_reply_received`
- `negative_reply_received`
- `form_sent`
- `form_reminder_sent`
- `final_form_reminder_sent`
- `form_completed`
- `lead_parked`
- `lead_recycled`
- `crm_ready`
- `crm_pushed`
- `lead_suppressed`
- `lead_restored`
- `mailbox_changed`
- `manual_state_change`

---

## 3. campaign_enrollments

## Purpose
Tracks which campaign or operational sequence a lead is currently or previously associated with.

A lead should only have one active campaign enrollment at a time.

## Fields
- `id`
- `lead_id`
- `campaign_name`
- `campaign_type`
- `status`
- `started_at`
- `ended_at`
- `is_active`
- `step_name`
- `step_number`

## Recommended campaign_type values
- `cold_outbound`
- `recycle`
- `form_followup`
- `manual`

## Recommended status values
- `active`
- `paused`
- `completed`
- `cancelled`

---

## 4. form_tracking

## Purpose
Tracks form-related actions in more detail than the simplified fields on the lead record.

Version 1 may keep this table simple.

## Fields
- `id`
- `lead_id`
- `form_url`
- `form_version`
- `sent_at`
- `completed_at`
- `status`
- `reminder_count`
- `last_reminder_sent_at`

## Recommended status values
- `not_sent`
- `sent`
- `reminder_1_sent`
- `final_reminder_sent`
- `completed`
- `abandoned`

---

## 5. suppression

## Purpose
Tracks suppression or do-not-contact logic separately for auditability and future restore support.

## Fields
- `id`
- `lead_id`
- `reason`
- `details`
- `suppressed_at`
- `suppressed_by_user_id`
- `is_active`

## Recommended reason values
- `unsubscribe`
- `wrong_contact`
- `invalid_email`
- `negative_reply`
- `duplicate`
- `manual_block`
- `already_in_crm`
- `bad_fit`

---

## 6. sending_mailboxes

## Purpose
Tracks the sending inbox or domain associated with outbound email activity.

## Fields
- `id`
- `mailbox_name`
- `email_address`
- `domain_name`
- `status`
- `daily_send_limit`
- `last_used_at`
- `bounce_rate`
- `reply_rate`
- `created_at`
- `updated_at`

## Recommended status values
- `active`
- `paused`
- `warming`
- `disabled`

---

## Suggested Relationships

- one `lead` has many `lead_events`
- one `lead` has many `campaign_enrollments`
- one `lead` has zero or one active `form_tracking` record in version 1
- one `lead` has zero or one active `suppression` record
- one `sending_mailbox` can be linked to many `leads`
- one active `campaign_enrollment` belongs to one `lead`

---

## Required Version 1 Constraints

### Required Constraint 1
A lead must not have more than one active campaign enrollment.

### Required Constraint 2
A suppressed lead must not have an active outbound next action.

### Required Constraint 3
A lead in `crm_pushed` or `do_not_contact` must not re-enter active cold outreach.

### Required Constraint 4
Every state change should create a `lead_event`.

### Required Constraint 5
A lead should be findable by email quickly and uniquely where possible.

---

## Version 1 Minimal Required Fields

If implementation needs to start even simpler, the minimum viable lead record should include:

- `id`
- `full_name`
- `company_name`
- `email`
- `current_state`
- `next_action_type`
- `next_action_date`
- `form_status`
- `parked_until`
- `crm_status`
- `sending_mailbox_id`
- `is_suppressed`
- `suppression_reason`
- `created_at`
- `updated_at`

And the minimum viable event record should include:

- `id`
- `lead_id`
- `event_type`
- `from_state`
- `to_state`
- `occurred_at`

---

## Future Extensions

Possible future additions:
- reply sentiment classification
- manual notes
- sales assignment tracking
- CRM sync log
- lead scoring
- list import batches
- bounce tracking
- email thread tracking
- contact replacement logic for wrong-contact replies

These should not block version 1.
