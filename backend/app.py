"""Read-only/bounded API. Intentionally no authentication or learner persistence yet."""
from typing import Literal
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, ConfigDict, Field
from . import core
from .limits import BodyLimit
app = FastAPI(title="Signal Mission Lab", docs_url=None, redoc_url=None, openapi_url=None)
app.add_middleware(BodyLimit)
class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
class Diagnosis(StrictModel):
    fault: Literal["dns", "identity", "power"]
    checks: list[int] = Field(max_length=3)
    diagnosis: Literal["dns", "identity", "power"]
class Answers(StrictModel):
    answers: dict[str,int] = Field(max_length=3)
@app.middleware("http")
async def boundary(request, call_next):
    response = await call_next(request)
    response.headers["Cache-Control"] = "no-store"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'"
    return response
@app.get("/health")
def health(): return {"status":"ok", "scope":"synthetic training"}
@app.get("/api/catalog")
def catalog(): return core.catalog()
@app.get("/api/graph")
def graph(): return core.graph()
@app.get("/api/requirements/{scenario_id}")
def requirements(scenario_id: Literal["fires","brigade","intelligence"]):
    return core.requirements(scenario_id)
@app.get("/api/mentor/{topic}")
def mentor(topic: Literal["mdmp","radar","unknown"]): return core.mentor(topic)
@app.get("/api/assessment")
def assessment(): return [{k:v for k,v in q.items() if k not in {"answer","rationale"}} for q in core.QUIZ]
@app.post("/api/assessment")
def assessment_grade(body: Answers):
    try: return core.grade(body.answers)
    except ValueError as error: raise HTTPException(422, str(error)) from error
@app.post("/api/diagnose")
def diagnose(body: Diagnosis):
    try: return core.diagnose(body.fault, body.checks, body.diagnosis)
    except ValueError as error: raise HTTPException(422, str(error)) from error
