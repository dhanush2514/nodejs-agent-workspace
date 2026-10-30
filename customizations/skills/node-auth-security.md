---
name: node-auth-security
description: "Use for login, authentication, sessions, tokens, authorization, roles/scopes, resource ownership, tenancy and backend security decisions."
---

# Authentication and authorization

1. Stop before choosing a mechanism. Ask which identities/clients exist, current
   identity provider, SSO/password/OTP/passkey needs, MFA/recovery, session lifecycle,
   logout/revocation, permissions, tenant rules and abuse/audit requirements.
2. Read accepted ADRs and threat/trust boundaries. Approval must precede implementation.
3. Separate identity verification, endpoint permissions and resource/tenant policy.
   Deny by default; app headers/CORS/client roles are not authorization.
4. Design input validation, rate/attempt controls, safe error responses, credential
   handling and secret rotation for the selected mechanism, not a generic JWT recipe.
5. Test missing/invalid/expired/revoked identity, insufficient scope, cross-user and
   cross-tenant access, enumeration, replay and forwarded-header spoofing as applicable.
6. Update `doc/systems/authentication.md`, authorization guide, APIs and ADRs.

The starter's UnconfiguredAuthenticator intentionally returns no principal.
Do not replace it with a fake header or hardcoded token to make a demonstration work.
