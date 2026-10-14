import { describe, expect, test } from 'vitest';
import { page } from '../helpers/dist';

const PLACES: [string, string, string][] = [
  ['/kontakty/', 'quote', '#rozrakhunok'],
  ['/', 'final', '#zayavka'],
  ['/zaryadni-stantsii/', 'level', '[data-level-block="form"]'],
  ['/sonyachni-paneli/', 'level', '[data-level-block="form"]'],
  ['/batarei/', 'level', '[data-level-block="form"]'],
  ['/solar-carport/', 'carport', '[data-carport-block="form"]'],
  ['/sonyachni-paneli/kriplennya/', 'level', '[data-empty-state]'],
];

/** Видимі поля: групи й поля поза згорнутим коментарем, без пастки та прихованих. */
function visibleFields(form: Element): number {
  return [...form.querySelectorAll('.lead__field')].filter((f) => !f.closest('details')).length;
}

describe('SPEC-009/AC-04 форми стоять на місцях і працюють без JS', () => {
  test.each(PLACES)('%s → форма %s у %s', (url, kind, selector) => {
    const doc = page(url).document;
    const form = doc.querySelector(`${selector} form[data-lead-form]`);
    expect(form, `${url} ${selector}`).not.toBeNull();
    expect(form!.getAttribute('data-kind')).toBe(kind);
    expect(form!.getAttribute('method')).toBe('post');
    expect(form!.getAttribute('action')).toBe('/dyakuyemo/?type=lead');
    expect(form!.querySelector('input[name="phone"][type="tel"][required]')).not.toBeNull();
    expect(form!.querySelector('button[type="submit"]')).not.toBeNull();
    expect(form!.querySelector('a[href="/polityka-konfidentsiinosti/"]')).not.toBeNull();
  });
});

describe('SPEC-009/AC-05 не більше 5 видимих полів, у кожного підпис', () => {
  test.each(PLACES)('%s', (url, _kind, selector) => {
    const form = page(url).document.querySelector(`${selector} form[data-lead-form]`)!;
    expect(visibleFields(form)).toBeLessThanOrEqual(5);
    for (const input of form.querySelectorAll('input:not([type="hidden"]):not([name="website"]), textarea, select')) {
      const id = input.getAttribute('id');
      const labelled = (id && form.querySelector(`label[for="${id}"]`)) || input.closest('label');
      expect(labelled, `${url}: ${input.getAttribute('name')}`).toBeTruthy();
    }
  });

  test('пастка honeypot прихована від людей і клавіатури', () => {
    const hp = page('/kontakty/').document.querySelector('form input[name="website"]')!;
    expect(hp.getAttribute('tabindex')).toBe('-1');
    expect(hp.closest('[aria-hidden="true"]')).not.toBeNull();
  });
});
