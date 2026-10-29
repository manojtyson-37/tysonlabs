-- Run ONCE per database as a superuser/admin, before migrations. Replace the passwords.
-- reviews_owner runs migrations; reviews_app is what the deployed service connects as.
-- reviews_app must NOT own tables, be a superuser, or have BYPASSRLS: that is what makes RLS binding.
CREATE ROLE reviews_owner LOGIN PASSWORD 'CHANGE_ME_OWNER' NOSUPERUSER NOBYPASSRLS;
CREATE ROLE reviews_app   LOGIN PASSWORD 'CHANGE_ME_APP'   NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE;
GRANT CREATE ON SCHEMA public TO reviews_owner;
