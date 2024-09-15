from flask import Flask, render_template, jsonify, request
from flask_socketio import SocketIO, emit
import json
from .presentation_storage import save_presentation, load_presentation, get_presentation_names
import time

app = Flask(__name__)
socketio = SocketIO(app)

# ... (rest of the code remains the same)

if __name__ == '__main__':
    # Initialize with default slides
    default_slides = [
        {"id": 1, "type": "image", "content": "https://via.placeholder.com/800x600.png?text=Slide+1", "notes": "This is slide 1", "transition": "fadeIn", "transitionDuration": "1s"},
        {"id": 2, "type": "image", "content": "https://via.placeholder.com/800x600.png?text=Slide+2", "notes": "This is slide 2", "transition": "slideInRight", "transitionDuration": "0.8s"},
        {"id": 3, "type": "simulation", "content": "{ \"type\": \"basic_simulation\", \"data\": { \"initialValue\": 10, \"increment\": 2 } }", "notes": "This is a simulation slide", "transition": "zoomIn", "transitionDuration": "1.2s"},
        {"id": 4, "type": "api_call", "content": "https://api.github.com/users/github", "notes": "This is an API call slide", "transition": "bounceIn", "transitionDuration": "1s"},
    ]
    presentation_state.set_slides(default_slides)
    socketio.run(app, host='0.0.0.0', port=5000, debug=True, use_reloader=True, log_output=True)
