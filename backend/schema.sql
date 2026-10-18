CREATE TABLE IF NOT EXISTS schema_versions (version INTEGER PRIMARY KEY);
CREATE TABLE IF NOT EXISTS accounts (
 id TEXT PRIMARY KEY,
 role TEXT NOT NULL CHECK (role IN ('learner','instructor')),
 lock_version INTEGER NOT NULL DEFAULT 0,
 created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS access_tokens (
 digest TEXT PRIMARY KEY,
 account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
 expires_at TEXT NOT NULL,
 revoked INTEGER NOT NULL DEFAULT 0 CHECK (revoked IN (0,1))
);
CREATE TABLE IF NOT EXISTS cohorts (
 id TEXT PRIMARY KEY,
 owner_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
 callsign TEXT NOT NULL CHECK (callsign IN ('Alpha','Bravo','Charlie','Delta')),
 created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS memberships (
 cohort_id TEXT NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
 learner_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
 PRIMARY KEY (cohort_id, learner_id)
);
CREATE TABLE IF NOT EXISTS assignments (
 id TEXT PRIMARY KEY,
 cohort_id TEXT NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
 activity TEXT NOT NULL CHECK (activity IN ('assessment','dns','identity','power')),
 created_at TEXT NOT NULL,
 UNIQUE (id,cohort_id)
);
CREATE TABLE IF NOT EXISTS attempts (
 id TEXT PRIMARY KEY,
 assignment_id TEXT NOT NULL,
 cohort_id TEXT NOT NULL,
 learner_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
 score INTEGER NOT NULL CHECK (score >= 0),
 total INTEGER NOT NULL CHECK (total > 0 AND score <= total),
 created_at TEXT NOT NULL,
 FOREIGN KEY (assignment_id,cohort_id) REFERENCES assignments(id,cohort_id) ON DELETE CASCADE,
 FOREIGN KEY (cohort_id,learner_id) REFERENCES memberships(cohort_id,learner_id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS audit_events (
 id TEXT PRIMARY KEY,
 actor_id TEXT NOT NULL,
 event TEXT NOT NULL,
 target_id TEXT NOT NULL,
 created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS token_account ON access_tokens(account_id);
CREATE INDEX IF NOT EXISTS cohort_owner ON cohorts(owner_id);
CREATE INDEX IF NOT EXISTS assignment_cohort ON assignments(cohort_id);
CREATE INDEX IF NOT EXISTS attempt_assignment ON attempts(assignment_id, learner_id);
CREATE INDEX IF NOT EXISTS attempt_learner ON attempts(learner_id);
INSERT INTO schema_versions(version) VALUES (1) ON CONFLICT (version) DO NOTHING;
