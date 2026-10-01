/**
 * Moduł statystyk gracza (Player Statistics)
 * Zapisuje i kalkuluje postępy gracza w localStorage
 */

class PlayerStatsManager {
  constructor() {
    this.STORAGE_KEY = 'sudoku_player_statistics_v1';
    this.stats = this.loadStats();
  }

  getDefaultStats() {
    return {
      overall: {
        started: 0,
        won: 0,
        currentStreak: 0,
        bestStreak: 0
      },
      difficulties: {
        easy: { started: 0, won: 0, bestTime: null, totalWonTime: 0 },
        medium: { started: 0, won: 0, bestTime: null, totalWonTime: 0 },
        hard: { started: 0, won: 0, bestTime: null, totalWonTime: 0 },
        expert: { started: 0, won: 0, bestTime: null, totalWonTime: 0 }
      },
      history: [] // tablica ostatnich 15 gier { id, date, difficulty, result: 'win'|'loss', timeSeconds, mistakes }
    };
  }

  loadStats() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        return {
          overall: { ...this.getDefaultStats().overall, ...(parsed.overall || {}) },
          difficulties: {
            easy: { ...this.getDefaultStats().difficulties.easy, ...(parsed.difficulties?.easy || {}) },
            medium: { ...this.getDefaultStats().difficulties.medium, ...(parsed.difficulties?.medium || {}) },
            hard: { ...this.getDefaultStats().difficulties.hard, ...(parsed.difficulties?.hard || {}) },
            expert: { ...this.getDefaultStats().difficulties.expert, ...(parsed.difficulties?.expert || {}) }
          },
          history: Array.isArray(parsed.history) ? parsed.history : []
        };
      }
    } catch (e) {
      console.error('Błąd ładowania statystyk:', e);
    }
    return this.getDefaultStats();
  }

  save() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.stats));
    } catch (e) {
      console.error('Błąd zapisu statystyk:', e);
    }
  }

  recordGameStarted(difficulty) {
    if (!this.stats.difficulties[difficulty]) return;
    this.stats.overall.started++;
    this.stats.difficulties[difficulty].started++;
    this.save();
  }

  recordGameWon(difficulty, timeSeconds, mistakes) {
    if (!this.stats.difficulties[difficulty]) return;

    this.stats.overall.won++;
    this.stats.overall.currentStreak++;
    if (this.stats.overall.currentStreak > this.stats.overall.bestStreak) {
      this.stats.overall.bestStreak = this.stats.overall.currentStreak;
    }

    const diffStats = this.stats.difficulties[difficulty];
    diffStats.won++;
    diffStats.totalWonTime += timeSeconds;

    if (diffStats.bestTime === null || timeSeconds < diffStats.bestTime) {
      diffStats.bestTime = timeSeconds;
    }

    this.stats.history.unshift({
      id: Date.now(),
      date: new Date().toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
      difficulty,
      result: 'win',
      timeSeconds,
      mistakes
    });

    if (this.stats.history.length > 20) {
      this.stats.history.pop();
    }

    this.save();
  }

  recordGameLost(difficulty, timeSeconds, mistakes) {
    this.stats.overall.currentStreak = 0;

    this.stats.history.unshift({
      id: Date.now(),
      date: new Date().toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
      difficulty,
      result: 'loss',
      timeSeconds,
      mistakes
    });

    if (this.stats.history.length > 20) {
      this.stats.history.pop();
    }

    this.save();
  }

  resetAll() {
    this.stats = this.getDefaultStats();
    this.save();
  }

  formatTime(seconds) {
    if (seconds === null || seconds === undefined) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  getWinRate(difficulty = null) {
    if (difficulty && this.stats.difficulties[difficulty]) {
      const d = this.stats.difficulties[difficulty];
      if (d.started === 0) return 0;
      return Math.round((d.won / d.started) * 100);
    }
    if (this.stats.overall.started === 0) return 0;
    return Math.round((this.stats.overall.won / this.stats.overall.started) * 100);
  }

  getAverageTime(difficulty) {
    const d = this.stats.difficulties[difficulty];
    if (!d || d.won === 0) return null;
    return Math.round(d.totalWonTime / d.won);
  }
}

window.statsManager = new PlayerStatsManager();
