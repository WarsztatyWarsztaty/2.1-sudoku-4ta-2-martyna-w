# 🧩 Sudoku Mistrz - Polska Aplikacja Pulpitowa (Desktop)

Nowoczesna, elegancka i bogato wyposażona aplikacja pulpitowa do gry w Sudoku, stworzona w języku polskim z obsługą motywu jasnego i ciemnego, rozbudowanymi statystykami gracza oraz inteligentnym systemem podpowiedzi logicznych.

---

## ✨ Kluczowe funkcje

- 🌓 **Motyw Ciemny i Jasny (Dark / Light Mode)**: Przełączanie jednym kliknięciem myszy lub skrótem `Ctrl + T`. Nowoczesna estetyka, kontrastowe cyfry, płynne animacje i szklany efekt (glassmorphism).
- 🇵🇱 **Pełny polski interfejs użytkownika**: Wszystkie komunikaty, zasady, menu, statystyki oraz komunikaty podpowiedzi są w języku polskim.
- 📊 **Szczegółowe Statystyki Gracza**:
  - Gry rozpoczęte, ukończone i przegrane.
  - Procentowy wskaźnik wygranych (% skuteczności).
  - Rekordy czasowe (najlepszy czas) oraz średni czas per poziom trudności.
  - Bieżąca i rekordowa seria zwycięstw (Streaks 🔥 / 🏆).
  - Pełna historia ostatnich gier z datą, poziomem, czasem i wynikiem.
  - Opcja bezpiecznego zresetowania statystyk.
- 🎯 **4 Poziomy trudności**:
  - **Łatwy** (Easy) – idealny na start i szybki trening
  - **Średni** (Medium) – zbalansowana rozgrywka
  - **Trudny** (Hard) – wymaga zaawansowanych technik eliminacji
  - **Ekspert** (Expert) – prawdziwe wyzwanie logiczne
- 💡 **Inteligentny Asystent Podpowiedzi**: Zamiast bezmyślnego wstawiania cyfr, algorytm wyjaśnia logiczne uzasadnienie (np. *„W kwadracie 3×3 cyfra 7 pasuje tylko na tym jednym polu”*).
- ✏️ **Tryb Notatek (Ołówek)**: Szybkie oznaczanie możliwych kandydatów w komórkach z opcją automatycznego czyszczenia po wpisaniu prawidłowej cyfry.
- ↩️ **Cofanie ruchów (Undo)**: Pełna historia ruchów pod skrótem `Ctrl + Z`.
- ⌨️ **Pełna obsługa klawiatury i myszy**: Sterowanie strzałkami lub WASD, klawiatura numeryczna 1–9, pauza pod spacją.
- 🔊 **Efekty dźwiękowe**: Przyjemne dźwięki generowane przez Web Audio API (z możliwością natychmiastowego wyciszenia).
- 🎉 **Efekty zwycięstwa**: Animacja konfetti, fanfary i podsumowanie partii.

---

## 🚀 Instrukcja: Jak uruchomić aplikację (Tutorial)

Aplikację można uruchomić na **3 bardzo proste sposoby**:

### Sposób 1: Uruchomienie jednym kliknięciem (Zalecane) ⭐
1. Otwórz folder z projektem:
   ```
   c:\Users\martyna\googleai\2.1-sudoku-4ta-2-martyna-w
   ```
2. Kliknij dwukrotnie w plik:
   👉 **`Uruchom-Sudoku.bat`**
3. Aplikacja otworzy się automatycznie w dedykowanym, eleganckim oknie pulpitu!

---

### Sposób 2: Uruchomienie przez terminal (npm start)
1. Otwórz terminal (PowerShell lub Wiersz poleceń) w folderze projektu:
   ```powershell
   cd c:\Users\martyna\googleai\2.1-sudoku-4ta-2-martyna-w
   ```
2. Wpisz polecenie:
   ```bash
   npm start
   ```
3. Otworzy się natywne okno pulpitu Electron z polskim paskiem menu.

---

### Sposób 3: Uruchomienie bezpośrednio w przeglądarce
Możesz także po prostu kliknąć dwukrotnie w plik **`index.html`** w Eksploratorze Windows, aby uruchomić grę w dowolnej ulubionej przeglądarce (Edge, Chrome, Firefox itp.). Wszystkie funkcje (zapis statystyk, motyw jasny/ciemny, dźwięki, podpowiedzi) działają również w tym trybie.

---

## ⌨️ Tabela skrótów klawiszowych

| Skrót | Działanie |
| :--- | :--- |
| **`1` – `9`** | Wpisanie cyfry do zaznaczonego pola (lub dopisanie notatki w trybie ołówka) |
| **`Strzałki` / `W, A, S, D`** | Poruszanie się po planszy Sudoku |
| **`N`** | Włączenie / wyłączenie trybu notatek (ołówek) |
| **`Backspace` / `Delete`** | Wyczyszczenie wpisu lub notatek z wybranego pola |
| **`Ctrl + Z`** | Cofnięcie ostatniego ruchu (Undo) |
| **`H`** | Inteligentna podpowiedź z logicznym uzasadnieniem |
| **`Spacja`** | Wstrzymanie (pauza) lub wznowienie gry |
| **`Ctrl + T`** | Przełączenie motywu (Jasny / Ciemny) |
| **`Ctrl + S`** | Otwarcie okna statystyk gracza |
| **`Esc`** | Zamknięcie otwartego okna / modalu |

---

## 📁 Struktura plików projektu

- `index.html` – Struktura interfejsu w języku polskim, modale, układ siatki.
- `main.js` – Główny proces okna desktopowego Electron z polskim menu systemowym.
- `preload.js` – Bezpieczny most IPC pomiędzy oknem aplikacji a menu systemowym.
- `css/style.css` – Kompletny arkusz styli z paletami kolorów dla trybu ciemnego i jasnego.
- `js/sudoku-engine.js` – Generator poprawnych plansz o unikalnym rozwiązaniu, algorytm MRV i silnik logicznych podpowiedzi.
- `js/stats.js` – Menedżer statystyk gracza z zapisem do pamięci trwałej (localStorage).
- `js/audio.js` – Syntezator efektów dźwiękowych Web Audio API.
- `js/confetti.js` – Efekt wizualny konfetti na canvasie po wygranej partii.
- `js/app.js` – Główny kontroler gry łączący interfejs, skróty klawiszowe i stan partii.
- `Uruchom-Sudoku.bat` – Automatyczny skrypt uruchamiający aplikację na systemie Windows.
- `icon.png` – Ikona aplikacji pulpitu.
