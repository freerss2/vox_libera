/*
 *  Vox Libera - main screen
 *  explanations and course selection
 */

"use strict";

const app_code_ver = '2.8.5';

// First, report the components versions
console.log('html_code_ver='+html_code_ver);
console.log('app_code_ver='+app_code_ver);

const urlParams = new URLSearchParams(window.location.search);
const userLangDefault = urlParams.get('userLang') || '';

const settings = new Settings(
    {
      "userInterfaceLanguage": {"default": "en"},
    }
);

var userLang = settings.getUserInterfaceLanguage();
if (userLangDefault) userLang = userLangDefault;
settings.setUserInterfaceLanguage(userLang);

const i18n = new I18nManager(locales);
i18n.setLanguage(userLang);

const userDir = langDirection(userLang);

// TODO: apply direction to "about" window
const langSelect = document.getElementById('ui-lang-select');
// Configure UI selector
langSelect.innerHTML = '';
Object.keys(locales).forEach(langCode => {
    const langName = locales[langCode].__title__ || langCode;
    const option = document.createElement('option');
    option.value = langCode;
    option.textContent = langCode;
    if (langCode === userLang) option.selected = true;
    langSelect.appendChild(option);
});
langSelect.value = userLang;

// Callback for UI language change
langSelect.addEventListener('change', (event) => {
    const newLang = event.target.value;

    settings.setUserInterfaceLanguage(newLang);

    i18n.setLanguage(newLang);

    location.reload();
});


window.addEventListener('DOMContentLoaded', async () => {
  const gender = Math.floor(Math.random() * 2) ? 'male' : 'female';
  initMascot(NARRATOR_TEMPLATES[gender], 'mascot-wrapper');
  const bubble = document.getElementById('speech-bubble');
  const mascot = document.getElementById('mascot-wrapper');
  updateCharacterBubble(i18n.t('main|app-description'));
  bubble.addEventListener('click', toggleBubble);
  mascot.addEventListener('click', toggleBubble);
  setMascotEmotion('narrator-svg', mascotNeutralEmotion);

  // TODO: take list of cources and generate buttons dynamically
  // charToSvg(manifest.icon_code)
  updateFavicon('🌐');
});
