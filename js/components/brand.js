/**
 * brand.js — Hydrate [data-brand] attributes from BRAND config.
 *
 * Pattern: any element in HTML can declare data-brand="<key>" and this module
 * fills it on boot. Smena imeni bренда = одна правка в config.js.
 *
 * Supported keys:
 *   name           → plain text "ORFEO"
 *   name-styled    → first letter wrapped in .gradient-text, rest plain
 *   tagline        → BRAND.tagline
 *   founder        → BRAND.founder
 *   geo            → BRAND.geo
 *   email          → both textContent and href (if <a>) → BRAND.contactEmail
 *   email-href     → only href, leaves text untouched
 *   response-time  → BRAND.responseTime
 *   langs          → "RU / EN"
 */
import { BRAND } from '../config.js';

export function init() {
  const targets = document.querySelectorAll('[data-brand]');
  if (!targets.length) return;

  targets.forEach((el) => {
    const key = el.dataset.brand;
    switch (key) {
      case 'name':
        el.textContent = BRAND.name;
        break;

      case 'name-styled': {
        const first = BRAND.name.charAt(0);
        const rest = BRAND.name.slice(1);
        el.innerHTML = `<span class="gradient-text">${first}</span>${rest}`;
        break;
      }

      case 'tagline':
        el.textContent = BRAND.tagline;
        break;

      case 'founder':
        el.textContent = BRAND.founder;
        break;

      case 'geo':
        el.textContent = BRAND.geo;
        break;

      case 'email':
        el.textContent = BRAND.contactEmail;
        if (el.tagName === 'A') {
          el.setAttribute('href', `mailto:${BRAND.contactEmail}`);
        }
        break;

      case 'email-href':
        if (el.tagName === 'A') {
          el.setAttribute('href', `mailto:${BRAND.contactEmail}`);
        }
        break;

      case 'response-time':
        el.textContent = BRAND.responseTime;
        break;

      case 'langs':
        el.textContent = BRAND.langs.join(' / ');
        break;

      default:
        console.warn(`[brand.js] Unknown data-brand key: "${key}"`);
    }
  });

  // Document title — keep in sync with BRAND
  document.title = `${BRAND.name} — ${BRAND.tagline}`;
}
