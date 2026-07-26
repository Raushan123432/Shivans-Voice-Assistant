import os
import json

from dotenv import load_dotenv
from google import genai
from google.genai import types

from laptop_control import execute_action


load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY is missing in .env"
    )


client = genai.Client(
    api_key=API_KEY
)


SYSTEM_INSTRUCTION = """
You are Babu AI, a professional Windows laptop voice assistant.

You understand English, Hindi, and Hinglish.

Your job is to understand the user's natural language and control the user's Windows laptop using the available tools.

Examples:

"Chrome kholo"
=> open_application(app_name="chrome")

"Open VS Code"
=> Do not use a tool because VS Code is not currently in the allowed application list.

"Google par Python tutorial search karo"
=> google_search(query="Python tutorial")

"YouTube par Python course search karo"
=> youtube_search(query="Python course")

"Downloads folder kholo"
=> open_folder(folder="Downloads")

"Desktop par Projects naam ka folder banao"
=> create_folder(name="Projects", location="Desktop")

"Screenshot lo"
=> take_screenshot()

"Volume badhao"
=> volume_up()

"Volume kam karo"
=> volume_down()

"Mute karo"
=> volume_mute()

"Notepad kholo aur Hello World type karo"
=> open_application(app_name="notepad")
Then type_text(text="Hello World")

Important safety rules:

- Never delete files.
- Never format drives.
- Never run arbitrary shell commands.
- Never install software.
- Never change passwords.
- Never disable security software.
- Never perform destructive system actions.

Only use the available tools.

After an action is completed, provide a short natural response.

If an action fails, honestly tell the user that it failed.

Respond in the same language style as the user whenever possible.
"""


TOOLS = [

    types.Tool(
        function_declarations=[

            types.FunctionDeclaration(
                name="open_application",
                description="Open an allowed Windows application.",
                parameters=types.Schema(
                    type="OBJECT",
                    properties={
                        "app_name": types.Schema(
                            type="STRING",
                            description="Application name such as chrome, edge, notepad, calculator"
                        )
                    },
                    required=["app_name"]
                )
            ),

            types.FunctionDeclaration(
                name="open_website",
                description="Open a website in the default browser.",
                parameters=types.Schema(
                    type="OBJECT",
                    properties={
                        "url": types.Schema(
                            type="STRING",
                            description="Website URL"
                        )
                    },
                    required=["url"]
                )
            ),

            types.FunctionDeclaration(
                name="google_search",
                description="Search something on Google.",
                parameters=types.Schema(
                    type="OBJECT",
                    properties={
                        "query": types.Schema(
                            type="STRING",
                            description="Search query"
                        )
                    },
                    required=["query"]
                )
            ),

            types.FunctionDeclaration(
                name="youtube_search",
                description="Search something on YouTube.",
                parameters=types.Schema(
                    type="OBJECT",
                    properties={
                        "query": types.Schema(
                            type="STRING",
                            description="YouTube search query"
                        )
                    },
                    required=["query"]
                )
            ),

            types.FunctionDeclaration(
                name="open_folder",
                description="Open a Windows folder.",
                parameters=types.Schema(
                    type="OBJECT",
                    properties={
                        "folder": types.Schema(
                            type="STRING",
                            description="Folder such as Desktop, Downloads, Documents"
                        )
                    },
                    required=["folder"]
                )
            ),

            types.FunctionDeclaration(
                name="create_folder",
                description="Create a new folder.",
                parameters=types.Schema(
                    type="OBJECT",
                    properties={
                        "name": types.Schema(
                            type="STRING",
                            description="New folder name"
                        ),
                        "location": types.Schema(
                            type="STRING",
                            description="Location such as Desktop, Downloads, Documents"
                        )
                    },
                    required=["name"]
                )
            ),

            types.FunctionDeclaration(
                name="take_screenshot",
                description="Take a screenshot of the Windows screen.",
                parameters=types.Schema(
                    type="OBJECT",
                    properties={}
                )
            ),

            types.FunctionDeclaration(
                name="type_text",
                description="Type text using the keyboard.",
                parameters=types.Schema(
                    type="OBJECT",
                    properties={
                        "text": types.Schema(
                            type="STRING",
                            description="Text to type"
                        )
                    },
                    required=["text"]
                )
            ),

            types.FunctionDeclaration(
                name="volume_up",
                description="Increase system volume.",
                parameters=types.Schema(
                    type="OBJECT",
                    properties={}
                )
            ),

            types.FunctionDeclaration(
                name="volume_down",
                description="Decrease system volume.",
                parameters=types.Schema(
                    type="OBJECT",
                    properties={}
                )
            ),

            types.FunctionDeclaration(
                name="volume_mute",
                description="Toggle system mute.",
                parameters=types.Schema(
                    type="OBJECT",
                    properties={}
                )
            ),

        ]
    )
]


def process_command(user_text: str):

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=user_text,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_INSTRUCTION,
            tools=TOOLS,
            temperature=0.2
        )
    )

    if not response.function_calls:

        return {
            "success": True,
            "reply": response.text,
            "action": None
        }


    function_call = response.function_calls[0]

    function_name = function_call.name

    arguments = dict(
        function_call.args
    )


    result = execute_action(
        function_name,
        arguments
    )


    if result["success"]:

        final_reply = (
            f"Done. {result['message']}"
        )

    else:

        final_reply = (
            f"Sorry, I could not complete that. "
            f"{result['message']}"
        )


    return {
        "success": result["success"],
        "reply": final_reply,
        "action": function_name,
        "result": result
    }
