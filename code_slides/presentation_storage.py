import json
import os

PRESENTATIONS_FILE = 'presentations.json'

def load_presentations():
    if os.path.exists(PRESENTATIONS_FILE):
        with open(PRESENTATIONS_FILE, 'r') as f:
            data = json.load(f)
            # Ensure the loaded data is a dictionary
            return data if isinstance(data, dict) else {}
    return {}

def save_presentations(presentations):
    with open(PRESENTATIONS_FILE, 'w') as f:
        json.dump(presentations, f, indent=2)

def get_presentation(presentation_id):
    presentations = load_presentations()
    return presentations.get(presentation_id)

def save_presentation(presentation_id, presentation_data):
    presentations = load_presentations()
    presentations[presentation_id] = presentation_data
    save_presentations(presentations)

def delete_presentation(presentation_id):
    presentations = load_presentations()
    if presentation_id in presentations:
        del presentations[presentation_id]
        save_presentations(presentations)
        return True
    return False

def list_presentations():
    presentations = load_presentations()
    return [{"id": k, "title": v.get("title", "Untitled") if isinstance(v, dict) else "Untitled"} for k, v in presentations.items()]
