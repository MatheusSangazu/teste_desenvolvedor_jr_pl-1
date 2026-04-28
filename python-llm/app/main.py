import sys
from dotenv import load_dotenv

load_dotenv()
sys.path = sys.path + ["./app"]

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from services.llm_service import LLMService

app = FastAPI()
llm_service = LLMService()


@app.get("/")
async def root():
    return {"message": "API is running"}


class TextData(BaseModel):
    text: str
    lang: str


@app.post("/summarize")
async def summarize(data: TextData):
    try:
        summary = llm_service.summarize_text(data.text, data.lang)
        return {"summary": summary}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
