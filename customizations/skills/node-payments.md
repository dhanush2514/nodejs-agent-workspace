---
name: node-payments
description: "Use for Razorpay or Cashfree payment integration, orders, webhooks, refunds, idempotency and reconciliation."
---

# Payments

1. Confirm provider, API version, currencies, amount units, business state machine,
   refund/capture rules, idempotency, reconciliation and sandbox acceptance criteria.
2. Read current official provider documentation; do not invent signatures or SDK APIs.
   Separate provider adapter DTOs from domain payment models.
3. Create orders from server-validated amounts; never trust a client's paid status.
   Verify webhook signatures against the original raw bytes before JSON processing.
4. Persist provider event IDs and state transitions transactionally; handle duplicates,
   retries, out-of-order events and timeouts with uncertain external outcomes.
5. Use safe outbound timeouts/retries and reconciliation, not blind payment replay.
   Store secrets securely; log only approved identifiers, not full payloads.
6. Test sandbox flows, invalid signatures, replay, duplicates, partial failures and
   reconciliation. Update API/system/runbook docs and approved ADR.

No live charges, refunds or credentials are authorized by adding this skill/profile.
