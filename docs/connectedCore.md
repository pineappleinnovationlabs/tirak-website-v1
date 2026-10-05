# Connected Core website candidate

The website links guide CTAs to `/apply`, persists a submission attempt before sending it, and retains the server application reference and private status capability after success. A retry sends the original payload and UUID. Edited data requires an explicit new attempt with a warning that the previous request may already have been accepted. Status and evidence requests are cancelled when the application scope changes.

Guide intake uses the Core `/supplier-onboarding` API with `mode: tirak`, structured individual-guide profile fields, inactive service drafts, and seven explicit weekday entries in `Asia/Bangkok`. Sunday is zero. Service duration must be an integer from 30 through 1439 minutes. Users provide price, duration and availability; blank fields do not create assumed services or working hours.

Application approval provisions a pending guide account and trial. Account activation, separate guide-profile verification, service activation and publication are distinct stages. This candidate contains no payment integration. Booking confirmation or completion cannot imply a successful charge.

Verification files upload through the application capability endpoint into private storage. The client retains opaque evidence references and never displays storage URLs. Capabilities use Authorization headers, never query parameters. Restore uses the saved receipt and fetches current server status; malformed envelopes are errors.

Interest signup uses `/interest` and returns a durable independent interest reference. It does not create an application or an account. `api/signup.ts` is an optional server adapter for deployments that execute that file. The isolated static Worker hosts the SPA; its forms use the direct browser API and do not rely on that adapter.

## Configuration and hosting

Set `VITE_CORE_API_URL` explicitly at build time, including `/api`. Missing configuration fails visibly without a fallback. The optional server adapter requires `CORE_API_URL`. The public example targets the dedicated candidate API:

```
https://tirak-core-qa-20261005.tirak-court.workers.dev/api
```

The planned isolated website URL is `https://tirak-core-qa-website-20261005.tirak-court.workers.dev`. Canonical hosting and DNS are separate release decisions. Deployment is complete only when a hosted receipt and browser journey exist.

## Verification

Run `npm run typecheck`, `npm test`, `npm run lint`, and build with the explicit QA API into `.qa-dist` using `npm run build -- --outDir .qa-dist`. Typecheck checks the app, Vite configuration, and optional adapter independently. Contracts cover immutable retries, strict response parsing, private capabilities, and cancellation. Unit tests do not establish hosted or device acceptance.

The upstream repository tracks historical `node_modules` and `dist` files. Connected source commits stage exact source/config/test/documentation paths only. Generated dependency/cache/build changes from local verification remain separately identified; do not reset unrelated checkout state or include generated vendor files in this feature change.
