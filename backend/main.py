from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from agents.orchestrator import orchestrate

app = FastAPI(title="CityPulse API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "CityPulse API running"}

@app.post("/ask")
async def ask(payload: dict):
    city = payload.get("city")
    question = payload.get("question")
    result = await orchestrate(city, question)
    return result