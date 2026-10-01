/**
 * Sudoku Mistrz - Główny kontroler aplikacji
 */

(function () {
  'use strict';

  // Obiekty silników i narzędzi
  const engine = new SudokuEngine();
  const confetti = new ConfettiEffect('confetti-canvas');
  const stats = window.statsManager;
  const sound = window.soundCtrl;

  // Tłumaczenia nazw poziomów
  const DIFFICULTY_NAMES = {
    easy: 'Łatwy',
    medium: 'Średni',
    hard: 'Trudny',
    expert: 'Ekspert'
  };

  // Stan aplikacji
  const state = {
    difficulty: 'medium',
    puzzle: null,
    solution: null,
    currentBoard: null,
    givenMask: null, // tablica 9x9 boolean (true jeśli komórka początkowa)
    notes: null, // tablica 9x9 Set() z cyframi 1-9
    undoStack: [],
    selectedCell: { row: 0, col: 0 },
    isNotesMode: false,
    mistakes: 0,
    maxMistakes: 3,
    score: 0,
    timerSeconds: 0,
    timerInterval: null,
    isPaused: false,
    isGameOver: false,
    isWon: false,
    settings: {
      mistakeLimit: true,
      highlightSame: true,
      highlightArea: true,
      autoClearNotes: true,
      sound: true
    }
  };

  // Elementy DOM
  const dom = {
    grid: document.getElementById('sudoku-grid'),
    timerDisplay: document.getElementById('timer-display'),
    pauseBtn: document.getElementById('pause-btn'),
    pauseIcon: document.getElementById('pause-icon'),
    playIcon: document.getElementById('play-icon'),
    pauseOverlay: document.getElementById('pause-overlay'),
    resumeBtn: document.getElementById('resume-btn'),
    mistakesDisplay: document.getElementById('mistakes-display'),
    scoreDisplay: document.getElementById('score-display'),
    currentDiffDisplay: document.getElementById('current-diff-display'),
    diffButtons: document.querySelectorAll('.btn-diff'),

    // Narzędzia
    btnUndo: document.getElementById('btn-undo'),
    btnErase: document.getElementById('btn-erase'),
    btnNotes: document.getElementById('btn-notes'),
    notesIndicator: document.getElementById('notes-indicator'),
    btnHint: document.getElementById('btn-hint'),
    btnNewGame: document.getElementById('btn-new-game'),
    btnRestart: document.getElementById('btn-restart'),
    numpadButtons: document.querySelectorAll('.numpad-btn'),

    // Pasek górny
    themeToggleBtn: document.getElementById('theme-toggle-btn'),
    themeIconSun: document.getElementById('theme-icon-sun'),
    themeIconMoon: document.getElementById('theme-icon-moon'),
    audioToggleBtn: document.getElementById('audio-toggle-btn'),
    audioIconOn: document.getElementById('audio-icon-on'),
    audioIconMuted: document.getElementById('audio-icon-muted'),
    statsOpenBtn: document.getElementById('stats-open-btn'),
    settingsOpenBtn: document.getElementById('settings-open-btn'),
    rulesOpenBtn: document.getElementById('rules-open-btn'),

    // Baner podpowiedzi
    hintBanner: document.getElementById('hint-banner'),
    hintText: document.getElementById('hint-text'),
    hintCloseBtn: document.getElementById('hint-close-btn'),

    // Modale
    modalStats: document.getElementById('modal-stats'),
    statsTabContent: document.getElementById('stats-tab-content'),
    statsTabButtons: document.querySelectorAll('.stats-tab-btn'),
    btnResetStats: document.getElementById('btn-reset-stats'),

    modalWin: document.getElementById('modal-win'),
    winDiff: document.getElementById('win-diff'),
    winTime: document.getElementById('win-time'),
    winMistakes: document.getElementById('win-mistakes'),
    winScore: document.getElementById('win-score'),
    winRecordBadge: document.getElementById('win-record-badge'),
    winNewGameBtn: document.getElementById('win-new-game-btn'),
    winShowStatsBtn: document.getElementById('win-show-stats-btn'),

    modalGameOver: document.getElementById('modal-gameover'),
    gameoverRestartBtn: document.getElementById('gameover-restart-btn'),
    gameoverNewBtn: document.getElementById('gameover-new-btn'),

    modalSettings: document.getElementById('modal-settings'),
    settingMistakeLimit: document.getElementById('setting-mistake-limit'),
    settingHighlightSame: document.getElementById('setting-highlight-same'),
    settingHighlightArea: document.getElementById('setting-highlight-area'),
    settingAutoClearNotes: document.getElementById('setting-auto-clear-notes'),
    settingSound: document.getElementById('setting-sound'),

    modalRules: document.getElementById('modal-rules')
  };

  /* ==========================================================================
     INICJALIZACJA I OBSŁUGA MOTYWU / USTAWIEŃ
     ========================================================================== */

  function loadSettings() {
    try {
      const saved = localStorage.getItem('sudoku_settings_v1');
      if (saved) {
        state.settings = { ...state.settings, ...JSON.parse(saved) };
      }
    } catch (e) {}

    // Synchronizuj przełączniki w modalu ustawień
    dom.settingMistakeLimit.checked = state.settings.mistakeLimit;
    dom.settingHighlightSame.checked = state.settings.highlightSame;
    dom.settingHighlightArea.checked = state.settings.highlightArea;
    dom.settingAutoClearNotes.checked = state.settings.autoClearNotes;
    dom.settingSound.checked = state.settings.sound;

    // Synchronizuj audio
    if (!state.settings.sound && !sound.isMuted()) {
      sound.toggleMute();
    }
    updateAudioIcon();
  }

  function saveSettings() {
    try {
      localStorage.setItem('sudoku_settings_v1', JSON.stringify(state.settings));
    } catch (e) {}
  }

  function initTheme() {
    const savedTheme = localStorage.getItem('sudoku_theme') || 'dark';
    setTheme(savedTheme);
  }

  function setTheme(theme) {
    if (theme === 'light') {
      document.body.classList.remove('theme-dark');
      document.body.classList.add('theme-light');
      dom.themeIconSun.classList.add('hidden');
      dom.themeIconMoon.classList.remove('hidden');
      localStorage.setItem('sudoku_theme', 'light');
    } else {
      document.body.classList.remove('theme-light');
      document.body.classList.add('theme-dark');
      dom.themeIconSun.classList.remove('hidden');
      dom.themeIconMoon.classList.add('hidden');
      localStorage.setItem('sudoku_theme', 'dark');
    }
  }

  function toggleTheme() {
    sound.playClick();
    const isDark = document.body.classList.contains('theme-dark');
    setTheme(isDark ? 'light' : 'dark');
  }

  function updateAudioIcon() {
    if (sound.isMuted()) {
      dom.audioIconOn.classList.add('hidden');
      dom.audioIconMuted.classList.remove('hidden');
    } else {
      dom.audioIconOn.classList.remove('hidden');
      dom.audioIconMuted.classList.add('hidden');
    }
  }

  function toggleAudio() {
    const muted = sound.toggleMute();
    state.settings.sound = !muted;
    dom.settingSound.checked = !muted;
    saveSettings();
    updateAudioIcon();
    if (!muted) sound.playClick();
  }

  /* ==========================================================================
     GENEROWANIE PLANSZY I ZARZĄDZANIE GRĄ
     ========================================================================== */

  function startNewGame(difficulty = state.difficulty) {
    sound.playClick();
    state.difficulty = difficulty;
    state.isPaused = false;
    state.isGameOver = false;
    state.isWon = false;
    state.mistakes = 0;
    state.score = 0;
    state.undoStack = [];
    state.isNotesMode = false;
    updateNotesButton();
    hideHint();

    dom.currentDiffDisplay.textContent = DIFFICULTY_NAMES[difficulty] || 'Średni';
    updateMistakesDisplay();
    updateScoreDisplay();

    // Aktywuj odpowiedni przycisk trudności
    dom.diffButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.diff === difficulty);
    });

    // Generowanie planszy
    const generated = engine.generatePuzzle(difficulty);
    state.puzzle = engine.cloneGrid(generated.puzzle);
    state.solution = generated.solution;
    state.currentBoard = engine.cloneGrid(generated.puzzle);

    // Maska pól początkowych
    state.givenMask = Array.from({ length: 9 }, (_, r) =>
      Array.from({ length: 9 }, (_, c) => state.puzzle[r][c] !== 0)
    );

    // Puste notatki
    state.notes = Array.from({ length: 9 }, () =>
      Array.from({ length: 9 }, () => new Set())
    );

    // Zarejestruj rozpoczęcie w statystykach
    stats.recordGameStarted(difficulty);

    // Reset timera
    resetTimer();
    startTimer();

    // Renderowanie siatki
    renderGrid();
    selectCell(0, 0);
    updateRemainingCounts();
  }

  function restartCurrentGame() {
    sound.playClick();
    state.currentBoard = engine.cloneGrid(state.puzzle);
    state.notes = Array.from({ length: 9 }, () =>
      Array.from({ length: 9 }, () => new Set())
    );
    state.undoStack = [];
    state.mistakes = 0;
    state.score = 0;
    state.isGameOver = false;
    state.isWon = false;
    hideHint();
    updateMistakesDisplay();
    updateScoreDisplay();
    resetTimer();
    startTimer();
    renderGrid();
    selectCell(state.selectedCell.row, state.selectedCell.col);
    updateRemainingCounts();
  }

  /* ==========================================================================
     RENDEROWANIE SIATKI SUDOKU
     ========================================================================== */

  function renderGrid() {
    dom.grid.innerHTML = '';

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const cellEl = document.createElement('div');
        cellEl.className = 'sudoku-cell';
        cellEl.dataset.row = r;
        cellEl.dataset.col = c;

        const val = state.currentBoard[r][c];
        const isGiven = state.givenMask[r][c];

        if (isGiven) {
          cellEl.classList.add('given');
          cellEl.textContent = val;
        } else if (val !== 0) {
          cellEl.classList.add('user-filled');
          cellEl.textContent = val;

          // Błędne wpisy oznaczone na czerwono jeśli nie zgadzają się z rozwiązaniem
          if (val !== state.solution[r][c]) {
            cellEl.classList.add('error');
          }
        } else {
          // Komórka pusta - sprawdź notatki
          const cellNotes = state.notes[r][c];
          if (cellNotes.size > 0) {
            const notesGrid = document.createElement('div');
            notesGrid.className = 'cell-notes-grid';
            for (let num = 1; num <= 9; num++) {
              const noteSpan = document.createElement('span');
              noteSpan.className = 'note-num';
              noteSpan.textContent = cellNotes.has(num) ? num : '';
              notesGrid.appendChild(noteSpan);
            }
            cellEl.appendChild(notesGrid);
          }
        }

        cellEl.addEventListener('click', () => {
          if (state.isPaused || state.isGameOver || state.isWon) return;
          selectCell(r, c);
          sound.playClick();
        });

        dom.grid.appendChild(cellEl);
      }
    }

    applyHighlights();
  }

  function getCellElement(r, c) {
    return dom.grid.querySelector(`.sudoku-cell[data-row="${r}"][data-col="${c}"]`);
  }

  function selectCell(row, col) {
    if (row < 0 || row > 8 || col < 0 || col > 8) return;
    state.selectedCell = { row, col };
    applyHighlights();
  }

  function applyHighlights() {
    const { row: selR, col: selC } = state.selectedCell;
    const selVal = state.currentBoard[selR][selC];

    const boxStartR = Math.floor(selR / 3) * 3;
    const boxStartC = Math.floor(selC / 3) * 3;

    dom.grid.querySelectorAll('.sudoku-cell').forEach(cell => {
      const r = parseInt(cell.dataset.row, 10);
      const c = parseInt(cell.dataset.col, 10);
      const val = state.currentBoard[r][c];

      cell.classList.remove('selected', 'highlight-area', 'highlight-same');

      // Wybrana komórka
      if (r === selR && c === selC) {
        cell.classList.add('selected');
      }
      // Wyróżnienie wiersza, kolumny i bloku 3x3
      else if (state.settings.highlightArea && (r === selR || c === selC || (r >= boxStartR && r < boxStartR + 3 && c >= boxStartC && c < boxStartC + 3))) {
        cell.classList.add('highlight-area');
      }

      // Wyróżnienie tej samej cyfry
      if (state.settings.highlightSame && selVal !== 0 && val === selVal && !(r === selR && c === selC)) {
        cell.classList.add('highlight-same');
      }
    });
  }

  /* ==========================================================================
     WPROWADZANIE CYFR I NOTATEK
     ========================================================================== */

  function handleNumberInput(num) {
    if (state.isPaused || state.isGameOver || state.isWon) return;

    const { row: r, col: c } = state.selectedCell;
    if (state.givenMask[r][c]) {
      // Nie można edytować komórek początkowych
      sound.playError();
      return;
    }

    // Tryb notatek (ołówek)
    if (state.isNotesMode) {
      if (state.currentBoard[r][c] !== 0) return; // nie dodajemy notatek do wypełnionej komórki

      saveHistoryState();
      const cellNotes = state.notes[r][c];
      if (cellNotes.has(num)) {
        cellNotes.delete(num);
      } else {
        cellNotes.add(num);
      }
      sound.playPencilNote();
      renderGrid();
      return;
    }

    // Zwykłe wpisywanie cyfry
    const currentVal = state.currentBoard[r][c];
    if (currentVal === num) return; // Już wpisana

    saveHistoryState();

    const isCorrect = (num === state.solution[r][c]);

    if (!isCorrect) {
      // Błąd
      state.currentBoard[r][c] = num;
      state.mistakes++;
      state.score = Math.max(0, state.score - 50);
      updateMistakesDisplay();
      updateScoreDisplay();
      sound.playError();
      renderGrid();

      if (state.settings.mistakeLimit && state.mistakes >= state.maxMistakes) {
        triggerGameOver();
        return;
      }
    } else {
      // Poprawna cyfra
      state.currentBoard[r][c] = num;
      state.notes[r][c].clear();

      // Automatyczne czyszczenie notatek z tego samego wiersza, kolumny i bloku 3x3
      if (state.settings.autoClearNotes) {
        clearNotesForPlacedNumber(r, c, num);
      }

      // Punkty
      const diffMultiplier = { easy: 1, medium: 2, hard: 3, expert: 4 }[state.difficulty] || 1;
      state.score += 100 * diffMultiplier;
      updateScoreDisplay();

      sound.playPlaceNumber(num);
      renderGrid();
      updateRemainingCounts();

      // Sprawdź czy ukończono wiersz, kolumnę lub blok
      checkSectionCompletions(r, c);

      // Sprawdź warunek wygranej
      checkWinCondition();
    }
  }

  function clearNotesForPlacedNumber(row, col, num) {
    // Wiersz
    for (let c = 0; c < 9; c++) {
      state.notes[row][c].delete(num);
    }
    // Kolumna
    for (let r = 0; r < 9; r++) {
      state.notes[r][col].delete(num);
    }
    // Kwadrat 3x3
    const startR = Math.floor(row / 3) * 3;
    const startC = Math.floor(col / 3) * 3;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        state.notes[startR + r][startC + c].delete(num);
      }
    }
  }

  function checkSectionCompletions(r, c) {
    // Sprawdza czy po tym ruchu wiersz, kolumna lub blok zostały w 100% poprawnie ułożone
    let rowComplete = true;
    for (let col = 0; col < 9; col++) {
      if (state.currentBoard[r][col] !== state.solution[r][col]) {
        rowComplete = false;
        break;
      }
    }

    let colComplete = true;
    for (let row = 0; row < 9; row++) {
      if (state.currentBoard[row][c] !== state.solution[row][c]) {
        colComplete = false;
        break;
      }
    }

    const startR = Math.floor(r / 3) * 3;
    const startC = Math.floor(c / 3) * 3;
    let boxComplete = true;
    for (let row = startR; row < startR + 3; row++) {
      for (let col = startC; col < startC + 3; col++) {
        if (state.currentBoard[row][col] !== state.solution[row][col]) {
          boxComplete = false;
          break;
        }
      }
    }

    if (rowComplete || colComplete || boxComplete) {
      sound.playSectionComplete();
    }
  }

  function eraseSelectedCell() {
    if (state.isPaused || state.isGameOver || state.isWon) return;

    const { row: r, col: c } = state.selectedCell;
    if (state.givenMask[r][c]) {
      sound.playError();
      return;
    }

    if (state.currentBoard[r][c] !== 0 || state.notes[r][c].size > 0) {
      saveHistoryState();
      state.currentBoard[r][c] = 0;
      state.notes[r][c].clear();
      sound.playErase();
      renderGrid();
      updateRemainingCounts();
    }
  }

  function toggleNotesMode() {
    sound.playClick();
    state.isNotesMode = !state.isNotesMode;
    updateNotesButton();
  }

  function updateNotesButton() {
    dom.btnNotes.classList.toggle('active', state.isNotesMode);
    dom.notesIndicator.textContent = state.isNotesMode ? 'WŁ' : 'WYŁ';
  }

  /* ==========================================================================
     HISTORIA I COFANIE RUCHÓW (UNDO)
     ========================================================================== */

  function saveHistoryState() {
    // Zapisuje głęboką kopię stanu planszy i notatek
    const snapshot = {
      board: engine.cloneGrid(state.currentBoard),
      notes: state.notes.map(row => row.map(set => new Set(set))),
      mistakes: state.mistakes,
      score: state.score,
      selected: { ...state.selectedCell }
    };
    state.undoStack.push(snapshot);
    if (state.undoStack.length > 50) {
      state.undoStack.shift();
    }
  }

  function undoLastMove() {
    if (state.isPaused || state.isGameOver || state.isWon) return;
    if (state.undoStack.length === 0) return;

    const previous = state.undoStack.pop();
    state.currentBoard = previous.board;
    state.notes = previous.notes;
    state.mistakes = previous.mistakes;
    state.score = previous.score;
    state.selectedCell = previous.selected;

    sound.playClick();
    updateMistakesDisplay();
    updateScoreDisplay();
    renderGrid();
    updateRemainingCounts();
  }

  /* ==========================================================================
     INTELIGENTNA PODPOWIEDŹ (SMART HINT)
     ========================================================================== */

  function applyHint() {
    if (state.isPaused || state.isGameOver || state.isWon) return;

    sound.playClick();

    // Sprawdź czy aktualnie wybrana komórka jest pusta lub ma błędną wartość
    const { row: selR, col: selC } = state.selectedCell;
    let hint = null;

    if (!state.givenMask[selR][selC] && state.currentBoard[selR][selC] !== state.solution[selR][selC]) {
      hint = {
        row: selR,
        col: selC,
        value: state.solution[selR][selC],
        message: `Podpowiedź dla wybranego pola: Właściwa cyfra to ${state.solution[selR][selC]}.`
      };
    } else {
      // Wyszukaj dedukcyjną wskazówkę silnikiem
      hint = engine.findSmartHint(state.currentBoard, state.solution);
    }

    if (!hint) {
      showHintBanner('Wszystkie pola są już poprawnie wypełnione!');
      return;
    }

    // Zaznacz komórkę i pokaż wyjaśnienie
    selectCell(hint.row, hint.col);
    const cellEl = getCellElement(hint.row, hint.col);
    if (cellEl) {
      cellEl.classList.add('hint-glow');
      setTimeout(() => {
        cellEl.classList.remove('hint-glow');
      }, 3000);
    }

    // Pokaż wyjaśnienie w banerze
    showHintBanner(hint.message);

    // Wpisz poprawną wartość jako podpowiedź
    saveHistoryState();
    state.currentBoard[hint.row][hint.col] = hint.value;
    state.notes[hint.row][hint.col].clear();

    if (state.settings.autoClearNotes) {
      clearNotesForPlacedNumber(hint.row, hint.col, hint.value);
    }

    renderGrid();
    updateRemainingCounts();
    checkSectionCompletions(hint.row, hint.col);
    checkWinCondition();
  }

  function showHintBanner(text) {
    dom.hintText.textContent = text;
    dom.hintBanner.classList.remove('hidden');
  }

  function hideHint() {
    dom.hintBanner.classList.add('hidden');
  }

  /* ==========================================================================
     LICZNIKI POZOSTAŁYCH CYFR
     ========================================================================== */

  function updateRemainingCounts() {
    const counts = Array(10).fill(0);
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const val = state.currentBoard[r][c];
        if (val >= 1 && val <= 9 && val === state.solution[r][c]) {
          counts[val]++;
        }
      }
    }

    for (let num = 1; num <= 9; num++) {
      const remain = 9 - counts[num];
      const remainEl = document.getElementById(`remain-${num}`);
      const btn = document.querySelector(`.numpad-btn[data-val="${num}"]`);

      if (remainEl) {
        remainEl.textContent = remain === 0 ? '✓' : remain;
      }
      if (btn) {
        btn.classList.toggle('completed', remain <= 0);
      }
    }
  }

  /* ==========================================================================
     TIMERY, PUNKTACJA I STATYSTYKI
     ========================================================================== */

  function startTimer() {
    clearInterval(state.timerInterval);
    state.timerInterval = setInterval(() => {
      if (!state.isPaused && !state.isGameOver && !state.isWon) {
        state.timerSeconds++;
        updateTimerDisplay();
      }
    }, 1000);
  }

  function stopTimer() {
    clearInterval(state.timerInterval);
  }

  function resetTimer() {
    stopTimer();
    state.timerSeconds = 0;
    updateTimerDisplay();
  }

  function updateTimerDisplay() {
    dom.timerDisplay.textContent = stats.formatTime(state.timerSeconds);
  }

  function togglePause() {
    sound.playClick();
    if (state.isGameOver || state.isWon) return;

    state.isPaused = !state.isPaused;
    dom.pauseOverlay.classList.toggle('hidden', !state.isPaused);
    dom.pauseIcon.classList.toggle('hidden', state.isPaused);
    dom.playIcon.classList.toggle('hidden', !state.isPaused);
  }

  function updateMistakesDisplay() {
    if (state.settings.mistakeLimit) {
      dom.mistakesDisplay.textContent = `${state.mistakes} / ${state.maxMistakes}`;
      dom.mistakesDisplay.style.color = state.mistakes > 0 ? '#ef4444' : 'inherit';
    } else {
      dom.mistakesDisplay.textContent = `${state.mistakes}`;
      dom.mistakesDisplay.style.color = 'inherit';
    }
  }

  function updateScoreDisplay() {
    dom.scoreDisplay.textContent = state.score.toLocaleString('pl-PL');
  }

  /* ==========================================================================
     WARUNKI KOŃCA GRY (WYGRANA / PRZEGRANA)
     ========================================================================== */

  function checkWinCondition() {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (state.currentBoard[r][c] !== state.solution[r][c]) {
          return false;
        }
      }
    }

    // Jeśli pętla doszła tutaj - gracz wygrał!
    triggerWin();
    return true;
  }

  function triggerWin() {
    state.isWon = true;
    stopTimer();
    sound.playWin();
    confetti.fire(5000);

    const prevBestTime = stats.stats.difficulties[state.difficulty]?.bestTime;
    const isNewRecord = prevBestTime === null || state.timerSeconds < prevBestTime;

    // Zapisz do bazy statystyk
    stats.recordGameWon(state.difficulty, state.timerSeconds, state.mistakes);

    // Wypełnij modal wygranej
    dom.winDiff.textContent = DIFFICULTY_NAMES[state.difficulty] || 'Średni';
    dom.winTime.textContent = stats.formatTime(state.timerSeconds);
    dom.winMistakes.textContent = state.mistakes;
    dom.winScore.textContent = state.score.toLocaleString('pl-PL');
    dom.winRecordBadge.classList.toggle('hidden', !isNewRecord);

    setTimeout(() => {
      openModal(dom.modalWin);
    }, 400);
  }

  function triggerGameOver() {
    state.isGameOver = true;
    stopTimer();
    sound.playError();
    stats.recordGameLost(state.difficulty, state.timerSeconds, state.mistakes);

    setTimeout(() => {
      openModal(dom.modalGameOver);
    }, 350);
  }

  /* ==========================================================================
     MODALE I STATYSTYKI GRACZA
     ========================================================================== */

  function openModal(modalEl) {
    sound.playClick();
    modalEl.classList.remove('hidden');
  }

  function closeModal(modalEl) {
    sound.playClick();
    modalEl.classList.add('hidden');
  }

  function renderStatsTab(tabName) {
    dom.statsTabButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.stab === tabName);
    });

    let html = '';

    if (tabName === 'overall') {
      const s = stats.stats.overall;
      const winRate = stats.getWinRate();

      html = `
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-card-title">Rozpoczęte</div>
            <div class="stat-card-val">${s.started}</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-title">Wygrane</div>
            <div class="stat-card-val" style="color: #10b981;">${s.won}</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-title">Wskaźnik wygranych</div>
            <div class="stat-card-val">${winRate}%</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-title">Bieżąca seria</div>
            <div class="stat-card-val">${s.currentStreak} 🔥</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-title">Najlepsza seria</div>
            <div class="stat-card-val">${s.bestStreak} 🏆</div>
          </div>
        </div>
      `;
    } else if (['easy', 'medium', 'hard', 'expert'].includes(tabName)) {
      const diffData = stats.stats.difficulties[tabName];
      const winRate = stats.getWinRate(tabName);
      const avgTime = stats.getAverageTime(tabName);

      html = `
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-card-title">Gry rozpoczęte</div>
            <div class="stat-card-val">${diffData.started}</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-title">Gry ukończone</div>
            <div class="stat-card-val" style="color: #10b981;">${diffData.won}</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-title">Skuteczność</div>
            <div class="stat-card-val">${winRate}%</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-title">Najlepszy czas</div>
            <div class="stat-card-val font-mono" style="color: #f59e0b;">${stats.formatTime(diffData.bestTime)}</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-title">Średni czas</div>
            <div class="stat-card-val font-mono">${stats.formatTime(avgTime)}</div>
          </div>
        </div>
      `;
    } else if (tabName === 'history') {
      const history = stats.stats.history;
      if (history.length === 0) {
        html = '<p style="text-align: center; color: var(--text-muted); padding: 30px 0;">Brak historii gier. Rozegraj swoją pierwszą partię!</p>';
      } else {
        html = `
          <table class="history-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Poziom</th>
                <th>Wynik</th>
                <th>Czas</th>
                <th>Błędy</th>
              </tr>
            </thead>
            <tbody>
              ${history.map(item => `
                <tr>
                  <td>${item.date}</td>
                  <td><strong>${DIFFICULTY_NAMES[item.difficulty] || item.difficulty}</strong></td>
                  <td>${item.result === 'win' ? '<span class="badge-win">Wygrana ✓</span>' : '<span class="badge-loss">Porażka ✗</span>'}</td>
                  <td class="font-mono">${stats.formatTime(item.timeSeconds)}</td>
                  <td>${item.mistakes}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      }
    }

    dom.statsTabContent.innerHTML = html;
  }

  function openStatsModal(defaultTab = 'overall') {
    renderStatsTab(defaultTab);
    openModal(dom.modalStats);
  }

  /* ==========================================================================
     OBSŁUGA ZDARZEŃ KLAWIATURY I MYSZY
     ========================================================================== */

  function handleKeyDown(e) {
    // Ignoruj, gdy fokus jest na polu tekstowym lub otwarty jest modal
    if (e.target.tagName === 'INPUT') return;

    // Skróty globalne
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      undoLastMove();
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 't') {
      e.preventDefault();
      toggleTheme();
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      openStatsModal();
      return;
    }

    // Zamknij modale klawiszem Escape
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop:not(.hidden)').forEach(modal => {
        closeModal(modal);
      });
      return;
    }

    // Jeśli gra jest zapauzowana, spacją można wznowić
    if (e.code === 'Space') {
      e.preventDefault();
      togglePause();
      return;
    }

    if (state.isPaused || state.isGameOver || state.isWon) return;

    // Nawigacja strzałkami / WASD
    let { row: r, col: c } = state.selectedCell;
    let moved = false;

    if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') {
      r = Math.max(0, r - 1);
      moved = true;
    } else if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') {
      r = Math.min(8, r + 1);
      moved = true;
    } else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
      c = Math.max(0, c - 1);
      moved = true;
    } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
      c = Math.min(8, c + 1);
      moved = true;
    }

    if (moved) {
      e.preventDefault();
      selectCell(r, c);
      sound.playClick();
      return;
    }

    // Klawisze cyfr 1-9 (zarówno zwykłe jak i Numpad)
    if (/^[1-9]$/.test(e.key)) {
      e.preventDefault();
      handleNumberInput(parseInt(e.key, 10));
      return;
    }

    // Wymazywanie (Backspace / Delete)
    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      eraseSelectedCell();
      return;
    }

    // Tryb notatek (N)
    if (e.key.toLowerCase() === 'n') {
      e.preventDefault();
      toggleNotesMode();
      return;
    }

    // Podpowiedź (H)
    if (e.key.toLowerCase() === 'h') {
      e.preventDefault();
      applyHint();
      return;
    }
  }

  /* ==========================================================================
     REJESTRACJA EVENT LISTENERÓW
     ========================================================================== */

  function registerEventListeners() {
    window.addEventListener('keydown', handleKeyDown);

    // Klawiatura wirtualna numpad
    dom.numpadButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const val = parseInt(btn.dataset.val, 10);
        handleNumberInput(val);
      });
    });

    // Przyciski akcji
    dom.btnUndo.addEventListener('click', undoLastMove);
    dom.btnErase.addEventListener('click', eraseSelectedCell);
    dom.btnNotes.addEventListener('click', toggleNotesMode);
    dom.btnHint.addEventListener('click', applyHint);
    dom.btnNewGame.addEventListener('click', () => startNewGame(state.difficulty));
    dom.btnRestart.addEventListener('click', restartCurrentGame);

    // Pauza
    dom.pauseBtn.addEventListener('click', togglePause);
    dom.resumeBtn.addEventListener('click', togglePause);

    // Wybór poziomu trudności
    dom.diffButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const diff = btn.dataset.diff;
        startNewGame(diff);
      });
    });

    // Pasek górny
    dom.themeToggleBtn.addEventListener('click', toggleTheme);
    dom.audioToggleBtn.addEventListener('click', toggleAudio);
    dom.statsOpenBtn.addEventListener('click', () => openStatsModal('overall'));
    dom.settingsOpenBtn.addEventListener('click', () => openModal(dom.modalSettings));
    dom.rulesOpenBtn.addEventListener('click', () => openModal(dom.modalRules));

    // Baner wskazówki
    dom.hintCloseBtn.addEventListener('click', hideHint);

    // Zamykanie modali przyciskami close
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modalId = btn.dataset.modal || btn.closest('.modal-backdrop').id;
        const modalEl = document.getElementById(modalId);
        if (modalEl) closeModal(modalEl);
      });
    });

    // Zamykanie po kliknięciu w tło modala
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
      });
    });

    // Zakładki statystyk
    dom.statsTabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        renderStatsTab(btn.dataset.stab);
      });
    });

    // Reset statystyk
    dom.btnResetStats.addEventListener('click', () => {
      if (confirm('Czy na pewno chcesz zresetować wszystkie statystyki i historię gier? Tej operacji nie można cofnąć.')) {
        stats.resetAll();
        renderStatsTab('overall');
        sound.playErase();
      }
    });

    // Przyciski w modalu wygranej / przegranej
    dom.winNewGameBtn.addEventListener('click', () => {
      closeModal(dom.modalWin);
      startNewGame(state.difficulty);
    });

    dom.winShowStatsBtn.addEventListener('click', () => {
      closeModal(dom.modalWin);
      openStatsModal('overall');
    });

    dom.gameoverRestartBtn.addEventListener('click', () => {
      closeModal(dom.modalGameOver);
      restartCurrentGame();
    });

    dom.gameoverNewBtn.addEventListener('click', () => {
      closeModal(dom.modalGameOver);
      startNewGame(state.difficulty);
    });

    // Ustawienia
    dom.settingMistakeLimit.addEventListener('change', (e) => {
      state.settings.mistakeLimit = e.target.checked;
      saveSettings();
      updateMistakesDisplay();
    });

    dom.settingHighlightSame.addEventListener('change', (e) => {
      state.settings.highlightSame = e.target.checked;
      saveSettings();
      applyHighlights();
    });

    dom.settingHighlightArea.addEventListener('change', (e) => {
      state.settings.highlightArea = e.target.checked;
      saveSettings();
      applyHighlights();
    });

    dom.settingAutoClearNotes.addEventListener('change', (e) => {
      state.settings.autoClearNotes = e.target.checked;
      saveSettings();
    });

    dom.settingSound.addEventListener('change', (e) => {
      state.settings.sound = e.target.checked;
      if (sound.isMuted() === e.target.checked) {
        sound.toggleMute();
      }
      saveSettings();
      updateAudioIcon();
    });

    // Integracja z menu Electron (jeśli uruchomiono w Electronie)
    if (window.electronAPI) {
      window.electronAPI.onMenuNewGame((diff) => startNewGame(diff));
      window.electronAPI.onMenuRestartGame(() => restartCurrentGame());
      window.electronAPI.onMenuTogglePause(() => togglePause());
      window.electronAPI.onMenuUndo(() => undoLastMove());
      window.electronAPI.onMenuErase(() => eraseSelectedCell());
      window.electronAPI.onMenuToggleNotes(() => toggleNotesMode());
      window.electronAPI.onMenuHint(() => applyHint());
      window.electronAPI.onMenuToggleTheme(() => toggleTheme());
      window.electronAPI.onMenuShowStats(() => openStatsModal('overall'));
      window.electronAPI.onMenuShowRules(() => openModal(dom.modalRules));
      window.electronAPI.onMenuShowAbout(() => openModal(dom.modalRules));
    }
  }

  /* ==========================================================================
     START APLIKACJI
     ========================================================================== */

  loadSettings();
  initTheme();
  registerEventListeners();
  startNewGame('easy');

})();
