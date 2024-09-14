from flask import Flask, render_template, jsonify, request
from flask_socketio import SocketIO, emit
import json
from presentation_storage import save_presentation, load_presentation, get_presentation_names

app = Flask(__name__)
socketio = SocketIO(app)

# In-memory storage for slides (replace with a database in a production environment)
slides = [
    {"id": 1, "type": "image", "content": "https://via.placeholder.com/800x600.png?text=Slide+1", "notes": "This is slide 1"},
    {"id": 2, "type": "image", "content": "https://via.placeholder.com/800x600.png?text=Slide+2", "notes": "This is slide 2"},
    {"id": 3, "type": "simulation", "content": "{ \"type\": \"basic_simulation\", \"data\": { \"initialValue\": 10, \"increment\": 2 } }", "notes": "This is a simulation slide"},
    {"id": 4, "type": "api_call", "content": "https://api.github.com/users/github", "notes": "This is an API call slide"},
]

# Server-side state management
current_slide_index = 0

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
    return jsonify(slides)

@app.route('/api/slide/<int:slide_id>')
def get_slide(slide_id):
    slide = next((slide for slide in slides if slide['id'] == slide_id), None)
    if slide:
        return jsonify(slide)
    return jsonify({"error": "Slide not found"}), 404

@app.route('/api/slide', methods=['POST'])
def create_slide():
    new_slide = request.json
    if new_slide:
        new_slide['id'] = max(slide['id'] for slide in slides) + 1
        slides.append(new_slide)
        return jsonify(new_slide), 201
    return jsonify({"error": "Invalid slide data"}), 400

@app.route('/api/presentation', methods=['POST'])
def save_current_presentation():
    data = request.json
    if data and 'name' in data:
        name = data['name']
        save_presentation(name, slides)
        return jsonify({"message": f"Presentation '{name}' saved successfully"}), 200
    return jsonify({"error": "Invalid presentation name"}), 400

@app.route('/api/presentation/<name>')
def load_saved_presentation(name):
    loaded_slides = load_presentation(name)
    if loaded_slides:
        global slides
        slides = loaded_slides
        return jsonify({"message": f"Presentation '{name}' loaded successfully"}), 200
    return jsonify({"error": "Presentation not found"}), 404

@app.route('/api/presentations')
def get_presentation_list():
    return jsonify(get_presentation_names())

@app.route('/api/current_slide')
def get_current_slide():
    return jsonify({"currentSlideIndex": current_slide_index})

@socketio.on('connect')
def handle_connect():
    print('Client connected')
    # Send the current slide index to the newly connected client
    emit('sync', {'slideIndex': current_slide_index})

@socketio.on('navigate')
def handle_navigation(data):
    global current_slide_index
    current_slide_index = data['slideIndex']
    emit('navigate', data, broadcast=True)

@socketio.on('request_sync')
def handle_sync_request():
    emit('sync', {'slideIndex': current_slide_index})

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True, use_reloader=True, log_output=True)
