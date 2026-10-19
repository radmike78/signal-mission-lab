"""CI-only synthetic recovery rows to verify backup/restore data, not just schema."""
import os
from pathlib import Path
import sys
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from backend.store import Store, now

def main():
    if os.environ.get('GITHUB_ACTIONS')!='true' or os.environ.get('SML_ENV')!='test':
        raise RuntimeError('This fixture is restricted to the CI test environment')
    db=Store(os.environ['SML_TEST_POSTGRES_URL'],testing=True)
    ids=['00000000-0000-4000-8000-'+str(i).zfill(12) for i in range(1,6)]
    teacher,learner,cohort,assignment,attempt=ids
    with db.transaction() as connection:
        for key,role in [(teacher,'instructor'),(learner,'learner')]:
            db.execute(connection,'INSERT INTO accounts(id,role,created_at) VALUES (?,?,?)',(key,role,now()))
        db.execute(connection,'INSERT INTO cohorts(id,owner_id,callsign,created_at) VALUES (?,?,?,?)',(cohort,teacher,'Alpha',now()))
        db.execute(connection,'INSERT INTO memberships(cohort_id,learner_id) VALUES (?,?)',(cohort,learner))
        db.execute(connection,'INSERT INTO assignments(id,cohort_id,activity,created_at) VALUES (?,?,?,?)',(assignment,cohort,'assessment',now()))
        db.execute(connection,'INSERT INTO recovery_assignments(assignment_id,case_id) VALUES (?,?)',(assignment,'builder'))
        db.execute(connection,'INSERT INTO attempts(id,assignment_id,cohort_id,learner_id,score,total,created_at) VALUES (?,?,?,?,?,?,?)',(attempt,assignment,cohort,learner,4,5,now()))
        db.execute(connection,'INSERT INTO recovery_attempts(attempt_id,case_id,evidence_count,decision_supported) VALUES (?,?,?,?)',(attempt,'builder',3,1))
    print('Synthetic recovery restore fixture created; no access credentials issued')

if __name__=='__main__':main()
