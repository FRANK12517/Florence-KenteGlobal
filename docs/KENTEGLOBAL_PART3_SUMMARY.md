# KenteGlobal Part 3 — Paystack Payment Engine and Global Currency Architecture

**Status:** Implemented locally; not committed or pushed.  
**Repository:** `FRANK12517/Florence-KenteGlobal`  
**Date:** 2026-08-18

## Delivered

Part 3 adds a server-oriented Paystack payment boundary and multi-currency customer experience without removing the Part 1 or Part 2 work. The implementation includes shared supported-currency metadata for GHS, NGN, USD, GBP, and EUR; persistent manual currency selection; customer-facing price conversion; immutable order currency and charged amount snapshots; payment records with unique references and payment states; an administrator payment view; and browser messaging that payment currency is locked at checkout.

The server payment module in `server/paystack.js` contains the production integration boundary. It verifies Paystack webhook signatures with HMAC-SHA512, validates references, amounts, and currencies, maps Paystack transaction statuses into KenteGlobal payment states, deduplicates webhook events, and applies inventory only once after a verified successful payment. It also includes a server-only transaction initialization function that requires `PAYSTACK_SECRET_KEY` and never exposes that secret to frontend code.

The current browser checkout creates a **Pending** payment draft for development continuity. It does not claim a browser redirect as payment confirmation. In production, the `initializePaystackTransaction` function and an HTTP webhook route should be connected to the deployed server runtime. Only verified webhook or server-side transaction responses should transition the payment and order to Paid and apply inventory fulfillment.

## Payment state mapping

| Paystack transaction state | KenteGlobal state | Inventory fulfillment |
|---|---|---|
| `success` | Paid | Applied once after reference, amount, and currency checks |
| `pending`, `ongoing`, `processing`, `queued` | Processing or Pending | Not applied |
| `failed` | Failed | Not applied |
| `abandoned` | Cancelled | Not applied |
| `reversed` | Refunded | Reversal/refund workflow required |

## Verification

The final verification run passed **5 tests across 2 test files**. Coverage includes HMAC-SHA512 signature validation, successful payment verification, incorrect amount rejection, incorrect currency rejection, duplicate webhook handling, duplicate inventory protection, and failed payment synchronization. The production Vite build also passed.

The browser storefront was verified after the changes. The currency selector displayed all five configured currencies, and switching to GHS updated catalogue prices while displaying the checkout currency-lock notice.

## Deployment requirements

Before production deployment, configure `PAYSTACK_SECRET_KEY` as a Vercel server-side environment variable only. Add a server route for Paystack webhooks that reads the raw request body, validates `x-paystack-signature`, acknowledges quickly with HTTP 200, and queues or performs idempotent fulfillment. Connect the order/payment stores to TiDB rather than browser `localStorage`, and move inventory updates into a transaction-safe database operation.

Paystack capabilities are account and market dependent. The configured currency list is an application architecture layer; the live Paystack account configuration must be checked before enabling a currency for actual payment initialization. The displayed amount and currency must be stored on the order and payment record and compared to the verified Paystack response.

## References

[1]: https://paystack.com/docs/payments/webhooks/ "Paystack Webhooks documentation"
[2]: https://paystack.com/docs/payments/verify-payments/ "Paystack Verify Payments documentation"
