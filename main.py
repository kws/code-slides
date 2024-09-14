from flask import Flask, render_template, jsonify, request
from flask_socketio import SocketIO, emit
import json

app = Flask(__name__)
socketio = SocketIO(app)

# In-memory storage for slides (replace with a database in a production environment)
slides = [
    {"id": 1, "type": "image", "content": "https://via.placeholder.com/800x600.png?text=Slide+1", "notes": "This is slide 1"},
    {"id": 2, "type": "image", "content": "https://via.placeholder.com/800x600.png?text=Slide+2", "notes": "This is slide 2"},
    {"id": 3, "type": "image", "content": "https://via.placeholder.com/800x600.png?text=Slide+3", "notes": "This is slide 3"},
]

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
    new_slide['id'] = max(slide['id'] for slide in slides) + 1
    slides.append(new_slide)
    return jsonify(new_slide), 201

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('navigate')
def handle_navigation(data):
    emit('navigate', data, broadcast=True, include_sender=False)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
