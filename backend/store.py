"""Parameterized persistence. PostgreSQL for deployment; SQLite only for isolated tests."""
from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
import hashlib
import os
from pathlib import Path
import secrets
import sqlite3
from urllib.parse import urlsplit, parse_qs
from uuid import uuid4

def now():
    return datetime.now(timezone.utc).isoformat()

def identifier():
    return str(uuid4())

def digest(token):
    return hashlib.sha256(token.encode('ascii')).hexdigest()

class Store:
    def __init__(self, url, testing=False):
        self.url = url
        self.sqlite = url.startswith('sqlite:///')
        if self.sqlite:
            if not testing:
                raise ValueError('SQLite is only supported in tests')
            self.path = url[len('sqlite:///'):]
        else:
            parsed = urlsplit(url)
            if parsed.scheme not in {'postgresql', 'postgres'}:
                raise ValueError('PostgreSQL connection required')
            if not testing and parse_qs(parsed.query).get('sslmode') not in [['verify-full']]:
                raise ValueError('PostgreSQL requires sslmode=verify-full')
    @contextmanager
    def transaction(self):
        if self.sqlite:
            connection = sqlite3.connect(self.path, timeout=5)
            connection.row_factory = sqlite3.Row
            connection.execute('PRAGMA foreign_keys = ON')
        else:
            import psycopg
            from psycopg.rows import dict_row
            connection = psycopg.connect(self.url, row_factory=dict_row, connect_timeout=5, options="-c statement_timeout=5000 -c lock_timeout=3000")
        try:
            yield connection
            connection.commit()
        except BaseException:
            connection.rollback()
            raise
        finally:
            connection.close()
    def execute(self, connection, sql, params=()):
        # Only constant application SQL is supplied. Values are always bound separately.
        return connection.execute(sql if self.sqlite else sql.replace('?', '%s'), params)
    def migrate(self):
        with self.transaction() as connection:
            for statement in (Path(__file__).with_name('schema.sql')).read_text().split(';'):
                if statement.strip():
                    self.execute(connection, statement)
    def audit(self, connection, actor, event, target):
        self.execute(connection,'INSERT INTO audit_events(id,actor_id,event,target_id,created_at) VALUES (?,?,?,?,?)',
                     (identifier(),actor,event,target,now()))
    def provision(self, role, days=1):
        if role not in {'learner','instructor'} or type(days) is not int or not 1 <= days <= 7:
            raise ValueError('Invalid account provisioning options')
        account, token = identifier(), secrets.token_urlsafe(32)
        with self.transaction() as connection:
            self.execute(connection,'INSERT INTO accounts(id,role,created_at) VALUES (?,?,?)',(account,role,now()))
            self.execute(connection,'INSERT INTO access_tokens(digest,account_id,expires_at) VALUES (?,?,?)',
                         (digest(token),account,(datetime.now(timezone.utc)+timedelta(days=days)).isoformat()))
            self.audit(connection,account,'account.provisioned',account)
        return {'account_id':account,'role':role,'access_token':token}
    def authenticate(self, token):
        with self.transaction() as connection:
            row = self.execute(connection,
                'SELECT a.id,a.role FROM accounts a JOIN access_tokens t ON t.account_id=a.id '
                'WHERE t.digest=? AND t.revoked=0 AND t.expires_at>?',(digest(token),now())).fetchone()
            return dict(row) if row else None
    def revoke(self, account):
        with self.transaction() as connection:
            self.execute(connection,'UPDATE access_tokens SET revoked=1 WHERE account_id=?',(account,))
            self.audit(connection,account,'account.revoked',account)

def configured_store():
    url=os.environ.get('SML_DATABASE_URL')
    if not url:
        raise ValueError('Persistence is not configured')
    return Store(url, testing=os.environ.get('SML_ENV')=='test')
