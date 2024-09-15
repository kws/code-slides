from flask import render_template, request, jsonify, redirect, url_for
from flask_socketio import emit
import uuid
from .presentation_storage import (
    get_presentation, save_presentation, delete_presentation,
    list_presentations, load_presentations
)
from . import app, socketio

current_slide = 0
timer_seconds = 0

# Load presentations on startup
presentations = load_presentations()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/presentation')
def presentation():
    return render_template('presentation.html')

@app.route('/navigation')
def navigation():
    presentations = list_presentations()
    return render_template('navigation.html', presentations=presentations)

@app.route('/api/presentations', methods=['GET', 'POST'])
def api_presentations():
    if request.method == 'GET':
        return jsonify(list_presentations())
    elif request.method == 'POST':
        data = request.json
        presentation_id = str(uuid.uuid4())
        save_presentation(presentation_id, data)
        return jsonify({"id": presentation_id}), 201

@app.route('/api/presentations/<presentation_id>', methods=['GET', 'PUT', 'DELETE'])
def api_presentation(presentation_id):
    if request.method == 'GET':
        presentation = get_presentation(presentation_id)
        if presentation:
            return jsonify(presentation)
        return jsonify({"error": "Presentation not found"}), 404
    elif request.method == 'PUT':
        data = request.json
        save_presentation(presentation_id, data)
        return jsonify({"message": "Presentation updated successfully"})
    elif request.method == 'DELETE':
        if delete_presentation(presentation_id):
            return jsonify({"message": "Presentation deleted successfully"})
        return jsonify({"error": "Presentation not found"}), 404

@app.route('/api/current_slide', methods=['GET', 'POST'])
def api_current_slide():
    global current_slide
    if request.method == 'GET':
        return jsonify({"current_slide": current_slide})
    elif request.method == 'POST':
        data = request.json
        current_slide = data['current_slide']
        socketio.emit('update_slide', {'slide': current_slide}, broadcast=True)
        return jsonify({"message": "Current slide updated successfully"})

@socketio.on('update_timer')
def handle_update_timer(data):
    global timer_seconds
    timer_seconds = data['seconds']
    emit('timer_update', {'seconds': timer_seconds}, broadcast=True)
