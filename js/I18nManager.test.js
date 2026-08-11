/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import './i18n.js'; // attaches `I18nManager` to window

beforeEach(() => {
  // reset document state and dir
  document.body.innerHTML = '';
  document.documentElement.dir = 'ltr';
});

describe('I18nManager', () => {
  it('translates nested keys and updates page elements (happy path)', () => {
    const locales = {
      en: { menu: { stats_words: 'Words' }, forms: { name: 'Name' } },
      ru: { menu: { stats_words: 'Слова' }, forms: { name: 'Имя' }, __dir__: 'ltr' }
    };

    const i18n = new I18nManager(locales);
    expect(i18n.t('menu|stats_words')).toBe('Words');

    // create elements to be translated
    const span = document.createElement('span');
    span.setAttribute('data-i18n', 'menu|stats_words');
    const input = document.createElement('input');
    input.setAttribute('data-i18n-placeholder', 'forms|name');
    const btn = document.createElement('button');
    btn.setAttribute('data-i18n-title', 'menu|stats_words');
    document.body.appendChild(span);
    document.body.appendChild(input);
    document.body.appendChild(btn);

    // switch language to Russian and ensure content updates
    i18n.setLanguage('ru');
    expect(span.textContent).toBe('Слова');
    expect(input.getAttribute('placeholder')).toBe('Имя');
    expect(btn.getAttribute('title')).toBe('Слова');
  });

  it('returns the key when translation not found', () => {
    const locales = { en: {} };
    const i18n = new I18nManager(locales);
    expect(i18n.t('nonexistent|key')).toBe('nonexistent|key');
  });

  it('uses langDirection for RTL languages when __dir__ missing', () => {
    const locales = { en: {}, he: { menu: { a: 'א' } } };
    const i18n = new I18nManager(locales);
    i18n.setLanguage('he');
    expect(document.documentElement.dir).toBe('rtl');
  });

  it('does not change language when asked to set an unknown language', () => {
    const locales = { en: { menu: { a: 'A' } } };
    const i18n = new I18nManager(locales);
    i18n.setLanguage('xx');
    // still default
    expect(i18n.t('menu|a')).toBe('A');
  });

  it('throws when non-string keys are passed to t()', () => {
    const locales = { en: { a: 'A' } };
    const i18n = new I18nManager(locales);
    expect(() => i18n.t(null)).toThrow();
    expect(() => i18n.t(undefined)).toThrow();
    expect(() => i18n.t(0)).toThrow();
    expect(() => i18n.t(NaN)).toThrow();
  });

  it('throws when constructed with invalid locales and setLanguage called (error case)', () => {
    const badLocales = null;
    const i18n = new I18nManager(badLocales);
    expect(() => i18n.setLanguage('en')).toThrow();
  });

  it('translatePage leaves attributes untouched when keys missing (regression)', () => {
    const locales = { en: {} };
    const i18n = new I18nManager(locales);
    const input = document.createElement('input');
    input.setAttribute('data-i18n-placeholder', 'forms|unknown');
    document.body.appendChild(input);
    // calling translatePage shouldn't throw and placeholder should equal the key
    i18n.translatePage();
    expect(input.getAttribute('placeholder')).toBe('forms|unknown');
  });
});
