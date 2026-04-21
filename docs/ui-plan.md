# UI Plan

## Purpose

This document defines the first version of the UI for the email CRM.

The UI should be focused on operational clarity, not on traditional CRM complexity.

The main purpose of the interface is to help the operator immediately understand:
- what state a lead is in
- what happened previously
- what should happen next
- when that next action is due

The UI should feel like a lead monitoring and control system, not a full sales CRM.

---

## Core Design Principle

Every important screen should answer one of these questions:

- Who needs action today?
- Who is waiting?
- Who replied?
- Who received a form but did not complete it?
- Who is parked for later?
- Who is ready for CRM?
- Who should never be contacted again?

---

## Primary Screens

### 1. Leads Due Today

#### Purpose
Shows all leads whose next action date is today or earlier.

#### Main Use
This is the operator’s main daily working queue.

#### Columns
- lead name
- company
- email
- current state
- active campaign
- next action type
- next action date
- sending mailbox
- last event
- priority

#### Actions
- send intro
- send follow-up
- send form
- send reminder
- park lead
- suppress lead
- open lead detail

---

### 2. Waiting for Reply

#### Purpose
Shows leads that are active in outreach but currently waiting for a reply.

#### Included States
- intro_sent
- waiting_followup
- followup_sent
- recycled

#### Columns
- lead name
- company
- email
- current state
- last outbound sent date
- next action date
- sending mailbox
- days since last touch

#### Actions
- open lead detail
- manually park
- manually suppress
- manually mark positive reply
- manually mark negative reply

---

### 3. Waiting for Form Completion

#### Purpose
Shows leads that were sent a form but have not completed it yet.

#### Included States
- form_sent
- form_reminder_1
- form_reminder_final

#### Columns
- lead name
- company
- email
- form status
- form sent date
- reminder count
- next reminder date
- last event

#### Actions
- send reminder
- mark form completed manually
- park lead
- suppress lead
- open lead detail

---

### 4. Parked / Recycle Queue

#### Purpose
Shows leads that are paused and may become eligible for future outreach.

#### Included States
- parked

#### Columns
- lead name
- company
- email
- parked reason
- parked until
- last outreach date
- recycle eligibility
- previous campaign

#### Actions
- recycle lead
- extend parked period
- suppress lead
- open lead detail

---

### 5. Ready for CRM

#### Purpose
Shows leads that completed the form and are ready to be pushed into CRM or handed off.

#### Included States
- form_completed
- crm_ready

#### Columns
- lead name
- company
- email
- form completed date
- current state
- CRM status
- owner
- last event

#### Actions
- push to CRM
- assign owner
- open lead detail
- suppress lead

---

### 6. Suppressed Leads

#### Purpose
Shows leads that should no longer receive outreach.

#### Included States
- do_not_contact
- negative_reply

#### Columns
- lead name
- company
- email
- suppression reason
- suppressed date
- last event
- source

#### Actions
- view lead detail
- restore manually if allowed

---

### 7. Lead Detail Page

#### Purpose
Shows the complete history and current status of a single lead.

#### Sections

##### Lead Identity
- name
- company
- email
- phone if available
- source
- industry if available

##### Lifecycle Status
- current state
- active campaign
- next action type
- next action date
- priority
- owner

##### Outreach Information
- first intro date
- last outbound date
- follow-up count
- recycle count
- sending mailbox
- sending domain

##### Form Information
- form status
- form sent date
- reminder count
- form completed date

##### CRM Information
- CRM status
- CRM pushed date
- assigned rep

##### Event Timeline
Chronological history of all major lead events.

Examples:
- intro sent
- follow-up sent
- positive reply
- form sent
- reminder sent
- form completed
- parked
- recycled
- pushed to CRM
- suppressed

#### Actions
- send email action
- mark reply
- send form
- mark form completed
- move to parked
- recycle
- suppress
- push to CRM

---

## Global UI Rules

### Simplicity
The UI should hide any traditional CRM concepts not needed for the outbound workflow.

### One Lead, One Active Path
The UI should always clearly show the single active path of the lead.

### Event Visibility
Every important lead action should appear in the event timeline.

### Status First
The current state and next action should always be visually obvious.

### Fast Operations
The most common operational actions should be available directly from list views.

---

## Version 1 Scope

Version 1 should focus only on:
- lead monitoring
- state visibility
- action queues
- event history
- manual operational control

Version 1 does not need:
- deep analytics dashboards
- deal forecasting
- opportunity tracking
- advanced permissions
- broad account management views
- unrelated CRM modules
