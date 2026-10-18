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
