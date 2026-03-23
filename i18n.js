/*
** I-18-n module
**
** Usage:  <span class="stat-label" data-i18n="menu.stats_words">Слова</span>

  const locales = {
    "ru": {
      "menu": {
        "stats_words": "Слова",
        },
    },
    "en": {
    "menu": {
      "stats_words": "Words",
        },
    }
  };

  const i18n = new I18nManager(locales);
*/

class I18nManager {
    constructor(locales) {
        this.locales = locales;
        this.currentLang = 'ru'; // The default one
    }

    setLanguage(lang) {
        if (this.locales[lang]) {
            this.currentLang = lang;
            this.translatePage();
        }
    }

    // Translation of content by data-tag key (like: "menu.stats_words")
    t(key) {
        const keys = key.split('.');
        let result = this.locales[this.currentLang];
        
        for (const k of keys) {
            result = result ? result[k] : null;
        }
        
        return result || key; // return the key when not found
    }

    // Find all elements with data-i18n and apply current language
    translatePage() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = this.t(key);
        });
    }
}
