import json
import os

STORAGE_FILE = 'presentations.json'

def save_presentation(name, slides):
    presentations = load_all_presentations()
    presentations[name] = slides
    with open(STORAGE_FILE, 'w') as f:
        json.dump(presentations, f)

def load_presentation(name):
    presentations = load_all_presentations()
    return presentations.get(name)

def load_all_presentations():
    if os.path.exists(STORAGE_FILE):
        with open(STORAGE_FILE, 'r') as f:
            return json.load(f)
    return {}

def get_presentation_names():
    return list(load_all_presentations().keys())
