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

class PresentationManager {
    constructor() {
        this.slides = [];
        this.currentSlideIndex = 0;
        this.slideContainer = document.getElementById('slide-container');
    }

    async loadSlides() {
        const response = await fetch('/api/slides');
        const slidesData = await response.json();
        this.slides = slidesData.map(slideData => {
            switch (slideData.type) {
                case 'image':
                    return new ImageSlide(slideData);
                default:
                    throw new Error(`Unknown slide type: ${slideData.type}`);
            }
        });
        this.renderCurrentSlide();
    }

    renderCurrentSlide() {
        if (this.slides.length === 0) return;
        const currentSlide = this.slides[this.currentSlideIndex];
        this.slideContainer.innerHTML = '';
        this.slideContainer.appendChild(currentSlide.render());
        console.log(`Rendered slide ${this.currentSlideIndex}`);
    }

    nextSlide() {
        if (this.currentSlideIndex < this.slides.length - 1) {
            this.currentSlideIndex++;
            this.renderCurrentSlide();
        }
    }

    previousSlide() {
        if (this.currentSlideIndex > 0) {
            this.currentSlideIndex--;
            this.renderCurrentSlide();
        }
    }

    navigateToSlide(index) {
        console.log(`Navigating to slide ${index}`);
        if (index >= 0 && index < this.slides.length) {
            this.currentSlideIndex = index;
            this.renderCurrentSlide();
        }
    }
}

const presentationManager = new PresentationManager();
const socket = io();

document.addEventListener('DOMContentLoaded', () => {
    presentationManager.loadSlides();

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
});

socket.on('navigate', (data) => {
    console.log(`Received navigation message: ${JSON.stringify(data)}`);
    presentationManager.navigateToSlide(data.slideIndex);
});
