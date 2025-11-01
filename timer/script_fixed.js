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
        this.readingStartBtn?.addEventListener('click', () => this.startReading());
        this.readingPauseBtn?.addEventListener('click', () => this.pauseReading());
        this.readingFinishBtn?.addEventListener('click', () => this.finishReading());
        
        if (this.addBookBtn) {
            this.addBookBtn.addEventListener('click', () => this.addBook());
        }
        
        // Enter key for book form
        this.bookTitleInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addBook();
        });
        this.bookAuthorInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addBook();
        });
        
        // Book details and management
        this.backToBooksBtn?.addEventListener('click', () => this.showBooksList());
        this.backToListBtn?.addEventListener('click', () => this.showBooksList());
        this.editBookBtn?.addEventListener('click', () => this.showEditBookModal());
        this.deleteBookBtn?.addEventListener('click', () => this.deleteBook());
        this.finishBookBtn?.addEventListener('click', () => this.showFinishBookModal());
        
        // Start reading from book details
        const startReadingBookBtn = document.getElementById('start-reading-book');
        if (startReadingBookBtn) {
            startReadingBookBtn.addEventListener('click', () => this.startReadingFromDetails());
        }
        
        // Edit book modal
        this.saveBookEditBtn?.addEventListener('click', () => this.saveBookEdit());
        this.cancelBookEditBtn?.addEventListener('click', () => this.hideEditBookModal());
        
        // Finish book modal
        this.saveFinishBookBtn?.addEventListener('click', () => this.saveFinishBook());
        this.cancelFinishBookBtn?.addEventListener('click', () => this.hideFinishBookModal());
        
        // Close modal when clicking outside
        this.editBookModal?.addEventListener('click', (e) => {
            if (e.target === this.editBookModal) {
                this.hideEditBookModal();
            }
        });
        
        this.finishBookModal?.addEventListener('click', (e) => {
            if (e.target === this.finishBookModal) {
                this.hideFinishBookModal();
            }
        });
    }
    
    switchTab(tabName) {
        // Hide all tab contents
        this.tabContents.forEach(content => {
            content.classList.remove('active');
        });
        
        // Remove active class from all tab buttons
        this.tabButtons.forEach(button => {
            button.classList.remove('active');
        });
        
        // Show selected tab content
        const targetTab = document.getElementById(tabName);
        if (targetTab) {
            targetTab.classList.add('active');
        }
        
        // Add active class to clicked button
        const targetButton = document.querySelector(`[data-tab="${tabName}"]`);
        if (targetButton) {
            targetButton.classList.add('active');
        }
    }
    
    // Stopwatch methods
    startStopwatch() {
        if (!this.stopwatchRunning) {
            this.stopwatchRunning = true;
            const startTime = Date.now() - this.stopwatchTime;
            
            this.stopwatchInterval = setInterval(() => {
                this.stopwatchTime = Date.now() - startTime;
                this.stopwatchDisplay.textContent = this.formatTime(this.stopwatchTime);
            }, 10);
            
            this.stopwatchStartBtn.style.display = 'none';
            this.stopwatchPauseBtn.style.display = 'inline-block';
            this.lapButton.style.display = 'inline-block';
        }
    }
    
    pauseStopwatch() {
        if (this.stopwatchRunning) {
            this.stopwatchRunning = false;
            clearInterval(this.stopwatchInterval);
            
            this.stopwatchStartBtn.style.display = 'inline-block';
            this.stopwatchPauseBtn.style.display = 'none';
            this.lapButton.style.display = 'none';
        }
    }
    
    resetStopwatch() {
        this.stopwatchRunning = false;
        clearInterval(this.stopwatchInterval);
        this.stopwatchTime = 0;
        this.laps = [];
        
        this.stopwatchDisplay.textContent = '00:00:00';
        this.stopwatchStartBtn.style.display = 'inline-block';
        this.stopwatchPauseBtn.style.display = 'none';
        this.lapButton.style.display = 'none';
        this.lapList.innerHTML = '';
    }
    
    addLap() {
        if (this.stopwatchRunning) {
            const lapTime = this.stopwatchTime;
            this.laps.push(lapTime);
            
            const lapItem = document.createElement('div');
            lapItem.className = 'lap-item';
            lapItem.innerHTML = `
                <span class="lap-number">แล็ป ${this.laps.length}</span>
                <span class="lap-time">${this.formatTime(lapTime)}</span>
            `;
            
            this.lapList.insertBefore(lapItem, this.lapList.firstChild);
        }
    }
    
    // Countdown methods
    startCountdown() {
        const hours = parseInt(this.hoursInput.value) || 0;
        const minutes = parseInt(this.minutesInput.value) || 0;
        const seconds = parseInt(this.secondsInput.value) || 0;
        
        if (hours === 0 && minutes === 0 && seconds === 0) {
            alert('กรุณาตั้งเวลา');
            return;
        }
        
        if (!this.countdownRunning) {
            if (this.countdownTime === 0) {
                this.countdownTime = (hours * 3600 + minutes * 60 + seconds) * 1000;
                this.countdownTotal = this.countdownTime;
            }
            
            this.countdownRunning = true;
            
            this.countdownInterval = setInterval(() => {
                this.countdownTime -= 1000;
                
                if (this.countdownTime <= 0) {
                    this.countdownTime = 0;
                    this.finishCountdown();
                }
                
                this.updateCountdownDisplay();
                this.updateProgressBar();
            }, 1000);
            
            this.toggleCountdownInputs(true);
            this.countdownStartBtn.style.display = 'none';
            this.countdownPauseBtn.style.display = 'inline-block';
        }
    }
    
    pauseCountdown() {
        if (this.countdownRunning) {
            this.countdownRunning = false;
            clearInterval(this.countdownInterval);
            
            this.countdownStartBtn.style.display = 'inline-block';
            this.countdownPauseBtn.style.display = 'none';
        }
    }
    
    resetCountdown() {
        this.countdownRunning = false;
        clearInterval(this.countdownInterval);
        this.countdownTime = 0;
        this.countdownTotal = 0;
        
        this.updateCountdownDisplay();
        this.updateProgressBar();
        
        this.toggleCountdownInputs(false);
        this.countdownStartBtn.style.display = 'inline-block';
        this.countdownPauseBtn.style.display = 'none';
    }
    
    finishCountdown() {
        this.resetCountdown();
        this.showNotification('⏰ เวลาหมด!', 'เสียงแจ้งเตือน');
        
        if (this.alarmSound) {
            this.alarmSound.play().catch(() => {
                // Fallback if audio fails
                console.log('Audio playback failed');
            });
        }
    }
    
    updateCountdownDisplay() {
        if (this.countdownTime > 0) {
            this.countdownDisplay.textContent = this.formatCountdownTime(this.countdownTime);
        } else {
            const hours = parseInt(this.hoursInput.value) || 0;
            const minutes = parseInt(this.minutesInput.value) || 0;
            const seconds = parseInt(this.secondsInput.value) || 0;
            const totalMs = (hours * 3600 + minutes * 60 + seconds) * 1000;
            this.countdownDisplay.textContent = this.formatCountdownTime(totalMs);
        }
    }
    
    updateProgressBar() {
        if (this.countdownTotal > 0) {
            const progress = ((this.countdownTotal - this.countdownTime) / this.countdownTotal) * 100;
            this.progressBar.style.width = progress + '%';
        } else {
            this.progressBar.style.width = '0%';
        }
    }
    
    toggleCountdownInputs(disabled) {
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
        if (!this.bookTitleInput) {
            alert('ไม่พบช่องกรอกชื่อหนังสือ');
            return;
        }
        
        const title = this.bookTitleInput.value.trim();
        
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
        
        // Clear book selection
        const readingSelect = document.getElementById('reading-book-select');
        if (readingSelect) readingSelect.value = '';
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
    
    updateReadingDisplay() {
        const display = document.getElementById('reading-timer-display');
        if (display) {
            display.textContent = this.formatTimeHMS(this.readingTime);
        }
        
        // Update session time
        const sessionTime = document.getElementById('session-time');
        if (sessionTime && this.currentSessionStart) {
            const currentSessionTime = this.readingRunning 
                ? Date.now() - this.currentSessionStart 
                : 0;
            sessionTime.textContent = this.formatTimeHMS(currentSessionTime);
        }
    }
    
    updateCurrentSessionTime() {
        if (this.currentSessionStart) {
            const currentSessionTime = Date.now() - this.currentSessionStart;
            const sessionTimeEl = document.getElementById('session-time');
            if (sessionTimeEl) {
                sessionTimeEl.textContent = this.formatTimeHMS(currentSessionTime);
            }
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
        
        if (this.totalBooksSpan) this.totalBooksSpan.textContent = totalBooks;
        if (this.totalTimeSpan) this.totalTimeSpan.textContent = Math.floor(totalTime / 3600000);
        if (this.totalSessionsSpan) this.totalSessionsSpan.textContent = totalSessions;
    }
    
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
        const sessionsList = document.getElementById('sessions-list');
        if (!sessionsList) return;
        
        sessionsList.innerHTML = '';
        
        // Add book reading period info if available
        if (book) {
            const bookInfoDiv = document.createElement('div');
            bookInfoDiv.className = 'book-reading-info';
            
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
            sessionsList.appendChild(bookInfoDiv);
        }
        
        if (sessions.length === 0) {
            const noSessionsP = document.createElement('p');
            noSessionsP.className = 'no-sessions';
            noSessionsP.textContent = 'ยังไม่มีประวัติการอ่าน';
            sessionsList.appendChild(noSessionsP);
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
            
            sessionsList.appendChild(sessionItem);
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
        
        const bookIndex = this.books.findIndex(b => b.id === this.currentEditingBookId);
        if (bookIndex !== -1) {
            // Check if title already exists (except current book)
            const existingBook = this.books.find(book => 
                book.title.toLowerCase() === title.toLowerCase() && 
                book.id !== this.currentEditingBookId
            );
            
            if (existingBook) {
                alert('ชื่อหนังสือนี้มีอยู่แล้ว');
                return;
            }
            
            this.books[bookIndex].title = title;
            this.books[bookIndex].author = this.editBookAuthorInput.value.trim();
            
            this.saveBooks();
            this.updateBooksDisplay();
            
            // Update current details view
            this.showBookDetails(this.currentEditingBookId);
            
            this.hideEditBookModal();
            this.showNotification('✏️ แก้ไขแล้ว!', 'ข้อมูลหนังสือได้รับการอัปเดต');
        }
    }
    
    deleteBook() {
        if (!this.currentViewingBookId) return;
        
        const book = this.books.find(b => b.id === this.currentViewingBookId);
        if (!book) return;
        
        if (confirm(`คุณต้องการลบ "${book.title}" หรือไม่?\n\nการกระทำนี้ไม่สามารถย้อนกลับได้`)) {
            this.books = this.books.filter(b => b.id !== this.currentViewingBookId);
            this.saveBooks();
            this.updateBooksDisplay();
            this.updateReadingStats();
            this.showBooksList();
            
            this.showNotification('🗑️ ลบแล้ว!', `ลบ "${book.title}" เรียบร้อย`);
        }
    }
    
    showFinishBookModal() {
        if (!this.currentViewingBookId) return;
        
        // Set current date and time as default
        const now = new Date();
        this.finishDateInput.value = now.toISOString().split('T')[0];
        this.finishTimeInput.value = now.toTimeString().slice(0, 5);
        
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
    
    showNotification(title, body) {
        // Try to show browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body, icon: '/icons/icon-96x96.png' });
        }
        
        // Also show in-app notification
        console.log(`${title}: ${body}`);
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
                if (timerApp.stopwatchRunning) {
                    timerApp.pauseStopwatch();
                } else {
                    timerApp.startStopwatch();
                }
            } else if (activeTab.id === 'countdown') {
                if (timerApp.countdownRunning) {
                    timerApp.pauseCountdown();
                } else {
                    timerApp.startCountdown();
                }
            } else if (activeTab.id === 'reading') {
                if (timerApp.readingRunning) {
                    timerApp.pauseReading();
                } else {
                    timerApp.startReading();
                }
            }
            break;
        case 'r':
            e.preventDefault();
            const activeTab2 = document.querySelector('.tab-content.active');
            if (activeTab2.id === 'stopwatch') {
                timerApp.resetStopwatch();
            } else if (activeTab2.id === 'countdown') {
                timerApp.resetCountdown();
            }
            break;
        case 'l':
            e.preventDefault();
            if (document.querySelector('.tab-content.active').id === 'stopwatch') {
                timerApp.addLap();
            }
            break;
    }
});

// Global function for tab switching
function showTab(tabName) {
    if (timerApp) {
        timerApp.switchTab(tabName);
    }
}