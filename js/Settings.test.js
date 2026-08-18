/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import './settings.js'; // attaches `Settings` to `window`

beforeEach(() => {
  window.localStorage.clear();
});

describe('Settings', () => {
  it('stores and retrieves string, int and json (happy path)', () => {
    const settings = new Settings({
      name: { default: 'alice' },
      age: { default: 10, type: 'int' },
      prefs: { default: { a: 1 }, type: 'json' }
    });

    expect(settings.getName()).toBe('alice');
    expect(settings.getAge()).toBe(10);
    expect(settings.getPrefs()).toEqual({ a: 1 });

    settings.setName('bob');
    settings.setAge('21'); // setter should coerce string -> number for int
    settings.setPrefs({ b: 2 });

    expect(settings.getName()).toBe('bob');
    expect(settings.getAge()).toBe(21);
    expect(settings.getPrefs()).toEqual({ b: 2 });

    // raw localStorage values should reflect stored representation
    expect(window.localStorage.getItem('vox_libera_setting_name')).toBe('bob');
    expect(window.localStorage.getItem('vox_libera_setting_age')).toBe('21');
    expect(window.localStorage.getItem('vox_libera_setting_prefs')).toBe(JSON.stringify({ b: 2 }));
  });

  it('handles null, undefined, empty string, 0 and NaN edge cases', () => {
    const settings = new Settings({
      s: { default: 'def' },
      i: { default: 5, type: 'int' },
      j: { default: {}, type: 'json' }
    });

    // empty string should be stored and returned as empty string
    settings.setS('');
    expect(settings.getS()).toBe('');

    // undefined for int should result in getter returning 0
    settings.setI(undefined);
    expect(settings.getI()).toBe(0);

    // explicit 0 stays 0
    settings.setI(0);
    expect(settings.getI()).toBe(0);

    // NaN stored for int should be treated as falsy and getter returns 0
    settings.setI(NaN);
    expect(settings.getI()).toBe(0);

    // null for json should become '{}'
    settings.setJ(null);
    expect(settings.getJ()).toEqual({});
    expect(window.localStorage.getItem('vox_libera_setting_j')).toBe('{}');
  });

  it('throws when storage contains invalid JSON for a json param', () => {
    window.localStorage.setItem('vox_libera_setting_bad', 'not-json');
    const settings = new Settings({ bad: { default: {}, type: 'json' } });
    expect(() => settings.getBad()).toThrow();
  });

  it('falls back to default when storage contains an empty string at init (regression test)', () => {
    window.localStorage.setItem('vox_libera_setting_str', '');
    const settings = new Settings({ str: { default: 'fallback' } });
    expect(settings.getStr()).toBe('fallback');
  });

  it('reflects changes across instances via localStorage', () => {
    const s1 = new Settings({ k: { default: 'v' } });
    s1.setK('x');
    const s2 = new Settings({ k: { default: 'v' } });
    expect(s2.getK()).toBe('x');
  });

  it('does not update last-changed time before the initial sync cycle enables tracking', () => {
    const s = new Settings({ a: { default: 'v' } });
    const before = Number(s.getLastChangedTime()) || 0;

    s.setA('z');

    const t = s.getLastChangedTime();
    expect(Number(t)).toBe(before);
  });

  it('keeps a dedicated progress timestamp for sync decisions', () => {
    const s = new Settings({ a: { default: 'v' } });
    const before = Number(s.getProgressUpdatedTime()) || 0;

    s.markAsChanged();

    const t = s.getProgressUpdatedTime();
    expect(Number(t)).toBeGreaterThan(before);
    expect(Number(s.getLastChangedTime())).toBe(Number(t));
  });

  it('updates last-changed time when markChanges is enabled', () => {
    const s = new Settings({ a: { default: 'v' } });
    s.enableChangedFlag();
    s.setA('z');
    const t = s.getLastChangedTime();
    expect(t).not.toBe('0');
    expect(Number(t)).toBeGreaterThan(0);
  });
});
