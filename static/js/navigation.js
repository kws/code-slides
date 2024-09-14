class NavigationManager {
    constructor() {
        this.slides = [];
        this.currentSlideIndex = 0;
        this.slideList = document.getElementById('slide-list');
        this.notesParagraph = document.getElementById('slide-notes');
    }

    async loadSlides() {
        const response = await fetch('/api/slides');
        this.slides = await response.json();
        this.renderSlideList();
        this.updateNotes();
    }

    renderSlideList() {
        this.slideList.innerHTML = '';
        this.slides.forEach((slide, index) => {
            const li = document.createElement('li');
            li.textContent = `Slide ${slide.id}`;
            li.addEventListener('click', () => this.navigateToSlide(index));
            if (index === this.currentSlideIndex) {
                li.classList.add('active');
            }
            this.slideList.appendChild(li);
        });
    }

    updateNotes() {
        const currentSlide = this.slides[this.currentSlideIndex];
        this.notesParagraph.textContent = currentSlide.notes;
    }

    navigateToSlide(index) {
        console.log(`Navigating to slide ${index}`);
        this.currentSlideIndex = index;
        this.renderSlideList();
        this.updateNotes();
        this.sendNavigationMessage();
    }

    nextSlide() {
        console.log('Next slide clicked');
        if (this.currentSlideIndex < this.slides.length - 1) {
            this.currentSlideIndex++;
            this.renderSlideList();
            this.updateNotes();
            this.sendNavigationMessage();
        }
    }

    previousSlide() {
        console.log('Previous slide clicked');
        if (this.currentSlideIndex > 0) {
            this.currentSlideIndex--;
            this.renderSlideList();
            this.updateNotes();
            this.sendNavigationMessage();
        }
    }

    sendNavigationMessage() {
        console.log('Sending navigation message');
        socket.emit('navigate', { slideIndex: this.currentSlideIndex });
    }
}

const navigationManager = new NavigationManager();
const socket = io();

document.addEventListener('DOMContentLoaded', () => {
    navigationManager.loadSlides();

    document.getElementById('prev-button').addEventListener('click', () => navigationManager.previousSlide());
    document.getElementById('next-button').addEventListener('click', () => navigationManager.nextSlide());
});

socket.on('connect', () => {
    console.log('Connected to server');
});
