"""Owner-only provisioning CLI. Never run against a database with untrusted data."""
import argparse
import json
from .store import configured_store

def main():
    parser=argparse.ArgumentParser(description='Signal Mission Lab database administration')
    subs=parser.add_subparsers(dest='command',required=True)
    subs.add_parser('migrate')
    create=subs.add_parser('provision')
    create.add_argument('role',choices=['learner','instructor'])
    create.add_argument('--days',type=int,choices=range(1,8),default=1)
    revoke=subs.add_parser('revoke');revoke.add_argument('account_id')
    args=parser.parse_args();store=configured_store()
    if args.command=='migrate':
        store.migrate(); print('Schema migration applied')
    elif args.command=='provision':
        # One-time terminal output; distribute through an approved secret channel, not logs.
        print(json.dumps(store.provision(args.role,args.days)))
    elif args.command=='revoke':
        from uuid import UUID
        account=str(UUID(args.account_id));store.revoke(account);print('Access revoked')
if __name__=='__main__':main()
