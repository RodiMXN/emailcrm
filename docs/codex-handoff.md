# Codex Handoff

## Project Goal

This repository is a fork of Twenty that is being converted into a focused email-first outbound CRM.

The goal is to preserve Twenty's existing clean UI and overall visual design while simplifying the product and changing the workflow to support outbound lead monitoring.

This is not intended to be a full traditional CRM.

The product should focus on:
- lead state tracking
- next action tracking
- event history
- parked/recycled leads
- form follow-up flow
- CRM handoff readiness
- suppression / do-not-contact logic

---

## Core Product Principles

- Keep the existing Twenty UI style wherever possible.
- Prefer hiding or simplifying unused features instead of redesigning the interface.
- Treat lead state as the center of the system.
- Every lead should have one current state and one next action.
- Every major action should create an event log entry.
- A lead must not belong to multiple active paths at the same time.

---

## Docs to Read First

Before making changes, read these files:

- `docs/email-crm-spec.md`
- `docs/state-machine.md`
- `docs/ui-plan.md`
- `docs/ui-customization-principles.md`
- `docs/data-model.md`
- `docs/implementation-priority.md`
- `docs/remove-list.md`

These documents define the intended product behavior.

---

## Version 1 Goal

Make the fork usable as a lightweight outbound lead-state monitor.

Version 1 should allow:

- storing a lead
- assigning a current state
- assigning a next action
- assigning a next action date
- tracking form status
- tracking parked state
- tracking suppression state
- showing event history
- showing queue-style views for operators

---

## Most Important Entities

Focus first on these concepts:

- Lead
- Lead Event
- Campaign Enrollment
- Form Tracking
- Suppression
- Sending Mailbox

---

## Current Implementation Priority

Follow this order:

1. adapt or extend the lead model
2. add lead state fields
3. add next action fields
4. add parked/form/CRM status fields
5. add lead event model
6. expose lead detail with state and event timeline
7. build queue-style operator views
8. hide or simplify unrelated CRM actions in the UI

---

## UI Direction

Keep:
- Twenty’s visual styling
- layout
- sidebar/navigation shell
- list/table style
- detail page style

Do not spend time redesigning the product visually.

Instead:
- hide irrelevant buttons
- hide irrelevant navigation items
- rename labels when necessary
- make state and next action more visible

---

## Things to Avoid

Do not prioritize:
- analytics dashboards
- deep forecasting features
- broad sales pipeline logic
- redesigning the UI
- enterprise complexity
- features unrelated to email lead workflow

---

## First Requested Task

The first implementation task should be:

1. identify the current Twenty object or model that is the best base for a lead
2. propose how to extend it with:
   - `current_state`
   - `next_action_type`
   - `next_action_date`
   - `parked_until`
   - `form_status`
   - `crm_status`
   - `is_suppressed`
   - `suppression_reason`
   - `sending_mailbox_id`
3. describe what files or modules need to change
4. make the smallest clean implementation plan before editing code

Do not make broad destructive refactors first.
