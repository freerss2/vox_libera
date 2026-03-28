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
        this.currentLang = 'en'; // The default one
    }

    setLanguage(lang) {
        if (this.locales[lang]) {
            this.currentLang = lang;
            this.translatePage();
            const dir = this.locales[lang].__dir__ || 'ltr';
            document.documentElement.dir = dir;
        }
    }

    // Translation of content by data-tag key (like: "menu|stats_words")
    t(key) {
        const keys = key.split('|');
        let result = this.locales[this.currentLang];
        
        for (const k of keys) {
            result = result ? result[k] : null;
        }
        
        return result || key; // return the key when not found
    }

    // Find all elements with data-i18n and apply current language
    translatePage() {
        const elements = document.querySelectorAll('[data-i18n], [data-i18n-title], [data-i18n-placeholder]');

        elements.forEach(el => {
            // 1. Перевод основного текста (textContent)
            const textKey = el.getAttribute('data-i18n');
            if (textKey) el.textContent = this.t(textKey);

            // 2. Перевод всплывающей подсказки (title)
            const titleKey = el.getAttribute('data-i18n-title');
            if (titleKey) el.setAttribute('title', this.t(titleKey));

            // 3. Перевод плейсхолдера (placeholder)
            const placeholderKey = el.getAttribute('data-i18n-placeholder');
            if (placeholderKey) el.setAttribute('placeholder', this.t(placeholderKey));
        });
    }
}
