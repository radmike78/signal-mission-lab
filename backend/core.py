"""Closed-corpus training services: no user text, uploads, tool execution or LLM."""
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
def load(name):
    return json.loads((ROOT / "data" / name).read_text())
def catalog():
    return load("catalog.json")
def graph():
    data = catalog()
    return {"nodes": data["equipment"], "edges": load("relationships.json")["relationships"], "claims": load("sources.json")["claims"], "coverage": load("equipment-coverage.json")}
def requirements(scenario_id):
    scenario = next((s for s in catalog()["scenarios"] if s["id"] == scenario_id), None)
    if scenario is None:
        raise ValueError("Unknown synthetic scenario")
    return {"scenario": scenario, "rows": [{"need": need, "owner": owner, "evidence": evidence, "status": "requires exercise validation"} for need,owner,evidence in [
        ("Information exchange", "Supported staff", "Describe sender, recipient and observable success using fictional roles"),
        ("Application support", "System owner", "Record version and authoritative documentation; unknown until reviewed"),
        ("Transport availability", "Signal staff", "Observe synthetic service health; connectivity does not prove interoperability"),
        ("Continuity", "Exercise director", "Rehearse a fictional service interruption and recovery"),
        ("Acceptance", "Supported staff and Signal", "Demonstrate the fictional user outcome and record evidence")]]}
def mentor(topic):
    topics = {"mdmp": "mdmp-method", "radar": "q53-purpose", "signal": "fm6-signal-role", "estimates": "fm6-running-estimates", "operations": "adp5-operations-process", "planning": "fm602-planning", "c2": "adp6-c2"}
    claim_id = topics.get(topic)
    claim = next((c for c in load("sources.json")["claims"] if c["id"] == claim_id), None)
    if claim is None:
        return {"answer": "Insufficient reviewed evidence. Ask an instructor to review a public source.", "citations": [], "mode": "deterministic retrieval; no generative AI"}
    return {"answer": claim["statement"], "citations": [claim], "mode": "deterministic retrieval; no generative AI", "limitation": claim["scope"]}
DIAGNOSTIC_CHECK_LIMIT = max(len(f["checks"]) for f in catalog()["faults"])

def diagnose(fault_id, checks, diagnosis):
    faults = catalog()["faults"]
    fault = next((f for f in faults if f["id"] == fault_id), None)
    if fault is None:
        raise ValueError("Unknown synthetic fault")
    if any(type(i) is not int or i < 0 or i >= len(fault["checks"]) for i in checks):
        raise ValueError("Unknown check")
    if diagnosis not in {f["id"] for f in faults}:
        raise ValueError("Unknown diagnosis")
    observed = sorted(set(checks))
    return {"evidence": [fault["checks"][i] for i in observed], "score": (50 if diagnosis == fault_id else 0) + round(50*len(observed)/len(fault["checks"])), "root": fault["root"], "lesson": fault["lesson"], "correct": diagnosis == fault_id}
QUIZ = load("assessment.json")

def grade(answers):
    if set(answers) != {q["id"] for q in QUIZ}:
        raise ValueError("Complete every question")
    if any(type(answers[q["id"]]) is not int or not 0 <= answers[q["id"]] < len(q["options"]) for q in QUIZ):
        raise ValueError("Invalid answer")
    return {"score": sum(answers[q["id"]] == q["answer"] for q in QUIZ), "total": len(QUIZ), "feedback": [{"id":q["id"], "rationale":q["rationale"]} for q in QUIZ]}
