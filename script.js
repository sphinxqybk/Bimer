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
        this.currentSessionTime = 0;  // เพิ่มตัวแปรสำหรับเซสชั่นปัจจุบัน
        this.readingInterval = null;
        this.readingRunning = false;
        this.currentBook = null;
        this.currentSessionStart = null;
        this.books = this.loadBooks();
        
        // Selection mode
        this.selectionMode = false;
        this.selectedBooks = new Set();
        
        this.initializeElements();
        this.setupEventListeners();
        this.setupLibraryControls();
        
        // Export/Import controls
        const exportBtn = document.getElementById('export-data');
        const importBtn = document.getElementById('import-data');
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportData());
        if (importBtn) importBtn.addEventListener('click', () => this.importData());
        
        // Selection mode controls
        const selectModeBtn = document.getElementById('select-mode');
        const selectAllBtn = document.getElementById('select-all');
        const deselectAllBtn = document.getElementById('deselect-all');
        const bulkEditBtn = document.getElementById('bulk-edit');
        const bulkDeleteBtn = document.getElementById('bulk-delete');
        const cancelSelectionBtn = document.getElementById('cancel-selection');
        
        if (selectModeBtn) selectModeBtn.addEventListener('click', () => this.toggleSelectionMode());
        if (selectAllBtn) selectAllBtn.addEventListener('click', () => this.selectAllBooks());
        if (deselectAllBtn) deselectAllBtn.addEventListener('click', () => this.deselectAllBooks());
        if (bulkEditBtn) bulkEditBtn.addEventListener('click', () => this.bulkEditBooks());
        if (bulkDeleteBtn) bulkDeleteBtn.addEventListener('click', () => this.bulkDeleteBooks());
        if (cancelSelectionBtn) cancelSelectionBtn.addEventListener('click', () => this.exitSelectionMode());
        
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
        this.readingStartBtn = document.getElementById('start-reading');
        this.readingPauseBtn = document.getElementById('pause-reading');
        this.readingFinishBtn = document.getElementById('stop-reading');
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
        
        // Quick action buttons in reading tab
        const addNewBookQuickBtn = document.getElementById('add-new-book-quick');
        if (addNewBookQuickBtn) {
            addNewBookQuickBtn.addEventListener('click', () => {
                console.log('Add new book quick button clicked');
                // Scroll to add book section
                const addBookSection = document.getElementById('add-book-section');
                if (addBookSection) {
                    addBookSection.scrollIntoView({ behavior: 'smooth' });
                    // Focus on book title input
                    setTimeout(() => {
                        const bookTitleInput = document.getElementById('book-title');
                        if (bookTitleInput) bookTitleInput.focus();
                    }, 500);
                }
            });
        }
        
        // Go to library button
        const goToLibraryBtn = document.getElementById('go-to-library');
        if (goToLibraryBtn) {
            goToLibraryBtn.addEventListener('click', () => {
                console.log('Go to library button clicked');
                this.switchTab('library');
            });
        }
        
        // View library button in reading section
        const viewLibraryBtn = document.getElementById('view-library-btn');
        if (viewLibraryBtn) {
            viewLibraryBtn.addEventListener('click', () => {
                console.log('View library button clicked');
                this.switchTab('library');
            });
        }
        
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
        this.backToBooksBtn?.addEventListener('click', () => this.showBooksList());
        this.backToListBtn?.addEventListener('click', () => this.showBooksList());
        
        // Refresh book details button
        const refreshBookDetailsBtn = document.getElementById('refresh-book-details');
        if (refreshBookDetailsBtn) {
            refreshBookDetailsBtn.addEventListener('click', () => {
                if (this.currentViewingBookId) {
                    this.showBookDetails(this.currentViewingBookId);
                }
            });
        }
        
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
        
        // Setup finish book modal event listeners
        const saveFinishBookBtn = document.getElementById('save-finish-book');
        const cancelFinishBookBtn = document.getElementById('cancel-finish-book');
        
        if (saveFinishBookBtn) {
            saveFinishBookBtn.addEventListener('click', () => {
                console.log('Save finish book clicked');
                this.saveFinishBook();
            });
        } else {
            console.error('save-finish-book button not found!');
        }
        
        if (cancelFinishBookBtn) {
            cancelFinishBookBtn.addEventListener('click', () => {
                console.log('Cancel finish book clicked');
                this.hideFinishBookModal();
            });
        } else {
            console.error('cancel-finish-book button not found!');
        }
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

    // Data Export/Import Methods
    exportData() {
        const data = {
            books: this.books,
            exportDate: new Date().toISOString(),
            appVersion: '1.0'
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `timer-app-books-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.showNotification('📥 ส่งออกสำเร็จ!', `ส่งออกข้อมูล ${this.books.length} เล่ม`);
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (event) => {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    if (!data.books || !Array.isArray(data.books)) {
                        alert('ไฟล์ไม่ถูกต้อง: ไม่พบข้อมูลหนังสือ');
                        return;
                    }
                    
                    const importCount = data.books.length;
                    const confirmImport = confirm(
                        `พบข้อมูลหนังสือ ${importCount} เล่ม\n\n` +
                        `ต้องการนำเข้าข้อมูลหรือไม่?\n` +
                        `(ข้อมูลเก่าจะถูกแทนที่)`
                    );
                    
                    if (!confirmImport) return;
                    
                    // วาง ID ใหม่เพื่อป้องกันความซ้ำ
                    data.books.forEach((book, index) => {
                        book.id = Date.now() + index;
                    });
                    
                    this.books = data.books;
                    this.saveBooks();
                    this.updateBooksDisplay();
                    this.updateReadingStats();
                    this.showBooksList();
                    
                    this.showNotification('📤 นำเข้าสำเร็จ!', `นำเข้าข้อมูล ${importCount} เล่ม`);
                } catch (error) {
                    console.error('Import error:', error);
                    alert('เกิดข้อผิดพลาดในการอ่านไฟล์: ' + error.message);
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }

    // Selection Mode Methods
    toggleSelectionMode() {
        this.selectionMode = !this.selectionMode;
        this.selectedBooks.clear();
        
        const selectModeBtn = document.getElementById('select-mode');
        const selectionActions = document.getElementById('selection-actions');
        
        if (this.selectionMode) {
            selectModeBtn.textContent = '❌ ยกเลิกการเลือก';
            selectModeBtn.className = 'btn btn-warning btn-small';
            selectionActions.style.display = 'block';
        } else {
            selectModeBtn.textContent = '✅ เลือก';
            selectModeBtn.className = 'btn btn-info btn-small';
            selectionActions.style.display = 'none';
        }
        
        this.updateBooksDisplay();
        this.updateSelectionCount();
    }

    exitSelectionMode() {
        this.selectionMode = false;
        this.selectedBooks.clear();
        
        const selectModeBtn = document.getElementById('select-mode');
        const selectionActions = document.getElementById('selection-actions');
        
        selectModeBtn.textContent = '✅ เลือก';
        selectModeBtn.className = 'btn btn-info btn-small';
        selectionActions.style.display = 'none';
        
        this.updateBooksDisplay();
    }

    selectAllBooks() {
        const visibleBooks = this.getFilteredBooks();
        visibleBooks.forEach(book => this.selectedBooks.add(book.id));
        this.updateBooksDisplay();
        this.updateSelectionCount();
    }

    deselectAllBooks() {
        this.selectedBooks.clear();
        this.updateBooksDisplay();
        this.updateSelectionCount();
    }

    updateSelectionCount() {
        const countElement = document.getElementById('selected-count');
        if (countElement) {
            countElement.textContent = `${this.selectedBooks.size} รายการที่เลือก`;
        }
    }

    bulkEditBooks() {
        if (this.selectedBooks.size === 0) {
            alert('กรุณาเลือกหนังสือที่ต้องการแก้ไข');
            return;
        }

        const selectedBooksArray = Array.from(this.selectedBooks);
        const books = selectedBooksArray.map(id => this.books.find(b => b.id === id));
        
        // แก้ไขหลายเล่มพร้อมกัน
        const newAuthor = prompt('👤 แก้ไขชื่อผู้แต่ง (เว้นว่างไว้หากไม่ต้องการเปลี่ยน):', '');
        if (newAuthor === null) return;

        let changeCount = 0;
        books.forEach(book => {
            if (newAuthor.trim()) {
                book.author = newAuthor.trim();
                changeCount++;
            }
        });

        if (changeCount > 0) {
            this.saveBooks();
            this.updateBooksDisplay();
            this.showNotification('✏️ แก้ไขแล้ว!', `แก้ไข ${changeCount} เล่ม เรียบร้อย`);
        }

        this.exitSelectionMode();
    }

    bulkDeleteBooks() {
        console.log('bulkDeleteBooks called');
        console.log('selectedBooks:', this.selectedBooks);
        
        if (this.selectedBooks.size === 0) {
            alert('กรุณาเลือกหนังสือที่ต้องการลบ');
            return;
        }

        const selectedBooksArray = Array.from(this.selectedBooks);
        console.log('selectedBooksArray:', selectedBooksArray);
        
        // Use == instead of === for ID comparison
        const books = selectedBooksArray.map(id => this.books.find(b => b.id == id)).filter(Boolean);
        console.log('Found books to delete:', books);
        
        if (books.length === 0) {
            alert('ไม่พบหนังสือที่เลือกในระบบ');
            return;
        }
        
        const totalSessions = books.reduce((sum, book) => sum + (book.sessions?.length || 0), 0);
        const totalTime = books.reduce((sum, book) => sum + (book.totalTime || 0), 0);

        const confirmDelete = confirm(
            `⚠️ ต้องการลบหนังสือที่เลือกหรือไม่?\n\n` +
            `📚 จำนวน: ${books.length} เล่ม\n` +
            `⏰ เวลารวม: ${this.formatTimeHMS(totalTime)}\n` +
            `📊 เซสชั่นรวม: ${totalSessions} เซสชั่น\n\n` +
            `⚠️ การลบจะไม่สามารถกู้คืนได้!`
        );

        if (!confirmDelete) return;

        const secondConfirm = confirm(`❗ ยืนยันการลบ ${books.length} เล่ม อีกครั้ง\n\nกดตกลงเพื่อลบถาวร`);
        if (!secondConfirm) return;

        console.log('Deleting books with IDs:', selectedBooksArray);
        this.books = this.books.filter(book => !this.selectedBooks.has(book.id));
        console.log('Books after deletion:', this.books.length);
        
        this.saveBooks();
        this.updateBooksDisplay();
        this.updateReadingStats();
        
        this.showNotification('🗑️ ลบแล้ว!', `ลบ ${books.length} เล่ม เรียบร้อย`);
        this.exitSelectionMode();
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
        console.log('startReading called');
        // Check if book is selected
        const readingSelect = document.getElementById('reading-book-select');
        console.log('Reading select element:', readingSelect);
        console.log('Selected value:', readingSelect?.value);
        
        if (!readingSelect || !readingSelect.value) {
            alert('กรุณาเลือกหนังสือที่จะอ่านก่อน');
            return;
        }
        
        if (!this.readingRunning) {
            // Find selected book (only on new start)
            const selectedBookId = parseInt(readingSelect.value);
            const selectedBook = this.books.find(book => book.id === selectedBookId);
            console.log('Selected book:', selectedBook);
            
            if (!selectedBook) {
                alert('ไม่พบหนังสือที่เลือก');
                return;
            }
            
            // Check if this is a new session (no currentBook or different book)
            if (!this.currentBook || this.currentBook.id !== selectedBook.id) {
                console.log('Starting NEW session for:', selectedBook.title);
                this.currentBook = selectedBook;
                this.currentSessionStart = Date.now();
                this.currentSessionTime = 0;
                this.readingTime = this.currentBook.totalTime || 0;
            } else {
                // Resume same session
                console.log('Resuming SAME session for:', this.currentBook.title);
            }
            
            console.log('Starting reading timer...');
            this.readingRunning = true;
            
            this.readingInterval = setInterval(() => {
                this.currentSessionTime += 1000;
                this.updateReadingDisplay();
                this.updateCurrentSessionTime();
            }, 1000);
            
            // Update button states
            const startBtn = document.getElementById('start-reading');
            const pauseBtn = document.getElementById('pause-reading');
            const stopBtn = document.getElementById('stop-reading');
            
            console.log('Button elements:', { startBtn, pauseBtn, stopBtn });
            
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
        
        if (this.currentSessionTime > 5000) { // At least 5 seconds to save
            // Add session to book
            const session = {
                date: new Date().toISOString(),
                duration: this.currentSessionTime,
                startTime: this.currentSessionStart,
                endTime: Date.now()
            };
            
            // Update book's total time with current session
            this.currentBook.totalTime = (this.currentBook.totalTime || 0) + this.currentSessionTime;
            this.currentBook.sessions.push(session);
            this.saveBooks();
            
            // Show success message before reset
            const minutes = Math.floor(this.currentSessionTime / 60000);
            const seconds = Math.floor((this.currentSessionTime % 60000) / 1000);
            this.showNotification('📚 บันทึกแล้ว!', 
                `บันทึกการอ่าน "${this.currentBook.title}" ${minutes}:${seconds.toString().padStart(2, '0')} นาที`);
            
            // Reset session completely for next session
            this.resetReadingSession();
            
            // Update displays
            this.updateBooksDisplay();
            this.updateReadingStats();
        } else {
            this.resetReadingSession();
            this.showNotification('⚠️ เวลาสั้นเกินไป', 'ต้องอ่านอย่างน้อย 5 วินาทีถึงจะบันทึกได้');
        }
    }
    
    resetReadingSession() {
        // Reset all reading states - complete reset for new session
        this.readingTime = 0;
        this.currentSessionTime = 0;
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
        
        // Reset book selection dropdown
        const readingSelect = document.getElementById('reading-book-select');
        if (readingSelect) {
            readingSelect.value = '';
        }
        
        // Reset all displays to 00:00:00
        this.updateReadingDisplay();
        this.updateCurrentSessionTime();
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
        // แสดงเฉพาะเวลาเซสชั่นปัจจุบัน ไม่ใช่เวลารวม
        const timeStr = this.formatTimeHMS(this.currentSessionTime);
        console.log('Updating reading display:', timeStr);
        
        // Update main timer display
        const mainDisplay = document.getElementById('reading-timer-display');
        if (mainDisplay) {
            mainDisplay.textContent = timeStr;
            console.log('Main display updated');
        }
        
        // Update session display
        if (this.readingDisplay) {
            this.readingDisplay.textContent = timeStr;
            console.log('Session display updated');
        }
    }
    
    updateCurrentSessionTime() {
        const timeStr = this.formatTimeHMS(this.currentSessionTime);
        console.log('Updating session time:', timeStr);
        
        const sessionTimeElement = document.getElementById('session-time');
        if (sessionTimeElement) {
            sessionTimeElement.textContent = timeStr;
        }
        
        if (this.currentSessionTime) {
            const currentSessionTimeElement = document.getElementById('current-session-time');
            if (currentSessionTimeElement) {
                currentSessionTimeElement.textContent = timeStr;
            }
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
        
        // Update library display - เรียงลำดับให้หนังสือใหม่อยู่บนสุด
        const sortedBooks = [...this.books].sort((a, b) => b.id - a.id);
        this.displayFilteredBooks(sortedBooks);
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
            // Re-bind event listener for finish button
            const newFinishBtn = finishBtn.cloneNode(true);
            finishBtn.parentNode.replaceChild(newFinishBtn, finishBtn);
            newFinishBtn.addEventListener('click', () => {
                console.log('Finish book button clicked!');
                this.finishBookProcess();
            });
        }
        
        if (startReadingBtn) {
            startReadingBtn.style.display = book.isFinished ? 'none' : 'block';
            // Re-bind event listener for start reading button
            const newStartBtn = startReadingBtn.cloneNode(true);
            startReadingBtn.parentNode.replaceChild(newStartBtn, startReadingBtn);
            newStartBtn.addEventListener('click', () => {
                this.startReadingFromDetails();
            });
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
        
        // ใช้ prompt แทนโมดัล
        const newTitle = prompt('📚 แก้ไขชื่อหนังสือ:', book.title);
        if (newTitle === null) return; // ยกเลิก
        
        const newAuthor = prompt('👤 แก้ไขชื่อผู้แต่ง:', book.author || '');
        if (newAuthor === null) return; // ยกเลิก
        
        // ตรวจสอบชื่อซ้ำ
        if (newTitle.trim()) {
            const existingBook = this.books.find(b => 
                b.title.toLowerCase() === newTitle.trim().toLowerCase() && b.id !== book.id
            );
            
            if (existingBook) {
                alert('มีหนังสือชื่อนี้อยู่แล้ว กรุณาใช้ชื่ออื่น');
                return;
            }
            
            // อัปเดตข้อมูล
            book.title = newTitle.trim();
            book.author = newAuthor.trim();
            this.saveBooks();
            this.updateBooksDisplay();
            this.showBookDetails(book.id);
            this.showNotification('✏️ แก้ไขแล้ว!', `แก้ไข "${book.title}" เรียบร้อย`);
        }
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
        console.log('deleteBook function called');
        if (!this.currentViewingBookId) {
            console.log('No currentViewingBookId');
            return;
        }
        
        const book = this.books.find(b => b.id === this.currentViewingBookId);
        if (!book) {
            console.log('Book not found');
            return;
        }
        
        console.log('Found book to delete:', book.title);
        
        // แสดงข้อมูลหนังสือก่อนลบ
        const totalTime = this.formatTimeHMS(book.totalTime || 0);
        const sessionCount = book.sessions ? book.sessions.length : 0;

        const first = confirm(
            `⚠️ ต้องการลบหนังสือนี้หรือไม่?\n\n` +
            `📚 ชื่อ: "${book.title}"\n` +
            `👤 ผู้แต่ง: ${book.author || 'ไม่ระบุ'}\n` +
            `⏰ เวลารวม: ${totalTime}\n` +
            `📊 จำนวนเซสชั่น: ${sessionCount}\n\n` +
            `⚠️ การลบจะไม่สามารถกู้คืนได้!`
        );
        
        console.log('First confirmation:', first);
        if (!first) return;

        const second = confirm(`❗ ยืนยันการลบ "${book.title}" อีกครั้ง\n\nกดตกลงเพื่อลบถาวร`);
        console.log('Second confirmation:', second);
        if (!second) return;

        console.log('Deleting book...');
        this.books = this.books.filter(b => b.id !== this.currentViewingBookId);
        this.saveBooks();
        this.updateBooksDisplay();
        this.updateReadingStats();
        this.showBooksList();
        this.showNotification('🗑️ ลบแล้ว!', `ลบ "${book.title}" เรียบร้อย`);
        console.log('Book deleted successfully');
    }
    
    // Finish Book Methods
    finishBookProcess() {
        console.log('finishBookProcess called');
        console.log('currentViewingBookId:', this.currentViewingBookId);
        
        if (!this.currentViewingBookId) {
            console.log('No currentViewingBookId');
            alert('ไม่พบหนังสือที่ต้องการบันทึก');
            return;
        }
        
        // Use == instead of === to handle string vs number comparison
        const book = this.books.find(b => b.id == this.currentViewingBookId);
        console.log('Found book:', book);
        
        if (!book) {
            console.log('Book not found, books:', this.books);
            console.log('Looking for ID:', this.currentViewingBookId, typeof this.currentViewingBookId);
            alert('ไม่พบหนังสือในระบบ');
            return;
        }
        
        if (book.isFinished) {
            alert('หนังสือเล่มนี้อ่านจบแล้ว');
            return;
        }
        
        // Show the finish book modal instead of prompts
        this.showFinishBookModal();
    }
    
    showFinishBookModal() {
        if (!this.currentViewingBookId) return;
        
        const book = this.books.find(b => b.id == this.currentViewingBookId);
        if (!book) return;
        
        console.log('showFinishBookModal called for book:', book.title);
        
        // Find modal elements
        const modal = document.getElementById('finish-book-modal');
        const finishDateInput = document.getElementById('finish-date');
        const finishTimeInput = document.getElementById('finish-time');
        const finishNotesInput = document.getElementById('finish-notes');
        
        console.log('Modal elements:', { modal, finishDateInput, finishTimeInput, finishNotesInput });
        
        if (!modal) {
            console.error('finish-book-modal not found!');
            alert('ไม่พบฟอร์มบันทึกการอ่านจบ กรุณารีเฟรชหน้าเว็บ');
            return;
        }
        
        // Set default finish date/time to now
        const now = new Date();
        if (finishDateInput) {
            finishDateInput.value = now.toISOString().split('T')[0];
        }
        if (finishTimeInput) {
            finishTimeInput.value = now.toTimeString().slice(0, 5);
        }
        if (finishNotesInput) {
            finishNotesInput.value = '';
        }
        
        // Show modal
        modal.style.display = 'flex';
        console.log('Modal should be visible now');
        
        // Focus on date input
        if (finishDateInput) {
            setTimeout(() => finishDateInput.focus(), 100);
        }
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
        
        // Use == instead of === for ID comparison
        const book = this.books.find(b => b.id == this.currentViewingBookId);
        if (!book) {
            alert('ไม่พบหนังสือในระบบ');
            return;
        }
        
        const finishDateTime = new Date(`${finishDate}T${finishTime}`).toISOString();
        const notes = this.finishNotesInput.value.trim();
        
        book.finishDateTime = finishDateTime;
        book.notes = notes || null;
        book.isFinished = true;
        
        this.saveBooks();
        this.updateBooksDisplay();
        
        // Update current details view
        this.showBookDetails(this.currentViewingBookId);
        
        this.hideFinishBookModal();
        this.showNotification('🎉 บันทึกการอ่านจบแล้ว!', 
            `บันทึก "${book.title}" เรียบร้อย`);
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
        
        // เรียงลำดับให้หนังสือใหม่อยู่บนสุด
        filteredBooks.sort((a, b) => b.id - a.id);
        
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
            const isSelected = this.selectedBooks.has(book.id);
            const selectionClass = this.selectionMode ? 'selection-mode' : '';
            const selectedClass = isSelected ? 'selected' : '';
            
            const checkboxHtml = this.selectionMode ? 
                `<input type="checkbox" class="book-checkbox" ${isSelected ? 'checked' : ''} 
                 onchange="timerApp.toggleBookSelection('${book.id}', this.checked)">` : '';
            
            const clickHandler = this.selectionMode ? '' : `onclick="timerApp.showBookDetails('${book.id}')"`;
            
            return `
                <div class="book-item ${statusClass} ${selectionClass} ${selectedClass}" ${clickHandler}>
                    ${checkboxHtml}
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

    toggleBookSelection(bookId, checked) {
        // Convert bookId to number to match book.id type
        const numericId = parseInt(bookId);
        
        if (checked) {
            this.selectedBooks.add(numericId);
        } else {
            this.selectedBooks.delete(numericId);
        }
        console.log('Selected books after toggle:', this.selectedBooks);
        this.updateSelectionCount();
    }

    getFilteredBooks() {
        // Get currently visible books based on search and filter
        const searchTerm = document.getElementById('book-search')?.value.toLowerCase() || '';
        const filterValue = document.getElementById('book-filter')?.value || 'all';
        
        let filteredBooks = this.books;
        
        if (searchTerm) {
            filteredBooks = filteredBooks.filter(book => 
                book.title.toLowerCase().includes(searchTerm) ||
                book.author.toLowerCase().includes(searchTerm)
            );
        }
        
        if (filterValue === 'reading') {
            filteredBooks = filteredBooks.filter(book => !book.isFinished);
        } else if (filterValue === 'finished') {
            filteredBooks = filteredBooks.filter(book => book.isFinished);
        }
        
        // เรียงลำดับให้หนังสือใหม่อยู่บนสุด
        filteredBooks.sort((a, b) => b.id - a.id);
        
        return filteredBooks;
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