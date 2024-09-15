from flask import Flask, render_template, jsonify, request
from flask_socketio import SocketIO, emit
import json
from presentation_storage import save_presentation, load_presentation, get_presentation_names
import time

app = Flask(__name__)
socketio = SocketIO(app)

class PresentationState:
    def __init__(self):
        self.current_slide_index = 0
        self.slides = []
        self.connected_clients = set()
        self.timer_start = None
        self.timer_elapsed = 0

    def set_slides(self, slides):
        self.slides = slides

    def navigate_to_slide(self, index):
        if 0 <= index < len(self.slides):
            self.current_slide_index = index
            self.notify_clients()

    def add_client(self, client):
        self.connected_clients.add(client)

    def remove_client(self, client):
        self.connected_clients.remove(client)

    def notify_clients(self):
        state = self.get_current_state()
        for client in self.connected_clients:
            socketio.emit('state_update', state, room=client)

    def get_current_state(self):
        return {
            'currentSlideIndex': self.current_slide_index,
            'slides': self.slides,
            'timerElapsed': self.get_timer_elapsed()
        }

    def start_timer(self):
        if self.timer_start is None:
            self.timer_start = time.time()

    def stop_timer(self):
        if self.timer_start is not None:
            self.timer_elapsed += time.time() - self.timer_start
            self.timer_start = None

    def reset_timer(self):
        self.timer_start = None
        self.timer_elapsed = 0

    def get_timer_elapsed(self):
        if self.timer_start is None:
            return self.timer_elapsed
        return self.timer_elapsed + (time.time() - self.timer_start)

presentation_state = PresentationState()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/presentation')
def presentation():
    return render_template('presentation.html')

@app.route('/navigation')
def navigation():
    return render_template('navigation.html')

@app.route('/api/slides')
def get_slides():
    return jsonify(presentation_state.slides)

@app.route('/api/slide/<int:slide_id>')
def get_slide(slide_id):
    slide = next((slide for slide in presentation_state.slides if slide['id'] == slide_id), None)
    if slide:
        return jsonify(slide)
    return jsonify({"error": "Slide not found"}), 404

@app.route('/api/slide', methods=['POST'])
def create_slide():
    new_slide = request.json
    if new_slide:
        new_slide['id'] = max(slide['id'] for slide in presentation_state.slides) + 1
        presentation_state.slides.append(new_slide)
        return jsonify(new_slide), 201
    return jsonify({"error": "Invalid slide data"}), 400

@app.route('/api/presentation', methods=['POST'])
def save_current_presentation():
    data = request.json
    if data and 'name' in data:
        name = data['name']
        save_presentation(name, presentation_state.slides)
        return jsonify({"message": f"Presentation '{name}' saved successfully"}), 200
    return jsonify({"error": "Invalid presentation name"}), 400

@app.route('/api/presentation/<name>')
def load_saved_presentation(name):
    loaded_slides = load_presentation(name)
    if loaded_slides:
        presentation_state.set_slides(loaded_slides)
        presentation_state.notify_clients()
        return jsonify({"message": f"Presentation '{name}' loaded successfully"}), 200
    return jsonify({"error": "Presentation not found"}), 404

@app.route('/api/presentations')
def get_presentation_list():
    return jsonify(get_presentation_names())

@app.route('/api/current_state')
def get_current_state():
    return jsonify(presentation_state.get_current_state())

@app.route('/api/timer/start', methods=['POST'])
def start_timer():
    presentation_state.start_timer()
    presentation_state.notify_clients()
    return jsonify({"message": "Timer started"}), 200

@app.route('/api/timer/stop', methods=['POST'])
def stop_timer():
    presentation_state.stop_timer()
    presentation_state.notify_clients()
    return jsonify({"message": "Timer stopped"}), 200

@app.route('/api/timer/reset', methods=['POST'])
def reset_timer():
    presentation_state.reset_timer()
    presentation_state.notify_clients()
    return jsonify({"message": "Timer reset"}), 200

@app.route('/api/timer')
def get_timer():
    return jsonify({"elapsed": presentation_state.get_timer_elapsed()}), 200

@socketio.on('connect')
def handle_connect():
    print('Client connected')
    presentation_state.add_client(request.sid)
    emit('state_update', presentation_state.get_current_state())

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')
    presentation_state.remove_client(request.sid)

@socketio.on('navigate')
def handle_navigation(data):
    presentation_state.navigate_to_slide(data['slideIndex'])

@socketio.on('request_sync')
def handle_sync_request():
    emit('state_update', presentation_state.get_current_state())

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
