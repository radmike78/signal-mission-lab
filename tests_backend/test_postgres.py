"""PostgreSQL-specific constraint and privilege tests, enabled by CI service URL."""
import os
import unittest
from uuid import uuid4
from backend.store import Store, identifier, now

@unittest.skipUnless(os.environ.get('SML_TEST_POSTGRES_URL'),'PostgreSQL integration service not configured')
class PostgreSQLTests(unittest.TestCase):
 def setUp(self):
  self.store=Store(os.environ['SML_TEST_POSTGRES_URL'],testing=True);self.store.migrate()
 def test_runtime_role_cannot_modify_schema(self):
  import psycopg
  from psycopg import sql
  role='sml_test_'+uuid4().hex
  with self.store.transaction() as connection:
   connection.execute(sql.SQL('CREATE ROLE {} NOLOGIN').format(sql.Identifier(role)))
   connection.execute(sql.SQL('GRANT USAGE ON SCHEMA public TO {}').format(sql.Identifier(role)))
   connection.execute(sql.SQL('GRANT SELECT,DELETE ON accounts TO {}').format(sql.Identifier(role)))
   connection.execute(sql.SQL('GRANT UPDATE (lock_version) ON accounts TO {}').format(sql.Identifier(role)))
  try:
   with self.assertRaises(psycopg.errors.InsufficientPrivilege):
    with self.store.transaction() as connection:
     connection.execute(sql.SQL('SET LOCAL ROLE {}').format(sql.Identifier(role)))
     connection.execute('CREATE TABLE forbidden_runtime_table (id INTEGER)')
   with self.assertRaises(psycopg.errors.InsufficientPrivilege):
    with self.store.transaction() as connection:
     connection.execute(sql.SQL('SET LOCAL ROLE {}').format(sql.Identifier(role)))
     connection.execute('DROP TABLE accounts')
   with self.assertRaises(psycopg.errors.InsufficientPrivilege):
    with self.store.transaction() as connection:
     connection.execute(sql.SQL('SET LOCAL ROLE {}').format(sql.Identifier(role)))
     connection.execute("UPDATE accounts SET role='instructor' WHERE false")
   with self.store.transaction() as connection:
    connection.execute(sql.SQL('SET LOCAL ROLE {}').format(sql.Identifier(role)))
    self.assertIsNotNone(connection.execute('SELECT count(*) FROM accounts').fetchone())
    connection.execute('UPDATE accounts SET lock_version=lock_version WHERE false')
  finally:
   with self.store.transaction() as connection:
    connection.execute(sql.SQL('DROP OWNED BY {}').format(sql.Identifier(role)))
    connection.execute(sql.SQL('DROP ROLE {}').format(sql.Identifier(role)))
 def test_membership_foreign_key_blocks_orphan_attempt(self):
  import psycopg
  teacher=self.store.provision('instructor');learner=self.store.provision('learner')
  cohort,assignment=identifier(),identifier()
  try:
   with self.store.transaction() as connection:
    self.store.execute(connection,'INSERT INTO cohorts(id,owner_id,callsign,created_at) VALUES (?,?,?,?)',(cohort,teacher['account_id'],'Alpha',now()))
    self.store.execute(connection,'INSERT INTO assignments(id,cohort_id,activity,created_at) VALUES (?,?,?,?)',(assignment,cohort,'assessment',now()))
   with self.assertRaises(psycopg.errors.ForeignKeyViolation):
    with self.store.transaction() as connection:
     self.store.execute(connection,'INSERT INTO attempts(id,assignment_id,cohort_id,learner_id,score,total,created_at) VALUES (?,?,?,?,?,?,?)',(identifier(),assignment,cohort,learner['account_id'],1,3,now()))
  finally:
   with self.store.transaction() as connection:
    for account in [teacher,learner]:self.store.execute(connection,'DELETE FROM accounts WHERE id=?',(account['account_id'],))
 def test_recovery_runtime_grants_allow_learning_without_rubric_updates(self):
  from pathlib import Path
  import psycopg
  from psycopg import sql
  role='sml_recovery_'+uuid4().hex
  teacher=self.store.provision('instructor');learner=self.store.provision('learner')
  cohort,assignment,attempt=identifier(),identifier(),identifier()
  with self.store.transaction() as connection:
   connection.execute(sql.SQL('CREATE ROLE {} NOLOGIN').format(sql.Identifier(role)))
   script=(Path(__file__).resolve().parents[1]/'deploy/runtime-grants.sql').read_text()
   script='\n'.join(line for line in script.splitlines() if not line.lstrip().startswith('--'))
   for statement in script.replace('sml_runtime',sql.Identifier(role).as_string(connection)).split(';'):
    if statement.strip():connection.execute(statement)
   self.store.execute(connection,'INSERT INTO cohorts(id,owner_id,callsign,created_at) VALUES (?,?,?,?)',(cohort,teacher['account_id'],'Alpha',now()))
   self.store.execute(connection,'INSERT INTO memberships(cohort_id,learner_id) VALUES (?,?)',(cohort,learner['account_id']))
   self.store.execute(connection,'INSERT INTO assignments(id,cohort_id,activity,created_at) VALUES (?,?,?,?)',(assignment,cohort,'assessment',now()))
   self.store.execute(connection,'INSERT INTO attempts(id,assignment_id,cohort_id,learner_id,score,total,created_at) VALUES (?,?,?,?,?,?,?)',(attempt,assignment,cohort,learner['account_id'],5,5,now()))
  try:
   with self.store.transaction() as connection:
    connection.execute(sql.SQL('SET LOCAL ROLE {}').format(sql.Identifier(role)))
    self.store.execute(connection,'INSERT INTO recovery_assignments(assignment_id,case_id) VALUES (?,?)',(assignment,'builder'))
    self.store.execute(connection,'INSERT INTO recovery_attempts(attempt_id,case_id,evidence_count,decision_supported) VALUES (?,?,?,?)',(attempt,'builder',4,1))
    self.assertIsNotNone(self.store.execute(connection,'SELECT * FROM recovery_attempts WHERE attempt_id=?',(attempt,)).fetchone())
   with self.assertRaises(psycopg.errors.InsufficientPrivilege):
    with self.store.transaction() as connection:
     connection.execute(sql.SQL('SET LOCAL ROLE {}').format(sql.Identifier(role)))
     self.store.execute(connection,'UPDATE recovery_attempts SET evidence_count=0 WHERE attempt_id=?',(attempt,))
   with self.store.transaction() as connection:
    connection.execute(sql.SQL('SET LOCAL ROLE {}').format(sql.Identifier(role)))
    self.store.execute(connection,'DELETE FROM attempts WHERE id=?',(attempt,))
    self.assertIsNone(self.store.execute(connection,'SELECT * FROM recovery_attempts WHERE attempt_id=?',(attempt,)).fetchone())
  finally:
   with self.store.transaction() as connection:
    for account in [teacher,learner]:self.store.execute(connection,'DELETE FROM accounts WHERE id=?',(account['account_id'],))
    connection.execute(sql.SQL('DROP OWNED BY {}').format(sql.Identifier(role)))
    connection.execute(sql.SQL('DROP ROLE {}').format(sql.Identifier(role)))
