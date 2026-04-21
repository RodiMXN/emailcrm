# Implementation Priority

## Purpose

This document defines the recommended order for implementing the email CRM inside the Twenty fork.

The goal is to avoid random refactoring and focus first on the highest-value workflow pieces.

---

## Guiding Principle

Do not try to fully convert Twenty all at once.

Build the system in narrow, working layers.

Each phase should leave the application in a working state.

---

## Phase 1: Foundation

### Goal
Prepare the repo and establish product structure.

### Tasks
- keep current Twenty UI and visual system
- add product docs
- define lead states
- define core data model
- define main operator screens
- identify which existing Twenty objects can be reused

### Output
A stable planning branch with enough structure for implementation.

---

## Phase 2: Core Lead State Model

### Goal
Make lead state the center of the product.

### Tasks
- create or adapt the main lead object
- add `current_state`
- add `next_action_type`
- add `next_action_date`
- add `parked_until`
- add `form_status`
- add `crm_status`
- add suppression fields
- add sending mailbox reference

### Output
A lead record that can represent the outbound workflow.

---

## Phase 3: Event History

### Goal
Track all important actions and state changes.

### Tasks
- create `lead_events`
- record state changes as events
- record outbound sends as events
- record form sends and completions as events
- record suppression and CRM push events

### Output
A visible audit trail for each lead.

---

## Phase 4: Primary Operator Views

### Goal
Make the system usable for daily operations.

### Tasks
- build or adapt list views for:
  - leads due today
  - waiting for reply
  - waiting for form completion
  - parked / recycle queue
  - ready for CRM
  - suppressed leads
- expose only the most useful actions in those views

### Output
A practical daily workflow interface.

---

## Phase 5: State Transition Actions

### Goal
Allow operators to move leads correctly through the workflow.

### Tasks
- send intro action
- send follow-up action
- send form action
- send reminder action
- park lead action
- recycle lead action
- suppress lead action
- push to CRM action
- manual state change action with event logging

### Output
A usable state-driven operational system.

---

## Phase 6: Simplify the Product Experience

### Goal
Reduce noise while preserving Twenty’s visual quality.

### Tasks
- hide unused buttons
- hide unused navigation items
- remove unrelated operator actions from key screens
- preserve layout, colors, and core UI style
- rename labels where necessary to fit email workflow

### Output
A cleaner, sharper outbound-focused product.

---

## Phase 7: Automation Support

### Goal
Reduce manual work without overcomplicating version 1.

### Tasks
- automatically compute due follow-ups
- automatically compute recycle eligibility
- automatically compute form reminder timing
- prevent conflicting active campaign states
- prevent outreach on suppressed leads

### Output
A more reliable and less manual system.

---

## Phase 8: CRM Handoff

### Goal
Complete the outbound lifecycle.

### Tasks
- mark completed forms as CRM-ready
- create push-to-CRM action
- log CRM handoff events
- prevent re-entry into cold outreach after handoff

### Output
A complete first lifecycle from new lead to CRM transfer.

---

## Version 1 Success Criteria

Version 1 is successful if:

- a lead can be created
- a lead can move through intro -> follow-up -> parked
- a positive reply can move a lead into form flow
- a form completion can move a lead into CRM-ready
- every important step is visible in the event timeline
- operators can work mainly from queue-style views
- the product still looks and feels like Twenty
- irrelevant CRM clutter is reduced

---

## Things to Avoid Early

Do not focus early on:
- analytics dashboards
- redesigning the UI
- advanced permissions
- deep account hierarchies
- broad custom object systems
- enterprise workflow complexity

These can wait until the core lifecycle works.
