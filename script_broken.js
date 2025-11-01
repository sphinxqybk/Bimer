class TimerApp {
    constructor() {
        this.stopwatchTime = 0;
        this.stopwatchInterval = null;
        this.stopwatchRunning = false;
        
        this.countdownTime = 0;
        this.countdownInterval = null;
        this.countdownRunning = false;
        this.countdownTotal = 0;
        
        this.laps = [];
        
        // Reading tracker properties
        this.readingTime = 0;
        this.readingInterval = null;
        this.readingRunning = false;
        this.currentBook = null;
        this.currentSessionStart = null;
        this.books = this.loadBooks();
        
        this.initializeElements();
        this.setupEventListeners();
        this.setupLibraryControls();
        this.updateCountdownDisplay();
        
        // Wait for DOM to be ready before updating display
        setTimeout(() => {
            this.updateBooksDisplay();
            this.updateReadingStats();
        }, 100);
    }
    
    initializeElements() {
        // Tab elements
        this.tabButtons = document.querySelectorAll('.tab-button');
        this.tabContents = document.querySelectorAll('.tab-content');
        
        // Stopwatch elements
        this.stopwatchDisplay = document.getElementById('stopwatch-display');
        this.stopwatchStartBtn = document.getElementById('stopwatch-start');
        this.stopwatchPauseBtn = document.getElementById('stopwatch-pause');
        this.stopwatchResetBtn = document.getElementById('stopwatch-reset');
        this.lapButton = document.getElementById('lap-button');
        this.lapList = document.getElementById('lap-list');
        
        // Countdown elements
        this.hoursInput = document.getElementById('hours');
        this.minutesInput = document.getElementById('minutes');
        this.secondsInput = document.getElementById('seconds');
        this.countdownDisplay = document.getElementById('countdown-display');
        this.countdownStartBtn = document.getElementById('countdown-start');
        this.countdownPauseBtn = document.getElementById('countdown-pause');
        this.countdownResetBtn = document.getElementById('countdown-reset');
        this.progressBar = document.getElementById('progress');
        this.alarmSound = document.getElementById('alarm-sound');
        
        // Reading tracker elements
        this.currentReadingSection = document.getElementById('current-reading');
        this.bookSelectionSection = document.getElementById('book-selection');
        this.currentBookTitle = document.getElementById('current-book-title');
        this.readingDisplay = document.getElementById('reading-display');
        this.readingStartBtn = document.getElementById('reading-start');
        this.readingPauseBtn = document.getElementById('reading-pause');
        this.readingFinishBtn = document.getElementById('reading-finish');
        this.currentSessionTime = document.getElementById('current-session-time');
        this.totalBookTime = document.getElementById('total-book-time');
        this.bookTitleInput = document.getElementById('book-title');
        this.bookAuthorInput = document.getElementById('book-author');
        this.bookStartDateInput = document.getElementById('book-start-date');
        this.bookStartTimeInput = document.getElementById('book-start-time');
        this.addBookBtn = document.getElementById('add-book');
        this.booksContainer = document.getElementById('books-container');
        this.totalBooksSpan = document.getElementById('total-books');
        this.totalTimeSpan = document.getElementById('total-time');
        this.totalSessionsSpan = document.getElementById('total-sessions');
        
        // Book details elements
        this.bookDetailsSection = document.getElementById('book-details');
        this.backToBooksBtn = document.getElementById('back-to-books');
        this.backToListBtn = document.getElementById('back-to-list');
        this.detailsBookTitle = document.getElementById('details-book-title');
        this.detailsBookAuthor = document.getElementById('details-book-author');
        this.detailsTotalTime = document.getElementById('details-total-time');
        this.detailsSessionCount = document.getElementById('details-session-count');
        this.sessionsList = document.getElementById('sessions-list');
        this.editBookBtn = document.getElementById('edit-book');
        this.deleteBookBtn = document.getElementById('delete-book');
        this.finishBookBtn = document.getElementById('finish-book');
        
        // Edit book modal elements
        this.editBookModal = document.getElementById('edit-book-modal');
        this.editBookTitleInput = document.getElementById('edit-book-title');
        this.editBookAuthorInput = document.getElementById('edit-book-author');
        this.saveBookEditBtn = document.getElementById('save-book-edit');
        this.cancelBookEditBtn = document.getElementById('cancel-book-edit');
        
        // Finish book modal elements
        this.finishBookModal = document.getElementById('finish-book-modal');
        this.finishDateInput = document.getElementById('finish-date');
        this.finishTimeInput = document.getElementById('finish-time');
        this.finishNotesInput = document.getElementById('finish-notes');
        this.saveFinishBookBtn = document.getElementById('save-finish-book');
        this.cancelFinishBookBtn = document.getElementById('cancel-finish-book');
        
        this.currentEditingBookId = null;
        this.currentViewingBookId = null;
    }
    
    setupEventListeners() {
        // Tab switching
        this.tabButtons.forEach(button => {
            button.addEventListener('click', () => this.switchTab(button.dataset.tab));
        });
        
        // Stopwatch controls
        this.stopwatchStartBtn.addEventListener('click', () => this.startStopwatch());
        this.stopwatchPauseBtn.addEventListener('click', () => this.pauseStopwatch());
        this.stopwatchResetBtn.addEventListener('click', () => this.resetStopwatch());
        this.lapButton.addEventListener('click', () => this.addLap());
        
        // Countdown controls
        this.countdownStartBtn.addEventListener('click', () => this.startCountdown());
        this.countdownPauseBtn.addEventListener('click', () => this.pauseCountdown());
        this.countdownResetBtn.addEventListener('click', () => this.resetCountdown());
        
        // Time input changes
        [this.hoursInput, this.minutesInput, this.secondsInput].forEach(input => {
            input.addEventListener('change', () => this.updateCountdownDisplay());
        });
        
        // Reading tracker controls
        this.readingStartBtn.addEventListener('click', () => this.startReading());
        this.readingPauseBtn.addEventListener('click', () => this.pauseReading());
        this.readingFinishBtn.addEventListener('click', () => this.finishReading());
        
        if (this.addBookBtn) {
            console.log('Add book button found, adding event listener');
            this.addBookBtn.addEventListener('click', () => {
                console.log('Add book button clicked!');
                this.addBook();
            });
        } else {
            console.error('Add book button not found!');
        }
        
        // Enter key for book form
        this.bookTitleInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addBook();
        });
        this.bookAuthorInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addBook();
        });
        
        // Book details and management
        this.backToBooksBtn.addEventListener('click', () => this.showBooksList());
        this.backToListBtn.addEventListener('click', () => this.showBooksList());
        this.editBookBtn.addEventListener('click', () => this.showEditBookModal());
        this.deleteBookBtn.addEventListener('click', () => this.deleteBook());
        this.finishBookBtn.addEventListener('click', () => this.showFinishBookModal());
        
        // Start reading from book details
        const startReadingBookBtn = document.getElementById('start-reading-book');
        if (startReadingBookBtn) {
            startReadingBookBtn.addEventListener('click', () => this.startReadingFromDetails());
        }
        
        // Edit book modal
        this.saveBookEditBtn.addEventListener('click', () => this.saveBookEdit());
        this.cancelBookEditBtn.addEventListener('click', () => this.hideEditBookModal());
        
        // Finish book modal
        this.saveFinishBookBtn.addEventListener('click', () => this.saveFinishBook());
        this.cancelFinishBookBtn.addEventListener('click', () => this.hideFinishBookModal());
        
        // Close modal when clicking outside
        this.editBookModal.addEventListener('click', (e) => {
            if (e.target === this.editBookModal) {
                this.hideEditBookModal();
            }
        });
        
        this.finishBookModal.addEventListener('click', (e) => {
            if (e.target === this.finishBookModal) {
                this.hideFinishBookModal();
            }
        });
    }
    
    switchTab(tabName) {
        // Update tab buttons
        this.tabButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update tab content
        this.tabContents.forEach(content => content.classList.remove('active'));
        document.getElementById(tabName).classList.add('active');
    }
    
    // Stopwatch methods
    startStopwatch() {
        if (!this.stopwatchRunning) {
            this.stopwatchRunning = true;
            this.stopwatchInterval = setInterval(() => {
                this.stopwatchTime += 10;
                this.updateStopwatchDisplay();
            }, 10);
            
            this.stopwatchStartBtn.disabled = true;
            this.stopwatchPauseBtn.disabled = false;
            this.lapButton.disabled = false;
            
            document.querySelector('#stopwatch .timer-display').classList.add('running');
        }
    }
    
    pauseStopwatch() {
        if (this.stopwatchRunning) {
            this.stopwatchRunning = false;
            clearInterval(this.stopwatchInterval);
            
            this.stopwatchStartBtn.disabled = false;
            this.stopwatchPauseBtn.disabled = true;
            this.lapButton.disabled = true;
            
            document.querySelector('#stopwatch .timer-display').classList.remove('running');
        }
    }
    
    resetStopwatch() {
        this.pauseStopwatch();
        this.stopwatchTime = 0;
        this.updateStopwatchDisplay();
        this.laps = [];
        this.updateLapDisplay();
        
        this.stopwatchStartBtn.disabled = false;
        this.stopwatchPauseBtn.disabled = true;
        this.lapButton.disabled = true;
    }
    
    addLap() {
        if (this.stopwatchRunning) {
            const lapTime = this.stopwatchTime;
            const lapNumber = this.laps.length + 1;
            this.laps.push({ number: lapNumber, time: lapTime });
            this.updateLapDisplay();
        }
    }
    
    updateStopwatchDisplay() {
        const time = this.formatTime(this.stopwatchTime);
        this.stopwatchDisplay.textContent = time;
    }
    
    updateLapDisplay() {
        this.lapList.innerHTML = '';
        this.laps.forEach(lap => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>รอบที่ ${lap.number}</span>
                <span>${this.formatTime(lap.time)}</span>
            `;
            this.lapList.appendChild(li);
        });
    }
    
    // Countdown methods
    startCountdown() {
        if (!this.countdownRunning) {
            if (this.countdownTime === 0) {
                this.setCountdownTime();
            }
            
            if (this.countdownTime > 0) {
                this.countdownRunning = true;
                this.countdownInterval = setInterval(() => {
                    this.countdownTime -= 1000;
                    this.updateCountdownDisplay();
                    this.updateProgressBar();
                    
                    if (this.countdownTime <= 0) {
                        this.countdownFinished();
                    } else if (this.countdownTime <= 10000) {
                        document.querySelector('#countdown .timer-display').classList.add('warning');
                    }
                }, 1000);
                
                this.countdownStartBtn.disabled = true;
                this.countdownPauseBtn.disabled = false;
                this.disableTimeInputs(true);
                
                document.querySelector('#countdown .timer-display').classList.add('running');
            }
        }
    }
    
    pauseCountdown() {
        if (this.countdownRunning) {
            this.countdownRunning = false;
            clearInterval(this.countdownInterval);
            
            this.countdownStartBtn.disabled = false;
            this.countdownPauseBtn.disabled = true;
            
            document.querySelector('#countdown .timer-display').classList.remove('running', 'warning');
        }
    }
    
    resetCountdown() {
        this.pauseCountdown();
        this.countdownTime = 0;
        this.updateCountdownDisplay();
        this.updateProgressBar();
        this.disableTimeInputs(false);
        
        this.countdownStartBtn.disabled = false;
        this.countdownPauseBtn.disabled = true;
        
        document.querySelector('#countdown .timer-display').classList.remove('warning');
    }
    
    setCountdownTime() {
        const hours = parseInt(this.hoursInput.value) || 0;
        const minutes = parseInt(this.minutesInput.value) || 0;
        const seconds = parseInt(this.secondsInput.value) || 0;
        
        this.countdownTime = (hours * 3600 + minutes * 60 + seconds) * 1000;
        this.countdownTotal = this.countdownTime;
    }
    
    updateCountdownDisplay() {
        if (this.countdownTime === 0 && !this.countdownRunning) {
            const hours = parseInt(this.hoursInput.value) || 0;
            const minutes = parseInt(this.minutesInput.value) || 0;
            const seconds = parseInt(this.secondsInput.value) || 0;
            
            const totalSeconds = hours * 3600 + minutes * 60 + seconds;
            this.countdownDisplay.textContent = this.formatCountdownTime(totalSeconds * 1000);
        } else {
            this.countdownDisplay.textContent = this.formatCountdownTime(this.countdownTime);
        }
    }
    
    updateProgressBar() {
        if (this.countdownTotal > 0) {
            const progress = ((this.countdownTotal - this.countdownTime) / this.countdownTotal) * 100;
            this.progressBar.style.width = `${progress}%`;
        }
    }
    
    countdownFinished() {
        this.pauseCountdown();
        this.countdownTime = 0;
        this.updateCountdownDisplay();
        
        // Play alarm sound
        this.playAlarm();
        
        // Show notification
        this.showNotification('⏰ เวลาหมดแล้ว!', 'เวลานับถอยหลังเสร็จสิ้นแล้ว');
        
        // Flash the display
        this.flashDisplay();
    }
    
    playAlarm() {
        // Create a simple beep sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = 800;
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.5);
            }, i * 600);
        }
    }
    
    showNotification(title, body) {
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                new Notification(title, { body });
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        new Notification(title, { body });
                    }
                });
            }
        }
    }
    
    flashDisplay() {
        const display = document.querySelector('#countdown .timer-display');
        let flashes = 0;
        const flashInterval = setInterval(() => {
            display.style.background = flashes % 2 === 0 ? '#fed7d7' : '#f8fafc';
            flashes++;
            if (flashes >= 6) {
                clearInterval(flashInterval);
                display.style.background = '';
            }
        }, 200);
    }
    
    disableTimeInputs(disabled) {
        this.hoursInput.disabled = disabled;
        this.minutesInput.disabled = disabled;
        this.secondsInput.disabled = disabled;
    }
    
    // Reading Tracker Methods
    loadBooks() {
        const stored = localStorage.getItem('reading-tracker-books');
        return stored ? JSON.parse(stored) : [];
    }
    
    saveBooks() {
        localStorage.setItem('reading-tracker-books', JSON.stringify(this.books));
    }
    
    addBook() {
        console.log('addBook() called');
        console.log('bookTitleInput:', this.bookTitleInput);
        console.log('bookAuthorInput:', this.bookAuthorInput);
        
        if (!this.bookTitleInput) {
            console.error('bookTitleInput not found');
            alert('ไม่พบช่องกรอกชื่อหนังสือ');
            return;
        }
        
        const title = this.bookTitleInput.value.trim();
        console.log('Title value:', title);
        
        if (!title) {
            alert('กรุณาระบุชื่อหนังสือ');
            return;
        }
        
        // Check if book already exists
        if (this.books.find(book => book.title.toLowerCase() === title.toLowerCase())) {
            alert('หนังสือเล่มนี้มีอยู่แล้ว');
            return;
        }
        
        const author = this.bookAuthorInput ? this.bookAuthorInput.value.trim() : '';
        const startDate = this.bookStartDateInput ? this.bookStartDateInput.value : '';
        const startTime = this.bookStartTimeInput ? this.bookStartTimeInput.value : '';
        
        console.log('Author:', author, 'StartDate:', startDate, 'StartTime:', startTime);
        
        // Create start datetime if provided
        let startDateTime = null;
        if (startDate) {
            const timeStr = startTime || '00:00';
            startDateTime = new Date(`${startDate}T${timeStr}`).toISOString();
        }
        
        const newBook = {
            id: Date.now(),
            title: title,
            author: author,
            totalTime: 0,
            sessions: [],
            createdAt: new Date().toISOString(),
            startDateTime: startDateTime,
            finishDateTime: null,
            notes: null,
            isFinished: false
        };
        
        console.log('New book:', newBook);
        
        this.books.push(newBook);
        this.saveBooks();
        this.updateBooksDisplay();
        this.updateReadingStats();
        
        // Clear form safely
        if (this.bookTitleInput) this.bookTitleInput.value = '';
        if (this.bookAuthorInput) this.bookAuthorInput.value = '';
        if (this.bookStartDateInput) this.bookStartDateInput.value = '';
        if (this.bookStartTimeInput) this.bookStartTimeInput.value = '';
        
        // Show success
        this.showNotification('📚 เพิ่มหนังสือแล้ว!', `เพิ่ม "${title}" เรียบร้อย`);
        
        console.log('Book added successfully, total books:', this.books.length);
    }
    
    selectBook(bookId) {
        this.currentBook = this.books.find(book => book.id === bookId);
        if (this.currentBook) {
            this.readingTime = this.currentBook.totalTime;
            this.updateReadingDisplay();
            this.updateTotalBookTime();
            this.currentBookTitle.textContent = `📖 กำลังอ่าน: ${this.currentBook.title}`;
            
            // Show current reading section
            this.currentReadingSection.style.display = 'block';
            this.bookSelectionSection.style.display = 'none';
            
            // Update book item display
            document.querySelectorAll('.book-item').forEach(item => {
                item.classList.remove('active');
            });
            document.querySelector(`[data-book-id="${bookId}"]`).classList.add('active');
        }
    }
    
    startReading() {
        // Check if book is selected
        const readingSelect = document.getElementById('reading-book-select');
        if (!readingSelect || !readingSelect.value) {
            alert('กรุณาเลือกหนังสือที่จะอ่านก่อน');
            return;
        }
        
        // Find selected book
        const selectedBookId = parseInt(readingSelect.value);
        this.currentBook = this.books.find(book => book.id === selectedBookId);
        
        if (!this.currentBook) {
            alert('ไม่พบหนังสือที่เลือก');
            return;
        }
        
        if (!this.readingRunning) {
            this.readingRunning = true;
            this.currentSessionStart = Date.now();
            this.readingTime = this.currentBook.totalTime || 0; // Continue from saved time
            
            this.readingInterval = setInterval(() => {
                this.readingTime += 1000;
                this.updateReadingDisplay();
                this.updateCurrentSessionTime();
            }, 1000);
            
            // Update button states
            const startBtn = document.getElementById('start-reading');
            const pauseBtn = document.getElementById('pause-reading');
            const stopBtn = document.getElementById('stop-reading');
            
            if (startBtn) startBtn.style.display = 'none';
            if (pauseBtn) pauseBtn.style.display = 'inline-block';
            if (stopBtn) stopBtn.style.display = 'inline-block';
            
            // Show current session info
            this.showCurrentSession();
            
            this.showNotification('⏱️ เริ่มจับเวลา', `เริ่มอ่าน "${this.currentBook.title}" แล้ว`);
        }
    }
    
    pauseReading() {
        if (this.readingRunning) {
            this.readingRunning = false;
            clearInterval(this.readingInterval);
            
            // Update button states
            const startBtn = document.getElementById('start-reading');
            const pauseBtn = document.getElementById('pause-reading');
            
            if (startBtn) startBtn.style.display = 'inline-block';
            if (pauseBtn) pauseBtn.style.display = 'none';
            
            this.showNotification('⏸️ หยุดชั่วคราว', 'จับเวลาหยุดชั่วคราว');
        }
    }
    
    finishReading() {
        if (!this.currentBook || !this.currentSessionStart) {
            alert('ไม่มีเซสชั่นการอ่านที่กำลังดำเนินอยู่');
            return;
        }
        
        this.pauseReading();
        
        const sessionDuration = Date.now() - this.currentSessionStart;
        const sessionTime = Math.floor(sessionDuration / 1000) * 1000; // Round to seconds
        
        if (sessionTime > 5000) { // At least 5 seconds to save
            // Add session to book
            const session = {
                date: new Date().toISOString(),
                duration: sessionTime,
                startTime: this.currentSessionStart,
                endTime: Date.now()
            };
            
            this.currentBook.sessions.push(session);
            this.currentBook.totalTime = this.readingTime;
            this.saveBooks();
            
            // Reset session
            this.resetReadingSession();
            
            // Update displays
            this.updateBooksDisplay();
            this.updateReadingStats();
            
            // Show success message
            const minutes = Math.floor(sessionTime / 60000);
            const seconds = Math.floor((sessionTime % 60000) / 1000);
            this.showNotification('📚 บันทึกแล้ว!', 
                `บันทึกการอ่าน "${this.currentBook.title}" ${minutes}:${seconds.toString().padStart(2, '0')} นาที`);
        } else {
            this.resetReadingSession();
            this.showNotification('⚠️ เวลาสั้นเกินไป', 'ต้องอ่านอย่างน้อย 5 วินาทีถึงจะบันทึกได้');
        }
    }
    
    resetReadingSession() {
        // Reset all reading states
        this.readingTime = 0;
        this.currentBook = null;
        this.currentSessionStart = null;
        this.readingRunning = false;
        
        if (this.readingInterval) {
            clearInterval(this.readingInterval);
            this.readingInterval = null;
        }
        
        // Reset button states
        const startBtn = document.getElementById('start-reading');
        const pauseBtn = document.getElementById('pause-reading');
        const stopBtn = document.getElementById('stop-reading');
        
        if (startBtn) startBtn.style.display = 'inline-block';
        if (pauseBtn) pauseBtn.style.display = 'none';
        if (stopBtn) stopBtn.style.display = 'none';
        
        // Hide current session info
        this.hideCurrentSession();
        
        // Reset displays
        this.updateReadingDisplay();
    }
    
    showCurrentSession() {
        const currentSession = document.getElementById('current-session');
        const currentBookTitle = document.getElementById('current-book-title');
        const currentBookAuthor = document.getElementById('current-book-author');
        
        if (currentSession && this.currentBook) {
            currentSession.style.display = 'block';
            if (currentBookTitle) currentBookTitle.textContent = this.currentBook.title;
            if (currentBookAuthor) currentBookAuthor.textContent = this.currentBook.author || 'ไม่ระบุผู้แต่ง';
        }
    }
    
    hideCurrentSession() {
        const currentSession = document.getElementById('current-session');
        if (currentSession) {
            currentSession.style.display = 'none';
        }
    }
        
        // Reset and go back to book selection
        this.resetReading();
    }
    
    resetReading() {
        this.currentBook = null;
        this.readingTime = 0;
        this.currentSessionStart = null;
        
        this.updateReadingDisplay();
        this.currentSessionTime.textContent = '00:00:00';
        this.totalBookTime.textContent = '00:00:00';
        
        this.readingStartBtn.disabled = false;
        this.readingPauseBtn.disabled = true;
        this.readingFinishBtn.disabled = true;
        
        // Always go back to book selection
        this.showBooksList();
        this.updateBooksDisplay();
    }
    
    updateReadingDisplay() {
        this.readingDisplay.textContent = this.formatTimeHMS(this.readingTime);
    }
    
    updateCurrentSessionTime() {
        if (this.currentSessionStart) {
            const sessionTime = Date.now() - this.currentSessionStart;
            this.currentSessionTime.textContent = this.formatTimeHMS(sessionTime);
        }
    }
    
    updateTotalBookTime() {
        if (this.currentBook) {
            this.totalBookTime.textContent = this.formatTimeHMS(this.currentBook.totalTime);
        }
    }
    
    updateBooksDisplay() {
        // Update reading book select dropdown
        const readingSelect = document.getElementById('reading-book-select');
        if (readingSelect) {
            const availableBooks = this.books.filter(book => !book.isFinished);
            readingSelect.innerHTML = '<option value="">-- เลือกหนังสือ --</option>';
            availableBooks.forEach(book => {
                const option = document.createElement('option');
                option.value = book.id;
                option.textContent = `${book.title} (${book.author})`;
                readingSelect.appendChild(option);
            });
        }
        
        // Update library display
        this.displayFilteredBooks(this.books);
    }
    
    updateReadingStats() {
        const totalBooks = this.books.length;
        const totalTime = this.books.reduce((sum, book) => sum + book.totalTime, 0);
        const totalSessions = this.books.reduce((sum, book) => sum + book.sessions.length, 0);
        
        this.totalBooksSpan.textContent = totalBooks;
        this.totalTimeSpan.textContent = Math.floor(totalTime / 3600000); // Hours
        this.totalSessionsSpan.textContent = totalSessions;
    }
    
    // Book Management Methods
    showBookDetails(bookId) {
        const book = this.books.find(b => b.id == bookId);
        if (!book) return;
        
        this.currentViewingBookId = bookId;
        
        // Switch to library tab first
        this.switchTab('library');
        
        // Update book details
        document.getElementById('details-book-title').textContent = book.title;
        document.getElementById('details-book-author').textContent = book.author || 'ไม่ระบุผู้แต่ง';
        document.getElementById('details-total-time').textContent = this.formatTimeHMS(book.totalTime);
        document.getElementById('details-session-count').textContent = book.sessions.length;
        
        // Update sessions list with reading dates
        this.updateSessionsList(book.sessions, book);
        
        // Show/hide buttons based on finish status
        const finishBtn = document.getElementById('finish-book');
        const startReadingBtn = document.getElementById('start-reading-book');
        
        if (finishBtn) {
            finishBtn.style.display = book.isFinished ? 'none' : 'block';
        }
        
        if (startReadingBtn) {
            startReadingBtn.style.display = book.isFinished ? 'none' : 'block';
        }
        
        // Show book details section
        const bookSelection = document.getElementById('book-selection');
        const bookDetails = document.getElementById('book-details');
        
        if (bookSelection) bookSelection.style.display = 'none';
        if (bookDetails) bookDetails.style.display = 'block';
    }
    
    showBooksList() {
        // Hide book details section and show book list
        const bookSelection = document.getElementById('book-selection');
        const bookDetails = document.getElementById('book-details');
        
        if (bookDetails) bookDetails.style.display = 'none';
        if (bookSelection) bookSelection.style.display = 'block';
        
        // Reset viewing state
        this.currentViewingBookId = null;
        
        // If user was reading, pause the timer but keep the data
        if (this.readingRunning) {
            this.pauseReading();
        }
    }
    
    startReadingFromDetails() {
        if (!this.currentViewingBookId) return;
        
        // Switch to reading tab
        this.switchTab('reading');
        
        // Select the book in the dropdown
        const readingSelect = document.getElementById('reading-book-select');
        if (readingSelect) {
            readingSelect.value = this.currentViewingBookId;
        }
        
        // Show notification
        const book = this.books.find(b => b.id == this.currentViewingBookId);
        if (book) {
            this.showNotification('📖 เตรียมพร้อมอ่าน', `เลือก "${book.title}" แล้ว กดเริ่มอ่านได้เลย!`);
        }
    }
    
    updateSessionsList(sessions, book = null) {
        this.sessionsList.innerHTML = '';
        
        // Add book reading period info if available
        if (book) {
            const bookInfoDiv = document.createElement('div');
            bookInfoDiv.className = 'book-reading-info';
            bookInfoDiv.style.cssText = `
                background: #f0fff4;
                padding: 1rem;
                border-radius: 8px;
                margin-bottom: 1rem;
                border-left: 4px solid #48bb78;
            `;
            
            let infoHTML = '';
            if (book.startDateTime) {
                const startDate = new Date(book.startDateTime);
                infoHTML += `📅 <strong>เริ่มอ่าน:</strong> ${startDate.toLocaleDateString('th-TH')} เวลา ${startDate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}<br>`;
            }
            
            if (book.isFinished && book.finishDateTime) {
                const finishDate = new Date(book.finishDateTime);
                infoHTML += `🎉 <strong>อ่านจบ:</strong> ${finishDate.toLocaleDateString('th-TH')} เวลา ${finishDate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}<br>`;
                
                if (book.notes) {
                    infoHTML += `📝 <strong>บันทึก:</strong> ${book.notes}`;
                }
            } else if (!book.isFinished) {
                infoHTML += `📖 <strong>สถานะ:</strong> <span style="color: #4299e1;">กำลังอ่าน</span>`;
            }
            
            bookInfoDiv.innerHTML = infoHTML;
            this.sessionsList.appendChild(bookInfoDiv);
        }
        
        if (sessions.length === 0) {
            const noSessionsP = document.createElement('p');
            noSessionsP.className = 'no-sessions';
            noSessionsP.textContent = 'ยังไม่มีประวัติการอ่าน';
            this.sessionsList.appendChild(noSessionsP);
            return;
        }
        
        // Sort sessions by date (newest first)
        const sortedSessions = sessions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        sortedSessions.forEach((session, index) => {
            const sessionDate = new Date(session.date);
            const sessionItem = document.createElement('div');
            sessionItem.className = 'session-item';
            
            const duration = this.formatTimeHMS(session.duration);
            const dateStr = sessionDate.toLocaleDateString('th-TH');
            const timeStr = sessionDate.toLocaleTimeString('th-TH', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            sessionItem.innerHTML = `
                <div class="session-info">
                    <div class="session-date">📅 ${dateStr} • ⏰ ${timeStr}</div>
                    <div class="session-time">เซสชั่นที่ ${sessions.length - index}</div>
                </div>
                <div class="session-duration">${duration}</div>
            `;
            
            this.sessionsList.appendChild(sessionItem);
        });
    }
    
    showEditBookModal() {
        if (!this.currentViewingBookId) return;
        
        const book = this.books.find(b => b.id === this.currentViewingBookId);
        if (!book) return;
        
        this.currentEditingBookId = this.currentViewingBookId;
        this.editBookTitleInput.value = book.title;
        this.editBookAuthorInput.value = book.author || '';
        this.editBookModal.style.display = 'flex';
        this.editBookTitleInput.focus();
    }
    
    hideEditBookModal() {
        this.editBookModal.style.display = 'none';
        this.currentEditingBookId = null;
        this.editBookTitleInput.value = '';
        this.editBookAuthorInput.value = '';
    }
    
    saveBookEdit() {
        if (!this.currentEditingBookId) return;
        
        const title = this.editBookTitleInput.value.trim();
        if (!title) {
            alert('กรุณาระบุชื่อหนังสือ');
            return;
        }
        
        // Check if book title already exists (excluding current book)
        const existingBook = this.books.find(book => 
            book.title.toLowerCase() === title.toLowerCase() && 
            book.id !== this.currentEditingBookId
        );
        
        if (existingBook) {
            alert('มีหนังสือชื่อนี้อยู่แล้ว');
            return;
        }
        
        const bookIndex = this.books.findIndex(b => b.id === this.currentEditingBookId);
        if (bookIndex !== -1) {
            this.books[bookIndex].title = title;
            this.books[bookIndex].author = this.editBookAuthorInput.value.trim();
            
            this.saveBooks();
            this.updateBooksDisplay();
            this.updateReadingStats();
            
            // Update current details view
            if (this.currentViewingBookId === this.currentEditingBookId) {
                this.showBookDetails(this.currentEditingBookId);
            }
            
            this.hideEditBookModal();
            this.showNotification('✏️ แก้ไขเรียบร้อย!', `อัปเดตข้อมูล "${title}" แล้ว`);
        }
    }
    
    deleteBook() {
        if (!this.currentViewingBookId) return;
        
        const book = this.books.find(b => b.id === this.currentViewingBookId);
        if (!book) return;
        
        const confirmDelete = confirm(
            `คุณต้องการลบหนังสือ "${book.title}" หรือไม่?\n\n` +
            `ข้อมูลทั้งหมดรวมถึงประวัติการอ่านจะถูกลบและไม่สามารถกู้คืนได้`
        );
        
        if (confirmDelete) {
            this.books = this.books.filter(b => b.id !== this.currentViewingBookId);
            this.saveBooks();
            this.updateBooksDisplay();
            this.updateReadingStats();
            this.showBooksList();
            
            this.showNotification('🗑️ ลบเรียบร้อย!', `ลบ "${book.title}" แล้ว`);
        }
    }
    
    // Finish Book Methods
    showFinishBookModal() {
        if (!this.currentViewingBookId) return;
        
        const book = this.books.find(b => b.id === this.currentViewingBookId);
        if (!book) return;
        
        // Set default finish date/time to now
        const now = new Date();
        this.finishDateInput.value = now.toISOString().split('T')[0];
        this.finishTimeInput.value = now.toTimeString().slice(0, 5);
        this.finishNotesInput.value = '';
        
        this.finishBookModal.style.display = 'flex';
        this.finishDateInput.focus();
    }
    
    hideFinishBookModal() {
        this.finishBookModal.style.display = 'none';
        this.finishDateInput.value = '';
        this.finishTimeInput.value = '';
        this.finishNotesInput.value = '';
    }
    
    saveFinishBook() {
        if (!this.currentViewingBookId) return;
        
        const finishDate = this.finishDateInput.value;
        const finishTime = this.finishTimeInput.value;
        
        if (!finishDate || !finishTime) {
            alert('กรุณาระบุวันที่และเวลาที่อ่านจบ');
            return;
        }
        
        const bookIndex = this.books.findIndex(b => b.id === this.currentViewingBookId);
        if (bookIndex !== -1) {
            const finishDateTime = new Date(`${finishDate}T${finishTime}`).toISOString();
            const notes = this.finishNotesInput.value.trim();
            
            this.books[bookIndex].finishDateTime = finishDateTime;
            this.books[bookIndex].notes = notes || null;
            this.books[bookIndex].isFinished = true;
            
            this.saveBooks();
            this.updateBooksDisplay();
            
            // Update current details view
            this.showBookDetails(this.currentViewingBookId);
            
            this.hideFinishBookModal();
            this.showNotification('🎉 บันทึกการอ่านจบแล้ว!', 
                `บันทึก "${this.books[bookIndex].title}" เรียบร้อย`);
        }
    }
    
    // Library Search and Filter Functions
    setupLibraryControls() {
        const searchInput = document.getElementById('book-search');
        const filterSelect = document.getElementById('book-filter');
        
        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterBooks());
        }
        
        if (filterSelect) {
            filterSelect.addEventListener('change', () => this.filterBooks());
        }
    }
    
    filterBooks() {
        const searchInput = document.getElementById('book-search');
        const filterSelect = document.getElementById('book-filter');
        
        if (!searchInput || !filterSelect) return;
        
        const searchTerm = searchInput.value.toLowerCase().trim();
        const filterValue = filterSelect.value;
        
        let filteredBooks = this.books;
        
        // Apply status filter
        if (filterValue === 'reading') {
            filteredBooks = filteredBooks.filter(book => !book.isFinished);
        } else if (filterValue === 'finished') {
            filteredBooks = filteredBooks.filter(book => book.isFinished);
        }
        
        // Apply search filter
        if (searchTerm) {
            filteredBooks = filteredBooks.filter(book => 
                book.title.toLowerCase().includes(searchTerm) ||
                book.author.toLowerCase().includes(searchTerm)
            );
        }
        
        this.displayFilteredBooks(filteredBooks);
    }
    
    displayFilteredBooks(books) {
        const container = document.getElementById('books-container');
        if (!container) {
            console.error('books-container not found');
            return;
        }
        
        if (books.length === 0) {
            container.innerHTML = '<p class="no-books">ไม่พบหนังสือที่ตรงกับเงื่อนไข</p>';
            return;
        }
        
        container.innerHTML = books.map(book => {
            const totalTime = book.totalTime || 0;
            const sessionCount = book.sessions ? book.sessions.length : 0;
            const statusBadge = book.isFinished ? '✅ อ่านจบแล้ว' : '📖 กำลังอ่าน';
            const statusClass = book.isFinished ? 'finished' : 'reading';
            
            return `
                <div class="book-item ${statusClass}" onclick="timerApp.showBookDetails('${book.id}')">
                    <div class="book-info">
                        <h4>${book.title}</h4>
                        <p>โดย: ${book.author}</p>
                        <div class="book-meta">
                            <span class="reading-time">⏱️ ${this.formatTimeHMS(totalTime)}</span>
                            <span class="session-count">📝 ${sessionCount} เซสชั่น</span>
                            <span class="book-status ${statusClass}">${statusBadge}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Utility method for reading timer display
    formatTimeHMS(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Utility methods
    formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const ms = Math.floor((milliseconds % 1000) / 10);
        
        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${ms.toString().padStart(2, '0')}`;
        }
    }
    
    formatCountdownTime(milliseconds) {
        const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }
}

// Initialize the app when the page loads
let timerApp;
document.addEventListener('DOMContentLoaded', () => {
    timerApp = new TimerApp();
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    
    switch(e.key) {
        case ' ':
            e.preventDefault();
            const activeTab = document.querySelector('.tab-content.active');
            if (activeTab.id === 'stopwatch') {
                const startBtn = document.getElementById('stopwatch-start');
                const pauseBtn = document.getElementById('stopwatch-pause');
                if (!startBtn.disabled) {
                    startBtn.click();
                } else if (!pauseBtn.disabled) {
                    pauseBtn.click();
                }
            } else {
                const startBtn = document.getElementById('countdown-start');
                const pauseBtn = document.getElementById('countdown-pause');
                if (!startBtn.disabled) {
                    startBtn.click();
                } else if (!pauseBtn.disabled) {
                    pauseBtn.click();
                }
            }
            break;
        case 'r':
            e.preventDefault();
            const activeTab2 = document.querySelector('.tab-content.active');
            if (activeTab2.id === 'stopwatch') {
                document.getElementById('stopwatch-reset').click();
            } else {
                document.getElementById('countdown-reset').click();
            }
            break;
        case 'l':
            e.preventDefault();
            const lapBtn = document.getElementById('lap-button');
            if (!lapBtn.disabled) {
                lapBtn.click();
            }
            break;
        case '1':
            document.querySelector('[data-tab="stopwatch"]').click();
            break;
        case '2':
            document.querySelector('[data-tab="countdown"]').click();
            break;
        case '3':
            document.querySelector('[data-tab="reading"]').click();
            break;
    }
});