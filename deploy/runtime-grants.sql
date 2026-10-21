-- Execute as the schema owner. Create the sml_runtime login and its password
-- through your secrets manager first; this file deliberately contains no secret.
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO sml_runtime;
GRANT SELECT, DELETE ON accounts TO sml_runtime;
GRANT UPDATE (lock_version) ON accounts TO sml_runtime;
GRANT SELECT ON access_tokens TO sml_runtime;
GRANT SELECT, INSERT, UPDATE, DELETE ON cohorts, memberships, assignments, attempts TO sml_runtime;
GRANT INSERT ON audit_events TO sml_runtime;
-- No CREATE, DROP, token issuance/revocation, account provisioning or audit deletion
-- privileges are granted to the API identity. Use a separate administrative role.

GRANT SELECT, INSERT ON recovery_assignments, recovery_attempts TO sml_runtime;
