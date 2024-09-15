# Custom Presentation Tool

This is a web-based custom presentation tool using Flask and Vanilla JS, supporting programmable slides and a two-window interface.

## Features

- Two-window interface: Presentation view and Navigation view
- Support for various slide types: Image, Simulation, and API call
- Real-time synchronization between windows using WebSocket
- Customizable slide transitions
- Timer functionality for presentations
- Save and load presentations

## Prerequisites

- Python 3.7+
- Flask
- Flask-SocketIO

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/custom-presentation-tool.git
   cd custom-presentation-tool
   ```

2. Install the required packages:
   ```
   pip install flask flask-socketio
   ```

## Running the Application

1. Start the Flask server:
   ```
   python main.py
   ```

2. Open your web browser and navigate to `http://localhost:5000`

3. You will see the main page with options to open the Presentation and Navigation windows

4. Click on "Open Presentation" to open the presentation view in a new window

5. Click on "Open Navigation" to open the navigation view in another window

## Usage

- Use the Navigation window to control the presentation
- Navigate between slides using the "Previous" and "Next" buttons or by clicking on a slide in the list
- Start, stop, and reset the timer using the respective buttons
- In the Presentation window, use the right arrow key or space bar to move to the next slide, and the left arrow key to move to the previous slide
- Save and load presentations using the options on the main page

## Customizing Slides

To customize the slides, modify the `default_slides` list in the `main.py` file. Each slide is represented by a dictionary with the following structure:

```python
{
    "id": 1,
    "type": "image",
    "content": "https://example.com/image.jpg",
    "notes": "Slide notes",
    "transition": "fadeIn",
    "transitionDuration": "1s"
}
```

Supported slide types:
- `image`: Display an image
- `simulation`: Run a simulation (customize in the `SimulationSlide` class in `presentation.js`)
- `api_call`: Make an API call and display the result

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
