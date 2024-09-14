class NavigationManager {
    constructor() {
        this.slideList = document.getElementById('slide-list');
        this.notesParagraph = document.getElementById('slide-notes');
        this.nextSlidePreview = document.getElementById('next-slide-preview');
        this.timerElement = document.getElementById('timer');
        this.startTime = null;
        this.timerInterval = null;
        this.currentState = null;
    }

    updateState(newState) {
        this.currentState = newState;
        this.renderSlideList();
        this.updateNotes();
        this.updateNextSlidePreview();
    }

    renderSlideList() {
        this.slideList.innerHTML = '';
        this.currentState.slides.forEach((slide, index) => {
            const li = document.createElement('li');
            li.textContent = `Slide ${slide.id}: ${slide.type}`;
            li.addEventListener('click', () => this.navigateToSlide(index));
            if (index === this.currentState.currentSlideIndex) {
                li.classList.add('active');
            }
            this.slideList.appendChild(li);
        });
        this.scrollToActiveSlide();
    }

    scrollToActiveSlide() {
        const activeSlide = this.slideList.querySelector('.active');
        if (activeSlide) {
            activeSlide.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    updateNotes() {
        const currentSlide = this.currentState.slides[this.currentState.currentSlideIndex];
        this.notesParagraph.textContent = currentSlide.notes;
    }

    updateNextSlidePreview() {
        if (this.currentState.currentSlideIndex < this.currentState.slides.length - 1) {
            const nextSlide = this.currentState.slides[this.currentState.currentSlideIndex + 1];
            this.nextSlidePreview.textContent = `Next: Slide ${nextSlide.id} - ${nextSlide.type} - ${nextSlide.notes}`;
        } else {
            this.nextSlidePreview.textContent = 'End of presentation';
        }
    }

    navigateToSlide(index) {
        console.log(`Navigating to slide ${index}`);
        socket.emit('navigate', { slideIndex: index });
    }

    nextSlide() {
        console.log('Next slide clicked');
        this.navigateToSlide(this.currentState.currentSlideIndex + 1);
    }

    previousSlide() {
        console.log('Previous slide clicked');
        this.navigateToSlide(this.currentState.currentSlideIndex - 1);
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

function requestCurrentState() {
    socket.emit('request_sync');
}

document.addEventListener('DOMContentLoaded', () => {
    requestCurrentState();

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
    requestCurrentState();
});

socket.on('state_update', (newState) => {
    console.log('Received state update:', newState);
    navigationManager.updateState(newState);
});
