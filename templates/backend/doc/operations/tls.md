# TLS operations

Certificates are externally provisioned. The operator owns domain/DNS validation,
trusted issuer selection, renewal monitoring, file permissions and expiry alerts.
Mount the certificate chain and matching private key read-only. Never put keys in
Git, an image, logs or setup answers.

Production preflight checks hostname, validity and key match. Confirm the actual
client trust chain separately. Self-signed fixtures belong only in isolated tests.
If required files are missing, stop; do not fall back to plaintext.

Renew using the approved issuer/process. Because single-file bind mounts can retain
the old inode after atomic host replacement, recreate the Nginx container after
validating the new files, or use an approved directory-mount/reload procedure.
Run `nginx -t`, apply the approved reload/recreation, then verify the served certificate
and HTTPS request from outside the host. Do not delete the previous material until
rollback is no longer needed.

HTTP redirects to the configured HTTPS hostname, not a user-controlled Host value.
Forwarded headers are overwritten. WebSocket/SSE changes require feature-specific
proxy configuration and tests.

Safe access logs contain method/status/timing/request ID, not URL queries or bodies.
Nginx error logging is restricted to critical failures because verbose upstream
errors can echo request URLs. Use safe access status metrics and application traces
for routine upstream diagnosis; review any temporary increase in log verbosity.
