console.log('Presentation script loaded');

class Slide {
    constructor(data) {
        this.id = data.id;
        this.type = data.type;
        this.content = data.content;
        this.notes = data.notes;
    }

    render() {
        throw new Error('Render method must be implemented');
    }
}

class ImageSlide extends Slide {
    render() {
        const img = document.createElement('img');
        img.src = this.content;
        img.alt = `Slide ${this.id}`;
        return img;
    }
}

class SimulationSlide extends Slide {
    render() {
        console.log(`Rendering SimulationSlide ${this.id}`);
        const container = document.createElement('div');
        container.id = `simulation-${this.id}`;
        container.innerHTML = `<h2>Simulation</h2><div id="simulation-content-${this.id}"></div>`;
        
        // We'll load the simulation content after the slide is rendered
        setTimeout(() => this.loadSimulation(), 100);
        
        return container;
    }

    loadSimulation() {
        console.log(`Loading simulation for slide ${this.id}`);
        const simContainer = document.getElementById(`simulation-content-${this.id}`);
        if (!simContainer) {
            console.error(`Simulation container for slide ${this.id} not found`);
            return;
        }
        // Here we would typically load and start the simulation
        // For this example, we'll just add some placeholder content
        simContainer.innerHTML = `<p>Simulation content for slide ${this.id}</p>`;
        simContainer.style.color = 'white'; // Ensure text is visible on black background
        console.log(`Simulation for slide ${this.id} loaded`);
    }
}

class ApiCallSlide extends Slide {
    render() {
        console.log(`Rendering ApiCallSlide ${this.id}`);
        const container = document.createElement('div');
        container.id = `api-call-${this.id}`;
        container.innerHTML = `<h2>API Call Result</h2><div id="api-result-${this.id}">Loading...</div>`;
        
        // Make the API call after the slide is rendered
        setTimeout(() => this.makeApiCall(), 100);
        
        return container;
    }

    async makeApiCall() {
        console.log(`Making API call for slide ${this.id}`);
        const resultContainer = document.getElementById(`api-result-${this.id}`);
        if (!resultContainer) {
            console.error(`API result container for slide ${this.id} not found`);
            return;
        }
        try {
            const response = await fetch(this.content);
            const data = await response.json();
            resultContainer.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
            resultContainer.style.color = 'white'; // Ensure text is visible on black background
            console.log(`API call for slide ${this.id} completed successfully`);
        } catch (error) {
            console.error(`Error in API call for slide ${this.id}:`, error);
            resultContainer.innerHTML = `<p>Error: ${error.message}</p>`;
            resultContainer.style.color = 'red'; // Make error message visible
        }
    }
}

class PresentationManager {
    constructor() {
        this.slideContainer = document.getElementById('slide-container');
        this.currentState = null;
    }

    updateState(newState) {
        this.currentState = newState;
        this.renderCurrentSlide();
    }

    renderCurrentSlide() {
        if (!this.currentState || this.currentState.slides.length === 0) {
            console.log('No slides to render');
            return;
        }
        const currentSlide = this.currentState.slides[this.currentState.currentSlideIndex];
        console.log(`Rendering slide ${this.currentState.currentSlideIndex} of type ${currentSlide.type}`);
        this.slideContainer.innerHTML = '';
        let slideInstance;
        switch (currentSlide.type) {
            case 'image':
                slideInstance = new ImageSlide(currentSlide);
                break;
            case 'simulation':
                slideInstance = new SimulationSlide(currentSlide);
                break;
            case 'api_call':
                slideInstance = new ApiCallSlide(currentSlide);
                break;
            default:
                console.error(`Unknown slide type: ${currentSlide.type}`);
                return;
        }
        this.slideContainer.appendChild(slideInstance.render());
        console.log(`Rendered slide ${this.currentState.currentSlideIndex}`);
    }

    nextSlide() {
        socket.emit('navigate', { slideIndex: this.currentState.currentSlideIndex + 1 });
    }

    previousSlide() {
        socket.emit('navigate', { slideIndex: this.currentState.currentSlideIndex - 1 });
    }
}

const presentationManager = new PresentationManager();
const socket = io();

function requestCurrentState() {
    socket.emit('request_sync');
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM content loaded, initializing presentation');
    requestCurrentState();

    document.addEventListener('keydown', (event) => {
        switch (event.key) {
            case 'ArrowRight':
            case ' ':
                presentationManager.nextSlide();
                break;
            case 'ArrowLeft':
                presentationManager.previousSlide();
                break;
        }
    });
});

socket.on('connect', () => {
    console.log('Connected to server');
    requestCurrentState();
});

socket.on('state_update', (newState) => {
    console.log('Received state update:', newState);
    presentationManager.updateState(newState);
});
