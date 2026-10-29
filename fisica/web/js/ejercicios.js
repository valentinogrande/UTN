/* Ejercicios resueltos: mostrar los pasos de a uno */
(() => {
  'use strict';
  document.querySelectorAll('.ex').forEach(ex => {
    const steps = [...ex.querySelectorAll('.ex-steps li')];
    const res = ex.querySelector('.ex-res');
    const btns = ex.querySelector('.ex-btns');
    const next = ex.querySelector('[data-ex=next]');
    let shown = 0;
    const update = () => {
      steps.forEach((li, i) => { li.hidden = i >= shown; });
      const done = shown >= steps.length;
      res.hidden = !done;
      btns.hidden = done;
      next.textContent = shown === 0 ? 'Ver el primer paso' : `Ver el paso ${shown + 1} de ${steps.length}`;
    };
    next.addEventListener('click', () => { shown++; update(); });
    ex.querySelector('[data-ex=all]').addEventListener('click', () => { shown = steps.length; update(); });
    update();
  });
})();
