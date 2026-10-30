# Authorization

Protected endpoint metadata names a permission. After authentication, middleware
checks the server-verified principal's permissions and returns 403 when absent.
The sample uses `notes:read` and `notes:write` solely to demonstrate this boundary.

No production roles, tenant model or resource ownership policy has been selected.
Do not infer those from the client app names. Real resource/tenant access checks
must run in the use case before disclosing or mutating data.
App-name headers and CORS are never authorization. Add negative cross-user/tenant
tests when those capabilities are approved.
