from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ai_agent import process_command


app = FastAPI(
    title="Babu AI Voice Assistant"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CommandRequest(BaseModel):

    command: str


class CommandResponse(BaseModel):

    success: bool
    reply: str
    action: str | None = None


@app.get("/")
def home():

    return {
        "message": "Babu AI Backend is running"
    }


@app.post(
    "/api/command",
    response_model=CommandResponse
)
def command(
    request: CommandRequest
):

    result = process_command(
        request.command
    )

    return {
        "success": result["success"],
        "reply": result["reply"],
        "action": result.get(
            "action"
        )
    }
