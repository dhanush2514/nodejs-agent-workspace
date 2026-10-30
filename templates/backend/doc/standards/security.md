# Security

Authentication is undecided until requirements and ADR approve a mechanism.
Authorization is server-side, deny-by-default, and includes resource ownership and
tenant isolation when required. An app-name header, CORS or client role is not trust.
Public endpoints are explicit; webhook signatures are not ordinary user auth.

No secrets in Git, images, logs, setup answers or API examples. Use approved secret
storage and mounted files. Validate external URLs and destinations; prevent SSRF,
unsafe redirects/path traversal and mass assignment. Bound resource consumption.
Avoid user enumeration in auth/recovery designs; clarify MFA/session/revocation needs.

Log structured, allowlisted operational metadata. Never log bodies, credentials,
cookies, raw query strings, payment details or location histories. Correlate with
server-generated request IDs and safe traces.

Scan dependencies/images. Findings require fixes or an explicit time-bounded,
reviewed exception with owner/evidence; never silently suppress scanner failure.
