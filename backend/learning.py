"""Authenticated synthetic learning. Owner and membership checks precede every resource read/write."""
from typing import Literal, Annotated
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel, ConfigDict, Field
from . import core, recovery
from .security import principal, store_dependency
from .store import Store, identifier, now
router=APIRouter(prefix='/api/learning')
User=Annotated[dict,Depends(principal)]
Database=Annotated[Store,Depends(store_dependency)]
class Strict(BaseModel):
    model_config=ConfigDict(extra='forbid',strict=True)
class CohortInput(Strict):
    callsign: Literal['Alpha','Bravo','Charlie','Delta']
class MemberInput(Strict):
    learner_id: str = Field(pattern=r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')
class AssignmentInput(Strict):
    activity: Literal['assessment','dns','identity','power','builder','routing','satellite']
class Submission(Strict):
    answers: dict[str,int] = Field(default_factory=dict,max_length=len(core.QUIZ))
    checks: list[int] = Field(default_factory=list,max_length=len(core.QUIZ))
    diagnosis: Literal['dns','identity','power'] | None = None
    evidence: list[str] = Field(default_factory=list,max_length=4)
    decision: str | None = Field(default=None,max_length=24)

def instructor(user):
    if user['role']!='instructor':raise HTTPException(403,'Instructor access required')
def owner(db,connection,user,cohort):
    instructor(user)
    row=db.execute(connection,'SELECT * FROM cohorts WHERE id=? AND owner_id=?',(str(cohort),user['id'])).fetchone()
    if not row:raise HTTPException(404,'Cohort not found')
    return dict(row)
@router.get('/me')
def me(user:User):return user
@router.delete('/me',status_code=204)
def delete_me(user:User,db:Database):
    with db.transaction() as connection:
        db.audit(connection,user['id'],'account.deleted',user['id'])
        db.execute(connection,'DELETE FROM accounts WHERE id=?',(user['id'],))
    return Response(status_code=204)
@router.get('/cohorts')
def cohorts(user:User,db:Database):
    with db.transaction() as connection:
        if user['role']=='instructor':
            rows=db.execute(connection,'SELECT * FROM cohorts WHERE owner_id=? ORDER BY created_at,id LIMIT 100',(user['id'],)).fetchall()
        else:
            rows=db.execute(connection,'SELECT c.* FROM cohorts c JOIN memberships m ON m.cohort_id=c.id WHERE m.learner_id=? ORDER BY c.created_at,c.id LIMIT 100',(user['id'],)).fetchall()
    return [dict(row) for row in rows]
@router.post('/cohorts',status_code=201)
def create_cohort(body:CohortInput,user:User,db:Database):
    instructor(user);key=identifier();timestamp=now()
    with db.transaction() as connection:
        # Serialize per-owner quota checks across concurrent requests in PostgreSQL.
        db.execute(connection,'UPDATE accounts SET lock_version=lock_version WHERE id=?',(user['id'],))
        count=db.execute(connection,'SELECT count(*) AS n FROM cohorts WHERE owner_id=?',(user['id'],)).fetchone()['n']
        if count>=100:raise HTTPException(409,'Cohort limit reached')
        db.execute(connection,'INSERT INTO cohorts(id,owner_id,callsign,created_at) VALUES (?,?,?,?)',(key,user['id'],body.callsign,timestamp))
        db.audit(connection,user['id'],'cohort.created',key)
    return {'id':key,'callsign':body.callsign,'created_at':timestamp}
@router.delete('/cohorts/{cohort_id}',status_code=204)
def delete_cohort(cohort_id:UUID,user:User,db:Database):
    with db.transaction() as connection:
        owner(db,connection,user,cohort_id)
        db.execute(connection,'DELETE FROM cohorts WHERE id=?',(str(cohort_id),))
        db.audit(connection,user['id'],'cohort.deleted',str(cohort_id))
    return Response(status_code=204)
@router.post('/cohorts/{cohort_id}/members',status_code=201)
def add_member(cohort_id:UUID,body:MemberInput,user:User,db:Database):
    with db.transaction() as connection:
        owner(db,connection,user,cohort_id)
        db.execute(connection,'UPDATE cohorts SET callsign=callsign WHERE id=?',(str(cohort_id),))
        count=db.execute(connection,'SELECT count(*) AS n FROM memberships WHERE cohort_id=?',(str(cohort_id),)).fetchone()['n']
        if count>=100:raise HTTPException(409,'Membership limit reached')
        row=db.execute(connection,"SELECT id FROM accounts WHERE id=? AND role='learner'",(body.learner_id,)).fetchone()
        if not row:raise HTTPException(404,'Learner not found')
        db.execute(connection,'INSERT INTO memberships(cohort_id,learner_id) VALUES (?,?) ON CONFLICT (cohort_id,learner_id) DO NOTHING',(str(cohort_id),body.learner_id))
        db.audit(connection,user['id'],'member.added',body.learner_id)
    return {'learner_id':body.learner_id}
@router.delete('/cohorts/{cohort_id}/members/{learner_id}',status_code=204)
def remove_member(cohort_id:UUID,learner_id:UUID,user:User,db:Database):
    with db.transaction() as connection:
        owner(db,connection,user,cohort_id)
        db.execute(connection,'DELETE FROM memberships WHERE cohort_id=? AND learner_id=?',(str(cohort_id),str(learner_id)))
        # Erase this cohort's attempts so future re-enrollment starts with a clean record.
        db.execute(connection,'DELETE FROM attempts WHERE learner_id=? AND assignment_id IN (SELECT id FROM assignments WHERE cohort_id=?)',(str(learner_id),str(cohort_id)))
        db.audit(connection,user['id'],'member.removed',str(learner_id))
    return Response(status_code=204)
@router.get('/cohorts/{cohort_id}/progress')
def progress(cohort_id:UUID,user:User,db:Database):
    with db.transaction() as connection:
        cohort=owner(db,connection,user,cohort_id)
        members=db.execute(connection,'SELECT learner_id FROM memberships WHERE cohort_id=? ORDER BY learner_id LIMIT 100',(str(cohort_id),)).fetchall()
        assignments=db.execute(connection,'SELECT a.id,a.cohort_id,a.created_at,COALESCE(r.case_id,a.activity) AS activity FROM assignments a LEFT JOIN recovery_assignments r ON r.assignment_id=a.id WHERE a.cohort_id=? ORDER BY a.created_at,a.id LIMIT 100',(str(cohort_id),)).fetchall()
        attempts=db.execute(connection,'SELECT t.*,r.case_id,r.evidence_count,r.decision_supported FROM attempts t LEFT JOIN recovery_attempts r ON r.attempt_id=t.id JOIN assignments a ON a.id=t.assignment_id JOIN memberships m ON m.cohort_id=a.cohort_id AND m.learner_id=t.learner_id WHERE a.cohort_id=? ORDER BY t.created_at DESC,t.id LIMIT 500',(str(cohort_id),)).fetchall()
        latest=db.execute(connection,'SELECT * FROM (SELECT t.*,r.case_id,r.evidence_count,r.decision_supported,ROW_NUMBER() OVER (PARTITION BY t.learner_id,t.assignment_id ORDER BY t.created_at DESC,t.id DESC) AS position FROM attempts t LEFT JOIN recovery_attempts r ON r.attempt_id=t.id JOIN assignments a ON a.id=t.assignment_id JOIN memberships m ON m.cohort_id=a.cohort_id AND m.learner_id=t.learner_id WHERE a.cohort_id=?) ranked WHERE position=1',(str(cohort_id),)).fetchall()
    members,assignments,attempts=([dict(x) for x in rows] for rows in (members,assignments,attempts))
    return {'cohort':cohort,'members':members,'assignments':assignments,'attempts':attempts[:500], 'summary':recovery.summarize(members,assignments,[dict(x) for x in latest])}
@router.post('/cohorts/{cohort_id}/assignments',status_code=201)
def assign(cohort_id:UUID,body:AssignmentInput,user:User,db:Database):
    key=identifier()
    with db.transaction() as connection:
        owner(db,connection,user,cohort_id)
        db.execute(connection,'UPDATE cohorts SET callsign=callsign WHERE id=?',(str(cohort_id),))
        count=db.execute(connection,'SELECT count(*) AS n FROM assignments WHERE cohort_id=?',(str(cohort_id),)).fetchone()['n']
        if count>=100:raise HTTPException(409,'Assignment limit reached')
        db.execute(connection,'INSERT INTO assignments(id,cohort_id,activity,created_at) VALUES (?,?,?,?)',(key,str(cohort_id),'assessment' if body.activity in recovery.CASES else body.activity,now()))
        if body.activity in recovery.CASES:
            db.execute(connection,'INSERT INTO recovery_assignments(assignment_id,case_id) VALUES (?,?)',(key,body.activity))
        db.audit(connection,user['id'],'assignment.created',key)
    return {'id':key,'activity':body.activity,'cohort_id':str(cohort_id)}
@router.get('/assignments')
def assignments(user:User,db:Database):
    with db.transaction() as connection:
        rows=db.execute(connection,'SELECT a.id,a.cohort_id,COALESCE(r.case_id,a.activity) AS activity,a.created_at,c.callsign FROM assignments a LEFT JOIN recovery_assignments r ON r.assignment_id=a.id JOIN cohorts c ON c.id=a.cohort_id JOIN memberships m ON m.cohort_id=a.cohort_id WHERE m.learner_id=? ORDER BY a.created_at,a.id LIMIT 100',(user['id'],)).fetchall()
    return [dict(row) for row in rows]
@router.post('/assignments/{assignment_id}/attempts',status_code=201)
def submit(assignment_id:UUID,body:Submission,user:User,db:Database):
    if user['role']!='learner':raise HTTPException(403,'Learner access required')
    with db.transaction() as connection:
        # Serialize this learner's attempts and membership checks with deletion/revocation.
        db.execute(connection,'UPDATE accounts SET lock_version=lock_version WHERE id=?',(user['id'],))
        row=db.execute(connection,'SELECT COALESCE(r.case_id,a.activity) AS activity,a.cohort_id FROM assignments a LEFT JOIN recovery_assignments r ON r.assignment_id=a.id JOIN memberships m ON m.cohort_id=a.cohort_id WHERE a.id=? AND m.learner_id=?',(str(assignment_id),user['id'])).fetchone()
        if not row:raise HTTPException(404,'Assignment not found')
        count=db.execute(connection,'SELECT count(*) AS n FROM attempts WHERE assignment_id=? AND learner_id=?',(str(assignment_id),user['id'])).fetchone()['n']
        if count>=20:raise HTTPException(409,'Attempt limit reached')
        try:
            if row['activity'] in recovery.CASES:
                if body.answers or body.checks or body.diagnosis or body.decision is None:raise ValueError('Recovery choices required')
                result=recovery.grade(row['activity'],body.evidence,body.decision);score,total=result['score'],result['total']
            elif body.evidence or body.decision is not None:
                raise ValueError('Unexpected recovery fields')
            elif row['activity']=='assessment':
                if body.checks or body.diagnosis:raise ValueError('Unexpected diagnostic fields')
                result=core.grade(body.answers);score,total=result['score'],result['total']
            else:
                if body.answers or body.diagnosis is None:raise ValueError('Diagnosis required')
                result=core.diagnose(row['activity'],body.checks,body.diagnosis);score,total=result['score'],100
        except ValueError as error:raise HTTPException(422,str(error)) from error
        key,timestamp=identifier(),now()
        db.execute(connection,'INSERT INTO attempts(id,assignment_id,cohort_id,learner_id,score,total,created_at) VALUES (?,?,?,?,?,?,?)',(key,str(assignment_id),row['cohort_id'],user['id'],score,total,timestamp))
        if row['activity'] in recovery.CASES:
            db.execute(connection,'INSERT INTO recovery_attempts(attempt_id,case_id,evidence_count,decision_supported) VALUES (?,?,?,?)',(key,row['activity'],result['evidence_count'],int(result['decision_supported'])))
        db.audit(connection,user['id'],'attempt.submitted',key)
    return {'id':key,'assignment_id':str(assignment_id),'score':score,'total':total,'created_at':timestamp,'feedback':result}
@router.get('/attempts')
def my_attempts(user:User,db:Database):
    with db.transaction() as connection:
        rows=db.execute(connection,'SELECT t.id,t.assignment_id,t.score,t.total,t.created_at,COALESCE(r.case_id,a.activity) AS activity FROM attempts t JOIN assignments a ON a.id=t.assignment_id LEFT JOIN recovery_assignments r ON r.assignment_id=a.id WHERE t.learner_id=? ORDER BY t.created_at DESC,t.id LIMIT 100',(user['id'],)).fetchall()
    return [dict(row) for row in rows]
