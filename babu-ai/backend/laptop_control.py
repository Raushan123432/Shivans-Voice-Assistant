import os
import platform
import subprocess
import webbrowser
from pathlib import Path

import pyautogui


# -----------------------------
# Open allowed applications
# -----------------------------

ALLOWED_APPS = {
    "chrome": "chrome",
    "google chrome": "chrome",
    "edge": "msedge",
    "microsoft edge": "msedge",
    "notepad": "notepad",
    "calculator": "calc",
    "calc": "calc",
    "paint": "mspaint",
    "explorer": "explorer",
    "file explorer": "explorer",
}


def open_application(app_name: str):
    app_name = app_name.lower().strip()

    if app_name not in ALLOWED_APPS:
        return {
            "success": False,
            "message": f"Application '{app_name}' is not in the allowed application list."
        }

    try:
        subprocess.Popen(ALLOWED_APPS[app_name])

        return {
            "success": True,
            "message": f"{app_name} opened successfully."
        }

    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }


# -----------------------------
# Open website
# -----------------------------

def open_website(url: str):
    try:
        if not url.startswith(("http://", "https://")):
            url = "https://" + url

        webbrowser.open(url)

        return {
            "success": True,
            "message": f"Opened {url}"
        }

    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }


# -----------------------------
# Google search
# -----------------------------

def google_search(query: str):
    try:
        url = "https://www.google.com/search?q=" + query.replace(" ", "+")
        webbrowser.open(url)

        return {
            "success": True,
            "message": f"Searching Google for {query}"
        }

    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }


# -----------------------------
# YouTube search
# -----------------------------

def youtube_search(query: str):
    try:
        url = "https://www.youtube.com/results?search_query=" + query.replace(
            " ", "+"
        )

        webbrowser.open(url)

        return {
            "success": True,
            "message": f"Searching YouTube for {query}"
        }

    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }


# -----------------------------
# Open folder
# -----------------------------

def open_folder(folder: str):
    try:

        folders = {
            "desktop": Path.home() / "Desktop",
            "downloads": Path.home() / "Downloads",
            "documents": Path.home() / "Documents",
            "pictures": Path.home() / "Pictures",
        }

        folder_lower = folder.lower().strip()

        if folder_lower in folders:
            path = folders[folder_lower]

        else:
            path = Path(folder)

        if not path.exists():
            return {
                "success": False,
                "message": f"Folder does not exist: {path}"
            }

        os.startfile(str(path))

        return {
            "success": True,
            "message": f"Opened folder {path}"
        }

    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }


# -----------------------------
# Create folder
# -----------------------------

def create_folder(name: str, location: str = "Desktop"):
    try:

        folders = {
            "desktop": Path.home() / "Desktop",
            "downloads": Path.home() / "Downloads",
            "documents": Path.home() / "Documents",
        }

        location_lower = location.lower().strip()

        base_path = folders.get(
            location_lower,
            Path.home() / "Desktop"
        )

        new_folder = base_path / name

        new_folder.mkdir(parents=True, exist_ok=True)

        return {
            "success": True,
            "message": f"Folder '{name}' created at {base_path}"
        }

    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }


# -----------------------------
# Screenshot
# -----------------------------

def take_screenshot():
    try:

        screenshot_dir = Path.home() / "Pictures" / "BabuAI"

        screenshot_dir.mkdir(
            parents=True,
            exist_ok=True
        )

        file_path = screenshot_dir / "screenshot.png"

        screenshot = pyautogui.screenshot()

        screenshot.save(file_path)

        return {
            "success": True,
            "message": f"Screenshot saved at {file_path}"
        }

    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }


# -----------------------------
# Type text
# -----------------------------

def type_text(text: str):
    try:

        pyautogui.write(
            text,
            interval=0.02
        )

        return {
            "success": True,
            "message": "Text typed successfully."
        }

    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }


# -----------------------------
# Volume control
# -----------------------------

def volume_up():
    try:

        pyautogui.press(
            "volumeup",
            presses=5
        )

        return {
            "success": True,
            "message": "Volume increased."
        }

    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }


def volume_down():
    try:

        pyautogui.press(
            "volumedown",
            presses=5
        )

        return {
            "success": True,
            "message": "Volume decreased."
        }

    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }


def volume_mute():
    try:

        pyautogui.press(
            "volumemute"
        )

        return {
            "success": True,
            "message": "Volume mute toggled."
        }

    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }


# -----------------------------
# Execute tool
# -----------------------------

def execute_action(
    action: str,
    arguments: dict
):

    if action == "open_application":
        return open_application(
            arguments["app_name"]
        )

    if action == "open_website":
        return open_website(
            arguments["url"]
        )

    if action == "google_search":
        return google_search(
            arguments["query"]
        )

    if action == "youtube_search":
        return youtube_search(
            arguments["query"]
        )

    if action == "open_folder":
        return open_folder(
            arguments["folder"]
        )

    if action == "create_folder":
        return create_folder(
            arguments["name"],
            arguments.get(
                "location",
                "Desktop"
            )
        )

    if action == "take_screenshot":
        return take_screenshot()

    if action == "type_text":
        return type_text(
            arguments["text"]
        )

    if action == "volume_up":
        return volume_up()

    if action == "volume_down":
        return volume_down()

    if action == "volume_mute":
        return volume_mute()

    return {
        "success": False,
        "message": "Unknown action."
    }
