# KenteGlobal Part 1 — Repository Audit, Baseline, and Safe Integration Architecture

**Prepared by:** Manus AI  
**Date:** 2026-08-18  
**Repository:** `FRANK12517/Florence-KenteGlobal`  
**Branch audited:** `main`  
**Commit audited:** `025eb18` (`Initial commit`)

## Executive Summary

The repository was inspected before any application implementation work. The current GitHub repository is an initial documentation-only repository: it contains a license file and a short README, but no frontend, backend, database, authentication, deployment, test, asset, or integration implementation. Therefore, there are no existing application features to remove or replace, but there is also no existing runnable product surface to preserve beyond the repository metadata and business statement in the README.

Part 1 is complete as an **audit and architecture exercise only**. No destructive database migration, application replacement, payment integration, authentication implementation, or GitHub commit was performed. The next implementation part should establish the production-oriented foundation deliberately rather than infer or overwrite a pre-existing codebase.

## 1. Repository Audit

### 1.1 Repository contents

| Area | Finding | Evidence | Status |
|---|---|---|---|
| Frontend framework | None detected | No source files or package manifest | Not present |
| Backend/API | None detected | No server, route, function, or API files | Not present |
| Database | None detected | No schema, migrations, ORM, or database config | Not present |
| Authentication/session logic | None detected | No auth/session files or dependencies | Not present |
| Pages/routes | None detected | No HTML, JSX, TSX, routing, or app files | Not present |
| Components | None detected | No component source files | Not present |
| Navigation/buttons/forms | None detected | No UI source files | Not present |
| Dashboards | None detected | No dashboard source files | Not present |
| Product/customer/admin functionality | None detected | No application code or data model | Not present |
| Responsive/mobile/PWA behavior | None detected | No CSS, manifest, service worker, or client code | Not present |
| Environment variables | None detected | No `.env*` files or environment documentation | Not present |
| Deployment | None detected | No `vercel.json`, framework config, Dockerfile, or CI workflow | Not present |
| Tests | None detected | No test/spec files or test configuration | Not present |
| Assets/design system | None detected | No image, font, CSS, token, or theme files | Not present |
| Integrations | None detected | No Paystack, TiDB, shipping, email, or analytics code | Not present |

The only product statement currently present is that KenteGlobal sells Ghanaian-made quality Bonwire Kente.[1]

### 1.2 Existing tracked files

| File | Purpose | Preservation decision |
|---|---|---|
| `README.md` | One-sentence business description | Preserve and expand only in a later implementation part |
| `LICENSE` | Repository license | Preserve unchanged unless the owner explicitly requests a license change |

The repository has one commit and no application tree. No source files, package manifests, lockfiles, migrations, or deployment files were found during the audit.

## 2. Baseline Report

### 2.1 Checks performed

The following baseline checks were performed against the checked-out `main` branch:

| Check | Result | Interpretation |
|---|---|---|
| Repository checkout | Passed | Repository cloned successfully from the selected GitHub repository |
| Git working tree before audit | Clean | `main` matched `origin/main` before audit artifacts were created |
| Package manifest discovery | No manifest | There is no `package.json`, and therefore no declared build or test scripts |
| Source discovery | No application source | No JavaScript, TypeScript, Python, Go, Java, HTML, or CSS files were present |
| Test discovery | No tests | No test/spec files or test configuration were present |
| Database discovery | No database implementation | No schema, migration, ORM, or connection configuration was present |
| Deployment discovery | No deployment configuration | No Vercel or other deployment configuration was present |
| Runtime/API check | Not applicable | There is no runnable application or API entry point |
| Browser/mobile check | Not applicable | There is no client application to launch |

Because the repository has no package manager manifest or executable application, a build or test command cannot be run without first creating new implementation code. This is a **baseline limitation**, not a newly introduced failure. The raw discovery output is retained as `baseline-command-output.txt` for traceability.

### 2.2 Existing errors and risks

No build, runtime, console, API, database, mobile, or navigation errors could be observed because no executable product exists in the audited revision. The primary baseline risk is the absence of a technical foundation: future work must make explicit choices for framework, API boundaries, database access, authentication, payment verification, delivery state, observability, and deployment.

## 3. Feature Inventory

The requested business scope is recorded as the target inventory, not as existing functionality. The present repository contains none of these features.

| Capability | Current repository state | Part 1 decision | Later integration boundary |
|---|---|---|---|
| Storefront/catalog | Not implemented | Plan as customer-facing web app | Product/catalog read APIs |
| Product pricing/variants | Not implemented | Normalize in database | Product, price, and variant services |
| Inventory | Not implemented | Use transaction ledger | Inventory service with atomic reservation/release |
| Images/videos | Not implemented | Store metadata separately from object storage | Media upload and delivery layer |
| Kente cultural information | Not implemented | Model as first-class editorial content | Cultural content administration/read APIs |
| Promotions/discounts/flash sales | Not implemented | Keep pricing rules server-side | Promotion and pricing evaluation service |
| Cart/guest checkout | Not implemented | Persist anonymous carts with secure identifiers | Cart and checkout APIs |
| Customers/addresses/wishlists/reviews | Not implemented | Separate customer identity from order snapshots | Customer domain APIs |
| Orders/payments | Not implemented | Treat Paystack callbacks as untrusted until verified | Checkout, payment, and order state machine |
| Shipping/delivery/tracking | Not implemented | Keep provider-neutral shipment model | Shipment and tracking adapters |
| Administrator accounts | Not implemented | Support exactly two authorized admin identities initially | Admin auth and authorization layer |
| 2FA/OTP | Not implemented | Require step-up authentication for admin access | OTP enrollment, challenge, recovery policy |
| Marketing/analytics/reports | Not implemented | Collect consent-aware events and derive reports server-side | Event, reporting, and export boundaries |
| Future designers/brands | Not implemented | Add nullable ownership/brand abstractions without marketplace behavior | Future seller/brand domain extension |

## 4. Safe Integration Architecture

### 4.1 Recommended foundation

The safest production-oriented foundation is a **mobile-first TypeScript web application deployed on Vercel**, backed by a server-side API layer and a normalized TiDB schema. The application should separate public storefront reads, customer actions, checkout/payment operations, and administrator operations. The payment provider must never be treated as the source of truth solely from a browser redirect; server-side verification and idempotent webhook processing are required before an order is marked paid.

The first implementation part should create only the smallest vertical foundation needed to make this architecture executable: project structure, configuration validation, database connection abstraction, migration discipline, authentication boundaries, and a health check. It should not create every future table or every admin screen in one migration.

### 4.2 Logical boundaries

```text
Customer browser / PWA
        |
        v
Vercel web application
  |-- public storefront and cultural content
  |-- customer account, cart, checkout
  |-- administrator UI (protected)
  |
  v
Server-side API and domain services
  |-- catalog and pricing
  |-- cart and order state machine
  |-- Paystack adapter + verified webhook handler
  |-- inventory ledger and reservation rules
  |-- shipping adapter and tracking events
  |-- admin authorization, 2FA, audit logging
        |
        +--> TiDB (normalized transactional data)
        +--> object storage (product media)
        +--> Paystack (payment initiation/verification)
        +--> shipping provider(s) (provider-neutral adapter)
        +--> email/SMS/analytics providers (consent-aware)
```

### 4.3 Security principles

Administrator access should use server-managed sessions, secure cookies, CSRF protection where applicable, strict authorization checks on every mutation, rate limits on login and OTP endpoints, and immutable audit records for privileged actions. The two administrator accounts should be provisioned through deployment or an administrative bootstrap procedure; credentials and OTP secrets must never be stored in frontend code or committed to Git.

Payment amounts, discounts, inventory availability, order totals, and shipping charges must be calculated or revalidated on the server. Paystack references and webhook payloads should be verified, deduplicated, and associated with an internal payment record before changing order state. Guest checkout should use an unguessable cart/session identifier and should not expose customer records by sequential IDs.

### 4.4 Initial normalized data model

Only the first implementation slice should be migrated initially. The model below is the architectural target and should be introduced incrementally after comparing each migration to the actual code.

| Domain | Initial entities | Notes |
|---|---|---|
| Identity | `administrators`, `administrator_sessions`, `administrator_2fa`, `customers`, `customer_addresses` | Keep admin and customer authentication concerns separate |
| Catalog | `products`, `product_categories`, `product_variants`, `product_images`, `product_videos` | Use stable product and variant identifiers; do not put inventory in frontend state only |
| Cultural content | `product_cultural_information`, `product_symbols`, `product_colours`, `product_regions` | Use join tables where relationships are many-to-many |
| Pricing/inventory | `currencies`, `product_prices`, `product_inventory`, `inventory_transactions` | Record currency and effective pricing explicitly; use an append-only inventory ledger |
| Commerce | `carts`, `cart_items`, `orders`, `order_items`, `payments`, `shipping_addresses` | Preserve order-time snapshots for price and address history |
| Fulfillment | `shipments`, `tracking_events` | Provider-neutral status and external reference fields |
| Engagement | `reviews`, `wishlists`, `notifications` | Enforce ownership and moderation rules server-side |
| Growth | `promotions`, `discount_codes`, `flash_sales`, `gift_cards`, `loyalty_accounts`, `loyalty_transactions`, `referrals` | Add when the relevant business workflow is implemented |
| Custom commerce | `custom_orders` | Separate inquiry/quote lifecycle from normal cart orders |
| Governance | `audit_logs` | Append-only privileged and sensitive business events |

The future marketplace should be represented by an extension point such as a nullable `brand_id` or `seller_id` abstraction only when the existing product model requires it. No seller onboarding, payout, seller permissions, or multi-vendor settlement should be implemented in Part 1.

### 4.5 Responsive and PWA requirements

New UI must be designed from the smallest supported viewport first, with layout verification at 320px, 360px, 375px, 390px, 412px, 430px, 480px, tablet, and desktop widths. Interactions must be usable through pointer, touch, and keyboard input where applicable. The implementation should prevent accidental horizontal overflow, use accessible focus states and labels, and defer service-worker/offline caching until caching and invalidation rules are defined.

## 5. Safe Implementation Sequence

| Sequence | Scope | Exit criteria |
|---|---|---|
| 1 | Establish app scaffold and environment validation | Local development and production build commands exist; secrets are validated server-side |
| 2 | Add database access and first migration discipline | TiDB connection is isolated; migration and rollback expectations are documented |
| 3 | Add shared domain types and API error conventions | Public/customer/admin boundaries are explicit and tested |
| 4 | Add admin authentication skeleton and 2FA boundary | Two-admin authorization policy, sessions, OTP flow contract, and audit hooks exist |
| 5 | Add catalog read model and minimal admin product workflow | Products, variants, media metadata, and prices are server-backed |
| 6 | Add cart and checkout contracts | Guest and registered checkout paths preserve inventory and price integrity |
| 7 | Add Paystack verification and order state transitions | Verification is server-side and idempotent; unpaid orders cannot be treated as paid |
| 8 | Add fulfillment, marketing, analytics, and reports incrementally | Each workflow has tests, permissions, and operational observability |

## 6. Preservation and Change-Control Rules

No existing application code was removed because none exists in the audited revision. The README and license remain preserved. Before each future implementation part, the working tree should be checked, a focused baseline should be run, and schema changes should be reviewed for reversibility and compatibility. New work should be additive and should not silently replace the business description or introduce marketplace assumptions.

No GitHub commit or push was made for this Part 1 audit. The audit documents and raw command output are intentionally left uncommitted for review and for use as the starting point for the next implementation part.

## References

[1]: ../README.md "KenteGlobal-1 repository README"
[2]: ../pasted_content.txt "User-provided KenteGlobal implementation Part 1 requirements"
