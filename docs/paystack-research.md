# Paystack Part 3 Research Notes

Paystack's official webhook documentation states that events carry an `x-paystack-signature` header containing an HMAC-SHA512 signature of the event payload signed with the secret key. The signature must be verified before processing. Paystack also requires an immediate `200 OK` acknowledgement; otherwise events may be retried for up to 72 hours. Long-running work should be handled asynchronously after acknowledgement. [1]

Paystack's official transaction verification documentation states that webhooks are preferred for confirming transaction status, but currently successful transactions are the webhook event type sent. The server-side Verify Transaction API should be called with the transaction reference for callback or SDK flows. The transaction status is in `response.data.status`, not the top-level API response status. The payment authorization object contains the payment instrument details. The documentation lists transaction statuses including abandoned, failed, ongoing, pending, processing, queued, reversed, and success. [2]

Implementation consequence: the repository will add a server-side payment service contract and webhook handler boundary, verify HMAC signatures, deduplicate references/events, compare verified amount and currency with the immutable order snapshot, and only then confirm the order and reduce inventory. The current frontend-only local checkout will be clearly labeled as a development fallback until server secrets and a deployed webhook endpoint are configured.

## References

[1]: https://paystack.com/docs/payments/webhooks/ "Paystack Webhooks documentation"
[2]: https://paystack.com/docs/payments/verify-payments/ "Paystack Verify Payments documentation"

## Browser verification

The local storefront loaded after the payment integration changes. The currency selector exposed GHS, NGN, USD, GBP, and EUR. Switching to GHS updated catalogue prices from USD amounts to GHS display amounts and showed the notice that payment currency is locked at checkout, preventing a silent currency change during payment.
