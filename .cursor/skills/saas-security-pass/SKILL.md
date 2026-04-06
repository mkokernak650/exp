---
name: saas-security-pass
description: Reviews or hardens changes for multi-customer SaaS safety (authorization, data scoping, mass assignment, secrets). Use before finishing features that touch IDs from the client, customer/affiliate/campaign data, exports, deletes, or public/token links.
---

# SaaS security pass

Run this mentally (and in code) before treating a task as done when it touches **tenant-like data** (customers, affiliates, campaigns, insertion orders, call logs, etc.) or **destructive** actions.

## 1. Identity and authorization

- Every **mutating** route (`POST`, `PUT`, `PATCH`, `DELETE`) must enforce **who** can act: middleware, policies, or explicit checks — not only UI hiding.
- Never trust **IDs from the browser** alone. Resolve the record, then verify the authenticated user may access it (same pattern as existing controllers for that domain).
- **Public** routes (`*PublicController`, unsigned links) must use the **narrowest** token/identifier and **minimal** data exposure; compare with existing public IO patterns in this repo.

## 2. Query scoping

- List and show queries should be **scoped** to the correct customer/org/affiliate/campaign when the domain requires it (follow how sibling models are filtered in existing controllers).
- Avoid returning **other customers’** rows due to missing `where` constraints or join leaks.

## 3. Mass assignment and input

- Use `$fillable` / `$guarded` (or explicit `only()` / DTO-style assignment) so new columns on models are not silently writable from requests.
- Validate **all** write input: arrays, enums, dates, and comma-separated IDs — reject unexpected fields where appropriate.

## 4. Information disclosure

- **Errors and validation messages**: avoid leaking existence of resources across tenants (“not found” vs “forbidden” — prefer generic messages where it matters).
- **Exports and APIs**: only include columns the user is allowed to see; paginate large datasets.

## 5. Logging and notifications

- Do not log **passwords**, **tokens**, **full payment data**, or unnecessary **PII** (emails/phones) at info level; follow existing `Notification` usage without copying sensitive values into logs.

## 6. Front-end

- Client-side checks are **UX only**. All enforcement is **server-side**.
- Do not put **secrets** or **bypass tokens** in `resources/js` bundle code.

## Output when reviewing

Summarize briefly:

1. **Risk level** (low/medium/high) and why  
2. **What was verified** (policy, middleware, query scope, validation)  
3. **Residual risks** or follow-ups (e.g. “needs rate limit on public route”)

## Done checklist

- [ ] Mutations authorized on the server for the resolved resource
- [ ] Queries scoped consistently with similar features
- [ ] Input validated; mass assignment safe
- [ ] No secrets or sensitive PII in logs/client bundle
- [ ] Public/token flows match or improve on existing hardening patterns
