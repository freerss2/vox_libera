/*
 *   "Vox-Libera" Language learning
 *   JS engine functions
 */

"use strict";

const app_code_ver = '2.5.0';
console.log('html_code_ver='+html_code_ver);
console.log('app_code_ver='+app_code_ver);
console.log('lesson_data_ver='+lesson_data_ver);


document.getElementById('versions-info').innerHTML =
  '<table>' +
  '<tr><td>html code</td><td>&nbsp;v' + html_code_ver + '</td></tr>' +
  '<tr><td>app code</td><td>&nbsp;v' + app_code_ver + '</td></tr>' +
  '<tr><td>lesson data</td><td>&nbsp;v' + lesson_data_ver + '</td></tr></table>'
  ;

// Fisher–Yates shuffle
function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]
        ];
    }
    return array;
}

// animated scroll to the top of given element
function scrollToTop(elementId) {
    const container = document.getElementById(elementId);

    container.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function renderDrawer() {
    const pathContainer = document.getElementById('exercisePath');
    pathContainer.innerHTML = ''; // Очистка

    SCREEN_TYPES.forEach((screen, index) => {
        const li = document.createElement('li');
        li.className = 'exercise-node';
        li.setAttribute('data-id', screen.id);
        li.innerHTML = `
            <div class="node-icon">${index + 1}</div>
            <span class="node-name">${screen.name}</span>
        `;

        li.onclick = () => loadScreenFromMenu(screen.id);

        pathContainer.appendChild(li);

        // if this is current excercise - select it
        if ( currentGameType == screen.id ) setActiveExerciseInMenu(screen.id);
    });
    displayTopicName(currentTopic);
    showScreenTitle(currentGameType, currentTopic);
}

function setActiveExerciseInMenu(screen_id) {
  document.querySelectorAll('.exercise-node').forEach(n => n.classList.remove('current'));
  const activeNode = document.querySelector(`[data-id="${screen_id}"]`);
  if (activeNode) activeNode.classList.add('current');
}

function loadScreenFromMenu(screen_id) {
  loadScreen(screen_id);
  toggleDrawer();
}

function loadNextScreen() {
  // find current screen index
  const currGameIndex = SCREEN_TYPES.findIndex(m => m.id === currentGameType);
  if (currGameIndex+1 < SCREEN_TYPES.length) {
    // if not last - load the next
    const screen_id = SCREEN_TYPES[currGameIndex+1].id;
    // check for 'all' topic
    if ( currentTopic == 'all' ) {
      const record = getScreenRecord(screen_id);
      if (record.is_common == 0) {
        // if not is_common - move to next topic
        nextTopic();
        return;
      }
    }
    loadScreen(screen_id);
  } else {
    // if last - move to next topic
    nextTopic();
  }
}

// load screen by ID
function loadScreen(screen_id) {
  setActiveExerciseInMenu(screen_id);
  startGame(screen_id, currentTopic);
}

// try to find topic key name by given index
function getTopic(topicIndex) {
    for (let key in topics) {
      if (topics[key].id == topicIndex) return key;
    }
    return '';
}

function prevTopic() {
  switchTopic(-1);
}

function nextTopic() {
  switchTopic(1);
}

// Move one topic forward (+1) or backward (-1)
// do nothing if it is impossible
function switchTopic(direction) {
  // get topic id
  let topicIndex = topics[currentTopic].id;
  // find topic with next id
  let nextTopicId = getTopic(topicIndex+direction);
  if (! nextTopicId) return;
  // if found - load screen
  startTopic(nextTopicId);
}

function displayTopicName(topic) {
  let topicTitle = topics[topic].name;
  document.getElementById('currentTopicName').textContent = topicTitle;
  displayTopicState();
  // show/hide relevant items in menu
  // for topic 'all' hide item that have is_common==0
  const nodes = document.getElementsByClassName('exercise-node');
  [...nodes].forEach(node => {
      const record = getScreenRecord(node.dataset.id);
      let display = 'flex';
      if (topic == 'all' && record.is_common == 0) display = 'none';
      node.style.display = display;
    }
  );
}

// set current topic, reset game type to first
// update display
// start the game
function startTopic(topic) {
  currentTopic = topic;
  displayTopicName(topic);
  currentGameType = SCREEN_TYPES[0].id;
  showScreenTitle(currentGameType, topic);
  loadScreen(currentGameType);
}

// Show-hide side menu
function toggleDrawer() {
    const drawer = document.getElementById('drawer');
    const overlay = document.getElementById('overlay');
    scrollToTop('drawer-content');

    // Toggle classes for both elements
    drawer.classList.toggle('open');
    overlay.classList.toggle('active');
}

// Set reaction on click for any button in side menu
document.querySelectorAll('.drawer button').forEach(btn => {
    if ( ! btn.classList.contains('nav-arrow') )
    btn.addEventListener('click', () => {
        toggleDrawer();
    });
});

// Initiallize displayed screen type and selected topic
let currentGameType = localStorage.getItem('selectedType') || 'dictionary';
let currentTopic = localStorage.getItem('selectedTopic') || "all";

if ( ! topics[currentTopic] ) currentTopic = all;

// Screen types
const SCREEN_TYPES = [
    { id: 'dictionary',      is_common: 1, screen_type: 'dictionary', name: 'Словарь', inputs: ['words'] },
    { id: 'sentences',       is_common: 1, screen_type: 'dictionary', name: 'Предложения', inputs: ['sentences'] },
    { id: 'flashcards',      is_common: 0, screen_type: 'flashcards', name: 'Карточки слов', inputs: ['words'] },
    { id: 'flashcards-sent', is_common: 0, screen_type: 'flashcards', name: 'Карточки предложений', inputs: ['sentences'] },
    { id: 'matching',        is_common: 0, screen_type: 'matching',   name: 'Поиск пары', inputs: ['words'] },
    { id: 'quiz_ru_ar',      is_common: 0, screen_type: 'quiz_ru_ar', name: 'Викторина: Ru → Ar', inputs: ['words', 'sentences'] },
    { id: 'quiz_ar_ru',      is_common: 0, screen_type: 'quiz_ar_ru', name: 'Викторина: Ar → Ru', inputs: ['words', 'sentences'] },
    { id: 'quiz_audio',      is_common: 0, screen_type: 'quiz_audio', name: 'Аудио-викторина', inputs: ['words', 'sentences'] },
    { id: 'sent_ru_ar',      is_common: 0, screen_type: 'sent_ru_ar', name: 'Предложение: Ru → Ar', inputs: ['sentences'] },
    { id: 'sent_ar_ru',      is_common: 0, screen_type: 'sent_ar_ru', name: 'Предложение: Ar → Ru', inputs: ['sentences'] },
    { id: 'sent_audio',      is_common: 0, screen_type: 'sent_audio', name: 'Аудио-Предложение', inputs: ['sentences'] },
];

// Reaction on completed round (according to reached grade)
const feedback = {
    perfect: [
        {ar: "أَحْسَنْتَ!", ru: "Отлично!", tr: "Aḥsanta!"},
        {ar: "مُمْتَاز!", ru: "Превосходно!", tr: "Mumtāz!"},
        {ar: "مَا شَاءَ الله!", ru: "Машалла!", tr: "Mā shā'a Allāh!"}
    ],
    good: [
        {ar: "عَمَلٌ جَيِّد!", ru: "Хорошая работа!", tr: "'Amalun jayyid!"},
        {ar: "بَطَل!", ru: "Молодец!", tr: "Baṭal!"}
    ],
    tryAgain: [
        {ar: "حَاوِلْ مَرَّةً أُخْرَى", ru: "Попробуй еще раз", tr: "Ḥāwil marratan ukhrā"},
        {ar: "لَا تَسْتَسْلِم!", ru: "Не сдавайся!", tr: "Lā tastaslim!"}
    ]
};

function getScreenRecord(type) {
  return SCREEN_TYPES.find(r => r.id == type);
}

// get screen type by game instance ID
function getScreenType(type) {
  const record = getScreenRecord(type);
  if (record) return record.screen_type;
  return 'dictionary'; // DEFAULT
}

// Initialize side menu
function initMenu() {
    // 1. Populate list of screens
    renderDrawer();
    // 3. Read and apply settings
    const savedDifficulty = localStorage.getItem('gameDifficulty') || 'easy';
    setGamesDifficulty(savedDifficulty);
    const radioToSelect = document.getElementById(`diff-${savedDifficulty}`);
    if (radioToSelect) {
        radioToSelect.checked = true;
    }
}

function showScreenTitle(type, topic) {
    const modeObj = getScreenRecord(type);
    const modeName = modeObj ? modeObj.name : "Игра";

    // Build main title
    document.getElementById('title').textContent = `${topics[topic].name}: ${modeName}`;
}

// Start any screen/game from any other context (not from menu)
function startGame(type = currentGameType, topic = currentTopic) {
    currentGameType = type;
    currentTopic = topic;

    showScreenTitle(type, topic);
    // Memorize the selection for next run
    localStorage.setItem('selectedTopic', topic);
    localStorage.setItem('selectedType', type);

    // Render screen according to type
    renderGameContent(type, topic);
}


// Render screen/game
function renderGameContent(type, topic) {
    // 1. Hide all screen-related DOM elements
    const screens = document.querySelectorAll('.game-screen');
    screens.forEach(s => s.style.display = 'none');
    // including different panels
    const winScreenElm = document.getElementById('winScreen');
    if (winScreenElm) winScreenElm.style.display = 'none';
    // initilize hint panel
    const hintPanelElm = document.getElementById('hint-panel');
    if (hintPanelElm) hintPanelElm.textContent = 'Нажми на арабское слово';
    document.getElementById('progress-container').style.display = 'none';
    document.getElementById('errors-panel').style.display = 'none';
    // hide the search line
    showHideSearch(0);
    updateTranscriptionDisplay();


    // 2. Show related screen only
    const screenType = getScreenType(type);
    let screenId = screenType.startsWith('quiz') ? 'screen-quiz' : ('screen-'+screenType);
    if (screenType.startsWith('sent')) { screenId = 'screen-sent'; }
    if (screenType == 'flashcards') { screenId = 'flashcards-screen'; }
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.style.display = 'block';
    }

    // 3. Initialize screen according to type
    if (screenType === 'dictionary') {
        openDictionary(topic);
    } else {
        const container = document.getElementById('app-container');
        container.classList.add('hidden-anim');
        setTimeout(() => {
            // render content
            initGameEngine(type, topic);
            // animate
            container.classList.remove('hidden-anim');
        }, 300);
    }
}

// Initilize engine for game-type screen
function initGameEngine(type, topic) {
    const screenType = getScreenType(type);
    if (screenType == 'matching') {
        renderMatchingGame(topic);
    } else {
        if (screenType == 'flashcards') {
          initFlashcards(topic);
        } else if (screenType.startsWith('quiz')) {
          startNewSet();
        } else {
          renderSent(type, topic);
        }
    }
}

// --------------------------------- flash-cards

let cardIndex = 0;
let flashcardsData = [];
let studyMode = 'ar-ru'; // Modes: 'ar-ru' / 'ru-ar'

function initFlashcards(topic) {
    const container = document.getElementById('flashcards-screen');
    const inputTypes = getGameInputTypes(currentGameType);

    // Deep copy for dynamic changes
    flashcardsData = shuffle([...getTopicData(topic, inputTypes)]);

    if (flashcardsData.length === 0) {
        showCompletionMessage();
        return;
    }

    cardIndex = 0;

    container.innerHTML = `
            <div class="flashcard-header">
                <span class="mode-toggle-wrapper">
                  <button class="mode-toggle" onclick="toggleStudyMode()">&nbsp;ذ&nbsp;⇆&nbsp;я&nbsp;</button>
                </span>
                <span id="card-counter">1 / ${flashcardsData.length}</span>
                <div class="speed-controls">
                  <button class="mode-toggle" onclick="speakFlashcard()">🐇</button>🔊
                  <button class="mode-toggle" onclick="speakFlashcard(1)">🐢</button>
                </div>
            </div>

            <div class="flashcard-wrapper">
                <button class="nav-btn prev" onclick="changeCard(-1)">&Lang;</button>

                <div class="card-container" id="card-anchor">
                    <div class="flashcard" id="card-object" onclick="this.classList.toggle('flipped')">
                        <div class="card-front" id="card-front-content"></div>
                        <div class="card-back" id="card-back-content"></div>
                    </div>
                </div>

                <button class="nav-btn next" onclick="changeCard(1)">&Rang;</button>
            </div>

            <div class="card-controls">
                <button class="action-btn easy" onclick="markAsLearned()">✔ Знаю</button>
                <button class="action-btn hard" onclick="changeCard(1)">✘ Повторить</button>
            </div>
    `;

    updateCardContent();
}

function speakFlashcard(slow=0) {
    const item = flashcardsData[cardIndex];
    if (slow)  speakArabicSlow(item[1]);
    else       speakArabic(item[1]);
}

function toggleStudyMode() {
    studyMode = (studyMode === 'ar-ru') ? 'ru-ar' : 'ar-ru';
    // Сбрасываем переворот и обновляем текст
    document.getElementById('card-object').classList.remove('flipped');
    updateCardContent();
}

function updateCardContent() {
    const item = flashcardsData[cardIndex];
    const front = document.getElementById('card-front-content');
    const back = document.getElementById('card-back-content');
    const counter = document.getElementById('card-counter');
    const cardObject = document.getElementById('card-object');
    cardObject.classList.remove('flipped');


    speakArabic(item[1]);
    const trText = `[${item[2] || ''}]`;
    // [0] - RU, [1] - AR, [2] - Translit
    if (studyMode === 'ar-ru') {
        front.innerHTML = `
            <div class="ar-text">${item[1]}</div>
            <div class="tr-text translation">${trText}</div>`;
        back.innerHTML = `
            <div class="ru-text">${item[0]}</div>
        `;
    } else {
        front.innerHTML = `
            <div class="ru-text">${item[0]}</div>`;
        back.innerHTML = `
            <div class="ar-text">${item[1]}</div>
            <div class="tr-text translation">${trText}</div>
        `;
    }
    updateTranscriptionDisplay();

    counter.innerText = `${cardIndex + 1} / ${flashcardsData.length}`;
}

function changeCard(step) {
    const cardAnchor = document.getElementById('card-anchor');

    // Animation of sliding
    cardAnchor.style.opacity = '0';
    cardAnchor.style.transform = `translateX(${step > 0 ? '30px' : '-30px'}) scale(0.95)`;

    setTimeout(() => {
        cardIndex = (cardIndex + step + flashcardsData.length) % flashcardsData.length;
        updateCardContent();

        // Animate next card appearance
        cardAnchor.style.opacity = '1';
        cardAnchor.style.transform = 'translateX(0) scale(1)';
    }, 200);
}

function markAsLearned() {
    const cardAnchor = document.getElementById('card-anchor');
    const currentItem = flashcardsData[cardIndex];

    // updateStats(currentItem[1], true);

    // Animate learned card disappearing
    cardAnchor.style.transform = 'translateY(-100vh) rotate(10deg)';
    cardAnchor.style.opacity = '0';

    setTimeout(() => {
        // 3. Удаляем карточку из текущей сессии
        flashcardsData.splice(cardIndex, 1);

        if (flashcardsData.length === 0) {
            showCompletionMessage();
        } else {
            // Если удалили последнюю в списке, переходим к новой "последней"
            if (cardIndex >= flashcardsData.length) {
                cardIndex = 0;
            }
            // Сбрасываем позицию якоря и обновляем контент
            cardAnchor.style.transform = 'translateY(0) rotate(0)';
            cardAnchor.style.opacity = '1';
            updateCardContent();
        }
    }, 400);
}

function showCompletionMessage() {
    const container = document.getElementById('flashcards-screen');
    container.innerHTML = `
        <div class="completion-screen">
            <p>Все карточки в этом наборе изучены.</p>
        </div>
    `;
    showWin(100);
}

// --------------------------------- pairs

// status for pairs (matching) screen
let selectedLeft = null, selectedRight = null, errors = 0, matches = 0;

// settings for game according to difficilty
var gameSettings = {}

// settings for quiz screen(s)
var totalChoices = 4;

// initialize pairs (matching) screen
function renderMatchingGame(topic) {
    const board = document.getElementById('matching-grid');
    board.innerHTML = '';

    // Reset status variables
    selectedLeft = null;
    selectedRight = null;
    errors = 0;
    matches = 0;

    // Reset display elements
    document.getElementById('progress-container').style.display = 'block';
    document.getElementById('errors-panel').style.display = 'block';
    showErrorCount(0);
    updateProgress(0);

    // Get all data related to topic
    const inputTypes = getGameInputTypes('matching');
    const currentData = getTopicData(topic, inputTypes);

    // Take a random slice according to itemsPerRound
    const pool = shuffle([...currentData]).slice(0, gameSettings.itemsPerRound);
    // Randomly shaffle pool on both sides
    const leftSide = shuffle(pool.map(p => ({ t: p[0], id: p[1], h: p[2] })));
    const rightSide = shuffle(pool.map(p => ({ t: p[1], id: p[1], h: p[2] })));

    leftSide.forEach((item, i) => createTile(item, i, 'left', 'ru', board));
    rightSide.forEach((item, i) => createTile(item, i, 'right', 'ar', board));
}

// Create a single tile for pairs (matching) screen
function createTile(item, index, side, lang, container) {
    const div = document.createElement('div');
    div.className = 'card' + (lang === 'ar' ? ' arabic' : '');
    div.textContent = item.t;
    div.dataset.col = side;
    div.dataset.arabic = (lang === 'ar' ? item.t : '');
    div.dataset.id = item.id;
    div.style.gridColumn = side === 'left' ? '1' : '2';
    div.style.gridRow = (index + 1).toString();

    div.onclick = () => {
        if (lang === 'ar') {
          // perform when option enabled only
          document.getElementById('hint-panel').textContent = `[ ${item.h} ]`;
          speakArabic(item.t);
        }
        handleSelectTile(div, side);
    };
    container.appendChild(div);
}

// Reaction on tile click (any side)
function handleSelectTile(el, side) {
    if (el.classList.contains('correct')) return;
    document.querySelectorAll(`.card[data-col="${side}"]`).forEach(t => t.classList.remove('selected'));
    el.classList.add('selected');

    if (side === 'left') selectedLeft = el;
    else selectedRight = el;

    if (selectedLeft && selectedRight) checkMatch();
}

// Verify did we got a match
function checkMatch() {
    const l = selectedLeft, r = selectedRight;
    const arabicWord = l.dataset.arabic || r.dataset.arabic || l.textContent;
    if (l.dataset.id === r.dataset.id) {
        scrollToTop('app-container');
        updateStats(arabicWord, true);
        triggerSuccessEffect(r);
        triggerSuccessEffect(l);
        document.getElementById('hint-panel').textContent = 'Нажми на арабское слово';

        l.classList.add('correct'); r.classList.add('correct');
        matches++;
        updateProgress(matches / gameSettings.itemsPerRound * 100);
        selectedLeft = null; selectedRight = null;
        if (matches === gameSettings.itemsPerRound) setTimeout(() => {
            const acc = Math.round((gameSettings.itemsPerRound / (gameSettings.itemsPerRound + errors)) * 100);
            showWin(acc);
        }, 400);
    } else {
        updateStats(arabicWord, false);
        errors++;
        showErrorCount(errors);
        l.classList.add('wrong'); r.classList.add('wrong');
        setTimeout(() => {
            l.classList.remove('wrong', 'selected');
            r.classList.remove('wrong', 'selected');
            // Do we need it here?
            selectedLeft = null; selectedRight = null;
            scrollToTop('app-container');
        }, 400);
    }
}

// Update progres-bar according to matches count
function updateProgress(percents) {
    const progressBar = document.getElementById('progressBar');
    if (progressBar) progressBar.style.width = percents + "%";
}

function showErrorCount(errors) {
    const errorDisplay = document.getElementById('errorCount');
    if (errorDisplay) errorDisplay.textContent = errors;
}
// ------------------------------------------- common Win popup

// Show final summary per round
function showWin(acc) {

    // Calculate the success rate
    let category = acc >= 90 ? 'perfect' : (acc >= 60 ? 'good' : 'tryAgain');

    // For a variety select random phrase
    let quotes = feedback[category];
    let pick = quotes[Math.floor(Math.random() * quotes.length)];

    // Fill-in the informal summary
    const statusEl = document.getElementById('winStatus');
    statusEl.innerHTML = `
        <span class="arabic" style="font-size: 1.5em; display: block; ">${pick.ar}</span>
        <span style="font-size: 0.5em; color: #888; display: block; margin-top: 5px;">
            ${pick.tr} — ${pick.ru}
        </span>
    `;

    // hide the game board and visualize the popup
    document.getElementById('screen-matching').style.display = 'none';
    document.getElementById('winScreen').style.display = 'block';
    document.getElementById('accuracyStat').textContent = acc + "%";
}

// ------------------------------------------ quiz (find the right one from many)

// status of quiz game
let quizCorrectWord = null;
let firstAttempt = true;

// Initialize quiz (of all possoble types)
function renderQuizGame(type, topic) {
    const inputTypes = getGameInputTypes(type);
    const allWords = getTopicData(topic, inputTypes);
    // Take a random word from all words in topic
    quizCorrectWord = allWords[Math.floor(Math.random() * allWords.length)];

    const questionContainer = document.getElementById('quiz-question-container');
    const optionsGrid = document.getElementById('quiz-options-grid');

    questionContainer.innerHTML = '';
    optionsGrid.innerHTML = '';
    document.getElementById('quiz-hint-panel').textContent = 'Нажми на слово';

    // 1. Fill the question card
    if (type === 'quiz_ru_ar') {
        questionContainer.textContent = quizCorrectWord[0];  // Translation
    } else if (type === 'quiz_ar_ru') {
        questionContainer.innerHTML = `<span class="arabic">${quizCorrectWord[1]}</span>`;
    } else if (type === 'quiz_audio') {
        questionContainer.innerHTML = `
            <button class="audio-main-btn" onclick="speakArabic('${quizCorrectWord[1]}')">
                <span style="font-size: 50px;">🔊</span>
            </button>
            <button class="audio-main-btn" onclick="speakArabicSlow('${quizCorrectWord[1]}')">
                <span style="font-size: 50px;">🐌</span>
            </button>
            `;
        speakArabic(quizCorrectWord[1]); // Immediately trigger the speak
    }

    // 2. Generate options for selection (one correct and rest - random)
    const options = generateDistractors(quizCorrectWord, allWords, gameSettings.totalChoices);
    firstAttempt = true;

    options.forEach(word => {
        const btn = document.createElement('div');
        btn.className = 'card quiz-card';

        btn.dataset.speak = '';
        // According to quiz type determine the cards content
        if (type === 'quiz_ru_ar') {
            btn.innerHTML = `<span class="arabic">${word[1]}</span>`;
            btn.dataset.speak = word[1];
        } else {
            btn.textContent = word[0]; // Translation
        }
        btn.dataset.translit = word[2];
        btn.onclick = () => handleQuizChoice(word, btn);
        optionsGrid.appendChild(btn);
    });
}

// Generate a list of choices (including pre-selected correct one)
function generateDistractors(correct, all, totalChoices) {
    // initialize with the correct answer
    let choices = [correct];
    const targetLength = correct[1].length;
    // let filtered = all.filter(w => w[1] !== correct[1]); // Remove the correct one prior to shuffle

    let filtered = all
        .filter(item => item[1] !== correct[1]) // Исключаем сам правильный ответ
        .sort((a, b) => {
            const diffA = Math.abs(a[1].length - targetLength);
            const diffB = Math.abs(b[1].length - targetLength);
            return diffA - diffB;
        });
    filtered = filtered.slice(0, gameSettings.totalChoices-1);
    // shuffle and take out of them (totalChoices-1) answers
    // filtered.sort(() => 0.5 - Math.random());

    return shuffle(choices.concat(filtered));
    // choices.sort(() => 0.5 - Math.random()); // Final shuffle
}

let gameSet = {
    totalQuestions: gameSettings.totalQuestions,
    currentQuestionIndex: 0,
    errors: 0,
    isSetRunning: false
};

function startNewSet() {
    gameSet.totalQuestions = gameSettings.totalQuestions;
    gameSet.currentQuestionIndex = 0;
    gameSet.errors = 0;
    gameSet.isSetRunning = true;
    firstAttempt = true;

    document.getElementById('progress-container').style.display = 'block';
    document.getElementById('errors-panel').style.display = 'block';
    showErrorCount(0);
    updateProgress(0);

    renderQuizGame(currentGameType, currentTopic);
}

function finishSet() {
    // show summary
    const acc = Math.round((gameSet.totalQuestions / (gameSet.totalQuestions + gameSet.errors)) * 100);
    showWin(acc);
}

// Callback for click on quiz button
function handleQuizChoice(selectedWord, btn) {
    // if relevant - fill quiz-hint-panel with transliteration
    const translit = btn.dataset.translit;
    if (btn.dataset.speak) speakArabic(btn.dataset.speak);
    const hintPanel = document.getElementById('quiz-hint-panel');
    if (hintPanel && translit) {
        hintPanel.textContent = translit;
    }
    if (selectedWord[1] === quizCorrectWord[1]) {
        // Correct!
        btn.style.borderColor = "var(--primary)";
        scrollToTop('app-container');

        updateStats(quizCorrectWord[1], firstAttempt);
        if (firstAttempt) {
          triggerSuccessEffect(btn);
        }
        gameSet.currentQuestionIndex++;
        const percent = (gameSet.currentQuestionIndex / gameSet.totalQuestions) * 100;
        updateProgress(percent);

        if (gameSet.currentQuestionIndex < gameSet.totalQuestions) {
            // Next mini-game
            setTimeout(() => {
                renderQuizGame(currentGameType, currentTopic);
            }, 1000);
        } else {
            finishSet(); // success
        }
    } else {
        // Mistake
        if (firstAttempt) {
          gameSet.errors++;
          showErrorCount(gameSet.errors);
        }
        firstAttempt = false;
        updateStats(quizCorrectWord[1], firstAttempt);
        btn.classList.add('wrong');
        btn.disabled = true; // Disable as already taken
        scrollToTop('app-container');

        // For audio-based quiz re-run speaking routine
        if (currentGameType === 'quiz_audio') speakArabic(quizCorrectWord[1]);
    }
}

// ---------------------------------------------- sentences build

/*
    { id: 'sent_ru_ar', name: 'Предложение: Ру → Ар' },
    { id: 'sent_ar_ru', name: 'Предложение: Ар → Ру' },
    { id: 'sent_audio', name: 'Аудио-Предложение' },
*/
function renderSent(type, topic) {
    document.getElementById('errors-panel').style.display = 'block';
    // 1. get topic data
    const inputTypes = ['sentences']; // getGameInputTypes(type);
    const currentData = getTopicData(topic, inputTypes);
    const allData = currentData.filter(r => (r[0].includes(' ') && r[1].includes(' ') && !r[0].includes('.')));
    // for wrong topic without sentences - switch to a compatible screen type
    if ( ! allData.length ) {
        renderGameContent('matching', topic);
        return;
    }
    var allWords;
    errors = 0;
    showErrorCount(errors);
    // 2. draw a random sentence from topic data (X russian and Y arabic words)
    let gameSentence = allData[Math.floor(Math.random() * allData.length)];
    // 3. for rus->ar game show all X words in top card
    //    for ar->rus      show all Y words
    //    for aud->rus     store in div.dataset.ar Y arabic words
    // 4. store ar/ru in div.dataset.expected
    const questionContainer = document.getElementById('sent-question-container');
    const bankContainer = document.getElementById('sent-bank');
    const resultContainer = document.getElementById('sent-result');
    let questionHtml = '';
    let expected = gameSentence[0];
    let extractPosition = 0;
    let speakEnable = 0;
    resultContainer.classList.remove('arabic');
    if ( type == 'sent_ru_ar' ) {
        questionHtml = gameSentence[0];
        expected = gameSentence[1];
        extractPosition = 1;
        speakEnable = 1;
        resultContainer.classList.add('arabic');
    } else if (type == 'sent_ar_ru') {
        questionHtml = gameSentence[1];
    } else {
        questionHtml = `
            <button class="audio-main-btn" onclick="speakArabic('${gameSentence[1]}')">
                <span style="font-size: 50px;">🔊</span>
            </button>
            <button class="audio-main-btn" onclick="speakArabicSlow('${gameSentence[1]}')">
                <span style="font-size: 50px;">🐌</span>
            </button>`;
        speakArabic(gameSentence[1]);
    }
    questionContainer.innerHTML = questionHtml;
    let bankWords = (expected.split(/\s+/)).filter(word => word.length > 0);
    questionContainer.dataset.expected = bankWords.join(' ');
    // 5. add to expected sentence more words (avoid already contaning words)
    // add 50/70/90% to bank, but total not bigger than 10
    let factor = gameSettings.sentenceFactor;
    let maxWords = Math.max(bankWords.length, 10);
    let extraWordsCount = Math.min(Math.round(bankWords.length * factor), maxWords);
    const subset = extractUniqueWordsFromData(allData, extractPosition).filter(w => !bankWords.includes(w)).slice(0, extraWordsCount);
    bankWords.push(...subset);
    bankWords = shuffle(bankWords);
    // 6. create word-buttons in bottom card
    bankContainer.innerText = '';
    let bankWordClass = 'sent-word';
    if ( type == 'sent_ru_ar' ) bankWordClass += ' arabic';
    for (let i = 0; i < bankWords.length; i++) {
      const bankWord = document.createElement('span');
      bankWord.onclick = () => useBankWord(i);
      bankWord.className = bankWordClass;
      bankWord.textContent = bankWords[i];
      bankWord.dataset.id = i;
      bankWord.dataset.speakEnable = speakEnable;
      bankWord.id = "bank-word-" + i;
      bankContainer.appendChild(bankWord);
    }
    // init result with empty words list
    resultContainer.innerText = '';
    resultContainer.dataset.words = '';
}

// onClick for bottom card buttons: move word to the end of middle set
// take a word according to index from bank of words and append it to middle sentence
function useBankWord(index) {
  // find the DOM object by ID
  const bankWordId = "bank-word-" + index;
  const bankWordElement = document.getElementById(bankWordId);
  if (bankWordElement.classList.contains('sent-word-used')) return;
  const word = bankWordElement.textContent;
  // speak only the relevant content
  if ( bankWordElement.dataset.speakEnable == '1' ) {
    speakArabic(word);
  }
  bankWordElement.classList.add('sent-word-used');
  appendWordToResult(bankWordId, word);
}

// append word with given bankId to result display
function appendWordToResult(bankWordId, word) {
  const resultContainer = document.getElementById('sent-result');
  // append the word to dataset.words
  let wordsList = resultContainer.dataset.words ? resultContainer.dataset.words.split(' ') : [];
  const wordIndex = wordsList.length;
  wordsList.push(word);
  resultContainer.dataset.words = wordsList.join(' ');
  // create span element with reference to bankWordId
  const resultWord = document.createElement('span');
  resultWord.innerText = word;
  resultWord.dataset.bankWordId = bankWordId;
  resultWord.dataset.wordIndex = wordIndex;
  resultWord.id = 'result-' + bankWordId;
  resultWord.className = 'sent-word sent-word-result';
  resultContainer.appendChild(resultWord);
  // set onclick
  resultWord.onclick = () => revokeBankWord(resultWord.id);
}

// onClick for middle card buttons: move it to the lower card set
function revokeBankWord(resultWordId) {
  const resultContainer = document.getElementById('sent-result');
  const resultWord = document.getElementById(resultWordId);
  // take the target bank word ID
  const bankWordId = resultWord.dataset.bankWordId;
  // restore bank word element (remove class)
  const bankWordElement = document.getElementById(bankWordId);
  bankWordElement.classList.remove('sent-word-used');
  // hide this element
  resultWord.remove();
  // recalculate indexes for the rest of elements
  [...document.getElementsByClassName('sent-word-result')].forEach(w => {
    if (w.dataset.wordIndex > resultWord.dataset.wordIndex) w.dataset.wordIndex --;
  });
  // rebuild the result data
  let wordsList = resultContainer.dataset.words ? resultContainer.dataset.words.split(' ') : [];
  wordsList.splice(resultWord.dataset.wordIndex, 1);
  resultContainer.dataset.words = wordsList.join(' ');
}

function checkSent() {
  const resultContainer = document.getElementById('sent-result');
  const questionContainer = document.getElementById('sent-question-container');
  if ( resultContainer.dataset.words == questionContainer.dataset.expected) {
    // count as success ?
    // updateStats(questionContainer.dataset.expected, true);
    const acc = Math.round((2 / (2 + errors)) * 100);
    showWin(acc);
  } else {
    // increase errors count
    errors++;
    // count as failure ?
    // updateStats(questionContainer.dataset.expected, false);
    resultContainer.classList.add('wrong');
    setTimeout(() => {
        resultContainer.classList.remove('wrong');
            scrollToTop('app-container');
    }, 400);
  }
  showErrorCount(errors);
}

// from a list of lists allData extract all unique words on position pos
// randomly shuffle the result
function extractUniqueWordsFromData(allData, pos) {
   let realWords = allData.flatMap(row => row[pos].split(/\s+|,/)).filter(w => w.length > 0);
   realWords = realWords.filter(w => !w.includes(')')).filter(w => !w.includes('(')).filter(w => !w.includes('/'));
   let allWords = [...new Set( realWords )];
   return shuffle(allWords);
}

// Show/hide the "search" bar
function showHideSearch(show) {
    const searchBar = document.getElementById('searchBar');
    searchBar.style.display = show ? 'flex' : 'none';

    if (!show) {
        document.getElementById('dictSearch').value = '';
    }
    filterDictionary();
}

// filtering by search pattern
function filterDictionary() {
    const input = document.getElementById('dictSearch');
    const filter = input.value.toLowerCase();
    const cards = document.getElementsByClassName('dictionaryCard');

    document.getElementById('clearSearch').style.display = input.value ? 'block' : 'none';
    for (let i = 0; i < cards.length; i++) {
        const cardText = cards[i].textContent.toLowerCase();

        if (cardText.includes(filter)) {
            cards[i].style.display = "";
        } else {
            cards[i].style.display = "none";
        }
    }
}

function clearInput() {
    const input = document.getElementById('dictSearch');
    input.value = '';
    filterDictionary();
    document.getElementById('clearSearch').style.display = 'none';
}

// application state setting
let isMuted = false;
let currentZoom = 1.0;

function toggleMute() {
    isMuted = !isMuted;
    const btn = document.getElementById('muteBtn');
    btn.textContent = isMuted ? "‏🔇" : "‏🔊";

    // Immediate cancel of current speech when selected "mute"
    if (isMuted && window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
}
function speakArabicSlow(text) {
  speakArabic(text, 0.5);
}

function speakArabic(text, rate=1) {
    if (isMuted) return;
    // Check, whether broser supports this API
    if ('speechSynthesis' in window) {
        // Cancel any in-progress speech
        window.speechSynthesis.cancel();

        const msg = new SpeechSynthesisUtterance();
        msg.text = text;
        msg.lang = 'ar-EG'; // Указываем код языка (ar-SA - Саудовская Аравия)
        msg.rate = rate;    // Скорость
        msg.pitch = 1;      // Тональность

        window.speechSynthesis.speak(msg);
    }
}

function changeZoom(delta) {
    currentZoom = Math.min(Math.max(0.8, currentZoom + delta), 1.8);
    document.documentElement.style.setProperty('--base-font-size', currentZoom + 'rem');
}

function getGameInputTypes(type) {
  const modeObj = getScreenRecord(type);
  return modeObj.inputs;
}

// render dictionary according to selected topic
function openDictionary(topic) {
    const listContainer = document.getElementById('dictionaryList');
    listContainer.innerHTML = '';
    showHideSearch(1);

    const inputTypes = getGameInputTypes(currentGameType);
    const currentData = getTopicData(topic, inputTypes);

    const stats = getStats();

    currentData.forEach(item => {
        // Создаем карточку слова
        const card = document.createElement('div');
        card.className = "dictionaryCard";

        const wordStat = stats[item[1]] || { attempts: 0, success: 0 };
        let accuracy = 0;
        if (wordStat.attempts > 0) {
          accuracy = Math.round((  wordStat.success / wordStat.attempts) * 100);
        }
        let statusColor = 'var(--border-color)'; // по умолчанию серый
        if (wordStat.attempts > 0) {
            if (accuracy < 50) statusColor = 'var(--error-color)';      // Failed
            else if (accuracy < 85) statusColor = '#ffc107';            // Acceptable
            else statusColor = 'var(--primary-color)';                  // Good
        }

        // Speak the content on click
        card.onclick = () => speakArabic(item[1]);

        card.innerHTML = `
            <div style="flex: 1;">
                <div style="font-weight: bold; color: #777; font-size: var(--base-font-size);">
                  ${item[0]}
                  ${wordStat.attempts > 0 ? `<span style="font-size: 0.9em; opacity: 0.7; color: ${statusColor};"> (${accuracy}%)</span>` : ''}
                </div>
                <div class="dictionaryTransl translation">[${item[2]}]</div>
            </div>
            <div class="arabic" style="color: var(--text-color);">
                ${item[1]}
            </div>
        `;
        updateTranscriptionDisplay();
        listContainer.appendChild(card);
    });

}

// universal collector for topic data (including virtual "all")
// external parameter: hideWellLearned
function getTopicData(topic, inputTypes) {
  let currentData = [];
  if (topic == 'all') {
    for (let key in topics) {
      inputTypes.forEach( inputType => {
        let topicData = topics[key][inputType];
        if ( topicData ) {
          currentData.push(...topicData);
        }
      });
    }
  } else {
    inputTypes.forEach( inputType => {
      let topicData = topics[topic][inputType];
      if ( topicData ) {
        currentData.push(...topicData);
      }
    });
  }
  currentData = currentData.filter(row => {
    return row &&
           typeof row[0] === 'string' && row[0].trim() !== "" &&
           typeof row[1] === 'string' && row[1].trim() !== "";
  });

  if (!hideWellLearned) return currentData;

  const candidates = currentData.filter(item => {
        const arabicWord = item[1];
        const stats = wordStats[arabicWord];
        if (!stats) return true; // all new words should be learned
        const accuracy = (stats.success / stats.attempts) * 100;
        return accuracy < 90; // threshold (maybe 85?)
    });

  // do not return too less results
  if (candidates.length < 10) return currentData;
  return candidates;
}

const wordStats = getStats();

// Stats manipulation: read words stats
function getStats() {
  return JSON.parse(localStorage.getItem('wordStats') || '{}');
}

// Stats manipulation: save words stats
function setStats(stats) {
  localStorage.setItem('wordStats', JSON.stringify(stats));
}

// Topics state manipulation (read/save)
function setTopicState(topic, state) {
  const topicStates = getTopicStates();
  topicStates[topic] = Number(state);

  localStorage.setItem('topicStats', JSON.stringify(topicStates));
}

function getTopicStates() {
  return JSON.parse(localStorage.getItem('topicStats') || '{}');
}

function toggleTopicPassed() {
    const isChecked = document.getElementById('topicPassedCheckbox').checked;

    const titleContainer = document.querySelector('.drawer-title');
    if (isChecked) {
        titleContainer.classList.add('is-passed');
    } else {
        titleContainer.classList.remove('is-passed');
    }

    // Сохраняем в localStorage, чтобы при перезагрузке не пропало
    setTopicState(currentTopic, Number(isChecked));
}

function displayTopicState() {
    const topicStates = getTopicStates();
    const state = Number(topicStates[currentTopic]);
    document.getElementById('topicPassedCheckbox').checked = state;
    const titleContainer = document.querySelector('.drawer-title');
    if (state) {
        titleContainer.classList.add('is-passed');
    } else {
        titleContainer.classList.remove('is-passed');
    }
}

function resetTopicStats() {
  let stats = getStats();
  // for each word in current topic
  const topicData = topics[currentTopic]['words'];
  // erase it from stats
  [...topicData].forEach(e => {delete stats[e[1]]});
  // save stats back
  setStats(stats);
  // reload dictionary
  const screenType = getScreenType(currentGameType);
  if (screenType === 'dictionary') {
     openDictionary(currentTopic);
  }
}

// Do we need this?
function resetStats() {
  setStats({});
  // reload dictionary
  const screenType = getScreenType(currentGameType);
  if (screenType === 'dictionary') {
     openDictionary(currentTopic);
  }
}

// Word stats update
function updateStats(arabicWord, isCorrect) {
  let stats = getStats();
  if (!stats[arabicWord]) {
      stats[arabicWord] = { attempts: 0, success: 0 };
  }
  stats[arabicWord].attempts += 1;
  if (isCorrect) {
      stats[arabicWord].success += 1;
  }
  setStats(stats);
  wordStats[arabicWord] = stats[arabicWord];
}

const hideWellLearnedElm = document.getElementById('hide-well-learned');
var hideWellLearned = (localStorage.getItem('hideWellLearned') || 0) == '1';
hideWellLearnedElm.checked = hideWellLearned == '1';

function toggleWellLearned() {
  hideWellLearned = hideWellLearnedElm.checked;
  localStorage.setItem('hideWellLearned', hideWellLearned ? 1 : 0);
  startGame(currentGameType, currentTopic);
}

const showTransToggleElm = document.getElementById('show-trans-toggle');
var showTransToggle =  (localStorage.getItem('showTransToggle') || 0) == '1';
showTransToggleElm.checked = showTransToggle == '1';

function toggleTranscription() {
  showTransToggle =  showTransToggleElm.checked;
  localStorage.setItem('showTransToggle', showTransToggle ? 1 : 0);
  updateTranscriptionDisplay();
}

// show or hide transcription according to global setting
function updateTranscriptionDisplay() {
  // change visibility for "translation" class
  [...document.getElementsByClassName('translation')].forEach(e => {
    e.classList.toggle('hidden', !showTransToggle);
  });
}

const difficultySettings = {
    easy:   { itemsPerRound: 5, totalChoices: 4, totalQuestions: 5,  sentenceFactor: 1.5},
    medium: { itemsPerRound: 6, totalChoices: 6, totalQuestions: 7,  sentenceFactor: 1.7},
    hard:   { itemsPerRound: 7, totalChoices: 8, totalQuestions: 9,  sentenceFactor: 1.9}
};

function changeDifficulty(level) {
    // 1. Store for future
    localStorage.setItem('gameDifficulty', level);
    // 2. Change the games parameters
    setGamesDifficulty(level);
    // 3. Restart the game (exclude dictionary)
    const screenType = getScreenType(currentGameType);
    if (screenType === 'dictionary') {
      startGame(currentGameType, currentTopic);
    }
}

// set games difficulty
function setGamesDifficulty(level) {
    gameSettings = difficultySettings[level];
}

const successCharacters = [
  '✨', '🌟', '🎊', '🎉', '🏆', '🎖️', '💎', '💡', '🚀', '⚡', '🎈', '🔥'];

function triggerSuccessEffect(button) {
    // 1. Запускаем анимацию на самой кнопке
    button.classList.add('correct-animation');

    // 2. Создаем "салют" (текстовый символ)
    const sparkle = document.createElement('span');
    sparkle.innerText = shuffle(successCharacters)[0]+shuffle(successCharacters)[1]+shuffle(successCharacters)[2];
    sparkle.className = 'success-sparkle';
    button.appendChild(sparkle);

    // 3. Убираем всё через полсекунды
    setTimeout(() => {
        button.classList.remove('correct-animation');
        sparkle.remove();
    }, 700);
}

document.addEventListener('keydown', (event) => {
    // avoid intervention for active inputs
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;

    const isMenuOpen = document.getElementById('drawer').classList.contains('open');

    switch (event.key) {
        case 'Escape':
            toggleDrawer();
            break;

        case 'ArrowRight':
            if (isMenuOpen) {
                nextTopic();
            }
            break;

        case 'ArrowLeft':
            if (isMenuOpen) {
                prevTopic();
            }
            break;

        case 'ArrowUp':
            if (isMenuOpen) {
                event.preventDefault();
                loadPrevScreen();
            }
            break;

        case 'ArrowDown':
            if (isMenuOpen) {
                event.preventDefault();
                loadNextScreen();
            }
            break;
            
        case 'Enter':
            if (isMenuOpen) {
                toggleTopicPassed(); 
            }
            break;
    }
});

// On page load initialize the menu and selected screen
document.addEventListener('DOMContentLoaded', () => {
    initMenu();
    startGame();
});
