# Remove List

## Purpose

This document lists the parts of Twenty that should be hidden, removed, ignored, or de-prioritized while converting it into an email-first outbound CRM.

The goal is not to destroy the useful foundation of Twenty.
The goal is to reduce noise and keep only what supports the outbound lead-state workflow.

---

## Keep

These parts are likely useful and should remain available unless proven unnecessary:

- authentication
- user/workspace structure
- database and backend foundation
- record views and filtering
- search
- API and webhook support
- basic object management
- UI shell and navigation system

---

## Hide or Remove from the UI First

These should be removed from the operator’s main experience as early as possible if they do not directly support the email CRM workflow:

- traditional sales pipeline views
- opportunity / deal forecasting views
- revenue forecasting concepts
- non-essential account management pages
- unrelated dashboard widgets
- generic CRM onboarding flows
- modules that imply full sales CRM behavior
- any views that distract from lead-state operations

---

## De-Prioritize

These may exist in the codebase for now, but should not be part of version 1 work:

- advanced reporting
- broad analytics dashboards
- complex role systems beyond basic needs
- deep account hierarchies
- extensive custom object expansion
- non-email communication tracking
- unrelated automation systems
- enterprise-only style features not needed for a simple internal workflow

---

## Add Instead

As unnecessary parts are hidden, the following custom features should replace them in priority:

- lead state field and state-driven workflow
- next action type
- next action date
- parked until date
- event timeline for outreach actions
- form status tracking
- one active campaign per lead rule
- suppression status and suppression reason
- sending mailbox tracking
- CRM-ready queue
- recycle queue

---

## Important Principle

The conversion strategy should follow this order:

1. keep the useful platform foundation
2. add the email CRM state model
3. add the email CRM workflow screens
4. hide or bypass unrelated CRM features
5. remove deeper unused code only when safe

This is important because removing too much too early can break useful internal dependencies.

---

## Version 1 Focus

Version 1 should feel like:
- a lead operations dashboard
- an outreach control system
- a state-based lead monitor

Version 1 should not feel like:
- a general-purpose sales CRM
- a forecasting product
- a deal management system
- a bloated all-in-one enterprise tool
