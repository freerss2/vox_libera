/*
 *   "Vox-Libera" Language learning.
 *   Main application JS engine
 */

"use strict";

const app_code_ver = '2.7.9b';

// First, report the components versions
console.log('html_code_ver='+html_code_ver);
console.log('app_code_ver='+app_code_ver);
console.log('lesson_data_ver='+lesson_data_ver);

const GENERAL_TOPIC_ID = 'all';
const DEFAULT_SCREEN_ID = 'dictionary';

document.getElementById('versions-info').innerHTML =
  '<table>' +
  '<tr><td>html code</td><td>&nbsp;v' + html_code_ver + '</td></tr>' +
  '<tr><td>app code</td><td>&nbsp;v' + app_code_ver + '</td></tr>' +
  '<tr><td>lesson data</td><td>&nbsp;v' + lesson_data_ver + '</td></tr></table>'
  ;

const settings = new Settings(
    {
      "userInterfaceLanguage": {"default": "en"},
      "gameDifficulty":        {"default": "easy"},
      "hideWellLearned":       {"default": 0, "type": "int"},
      "showTranscription":     {"default": 0, "type": "int"},
      "currentTopic":          {"default": GENERAL_TOPIC_ID},
      "currentScreenId":       {"default": DEFAULT_SCREEN_ID},
      "topicsCompletion":      {"default": {}, "type": "json"},
      "wordStats":             {"default": {}, "type": "json"}
    }
);

let finalGameForTopic = '';

const hideWellLearnedElm = document.getElementById('hide-well-learned');
hideWellLearnedElm.checked = settings.getHideWellLearned() == 1;

const showTransToggleElm = document.getElementById('show-trans-toggle');
showTransToggleElm.checked = settings.getShowTranscription() == 1;

const langSelect = document.getElementById('ui-lang-select');
// Configure UI selector
const currentLang = settings.getUserInterfaceLanguage();
langSelect.innerHtml = '';
Object.keys(locales).forEach(langCode => {
    const langName = locales[langCode].__title__ || langCode;
    const option = document.createElement('option');
    option.value = langCode;
    option.textContent = langName;
    if (langCode === currentLang) option.selected = true;
    langSelect.appendChild(option);
});
langSelect.value = currentLang;

const difficultySettings = {
    easy:   { itemsPerRound: 5, totalChoices: 4, totalQuestions: 5,  sentenceFactor: 1.5},
    medium: { itemsPerRound: 6, totalChoices: 6, totalQuestions: 7,  sentenceFactor: 1.7},
    hard:   { itemsPerRound: 7, totalChoices: 8, totalQuestions: 9,  sentenceFactor: 1.9}
};

// Auto-fix for wrong inputs
if ( ! topics.hasOwnProperty(GENERAL_TOPIC_ID) ) topics[GENERAL_TOPIC_ID] = {"name": "All topics", "index": 0, "words": [], "sentences": []};

if ( ! topics[settings.getCurrentTopic()] ) settings.setCurrentTopic(GENERAL_TOPIC_ID);

// instantiate I18nManager
const course_locales = manifest['course_locales'];
if (course_locales) {
  Object.keys(course_locales).forEach(langCode => {
    if (locales[langCode]) {
      locales[langCode]['cl'] = course_locales[langCode];
    }
  })
}

const i18n = new I18nManager(locales);
i18n.setLanguage(currentLang);

// Screen types
const SCREENS = [
  { id: 'dictionary',      shared: 1, excercise: 0, screen_type: 'dictionary', name: 'Словарь',              inputs: ['words'] },
  { id: 'sentences',       shared: 1, excercise: 0, screen_type: 'dictionary', name: 'Предложения',          inputs: ['sentences'] },
  { id: 'flashcards',      shared: 0, excercise: 0, screen_type: 'flashcards', name: 'Карточки слов',        inputs: ['words'] },
  { id: 'flashcards-sent', shared: 0, excercise: 0, screen_type: 'flashcards', name: 'Карточки предложений', inputs: ['sentences'] },
  { id: 'matching',        shared: 0, excercise: 1, screen_type: 'matching',   name: 'Поиск пары',           inputs: ['words'] },
  { id: 'quiz_u2t',        shared: 0, excercise: 1, screen_type: 'quiz_u2t',   name: 'Викторина: 👤 → 🌍',   inputs: ['words', 'sentences'] },
  { id: 'quiz_t2u',        shared: 0, excercise: 1, screen_type: 'quiz_t2u',   name: 'Викторина: 🌍 → 👤',   inputs: ['words', 'sentences'] },
  { id: 'quiz_audio',      shared: 0, excercise: 1, screen_type: 'quiz_audio', name: 'Аудио-викторина',      inputs: ['words', 'sentences'] },
  { id: 'sent_u2t',        shared: 0, excercise: 1, screen_type: 'sent_u2t',   name: 'Предложение: 👤 → 🌍', inputs: ['sentences'] },
  { id: 'sent_t2u',        shared: 0, excercise: 1, screen_type: 'sent_t2u',   name: 'Предложение: 🌍 → 👤', inputs: ['sentences'] },
  { id: 'sent_audio',      shared: 0, excercise: 1, screen_type: 'sent_audio', name: 'Аудио-Предложение',    inputs: ['sentences'] },
  { id: 'final',           shared: 0, excercise: 1, screen_type: 'random',     name: 'Итог темы',            inputs: ['words', 'sentences'] }
];

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

// ---------------- Side menu (drawer) control ---------------------

function renderDrawer() {
    const pathContainer = document.getElementById('exercisePath');
    pathContainer.innerHTML = '';

    SCREENS.forEach((screen, index) => {
        const li = document.createElement('li');
        const screen_name = i18n.t(`screens|${screen.id}`);
        li.className = 'exercise-node';
        li.setAttribute('data-id', screen.id);
        li.innerHTML = `
            <div class="node-icon">${index + 1}</div>
            <span class="node-name" data-i18n="screens|${screen.id}">${screen_name}</span>
        `;

        li.onclick = () => renderCurrentScreenFromMenu(screen.id);

        pathContainer.appendChild(li);
    });

    showActiveExerciseInMenu(settings.getCurrentScreenId());
}

// show the current screen name in menu as "selected"
function showActiveExerciseInMenu() {
  document.querySelectorAll('.exercise-node').forEach(n => n.classList.remove('current'));
  const activeNode = document.querySelector(`[data-id="${settings.getCurrentScreenId()}"]`);
  if (activeNode) activeNode.classList.add('current');
}

// Try to apply translation according to course locales
function i18n_ct(text) {
  if (i18n.currentLang == 'en') return text;  // by default never translate to English
  const translation = i18n.t(`cl|${text}`);
  if (translation.startsWith('cl|')) return text;  // better original English instead of "key"
  return translation;
}

// Apply topic to GUI
// - title in menu
// - completion status
// - show/hide nodes in excercises path
function applyTopicToDisplay() {
  const topicTitle = i18n_ct(topics[settings.getCurrentTopic()].name);
  document.getElementById('currentTopicName').textContent = topicTitle;
  document.getElementById('currentTopicNameSummary').textContent = topicTitle;

  displayTopicCompletionState();
  updateDrawerStats();
  // Hide/show topic-settings
  const topicSettings = document.getElementById('topic-settings');
  if (settings.getCurrentTopic() == GENERAL_TOPIC_ID) {
    topicSettings.classList.add('hidden');
  } else {
    topicSettings.classList.remove('hidden');
  }
  // show/hide relevant items in menu
  // for topic 'all' hide item that have shared==0
  const nodes = document.getElementsByClassName('exercise-node');
  [...nodes].forEach(node => {
      const record = getScreenRecord(node.dataset.id);
      let display = 'flex';
      if (settings.getCurrentTopic() == GENERAL_TOPIC_ID && record.shared == 0) display = 'none';
      node.style.display = display;
    }
  );
}

// Show-hide side menu
function toggleDrawer() {
    const drawer = document.getElementById('drawer');
    const overlay = document.getElementById('overlay');
    scrollToTop('drawer-content');

    // if opening - refresh statistics display
    if ( !drawer.classList.contains('open') ) updateDrawerStats();

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

// Initialize side menu
function initMenu() {
    // 1. Populate list of screens
    renderDrawer();
    // 2. Display topic title
    applyTopicToDisplay();
    // 3. Read and apply settings
    const savedDifficulty = settings.getGameDifficulty()
    setGamesDifficulty(savedDifficulty);
    const radioToSelect = document.getElementById(`diff-${savedDifficulty}`);
    if (radioToSelect) {
        radioToSelect.checked = true;
    }
}

// --------------- Screens navigation -------------------------

function renderCurrentScreenFromMenu(screen_id) {
  settings.setCurrentScreenId(screen_id);
  renderCurrentScreen();
  toggleDrawer();
}

function loadPrevScreen() {
  loadPrevNexScreen(-1);
}

function loadNextScreen(fromWinDialog=false) {
  if (settings.getCurrentScreenId() == 'final' && fromWinDialog) {
    // if entered this code from WinScreen and current screen is 'final'
    // open special dialog box for topic summary
    showTopicResults();
    return;
  }
  loadPrevNexScreen(1);
}

function showTopicResults() {
    const data = getTopicStats(settings.getCurrentTopic());
    const modal = document.getElementById('resultsModal');
    
    // Statistics for words
    document.getElementById('res-words-count').textContent = data.wordsCount;
    document.getElementById('res-words-accuracy').textContent = `${Math.round(data.wordsSuccess)}%`;

    // Statistics for phrases
    document.getElementById('res-sent-count').textContent = data.sentencesCount;
    document.getElementById('res-sent-accuracy').textContent = `${Math.round(data.sentencesSuccess)}%`;

    // hide winScreen
    const winScreenElm = document.getElementById('winScreen');
    if (winScreenElm) winScreenElm.classList.add('hidden');
    // show new screen
    modal.classList.remove('hidden');

    // animate success
    triggerSuccessEffect(modal);
    setTimeout(() => { triggerSuccessEffect(modal); }, 1500);
    setTimeout(() => { triggerSuccessEffect(modal); }, 2500);
}

function loadPrevNexScreen(delta) {
  // find current screen index
  const currGameIndex = SCREENS.findIndex(m => m.id === settings.getCurrentScreenId());
  const newGameIndex = currGameIndex+delta;
  if (newGameIndex >= 0 && newGameIndex < SCREENS.length) {
    const next_screen_id = SCREENS[newGameIndex].id;
    // special case for 'all' topic
    if ( settings.getCurrentTopic() == GENERAL_TOPIC_ID ) {
      const record = getScreenRecord(next_screen_id);
      if (record.shared == 0) {
        // if next screen is not 'shared' - move to next topic
        switchTopic(delta);
        return;
      }
    }
    settings.setCurrentScreenId(next_screen_id);
    renderCurrentScreen();
  } else {
    // if last - move to next topic
    switchTopic(delta);
  }
}

// show current screen
function renderCurrentScreen() {
  showActiveExerciseInMenu();
  applyTopicToDisplay();

  // Render screen according to current type
  renderScreen(settings.getCurrentScreenId());
}

// try to find topic key name by given index
function getTopic(topicIndex) {
    for (let key in topics) {
      if (topics[key].index == topicIndex) return key;
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
  let topicIndex = topics[settings.getCurrentTopic()].index;
  // find topic with next id
  let nextTopicId = getTopic(topicIndex+direction);
  if (! nextTopicId) return;

  // if found - load screen
  settings.setCurrentTopic(nextTopicId);
  // reset screen to default (first)
  settings.setCurrentScreenId(SCREENS[0].id);
  // start the game
  renderCurrentScreen();
}


// by screen id get the whole record
function getScreenRecord(screen_id) {
  return SCREENS.find(r => r.id == screen_id);
}

// get screen_type by screen id
function getScreenType(screen_id) {
  const record = getScreenRecord(screen_id);
  if (record) return record.screen_type;
  return DEFAULT_SCREEN_ID;
}

// Build and show the screen title
function showScreenTitle() {
    const record = getScreenRecord(settings.getCurrentScreenId());
    const screenName = record ? i18n.t(`screens|${record.id}`) : "Screen";

    let topicTitle = i18n_ct(topics[settings.getCurrentTopic()].name);
    document.getElementById('title').textContent = `${topicTitle}: ${screenName}`;
}

// Render screen/game
function renderScreen(screen_id) {
    showScreenTitle();
    // for screen 'final' get a random screen from screens with excercise==1
    finalGameForTopic = '';
    if (screen_id == 'final') {
        // build a set of candidates:
        // having 'excercise' flag on and excluding 'final' itself
        const candidates = SCREENS.filter(rec => rec.id != 'final' && rec.excercise == 1);
        const replacement = candidates[Math.floor(Math.random() * candidates.length)];
        const record = getScreenRecord(screen_id);
        record.screen_type = replacement.screen_type;
        record.inputs = replacement.inputs;
        // use data from other topics in "completed" state
        finalGameForTopic = settings.getCurrentTopic();
    }
    // 1. Hide all screen-related DOM elements
    const screens = document.querySelectorAll('.game-screen');
    screens.forEach(s => s.style.display = 'none');
    // including different panels
    document.getElementById('winScreen').classList.add('hidden');
    document.getElementById('resultsModal').classList.add('hidden');
    // initilize hint panel
    const hintPanelElm = document.getElementById('hint-panel');
    if (hintPanelElm) hintPanelElm.textContent = i18n.t("main|hint-panel");
    document.getElementById('progress-container').style.display = 'none';
    document.getElementById('errors-panel').style.display = 'none';
    // hide the search line
    showHideSearch(0);
    updateTranscriptionDisplay();


    // 2. Show related screen only
    const screenType = getScreenType(screen_id);
    let screenId = screenType.startsWith('quiz') ? 'screen-quiz' : ('screen-'+screenType);
    if (screenType.startsWith('sent')) { screenId = 'screen-sent'; }
    if (screenType == 'flashcards') { screenId = 'flashcards-screen'; }
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.style.display = 'block';
    }

    // 3. Initialize screen according to type
    if (screenType === 'dictionary') {
        showDictionary();
    } else {
        const container = document.getElementById('app-container');
        container.classList.add('hidden-anim');
        setTimeout(() => {
            // render content
            initGameEngine(screen_id);
            // animate
            container.classList.remove('hidden-anim');
        }, 300);
    }
}

// Initilize engine for game-type screen
function initGameEngine(screen_id) {
    let screenType = getScreenType(screen_id);
    if (screenType == 'matching') {
        renderMatchingGame();
    } else {
        if (screenType == 'flashcards') {
          initFlashcards();
        } else if (screenType.startsWith('quiz')) {
          startNewQuizSet();
        } else {
          renderSent(screen_id);
        }
    }
}

// extract from learned item fields:
// string in user language, string in learned language, transliteration
function decodeLearnedItem(item) {
  const user_lang = i18n_ct(item[0]);
  const translit = item[2] || '';
  return [user_lang, item[1], translit];
}

// --------------------------------- flash-cards

let cardIndex = 0;
let flashcardsData = [];
let flashcardsMode = 't2u'; // Modes: 't2u' / 'u2t'

function initFlashcards() {
    const container = document.getElementById('flashcards-screen');
    const inputTypes = getGameInputTypes(settings.getCurrentScreenId());

    // Deep copy for dynamic changes
    flashcardsData = getTopicData(inputTypes, settings.getHideWellLearned(), true);

    if (flashcardsData.length === 0) {
        showCompletionMessage();
        return;
    }

    cardIndex = 0;
    container.innerHTML = `
            <div class="flashcard-header">
                <span class="mode-toggle-wrapper">
                  <button class="mode-toggle" onclick="toggleStudyMode()">&nbsp;🌍&nbsp;⇆&nbsp;👤&nbsp;</button>
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
    flashcardsMode = (flashcardsMode === 't2u') ? 'u2t' : 't2u';
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
    const trText = `[${item[2]}]`;
    // [0] - User, [1] - Target, [2] - Translit
    // TODO: use generic codes and calculated class names
    if (flashcardsMode === 't2u') {
        front.innerHTML = `
            <div class="ar-text">${item[1]}</div>
            <div class="tr-text transcription">${trText}</div>`;
        back.innerHTML = `
            <div class="ru-text">${item[0]}</div>
        `;
    } else {
        front.innerHTML = `
            <div class="ru-text">${item[0]}</div>`;
        back.innerHTML = `
            <div class="ar-text">${item[1]}</div>
            <div class="tr-text transcription">${trText}</div>
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
        // hide this card from current session
        flashcardsData.splice(cardIndex, 1);

        if (flashcardsData.length === 0) {
            showCompletionMessage();
        } else {
            // if removed card was the last in a list - return to the beginning
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
function renderMatchingGame() {
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
    const currentData = getTopicData(inputTypes, settings.getHideWellLearned(), true);

    // Take a random slice according to itemsPerRound
    const pool = shuffle([...currentData]).slice(0, gameSettings.itemsPerRound);
    // Randomly shaffle pool on both sides
    const leftSide = shuffle(pool.map(p => ({ t: p[0], id: p[1], h: p[2] })));
    const rightSide = shuffle(pool.map(p => ({ t: p[1], id: p[1], h: p[2] })));

    leftSide.forEach((item, i) => createTile(item, i, 'left', 'user', board));
    rightSide.forEach((item, i) => createTile(item, i, 'right', 'target', board));
}

// Create a single tile for pairs (matching) screen
function createTile(item, index, side, lang, container) {
    const div = document.createElement('div');
    div.className = 'card' + (lang === 'target' ? ' arabic' : '');
    div.textContent = item.t;
    div.dataset.col = side;
    div.dataset.target = (lang === 'target' ? item.t : '');
    div.dataset.id = item.id;
    div.style.gridColumn = side === 'left' ? '1' : '2';
    div.style.gridRow = (index + 1).toString();

    div.onclick = () => {
        if (lang === 'target') {
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

    if (selectedLeft && selectedRight) checkPairMatch();
}

// Verify did we got a match
function checkPairMatch() {
    const l = selectedLeft, r = selectedRight;
    const targetStr = l.dataset.target || r.dataset.target || l.textContent;
    if (l.dataset.id === r.dataset.id) {
        scrollToTop('app-container');
        updateStats(targetStr, true);
        triggerSuccessEffect(r);
        triggerSuccessEffect(l);
        document.getElementById('hint-panel').textContent = i18n.t("main|hint-panel");

        l.classList.add('correct'); r.classList.add('correct');
        matches++;
        updateProgress(matches / gameSettings.itemsPerRound * 100);
        selectedLeft = null; selectedRight = null;
        if (matches === gameSettings.itemsPerRound) setTimeout(() => {
            const acc = Math.round((gameSettings.itemsPerRound / (gameSettings.itemsPerRound + errors)) * 100);
            showWin(acc);
        }, 400);
    } else {
        updateStats(targetStr, false);
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
// ------------------------------------------- game completion popup

// Show completion summary per round
function showWin(acc) {

    // Calculate the success rate
    let category = acc >= 90 ? 'perfect' : (acc >= 60 ? 'good' : 'tryAgain');

    // Text summary on completed round (according to reached grade)
    let quotes = manifest.feedback[category];
    // For a variety take random phrase
    let pick = quotes[Math.floor(Math.random() * quotes.length)];

    // Fill-in the informal summary
    const statusEl = document.getElementById('winStatus');
    const tipEl = document.getElementById('tipOfTheDay');
    const user_lang_feedback = i18n_ct(pick[0]);
    statusEl.innerHTML = `
        <span class="arabic" style="font-size: 1.5em; display: block; ">${pick[1]}</span>
        <span style="font-size: 0.5em; color: #888; display: block; margin-top: 5px;">
            ${pick[2]} — ${user_lang_feedback}
        </span>
    `;
    // generate tip of the day
    tipEl.innerHTML = tipOfTheDay();

    // hide the game board and visualize the popup
    document.getElementById('screen-matching').style.display = 'none';
    document.getElementById('winScreen').classList.remove('hidden');
    document.getElementById('accuracyStat').textContent = acc + "%";
}


function tipOfTheDay() {
  // randomly choose either hint or recommended translation
  if ( Math.random() > 0.5 ) {
    const indx = Math.floor(Math.random() * 4);
    const tip = i18n.t(`tip_of_the_day|${indx}`);
    const title = i18n.t('tip_of_the_day|title');
    return `💡${title}💡<BR>${tip}`;
  }
  // get all words/sentences from current topic
  const inputTypes = getGameInputTypes(settings.getCurrentScreenId());
  const allStrs = getTopicData(inputTypes, true, true);
  // the strings are already filtered by success rate and shuffled
  const hintData = allStrs[0];
  const transl = i18n.t('tip_of_the_day|remember_transl');
  return `💡${transl}💡<BR>${hintData[0]}<BR>${hintData[1]}<BR>[${hintData[2]}]`;
}

// ------------------------------------------ quiz (find the right one from many)

// status of quiz game
let quizCorrectStr = null;
let firstAttempt = true;

// Initialize quiz (of all possible types)
function renderQuizGame(screen_id) {
    const inputTypes = getGameInputTypes(screen_id);
    const allStrs = getTopicData(inputTypes, settings.getHideWellLearned(), false);
    const screenType = getScreenType(screen_id);
    // Take a random word from all words in topic
    const index = settings.getHideWellLearned() ? 0 : Math.floor(Math.random() * allStrs.length);
    quizCorrectStr = allStrs[index];

    const questionContainer = document.getElementById('quiz-question-container');
    const optionsGrid = document.getElementById('quiz-options-grid');

    questionContainer.innerHTML = '';
    optionsGrid.innerHTML = '';
    document.getElementById('quiz-hint-panel').textContent = i18n.t("main|hint-panel");

    let mainHint = '';
    // 1. Fill the question card
    if (screenType === 'quiz_u2t') {
        questionContainer.textContent = quizCorrectStr[0];  // Translation
    } else if (screenType === 'quiz_t2u') {
        questionContainer.innerHTML = `<span class="arabic">${quizCorrectStr[1]}</span>`;
        mainHint = `[${quizCorrectStr[2]}]`;
    } else if (screenType === 'quiz_audio') {
        questionContainer.innerHTML = `
            <button class="audio-main-btn" onclick="speakArabic('${quizCorrectStr[1]}')">
                <span style="font-size: 50px;">🔊</span>
            </button>
            <button class="audio-main-btn" onclick="speakArabicSlow('${quizCorrectStr[1]}')">
                <span style="font-size: 50px;">🐌</span>
            </button>
            `;
        mainHint = `[${quizCorrectStr[2]}]`;
        speakArabic(quizCorrectStr[1]); // Immediately trigger the speak
    }
    document.getElementById('quiz-main-hint').innerHTML = mainHint;

    // 2. Generate options for selection (one correct and rest - random)
    const options = generateDistractors(quizCorrectStr, shuffle(allStrs), gameSettings.totalChoices);
    firstAttempt = true;

    options.forEach(word => {
        const btn = document.createElement('div');
        btn.className = 'card quiz-card';
        btn.dataset.speak = '';
        // According to quiz type determine the cards content
        if (screenType === 'quiz_u2t') {
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

    return shuffle(choices.concat(filtered));
}

let gameSet = {
    totalQuestions: gameSettings.totalQuestions,
    currentQuestionIndex: 0,
    errors: 0,
    isSetRunning: false
};

function startNewQuizSet() {
    gameSet.totalQuestions = gameSettings.totalQuestions;
    gameSet.currentQuestionIndex = 0;
    gameSet.errors = 0;
    gameSet.isSetRunning = true;
    firstAttempt = true;

    document.getElementById('progress-container').style.display = 'block';
    document.getElementById('errors-panel').style.display = 'block';
    showErrorCount(0);
    updateProgress(0);

    renderQuizGame(settings.getCurrentScreenId());
}

function finishSet() {
    // show summary
    const acc = Math.round((gameSet.totalQuestions / (gameSet.totalQuestions + gameSet.errors)) * 100);
    showWin(acc);
}

// Callback for click on quiz button
function handleQuizChoice(selectedStr, btn) {
    // if relevant - fill quiz-hint-panel with transliteration
    const translit = btn.dataset.translit;
    if (btn.dataset.speak) speakArabic(btn.dataset.speak);
    const hintPanel = document.getElementById('quiz-hint-panel');
    if (hintPanel && translit) {
        hintPanel.textContent = translit;
    }
    if (selectedStr[1] === quizCorrectStr[1]) {
        // Correct!
        btn.style.borderColor = "var(--primary)";
        scrollToTop('app-container');

        updateStats(quizCorrectStr[1], firstAttempt);
        if (firstAttempt) {
          triggerSuccessEffect(btn);
        }
        gameSet.currentQuestionIndex++;
        const percent = (gameSet.currentQuestionIndex / gameSet.totalQuestions) * 100;
        updateProgress(percent);

        if (gameSet.currentQuestionIndex < gameSet.totalQuestions) {
            // Next mini-game
            setTimeout(() => {
                renderQuizGame(settings.getCurrentScreenId());
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
        updateStats(quizCorrectStr[1], firstAttempt);
        btn.classList.add('wrong');
        btn.disabled = true; // Disable as already taken
        scrollToTop('app-container');

        const screenType = getScreenType(settings.getCurrentScreenId());
        // For audio-based quiz re-run speaking routine
        if (screenType === 'quiz_audio') speakArabic(quizCorrectStr[1]);
    }
}

// ---------------------------------------------- sentences build

/*
    { id: 'sent_u2t', name: 'Sentence: user → target' },
    { id: 'sent_t2u', name: 'Sentence: target → user' },
    { id: 'sent_audio', name: 'Audio-Sentence' },
*/
function renderSent(screen_id) {
    const screenType = getScreenType(screen_id);
    document.getElementById('errors-panel').style.display = 'block';
    // 1. get topic data
    const inputTypes = ['sentences'];
    let allStrs = getTopicData(inputTypes, settings.getHideWellLearned(), false);
    allStrs = allStrs.filter(r => (r[0].includes(' ') && r[1].includes(' ') && !r[0].includes('.')));
    // for wrong topic without sentences - switch to a compatible screen type
    if ( ! allStrs.length ) {
        renderScreen('matching');
        return;
    }
    // var allWords;
    errors = 0;
    showErrorCount(errors);
    // 2. draw a random sentence from topic data (X user and Y target words)
    const index = settings.getHideWellLearned() ? 0 : Math.floor(Math.random() * allStrs.length);
    let gameSentence = allStrs[index];
    // 3. for user->target game show all X words in top card
    //    for target->user      show all Y words
    //    for aud->user         store in div.dataset.expected Y target words
    // 4. store the answer in div.dataset.expected
    const questionContainer = document.getElementById('sent-question-container');
    const bankContainer = document.getElementById('sent-bank');
    const resultContainer = document.getElementById('sent-result');
    let questionHtml = '';
    let expected = gameSentence[0];
    let extractPosition = 0;
    let speakEnable = 0;
    resultContainer.classList.remove('arabic');
    let mainHint = '';
    if ( screenType == 'sent_u2t' ) {
        questionHtml = gameSentence[0];
        expected = gameSentence[1];
        extractPosition = 1;
        speakEnable = 1;
        resultContainer.classList.add('arabic');
    } else if (screenType == 'sent_t2u') {
        questionHtml = gameSentence[1];
        mainHint = `[${gameSentence[2]}]`;
    } else {
        questionHtml = `
            <button class="audio-main-btn" onclick="speakArabic('${gameSentence[1]}')">
                <span style="font-size: 50px;">🔊</span>
            </button>
            <button class="audio-main-btn" onclick="speakArabicSlow('${gameSentence[1]}')">
                <span style="font-size: 50px;">🐌</span>
            </button>`;
        mainHint = `[${gameSentence[2]}]`;
        speakArabic(gameSentence[1]);
    }
    questionContainer.innerHTML = questionHtml;
    document.getElementById('sent-main-hint').innerHTML = mainHint;
    let bankWords = (expected.split(/\s+/)).filter(word => word.length > 0);
    questionContainer.dataset.expected = bankWords.join(' ');
    // 5. add to expected sentence more words (avoid already contaning words)
    // add 50/70/90% to bank, but total not bigger than 10
    let factor = gameSettings.sentenceFactor;
    let maxWords = Math.max(bankWords.length, 10);
    let extraWordsCount = Math.min(Math.round(bankWords.length * factor), maxWords);
    const subset = extractUniqueWordsFromData(shuffle(allStrs), extractPosition).filter(w => !bankWords.includes(w)).slice(0, extraWordsCount);
    bankWords.push(...subset);
    bankWords = shuffle(bankWords);
    // 6. create word-buttons in bottom card
    bankContainer.innerText = '';
    let bankWordClass = 'sent-word';
    if ( screenType == 'sent_u2t' ) bankWordClass += ' arabic';
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

// from a list of lists allData extract all unique words on position pos
// randomly shuffle the result
function extractUniqueWordsFromData(allData, pos) {
   let realWords = allData.flatMap(row => row[pos].split(/\s+|,/)).filter(w => w.length > 0);
   realWords = realWords.filter(w => !w.includes(')')).filter(w => !w.includes('(')).filter(w => !w.includes('/'));
   let allWords = [...new Set( realWords )];
   return shuffle(allWords);
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
    // count as success
    updateStats(questionContainer.dataset.expected, true);
    const acc = Math.round((2 / (2 + errors)) * 100);
    showWin(acc);
  } else {
    // increase errors count
    errors++;
    // count as failure
    updateStats(questionContainer.dataset.expected, false);
    resultContainer.classList.add('wrong');
    setTimeout(() => {
        resultContainer.classList.remove('wrong');
            scrollToTop('app-container');
    }, 400);
  }
  showErrorCount(errors);
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

function getGameInputTypes(screen_id) {
  const record = getScreenRecord(screen_id);
  return record.inputs;
}

// render dictionary according to selected topic
function showDictionary() {
    const listContainer = document.getElementById('dictionaryList');
    listContainer.innerHTML = '';
    showHideSearch(1);

    const inputTypes = getGameInputTypes(settings.getCurrentScreenId());
    // for dictionary do not apply neither filtering nor shuffling
    const currentData = getTopicData(inputTypes, false, false);

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
                <div class="dictionaryTransl transcription">[${item[2]}]</div>
            </div>
            <div class="arabic" style="color: var(--text-color);">
                ${item[1]}
            </div>
        `;
        updateTranscriptionDisplay();
        listContainer.appendChild(card);
    });
    
    scrollToTop('screen-dictionary');
}

// universal collector for topic data (including virtual "all")
// external parameter: finalGameForTopic
function getTopicData(inputTypes, hideWellLearned, needShuffle) {
  let currentData = [];
  if (settings.getCurrentTopic() == GENERAL_TOPIC_ID) {
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
      let topicData = topics[settings.getCurrentTopic()][inputType];
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

  // special case for 'final' round - try to get data from other completed topics:
  //   iterate over all topics with state != 0, excluding the current one
  //   append to currentData elements of each input type
  if (finalGameForTopic) {
    for (let key in topics) {
      if (key == finalGameForTopic) continue;
      let state = getTopicState(key);
      if (! state) continue;
      inputTypes.forEach( inputType => {
        let topicData = topics[key][inputType];
        if ( topicData ) {
          currentData.push(...topicData);
        }
      });
    }
  }
  currentData.forEach((item, index) => { currentData[index] = decodeLearnedItem(item); });

  if ( hideWellLearned != 0 ) {
    // hide well-learned:
    const candidates = orderByAccuracy(currentData);
    currentData = getStratifiedBatch(candidates);
  }

  if ( needShuffle ) return shuffle([...currentData]);
  return currentData;
}

// Order currentData list by accuracy rate, assuming entries without stats as most important
function orderByAccuracy(currentData) {
  const candidates = currentData
    .map(item => {
        const targetStr = item[1]; // take target language string
        const stats = wordStats[targetStr];

        // Calculate accuracy, considering totally new as "-1" (for sorting)
        const accuracy = stats && stats.attempts > 0 
            ? (stats.success / stats.attempts) * 100 
            : -1;

        return { item, accuracy, attempts: stats ? stats.attempts : 0 };
    })
    .sort((a, b) => {
        // 1. First will appear the candidates with accuracy less than 0 (-1)
        // 2. The rest are sorted from less to higher success rate
        if (a.accuracy !== b.accuracy) {
            return a.accuracy - b.accuracy;
        }
        // 3. When the accuracy is the same, take less used candidate
        return a.attempts - b.attempts;
    })
    .map(obj => obj.item); // map back from statistical object to array of strings

  return candidates;
}

// Stratified random extract from candidates using strates of 60%..30%..10%
function getStratifiedBatch(candidates) {
    const total = candidates.length;
    if (total === 0) return [];

    // 1. Calculate index for each strate beginning
    const limit60 = Math.floor(total * 0.6);
    const limit90 = Math.floor(total * 0.9);

    // Extract strates according to indexes
    const strates = [
        candidates.slice(0, limit60),           // First 60%
        candidates.slice(limit60, limit90),     // Next  30%
        candidates.slice(limit90)               // Last  10%
    ];

    let finalBatch = [];

    // 2. Randomly take a half from each strate
    strates.forEach(strate => {
        if (strate.length > 0) {
            // shuffle the strate
            const shuffled = shuffle([...strate]); 
            
            // Take half (round up to avoid small strate miscalculation)
            const halfSize = Math.ceil(shuffled.length / 2);
            finalBatch.push(...shuffled.slice(0, halfSize));
        }
    });

    return finalBatch;
}

// TODO: move this variable to generic 'settings' too
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
  const topicStates = settings.getTopicsCompletion();
  topicStates[topic] = Number(state);

  settings.setTopicsCompletion(topicStates);
}

function getTopicState(topic) {
  const topicStates = settings.getTopicsCompletion();
  return Number(topicStates[topic]);
}

function toggleTopicPassed() {
    const isChecked = document.getElementById('topicPassedCheckbox').checked;

    const titleContainer = document.querySelector('.drawer-title');
    if (isChecked) {
        titleContainer.classList.add('is-passed');
    } else {
        titleContainer.classList.remove('is-passed');
    }

    setTopicState(settings.getCurrentTopic(), Number(isChecked));
}

function displayTopicCompletionState() {
    const state = getTopicState(settings.getCurrentTopic());
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
  // for each word/sentence in current topic
  const topicData = [...topics[settings.getCurrentTopic()]['words'], ...topics[settings.getCurrentTopic()]['sentences']];

  // erase it from stats
  [...topicData].forEach(e => {delete stats[e[1]]});
  // save stats back
  setStats(stats);
  // reload dictionary
  const screenType = getScreenType(settings.getCurrentScreenId());
  if (screenType === 'dictionary') {
     showDictionary();
  }
}

// Do we need this?
function resetStats() {
  setStats({});
  // reload dictionary
  const screenType = getScreenType(settings.getCurrentScreenId());
  if (screenType === 'dictionary') {
     showDictionary();
  }
}

// Str stats update
function updateStats(targetStr, isCorrect) {
  let stats = getStats();
  if (!stats[targetStr]) {
      stats[targetStr] = { attempts: 0, success: 0 };
  }
  stats[targetStr].attempts += 1;
  if (isCorrect) {
      stats[targetStr].success += 1;
  }
  setStats(stats);
  wordStats[targetStr] = stats[targetStr];
}

function getTopicStats(topicId) {
    let topicData = topics[topicId];

    const stats = {
        wordsCount: 0,
        sentencesCount: 0,
        wordsSuccess: 0,
        sentencesSuccess: 0
    };

    if (!topicData) return stats;

    let topicWords = topicData.words;
    let topicSentences = topicData.sentences;
    // collect all words and sentences for topicId == "all"
    if (topicId == GENERAL_TOPIC_ID) {
      topicWords = [];
      topicSentences = [];
      for (let key in topics) {
        topicData = topics[key];
        if ( topicData ) {
          if (topicData.hasOwnProperty('words'))     topicWords.push(...topicData.words);
          if (topicData.hasOwnProperty('sentences')) topicSentences.push(...topicData.sentences);
        }
      }
    }

    stats.wordsCount = topicWords.length;
    stats.sentencesCount = topicSentences.length;

    if (stats.wordsCount > 0) {
      let wordTotalRatio = 0;
      topicWords.forEach(w => {
          const s = wordStats[w[1]];
          if (s && s.attempts > 0) {
            wordTotalRatio += (s.success / s.attempts);
          }
      });
      stats.wordsSuccess =  (wordTotalRatio / stats.wordsCount) * 100;
    }

    if (stats.sentencesCount > 0) {
      let sentTotalRatio = 0;
      topicSentences.forEach(s => {
          const st = wordStats[s[1]];
          if (st && st.attempts > 0) {
            sentTotalRatio += (st.success / st.attempts);
          }
      });
      stats.sentencesSuccess = (sentTotalRatio / stats.sentencesCount) * 100;
    }

    return stats;
}

function updateDrawerStats() {
    const data = getTopicStats(settings.getCurrentTopic());
    if (!data) return;

    document.getElementById('statWords').textContent =
        `${data.wordsCount} / ${Math.round(data.wordsSuccess)}%`;
    document.getElementById('statSents').textContent =
        `${data.sentencesCount} / ${Math.round(data.sentencesSuccess)}%`;
}

// callback for toggle "Well-learned" checkbox
function toggleWellLearned() {
  settings.setHideWellLearned(hideWellLearnedElm.checked ? 1 : 0);
  renderCurrentScreen();
}

// callback for toggle "transcription" checkbox
function toggleTranscription() {
  settings.setShowTranscription(showTransToggleElm.checked ? 1 : 0);
  updateTranscriptionDisplay();
}

// Callback for UI language change
langSelect.addEventListener('change', (event) => {
    const newLang = event.target.value;
    
    settings.setUserInterfaceLanguage(newLang);
    
    i18n.setLanguage(newLang);

    location.reload();
});

// show or hide transcription according to global setting
function updateTranscriptionDisplay() {
  // change visibility for "transcription" class
  [...document.getElementsByClassName('transcription')].forEach(e => {
    e.classList.toggle('hidden', settings.getShowTranscription()==0);
  });
}

// callback for GUI change
function changeDifficulty(level) {
    // 1. Store for future
    settings.setGameDifficulty(level);
    // 2. Change the games parameters
    setGamesDifficulty(level);
    // 3. Restart the game (exclude dictionary)
    const screenType = getScreenType(settings.getCurrentScreenId());
    if (screenType === 'dictionary') {
      renderCurrentScreen();
    }
}

// set games difficulty
function setGamesDifficulty(level) {
    gameSettings = difficultySettings[level];
}

const successCharacters = [
  '✨', '🌟', '🎊', '🎉', '🏆', '🎖️', '💎', '💡', '🚀', '⚡', '🎈', '🔥'];

function triggerSuccessEffect(button) {
    // button.classList.add('correct-animation');

    // animate random success icons
    const sparkle = document.createElement('span');
    sparkle.innerText = shuffle(successCharacters)[0]+shuffle(successCharacters)[1]+shuffle(successCharacters)[2];
    sparkle.className = 'success-sparkle';
    button.appendChild(sparkle);

    setTimeout(() => {
        // button.classList.remove('correct-animation');
        sparkle.remove();
    }, 700);
}

document.addEventListener('keydown', (event) => {
    // avoid intervention for active inputs
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;

    const isMenuOpen = document.getElementById('drawer').classList.contains('open');

    let handled = false;
    switch (event.key) {
        case 'Escape':
            toggleDrawer();
            handled = true;
            break;

        case 'ArrowRight':
            if (isMenuOpen) {
                nextTopic();
                handled = true;
            }
            break;

        case 'ArrowLeft':
            if (isMenuOpen) {
                prevTopic();
                handled = true;
            }
            break;

        case 'ArrowUp':
            if (isMenuOpen) {
                event.preventDefault();
                loadPrevScreen();
                handled = true;
            }
            break;

        case 'ArrowDown':
            if (isMenuOpen) {
                event.preventDefault();
                loadNextScreen();
                handled = true;
            }
            break;

        case 'Enter':
            if (isMenuOpen) {
                toggleTopicPassed();
                handled = true;
            }
            break;
    }
    if (handled) {
        event.preventDefault();
        event.stopPropagation();
    }
});

// On page load initialize the menu and selected screen
document.addEventListener('DOMContentLoaded', () => {
    initMenu();
    renderCurrentScreen();
});
