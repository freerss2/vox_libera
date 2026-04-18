/*
 *   Vox Libera - main screen (selection of available courses)
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