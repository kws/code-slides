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
        const slide = document.createElement('div');
        slide.className = 'slide';
        const img = document.createElement('img');
        img.src = this.content;
        img.alt = `Slide ${this.id}`;
        slide.appendChild(img);
        return slide;
    }
}

class SimulationSlide extends Slide {
    render() {
        console.log(`Rendering SimulationSlide ${this.id}`);
        const slide = document.createElement('div');
        slide.className = 'slide';
        const container = document.createElement('div');
        container.id = `simulation-${this.id}`;
        container.innerHTML = `<h2>Simulation</h2><div id="simulation-content-${this.id}"></div>`;
        slide.appendChild(container);
        
        setTimeout(() => this.loadSimulation(), 100);
        
        return slide;
    }

    loadSimulation() {
        console.log(`Loading simulation for slide ${this.id}`);
        const simContainer = document.getElementById(`simulation-content-${this.id}`);
        if (!simContainer) {
            console.error(`Simulation container for slide ${this.id} not found`);
            return;
        }
        simContainer.innerHTML = `<p>Simulation content for slide ${this.id}</p>`;
        simContainer.style.color = 'white';
        console.log(`Simulation for slide ${this.id} loaded`);
    }
}

class ApiCallSlide extends Slide {
    render() {
        console.log(`Rendering ApiCallSlide ${this.id}`);
        const slide = document.createElement('div');
        slide.className = 'slide';
        const container = document.createElement('div');
        container.id = `api-call-${this.id}`;
        container.innerHTML = `<h2>API Call Result</h2><div id="api-result-${this.id}">Loading...</div>`;
        slide.appendChild(container);
        
        setTimeout(() => this.makeApiCall(), 100);
        
        return slide;
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
            resultContainer.style.color = 'white';
            console.log(`API call for slide ${this.id} completed successfully`);
        } catch (error) {
            console.error(`Error in API call for slide ${this.id}:`, error);
            resultContainer.innerHTML = `<p>Error: ${error.message}</p>`;
            resultContainer.style.color = 'red';
        }
    }
}

class PresentationManager {
    constructor() {
        this.slideContainer = document.getElementById('slide-container');
        this.currentState = null;
        this.renderedSlides = [];
    }

    updateState(newState) {
        this.currentState = newState;
        this.renderSlides();
    }

    renderSlides() {
        if (!this.currentState || this.currentState.slides.length === 0) {
            console.log('No slides to render');
            return;
        }

        this.slideContainer.innerHTML = '';
        this.renderedSlides = [];

        this.currentState.slides.forEach((slideData, index) => {
            let slideInstance;
            switch (slideData.type) {
                case 'image':
                    slideInstance = new ImageSlide(slideData);
                    break;
                case 'simulation':
                    slideInstance = new SimulationSlide(slideData);
                    break;
                case 'api_call':
                    slideInstance = new ApiCallSlide(slideData);
                    break;
                default:
                    console.error(`Unknown slide type: ${slideData.type}`);
                    return;
            }
            const slideElement = slideInstance.render();
            this.slideContainer.appendChild(slideElement);
            this.renderedSlides.push(slideElement);
        });

        this.showCurrentSlide();
    }

    showCurrentSlide() {
        console.log('Showing current slide');
        const currentIndex = this.currentState.currentSlideIndex;
        this.renderedSlides.forEach((slide, index) => {
            if (index === currentIndex) {
                setTimeout(() => {
                    console.log(`Adding 'active' class to slide ${index}`);
                    slide.classList.add('active');
                    slide.classList.remove('previous');
                }, 50);
            } else if (index === currentIndex - 1) {
                setTimeout(() => {
                    console.log(`Adding 'previous' class to slide ${index}`);
                    slide.classList.add('previous');
                    slide.classList.remove('active');
                }, 50);
            } else {
                console.log(`Removing all classes from slide ${index}`);
                slide.classList.remove('active', 'previous');
            }
        });
        console.log(`Showing slide ${currentIndex}`);
    }

    nextSlide() {
        console.log('Next slide requested');
        socket.emit('navigate', { slideIndex: this.currentState.currentSlideIndex + 1 });
    }

    previousSlide() {
        console.log('Previous slide requested');
        socket.emit('navigate', { slideIndex: this.currentState.currentSlideIndex - 1 });
    }
}

const presentationManager = new PresentationManager();
const socket = io();

function requestCurrentState() {
    console.log('Requesting current state');
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