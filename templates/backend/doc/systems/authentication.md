# Authentication

Status: **not configured / decision pending**.

The `Authenticator` contract accepts request headers and returns a verified
principal or no principal. The default `UnconfiguredAuthenticator` returns none,
so protected endpoints reject requests with 401. It is not a login implementation.
Test identity providers live only in tests and are never selected by server config.

Before implementation clarify actors, IdP, password/OTP/SSO/passkeys, MFA/recovery,
cookies/tokens/sessions, expiry, logout/revocation, abuse controls and acceptance tests.
Approve an ADR and update API security schemes and this explanation with actual
lifecycle behavior. Do not insert hardcoded credentials or trust a client identity.
