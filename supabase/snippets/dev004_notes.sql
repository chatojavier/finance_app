/*
DEV-004 | Decisions log

1) Ledger shape:
   - Chosen model: amount + direction
   - amount must be > 0
   - direction is constrained to ('in', 'out')

2) transactions.category_id:
   - Optional in v0 (nullable) to keep MVP flexibility.

3) profiles lifecycle:
   - profiles row is NOT auto-created in this ticket.
   - Profile creation is deferred to onboarding/auth follow-up flow.

4) Accounts deletion policy:
   - Hard delete is blocked for authenticated users (no DELETE policy on accounts).
   - Historical transactions must remain immutable; account archival is the supported path.

5) Transaction currency consistency:
   - transactions.currency must match the referenced account.currency in v0.
*/
