/*
 *   "Vox-Libera" - Learn Any Language
 *   Application engine
 */

"use strict";

const app_code_ver = '2.8.5';

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

// Global flag for special "final" game
let finalGameForTopic = '';

const hideWellLearnedElm = document.getElementById('hide-well-learned');
hideWellLearnedElm.checked = settings.getHideWellLearned() == 1;

const showTransToggleElm = document.getElementById('show-trans-toggle');
showTransToggleElm.checked = settings.getShowTranscription() == 1;

const langSelect = document.getElementById('ui-lang-select');
// Configure UI selector
const userLang = settings.getUserInterfaceLanguage();
langSelect.innerHTML = '';
Object.keys(locales).forEach(langCode => {
    const langName = locales[langCode].__title__ || langCode;
    const option = document.createElement('option');
    option.value = langCode;
    option.textContent = langName;
    if (langCode === userLang) option.selected = true;
    langSelect.appendChild(option);
});
langSelect.value = userLang;

const difficultySettings = {
    easy:   { itemsPerRound: 5, totalChoices: 4, totalQuestions: 5,  sentenceFactor: 1.5, finalGoal: 5},
    medium: { itemsPerRound: 6, totalChoices: 6, totalQuestions: 7,  sentenceFactor: 1.7, finalGoal: 7},
    hard:   { itemsPerRound: 7, totalChoices: 8, totalQuestions: 9,  sentenceFactor: 1.9, finalGoal: 9}
};

// Auto-fix for wrong inputs
if ( ! topics.hasOwnProperty(GENERAL_TOPIC_ID) ) topics[GENERAL_TOPIC_ID] = {"name": "All topics", "index": 0, "words": [], "sentences": []};

if ( ! topics[settings.getCurrentTopic()] ) settings.setCurrentTopic(GENERAL_TOPIC_ID);

// instantiate I18nManager
const course_locales = manifest['course_locales'];
if (course_locales) {
  Object.keys(course_locales).forEach(langCode => {
    if (locales[langCode]) {
      const langLocales = course_locales[langCode];
      locales[langCode]['cl'] =
          {...langLocales["interface"], ...langLocales["content"]};
      locales[langCode]['explanations'] = {...langLocales["explanations"]};
    }
  })
}

const i18n = new I18nManager(locales);
i18n.setLanguage(userLang);

// init speaking engine
const courseTargetLanguage = manifest.target_language;
const langSpeakCodes = {
  "ar": "ar-EG", // Language code (ar-SA - arabic Saudi)
  "he": "he-IL"
  };
const targetLangSpeakCode = (courseTargetLanguage in langSpeakCodes) ? langSpeakCodes[courseTargetLanguage] : '';

// calculate user/target language directions (LTR/RTL)
const targetDir = langDirection(courseTargetLanguage);
const userDir = langDirection(userLang);

// Screen types
const SCREENS = [
  { id: 'explanations',    shared: 1, excercise: 0, screen_type: 'explanations', name: 'Explanations',      inputs: [] },
  { id: 'abc',             shared: 1, excercise: 0, screen_type: 'dictionary',   name: 'Dictionary',        inputs: ['abc'] },
  { id: 'dictionary',      shared: 1, excercise: 0, screen_type: 'dictionary',   name: 'Dictionary',        inputs: ['words'] },
  { id: 'sentences',       shared: 1, excercise: 0, screen_type: 'dictionary',   name: 'Sentences',         inputs: ['sentences'] },
  { id: 'flashcards-abc',  shared: 0, excercise: 0, screen_type: 'flashcards',   name: 'Flashcards ABC',    inputs: ['abc'] },
  { id: 'flashcards',      shared: 0, excercise: 0, screen_type: 'flashcards',   name: 'Flashcards words',  inputs: ['words'] },
  { id: 'flashcards-sent', shared: 0, excercise: 0, screen_type: 'flashcards',   name: 'Flashcards sent',   inputs: ['sentences'] },
  { id: 'matching-abc',    shared: 0, excercise: 1, screen_type: 'matching',     name: 'Matching ABC',      inputs: ['abc'] },
  { id: 'matching',        shared: 0, excercise: 1, screen_type: 'matching',     name: 'Matching',          inputs: ['words'] },
  { id: 'quiz_u2t',        shared: 0, excercise: 1, screen_type: 'quiz_u2t',     name: 'Quiz: 👤 → 🌍',     inputs: ['words', 'sentences'] },
  { id: 'quiz_t2u',        shared: 0, excercise: 1, screen_type: 'quiz_t2u',     name: 'Quiz: 🌍 → 👤',     inputs: ['words', 'sentences'] },
  { id: 'quiz_audio',      shared: 0, excercise: 1, screen_type: 'quiz_audio',   name: 'Audio-Quiz',        inputs: ['words', 'sentences'] },
  { id: 'sent_u2t',        shared: 0, excercise: 1, screen_type: 'sent_u2t',     name: 'Sentence: 👤 → 🌍', inputs: ['sentences'] },
  { id: 'sent_t2u',        shared: 0, excercise: 1, screen_type: 'sent_t2u',     name: 'Sentence: 🌍 → 👤', inputs: ['sentences'] },
  { id: 'sent_audio',      shared: 0, excercise: 1, screen_type: 'sent_audio',   name: 'Audio-Sentence',    inputs: ['sentences'] },
  { id: 'final',           shared: 0, excercise: 1, screen_type: 'random',       name: 'Topic final',       inputs: ['words', 'sentences'] }
];

var topicScreens = [];

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

    topicScreens.forEach((screen, index) => {
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
    applyTopicToDisplay();
}

// show the current screen name in menu as "selected"
function showActiveExerciseInMenu() {
  document.querySelectorAll('.exercise-node').forEach(n => n.classList.remove('current'));
  const activeNode = document.querySelector(`[data-id="${settings.getCurrentScreenId()}"]`);
  if (activeNode) activeNode.classList.add('current');
}

// Try to apply translation according to course locales
function i18n_ct(text) {
  if (i18n.userLang == 'en') return text;  // by default never translate to English
  const translation = i18n.t(`cl|${text}`);
  if (translation.startsWith('cl|')) return text;  // better original English instead of "key"
  return translation;
}

// Apply topic to displayed elements
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
    // 2. Read and apply settings
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
  const currGameIndex = topicScreens.findIndex(m => m.id === settings.getCurrentScreenId());
  const newGameIndex = currGameIndex+delta;
  if (newGameIndex >= 0 && newGameIndex < topicScreens.length) {
    const next_screen_id = topicScreens[newGameIndex].id;
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

  const screen_id = settings.getCurrentScreenId();
  initFinalProgress(screen_id);
  // Render screen according to current type
  renderScreen(screen_id);
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
  initTopic(nextTopicId);
  // reset screen to default (first)
  settings.setCurrentScreenId(topicScreens[0].id);
  // start the game
  renderCurrentScreen();
}

// initialize topic
function initTopic(topicId) {
  settings.setCurrentTopic(topicId);
  // Copy SCREENS with a relevant screens only
  // For 'all' topic use only shared == 1
  // For any topic: check if it contains "sentences" (and skip all screens requiring sentences)
  // For any topic: check if it contains "explanations" (and skip "explanations" screen if missing)
  const currTopic = topics[settings.getCurrentTopic()];
  topicScreens = [];
  [...SCREENS].forEach(screen => {
    let useScreen = true;
    const screenInputs = screen['inputs'];
    if (topicId == 'all') {
      if (screen['shared'] == 1) {
        if (screen['screen_type'] === 'explanations') {
          if (!currTopic['explanations']) useScreen = false;
        } else {
          // collect from all topics their abc/wors/sentences
          const inputToCollect = screenInputs[0];
          let allTopicsInputs = [];
          for (let key in topics) {
            let t = topics[key];
            if (t[inputToCollect]) allTopicsInputs.push(...t[inputToCollect]);
          }
          if ( ! allTopicsInputs.length ) useScreen = false;
        }
      } else {
        useScreen = false;
      }
    } else {
      // if this screen require some limited set of inputs, make sure the topic contains them
      if (screen['screen_type'] === 'explanations') {
        if (!currTopic['explanations']) useScreen = false;
      } else {
        let presentInputs = [];
        screenInputs.forEach(input => {
          if (currTopic[input] && currTopic[input].length) presentInputs.push(input);
        });
        if (!presentInputs.length) {
          useScreen = false;
        }
      }
    }
    if ( useScreen ) {
      topicScreens.push(screen);
    }
  });
  initMenu();
}

// by screen id get the whole record
function getScreenRecord(screen_id) {
  return topicScreens.find(r => r.id == screen_id);
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
    document.getElementById('title').innerHTML = `${topicTitle}<BR>${screenName}`;
}

var finalProgress = 0;

// callback for game start
function initFinalProgress(screen_id) {
    const finalProgressElm = document.getElementById('finalProgress');
    if (screen_id == 'final') {
        finalProgressElm.classList.remove('hidden');
        if (finalProgress == 0) {
          // initialize progress display
          finalProgressElm.innerHTML = '';
          for (var i=0; i<gameSettings.finalGoal; i++) {
            const stageElm = document.createElement('span');
            stageElm.innerHTML = '&nbsp;';
            stageElm.className = 'final-progress-bar-stage';
            stageElm.id = `final-progress-stage-${i}`;
            finalProgressElm.appendChild(stageElm);
          }
        }
    } else {
        finalProgress = 0;
        // hide progress display
        if (! finalProgressElm.classList.contains('hidden') ){
          finalProgressElm.classList.add('hidden');
        }
    }
}

// callback for game completion
// @return: 1 when need to show this game summary
function updateFinalProgress(screen_id) {
    const finalProgressElm = document.getElementById('finalProgress');
    if (screen_id != 'final') {
      return 1;
    }
    // final round - move to next
    finalProgress += 1;
    if (finalProgress >= gameSettings.finalGoal) {
        finalProgress = 0;
        if (! finalProgressElm.classList.contains('hidden') ){
          finalProgressElm.classList.add('hidden');
        }
        // show final summary
        showTopicResults();
        return 0;
    }
    // show progress at new stage
    for (var i=0; i<finalProgress; i++) {
        document.getElementById(`final-progress-stage-${i}`).innerHTML = '✨';
    }
    // show next game
    renderCurrentScreen();
    // no need to show popup
    return 0;
}

// Render screen/game
function renderScreen(screen_id) {
    showScreenTitle();
    // for screen 'final' get a random screen from screens with excercise==1
    finalGameForTopic = '';
    if (screen_id == 'final') {
        // build a set of candidates:
        // having 'excercise' flag on and excluding 'final' itself
        const candidates = topicScreens.filter(rec => rec.id != 'final' && rec.excercise == 1);
        const replacement = candidates[Math.floor(Math.random() * candidates.length)];
        const record = getScreenRecord(screen_id);
        record.screen_type = replacement.screen_type;
        record.inputs = replacement.inputs;
        // use data from other topics in "completed" state
        finalGameForTopic = settings.getCurrentTopic();
    }
    // 1. Hide all screen-related DOM elements
    const screens = document.querySelectorAll('.game-screen');
    screens.forEach(s => s.classList.add('hidden'));
    // including different panels
    document.getElementById('winScreen').classList.add('hidden');
    document.getElementById('resultsModal').classList.add('hidden');
    // initilize hint panel
    const hintPanelElm = document.getElementById('hint-panel');
    if (hintPanelElm) hintPanelElm.textContent = i18n.t("main|hint-panel");
    document.getElementById('progress-container').classList.add('hidden');
    document.getElementById('errors-panel').classList.add('hidden');
    document.getElementById('completion-screen').classList.add('hidden');
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
        targetScreen.classList.remove('hidden');
    }

    // 3. Initialize screen according to type
    if (screenType === 'explanations') {
        renderExplanationsScreen();
        return;
    }
    if (screenType === 'dictionary') {
        showDictionary();
        return;
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

// extract fields from learning item:
//  - string in user language
//  - string in learned language
//  - transliteration
function decodeLearnItem(item) {
  const user_lang = i18n_ct(item[0]);
  const translit = item[2] || '';
  return [user_lang, item[1], translit];
}

// --------------------------------- flash-cards

let cardIndex = 0;
let flashcardsData = [];
let flashcardsMode = 't2u'; // Modes: 't2u' target-to-user / 'u2t' user-to-target

function initFlashcards() {
    const inputTypes = getGameInputTypes(settings.getCurrentScreenId());

    // Deep copy for dynamic changes
    flashcardsData = getTopicData(inputTypes, settings.getHideWellLearned(), true);

    if (flashcardsData.length === 0) {
        showCompletionMessage();
        return;
    }

    cardIndex = 0;

    updateCardContent();
    document.getElementById('flashcards-main').style.display = 'block';
    document.getElementById('card-anchor').style='';
}

function speakFlashcard(slow=0) {
    const item = flashcardsData[cardIndex];
    if (slow)  speakTargetLangSlow(item[1]);
    else       speakTargetLang(item[1]);
}

function toggleStudyMode() {
    flashcardsMode = (flashcardsMode === 't2u') ? 'u2t' : 't2u';
    // Cancel any flip and refresh the content
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

    speakTargetLang(item[1]);
    const trText = `[${item[2]}]`;
    // [0] - User, [1] - Target, [2] - Transcription
    const targetSide = `
            <div class="target-text" dir="${targetDir}" lang="${courseTargetLanguage}">${item[1]}</div>
            <div class="transcr-text transcription">${trText}</div>`;
    const userSide = `
            <div class="user-text" dir="${userDir}" lang="${userLang}" style="color: var(--secondary-color);">${item[0]}</div>`;
    if (flashcardsMode === 't2u') {
        front.innerHTML = targetSide;
        back.innerHTML = userSide;
    } else {
        front.innerHTML = userSide;
        back.innerHTML = targetSide;
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
            // Reset anchor position and refresh the card content
            cardAnchor.style.transform = 'translateY(0) rotate(0)';
            cardAnchor.style.opacity = '1';
            updateCardContent();
        }
    }, 400);
}

function showCompletionMessage() {
    const container = document.getElementById('completion-screen');
    const success = shuffle(successCharacters)[0];
    container.innerHTML = success + i18n.t('main|flashcards_completed');
    container.classList.remove('hidden');

    document.getElementById('flashcards-main').style.display = 'none';

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
    document.getElementById('progress-container').classList.remove('hidden');
    document.getElementById('errors-panel').classList.remove('hidden');
    showErrorCount(0);
    updateProgress(0);

    // Get all data related to topic
    const inputTypes = getGameInputTypes(settings.getCurrentScreenId());
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
    div.className = 'card' + (lang === 'target' ? ' target-text' : ' user-text');
    div.lang = lang === 'target' ? courseTargetLanguage : userLang;
    div.dir = lang === 'target' ? targetDir : userDir;
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
          speakTargetLang(item.t);
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
        triggerSuccessEffect(r, true);
        triggerSuccessEffect(l, true);
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

    // for final rounds increment the counter and check did we completed it
    const showSummary = updateFinalProgress(settings.getCurrentScreenId());
    if (! showSummary) return;

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
        <span class="target-text" dir="${targetDir}" lang="${courseTargetLanguage}" style="font-size: 1.5em; display: block; text-align: center;">${pick[1]}</span>
        <span class="user-text" dir="${userDir}" lang="${userLang}" style="font-size: 0.5em; color: #888; display: block; margin-top: 5px;">
            ${pick[2]} — ${user_lang_feedback}
        </span>
    `;
    // generate tip of the day
    tipEl.innerHTML = tipOfTheDay();

    // hide the game board and visualize the popup
    document.getElementById('screen-matching').classList.add('hidden'); // ?? why ??
    document.getElementById('accuracyStat').textContent = `${acc}%`;
    document.getElementById('winScreen').classList.remove('hidden');
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
  return `💡${transl}💡<BR>«${hintData[0]}»<BR>${hintData[1]}<BR>[${hintData[2]}]`;
}

// ------------------------------------------ avoid repetitive questions

/*
 * Save last choosen target string and last quiz answer position
 * When next random selection hits the same string or position - use alternative
 */

var lastStr = null;
var lastPos = -1;

// from the range [0..maxval] return two different random values
function getTwoUniqueIndices(maxVal) {
    if (maxVal < 2) return [0, 0];

    const first = Math.floor(Math.random() * maxVal);
    let second = Math.floor(Math.random() * (maxVal - 1));

    // avoid collision by moving out of first range
    if (second >= first) {
        second++;
    }

    return [first, second];
}

// for regular mode - get random item not matching previous round
// for hideWellLearned mode - take first or second item
function trueRandomStr(allStrs, hideWellLearned) {
  let index0 = 0;
  let index1 = 1;
  if ( hideWellLearned == 0 ) {
    [index0, index1] = getTwoUniqueIndices(allStrs.length);
  }
  if (lastStr == allStrs[index0][1]) {
    lastStr = allStrs[index1][1];
    return allStrs[index1];
  } else {
    lastStr = allStrs[index0][1];
    return allStrs[index0];
  }
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
    quizCorrectStr = trueRandomStr(allStrs, settings.getHideWellLearned());

    const questionContainer = document.getElementById('quiz-question-container');
    const optionsGrid = document.getElementById('quiz-options-grid');

    questionContainer.innerHTML = '';
    optionsGrid.innerHTML = '';
    document.getElementById('quiz-hint-panel').textContent = i18n.t("main|hint-panel");

    let mainHint = '';
    const targetTags = `class="target-text" dir="${targetDir}" lang="${courseTargetLanguage}"`;
    const userTags = `class="user-text" dir="${userDir}" lang="${userLang}"`;
    // 1. Fill the question card
    if (screenType === 'quiz_u2t') {
        questionContainer.innerHTML = `<span ${userTags}>${quizCorrectStr[0]}</span>`;
    } else if (screenType === 'quiz_t2u') {
        questionContainer.innerHTML = `<span ${targetTags}>${quizCorrectStr[1]}</span>`;
        mainHint = `[${quizCorrectStr[2]}]`;
    } else if (screenType === 'quiz_audio') {
        questionContainer.innerHTML = `
            <button class="audio-main-btn" onclick="speakTargetLang('${quizCorrectStr[1]}')">
                <span style="font-size: 50px;">🔊</span>
            </button>
            <button class="audio-main-btn" onclick="speakTargetLangSlow('${quizCorrectStr[1]}')">
                <span style="font-size: 50px;">🐌</span>
            </button>
            `;
        mainHint = `[${quizCorrectStr[2]}]`;
        speakTargetLang(quizCorrectStr[1]); // Immediately trigger the speak
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
            btn.innerHTML = `<span ${targetTags}>${word[1]}</span>`;
            btn.dataset.speak = word[1];
        } else {
            btn.innerHTML = `<span ${userTags}>${word[0]}</span>`;
        }
        btn.dataset.value = word[1];
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

    choices = shuffle(choices.concat(filtered));
    if (lastPos >= 0 && choices[lastPos][1] == correct[1]) {
      const newPos = (lastPos+1) % choices.length;
      [choices[lastPos], choices[newPos]] = [choices[newPos], choices[lastPos]];
      lastPos = newPos;
    }
    return choices;
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

    document.getElementById('progress-container').classList.remove('hidden');
    document.getElementById('errors-panel').classList.remove('hidden');
    showErrorCount(0);
    updateProgress(0);

    renderQuizGame(settings.getCurrentScreenId());
}

function finishSet() {
    // show summary
    const acc = Math.round((gameSet.totalQuestions / (gameSet.totalQuestions + gameSet.errors)) * 100);
    showWin(acc);
}

// user decided to give up:
//  - show the right card with a highlighted border
//  - mark this attempt as failed
function quizGiveup() {
  [...document.getElementsByClassName('quiz-card')].forEach(e => {
    if (e.dataset.value === quizCorrectStr[1]) {
      e.classList.add('quiz-card-giveup');
    }
  });
  updateStats(quizCorrectStr[1], false);
}

// Callback for click on quiz button
function handleQuizChoice(selectedStr, btn) {
    // if relevant - fill quiz-hint-panel with transliteration
    const translit = btn.dataset.translit;
    if (btn.dataset.speak) speakTargetLang(btn.dataset.speak);
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
          triggerSuccessEffect(btn, true);
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
        if (screenType === 'quiz_audio') speakTargetLang(quizCorrectStr[1]);
    }
}

// ---------------------------------------------- build-a-sentence

/*
    { id: 'sent_u2t', name: 'Sentence: user → target' },
    { id: 'sent_t2u', name: 'Sentence: target → user' },
    { id: 'sent_audio', name: 'Audio-Sentence' },
*/
function renderSent(screen_id) {
    const screenType = getScreenType(screen_id);
    document.getElementById('errors-panel').classList.remove('hidden');
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
    let gameSentence = trueRandomStr(allStrs, settings.getHideWellLearned());
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
    resultContainer.classList.remove('target-text');
    resultContainer.classList.remove('user-text');
    let mainHint = '';
    if ( screenType == 'sent_u2t' ) {
        questionHtml = `<span lang="${userLang}" dir="${userDir}" class="user-text">${gameSentence[0]}</span>`;
        expected = gameSentence[1];
        extractPosition = 1;
        speakEnable = 1;
        resultContainer.classList.add('target-text');
        resultContainer.dir = targetDir;
    } else if (screenType == 'sent_t2u') {
        questionHtml = gameSentence[1];
        questionHtml = `<span lang="${courseTargetLanguage}" dir="${targetDir}" class="target-text">${gameSentence[1]}</span>`;
        mainHint = `[${gameSentence[2]}]`;
        resultContainer.classList.add('user-text');
        resultContainer.dir = userDir;
    } else {
        questionHtml = `
            <button class="audio-main-btn" onclick="speakTargetLang('${gameSentence[1]}')">
                <span style="font-size: 50px;">🔊</span>
            </button>
            <button class="audio-main-btn" onclick="speakTargetLangSlow('${gameSentence[1]}')">
                <span style="font-size: 50px;">🐌</span>
            </button>`;
        mainHint = `[${gameSentence[2]}]`;
        resultContainer.classList.add('user-text');
        resultContainer.dir = userDir;
        speakTargetLang(gameSentence[1]);
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
    let bankWordLang = '';
    let bankWordDir = '';
    if ( screenType == 'sent_u2t' ) {
      bankWordClass += ' target-text';
      bankWordLang = courseTargetLanguage;
      bankWordDir = targetDir;
    } else {
      bankWordClass += ' user-text';
      bankWordLang = userLang;
      bankWordDir = userDir;
    }
    for (let i = 0; i < bankWords.length; i++) {
      const bankWord = document.createElement('span');
      bankWord.onclick = () => useBankWord(i);
      bankWord.className = bankWordClass;
      bankWord.dir = bankWordDir;
      bankWord.lang = bankWordLang;
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

// sentence "give up" action:
//  - remove all elements of class "sent-word-result"
//  - build a sequence of words from questionContainer.dataset.expected
//  - update statistics as "failed"
//  - increment errors and show the updated errors count
function giveupSent() {
    const questionContainer = document.getElementById('sent-question-container');
    [...document.getElementsByClassName('sent-word-result')].forEach(w => {
        w.click();
    });
    const wordMap = {};
    const bankElements = document.querySelectorAll('[id^="bank-word-"]');
    bankElements.forEach(el => {
        const text = el.innerText.trim();
        if (!wordMap[text]) wordMap[text] = [];
        wordMap[text].push(el.id);
    });
    const expectedWords = questionContainer.dataset.expected.trim().split(/\s+/);
    // disable Speak temporary
    const saveIsMuted = isMuted;
    isMuted = true;
    // TODO: add animation?
    expectedWords.forEach(word => {
        if (wordMap[word] && wordMap[word].length > 0) {
            const id = wordMap[word].shift();
            document.getElementById(id).click();
        }
    });
    isMuted = saveIsMuted;
    updateStats(questionContainer.dataset.expected, false);
    errors++;
    showErrorCount(errors);
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
    speakTargetLang(word);
  }
  bankWordElement.classList.add('sent-word-used');
  appendWordToResult(bankWordId, word);
}

// append word with given bankId to result display
function appendWordToResult(bankWordId, word) {
  const resultContainer = document.getElementById('sent-result');
  const screenType = getScreenType(settings.getCurrentScreenId());
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
  let resultWordClass = 'sent-word sent-word-result';
  let resultWordLang = '';
  let resultWordDir = '';
  if ( screenType == 'sent_u2t' ) {
      resultWordClass += ' target-text';
      resultWordLang = courseTargetLanguage;
      resultWordDir = targetDir;
  } else {
      resultWordClass += ' user-text';
      resultWordLang = userLang;
      resultWordDir = userDir;
  }
  resultWord.className = resultWordClass;
  resultWord.dir = resultWordDir;
  resultWord.lang = resultWordLang;
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

// ------------------------------------------ dictionary

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
            else if (accuracy < 85) statusColor = '#ce9b02';            // Acceptable
            else statusColor = 'var(--primary-color)';                  // Good
        }

        // Speak the content on click
        card.onclick = () => speakTargetLang(item[1]);
        const cardStat = wordStat.attempts > 0 ? `<span class="stat-badge" style=" color: ${statusColor};"> (${accuracy}%)</span>` : '';
        card.innerHTML = `
            <div style="flex: 1;">
                <div>
                  <span style="color: var(--secondary-color);" class="user-text" dir="${userDir}" lang="${userLang}">${item[0]}</span>
                  ${cardStat}
                </div>
                <div class="dictionaryTransl transcription">[${item[2]}]</div>
            </div>
            <div class="target-text" dir="${targetDir}" lang="${courseTargetLanguage}">
                ${item[1]}
            </div>
        `;
        updateTranscriptionDisplay();
        listContainer.appendChild(card);
    });

    scrollToTop('screen-dictionary');
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

// ---------------------------------------- application state setting

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
function speakTargetLangSlow(text) {
  speakTargetLang(text, 0.5);
}

function speakTargetLang(text, rate=1) {
    if (isMuted) return;
    if (! targetLangSpeakCode) return;
    // Check, whether broser supports this API
    if ('speechSynthesis' in window) {
        // Cancel any in-progress speech
        window.speechSynthesis.cancel();

        const msg = new SpeechSynthesisUtterance();
        msg.text = text;
        msg.lang = targetLangSpeakCode; // Language code
        msg.rate = rate;    // Speed rate
        msg.pitch = 1;      // Pitch

        window.speechSynthesis.speak(msg);
    }
}

function changeZoom(delta) {
    currentZoom = Math.min(Math.max(0.8, currentZoom + delta), 1.8);
    document.documentElement.style.setProperty('--app-scale', currentZoom );
}

function getGameInputTypes(screen_id) {
  const record = getScreenRecord(screen_id);
  return record.inputs;
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
  currentData.forEach((item, index) => { currentData[index] = decodeLearnItem(item); });

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

// reset all statistics
// (TODO: must get a confirmation) /!\
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

function triggerSuccessEffect(element, animateBorder=false) {
    if (animateBorder)
        element.classList.add('correct-animation');

    // animate random success icons
    const sparkle = document.createElement('span');
    sparkle.innerText = shuffle(successCharacters)[0]+shuffle(successCharacters)[1]+shuffle(successCharacters)[2];
    sparkle.className = 'success-sparkle';
    element.appendChild(sparkle);

    setTimeout(() => {
        if (animateBorder)
            element.classList.remove('correct-animation');
        sparkle.remove();
    }, 700);
}

// Map keyboard shortcuts

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

// Sources for information:
// manifest['metadata'] title, description, prerequisites, goals
function renderExplanationsScreen() {
  const explanationsElm = document.getElementById('explanationsScreen');
  const topicId = settings.getCurrentTopic();
  const currTopic = topics[topicId]
  let topicExplanations = currTopic['explanations'];
  // try to find localized version
  const i18nKey = `explanations|${topicId}`;
  const localizedExplanations = i18n.t(i18nKey);
  if (localizedExplanations && localizedExplanations != i18nKey) {
    topicExplanations = localizedExplanations;
  }
  // Markdown to HTML
  document.getElementById('explanationsContent').innerHTML = parseMarkdown(topicExplanations);
  explanationsElm.classList.remove('hidden');
}

// Convert "Markdown" text to HTML
function parseMarkdown(text) {
  const targetTags = `class="target-text" dir="${targetDir}" lang="${courseTargetLanguage}"`;
  return text
      // Headers (### Text)
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')

      // Bold (**text**)
      .replace(/\*\*([^*]+)\*\*/gim, '<b>$1</b>')

      // Italic (_text_)
      .replace(/_([^_]+)_/gim, '<i>$1</i>')

      // Target language ('''text''')
      .replace(/'''([^']+)'''/gim, '<span ' + targetTags +'>$1</span>')

      // Newlines
      .replace(/\n/gim, '<br>')

      // Avoid newline around header
      .replace(/h3><br>/gim, 'h3>')
      .replace(/<br><h3/gim, '<h3');
}

// On page load:
//  - initialize the menu
//  - show current screen
document.addEventListener('DOMContentLoaded', () => {

    initTopic(settings.getCurrentTopic());
    renderCurrentScreen();

});

