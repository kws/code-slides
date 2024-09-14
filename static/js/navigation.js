class NavigationManager {
    constructor() {
        this.slides = [];
        this.currentSlideIndex = 0;
        this.slideList = document.getElementById('slide-list');
        this.notesParagraph = document.getElementById('slide-notes');
        this.nextSlidePreview = document.getElementById('next-slide-preview');
        this.timerElement = document.getElementById('timer');
        this.startTime = null;
        this.timerInterval = null;
    }

    async loadSlides() {
        const response = await fetch('/api/slides');
        this.slides = await response.json();
        this.renderSlideList();
        this.updateNotes();
        this.updateNextSlidePreview();
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

    updateNextSlidePreview() {
        if (this.currentSlideIndex < this.slides.length - 1) {
            const nextSlide = this.slides[this.currentSlideIndex + 1];
            this.nextSlidePreview.textContent = `Next: Slide ${nextSlide.id} - ${nextSlide.notes}`;
        } else {
            this.nextSlidePreview.textContent = 'End of presentation';
        }
    }

    navigateToSlide(index) {
        console.log(`Navigating to slide ${index}`);
        this.currentSlideIndex = index;
        this.renderSlideList();
        this.updateNotes();
        this.updateNextSlidePreview();
        this.sendNavigationMessage();
    }

    nextSlide() {
        console.log('Next slide clicked');
        if (this.currentSlideIndex < this.slides.length - 1) {
            this.currentSlideIndex++;
            this.renderSlideList();
            this.updateNotes();
            this.updateNextSlidePreview();
            this.sendNavigationMessage();
        }
    }

    previousSlide() {
        console.log('Previous slide clicked');
        if (this.currentSlideIndex > 0) {
            this.currentSlideIndex--;
            this.renderSlideList();
            this.updateNotes();
            this.updateNextSlidePreview();
            this.sendNavigationMessage();
        }
    }

    sendNavigationMessage() {
        console.log('Sending navigation message');
        socket.emit('navigate', { slideIndex: this.currentSlideIndex });
    }

    startTimer() {
        if (!this.startTime) {
            this.startTime = new Date();
            this.timerInterval = setInterval(() => this.updateTimer(), 1000);
        }
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    resetTimer() {
        this.stopTimer();
        this.startTime = null;
        this.timerElement.textContent = '00:00:00';
    }

    updateTimer() {
        const currentTime = new Date();
        const elapsedTime = new Date(currentTime - this.startTime);
        const hours = elapsedTime.getUTCHours().toString().padStart(2, '0');
        const minutes = elapsedTime.getUTCMinutes().toString().padStart(2, '0');
        const seconds = elapsedTime.getUTCSeconds().toString().padStart(2, '0');
        this.timerElement.textContent = `${hours}:${minutes}:${seconds}`;
    }
}

const navigationManager = new NavigationManager();
const socket = io();

document.addEventListener('DOMContentLoaded', () => {
    navigationManager.loadSlides();

    document.getElementById('prev-button').addEventListener('click', () => navigationManager.previousSlide());
    document.getElementById('next-button').addEventListener('click', () => navigationManager.nextSlide());

    // Add timer control buttons
    const startTimerButton = document.createElement('button');
    startTimerButton.textContent = 'Start Timer';
    startTimerButton.classList.add('button');
    startTimerButton.addEventListener('click', () => navigationManager.startTimer());

    const stopTimerButton = document.createElement('button');
    stopTimerButton.textContent = 'Stop Timer';
    stopTimerButton.classList.add('button');
    stopTimerButton.addEventListener('click', () => navigationManager.stopTimer());

    const resetTimerButton = document.createElement('button');
    resetTimerButton.textContent = 'Reset Timer';
    resetTimerButton.classList.add('button');
    resetTimerButton.addEventListener('click', () => navigationManager.resetTimer());

    const timerControls = document.createElement('div');
    timerControls.appendChild(startTimerButton);
    timerControls.appendChild(stopTimerButton);
    timerControls.appendChild(resetTimerButton);

    document.querySelector('.navigation-buttons').appendChild(timerControls);
});

socket.on('connect', () => {
    console.log('Connected to server');
});
