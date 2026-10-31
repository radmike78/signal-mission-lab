"""Bounded training API with optional authenticated persistent learning."""
import os
import sqlite3
from pathlib import Path
from typing import Literal
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.trustedhost import TrustedHostMiddleware
from pydantic import BaseModel, ConfigDict, Field
from . import core
from .limits import BodyLimit
from .security import PublicAPILimit
from .learning import router as learning_router
app = FastAPI(title="Signal Mission Lab", docs_url=None, redoc_url=None, openapi_url=None)
app.add_middleware(BodyLimit)
app.add_middleware(PublicAPILimit)
app.add_middleware(TrustedHostMiddleware,allowed_hosts=os.environ.get("SML_ALLOWED_HOSTS","localhost,127.0.0.1,testserver").split(","))
app.include_router(learning_router)

@app.exception_handler(RequestValidationError)
async def validation_error(request, error):
    # Never echo submitted credential values or arbitrary input in validation errors.
    return JSONResponse({"detail":"Invalid request fields or values"}, status_code=422)

@app.exception_handler(sqlite3.DatabaseError)
async def database_error(request, error):
    return JSONResponse({"detail":"Learning service unavailable"},status_code=503,headers={"Cache-Control":"no-store"})

import psycopg
app.add_exception_handler(psycopg.Error,database_error)
class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
class Diagnosis(StrictModel):
    fault: Literal["dns", "identity", "power"]
    checks: list[int] = Field(max_length=len(core.QUIZ))
    diagnosis: Literal["dns", "identity", "power"]
class Answers(StrictModel):
    answers: dict[str,int] = Field(max_length=len(core.QUIZ))
@app.middleware("http")
async def boundary(request, call_next):
    response = await call_next(request)
    response.headers["Cache-Control"] = "no-store"
    response.headers["X-Content-Type-Options"] = "nosniff"
    if request.url.path.startswith("/api/") or request.url.path == "/health":
        response.headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'"
    else:
        response.headers["Content-Security-Policy"] = "default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' data:; font-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; object-src 'none'"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=(), payment=(), usb=()"
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
    response.headers["Cross-Origin-Resource-Policy"] = "same-origin"
    if request.url.scheme == "https":
        response.headers["Strict-Transport-Security"] = "max-age=31536000"
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
def mentor(topic: Literal["mdmp","radar","signal","estimates","operations","planning","c2","unknown"]): return core.mentor(topic)
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

# Optional same-origin packaging: no CORS, no browser-selected API destinations.
if os.environ.get('SML_SERVE_WEB') == '1':
    app.mount('/', StaticFiles(directory=Path(__file__).resolve().parents[1]/'web/dist',html=True),name='web')
