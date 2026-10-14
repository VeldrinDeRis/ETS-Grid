// UTM першого входу на сайт → sessionStorage (SPEC-009 §3.3, ревізія 4 SPEC-001).
import { readUtm, UTM_KEY } from '../lib/leads';

try {
  if (!sessionStorage.getItem(UTM_KEY)) {
    const utm = readUtm(location.search);
    if (utm) sessionStorage.setItem(UTM_KEY, JSON.stringify(utm));
  }
} catch {
  // сховище недоступне — заявка піде без UTM
}
