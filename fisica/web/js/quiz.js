/* Autoevaluación conceptual */
(() => {
  'use strict';
  const Q = [
    { q: 'Una patinadora gira con los brazos abiertos y los cierra. Despreciando el rozamiento, ¿qué pasa con su ω y su energía cinética?',
      o: ['ω aumenta y Ec se mantiene', 'ω aumenta y Ec aumenta', 'ω se mantiene y Ec aumenta', 'ω aumenta y Ec disminuye'], a: 1,
      w: 'Se conserva L = Iω: si I baja, ω sube. Como Ec = L²/(2I), con L fijo y menor I la energía aumenta. El extra sale del trabajo de sus músculos al acercar los brazos.' },
    { q: 'En un choque totalmente inelástico de un sistema aislado, ¿qué se conserva?',
      o: ['Sólo la energía cinética', 'La cantidad de movimiento y la energía cinética', 'Sólo la cantidad de movimiento', 'Nada, porque los cuerpos se deforman'], a: 2,
      w: 'La cantidad de movimiento se conserva en todo choque de un sistema aislado. La Ec no: en el plástico la pérdida es máxima (e = 0).' },
    { q: 'Un aro y un disco macizo de igual masa y radio bajan rodando sin deslizar por la misma rampa. ¿Cuál llega primero?',
      o: ['El aro', 'El disco', 'Llegan juntos porque tienen igual masa', 'Depende del radio'], a: 1,
      w: 'v = √(2gh/(1+c)), con c = 1 para el aro y c = ½ para el disco. El disco guarda menos energía en la rotación, así que le queda más para trasladarse.' },
    { q: 'Un proyectil explota en el aire en varios fragmentos. Mientras ninguno toca el suelo, el centro de masa de los fragmentos…',
      o: ['se detiene en el punto de la explosión', 'sigue la misma parábola que traía el proyectil', 'cae verticalmente', 'sale en la dirección del fragmento más pesado'], a: 1,
      w: 'Las fuerzas de la explosión son internas. La única fuerza externa sigue siendo el peso total, así que ΣF_ext = M·a_cm = M·g no cambia.' },
    { q: 'Entre todos los ejes paralelos entre sí, ¿respecto de cuál es mínimo el momento de inercia de un cuerpo?',
      o: ['El que pasa por el centro de masa', 'El que pasa por un extremo', 'El más alejado del cuerpo', 'Es el mismo para todos'], a: 0,
      w: 'Por Steiner, I_P = I_cm + M·d². Como M·d² ≥ 0, el mínimo es con d = 0.' },
    { q: 'Una varilla uniforme gira primero alrededor de un eje perpendicular por su centro y después por un extremo. ¿Cuántas veces mayor es I en el segundo caso?',
      o: ['2 veces', '3 veces', '4 veces', '12 veces'], a: 2,
      w: 'I_centro = ML²/12 e I_extremo = ML²/12 + M(L/2)² = ML²/3. El cociente es 4.' },
    { q: '¿Por qué un airbag reduce las lesiones en un choque?',
      o: ['Porque reduce el cambio de cantidad de movimiento del conductor', 'Porque alarga el tiempo de frenado y así reduce la fuerza media para el mismo impulso', 'Porque absorbe la cantidad de movimiento del auto', 'Porque convierte el choque en elástico'], a: 1,
      w: 'El conductor pasa de v a 0 igual: Δp es el mismo. Como J = F_med·Δt = Δp, al aumentar Δt baja la fuerza media.' },
    { q: 'En el Ejemplo 1 del apunte (marco con cuatro esferas girando alrededor del eje y), ¿cuánto aportan al momento de inercia las dos esferas de masa m ubicadas sobre el eje y?',
      o: ['2mb²', 'mb²', 'Nada', '2mb² + 2Ma²'], a: 2,
      w: 'Están sobre el eje: su distancia perpendicular es r = 0. No se mueven, no tienen Ec y no suman a I. Por eso I_y = 2Ma².' },
    { q: 'Una bola de billar choca de frente y en forma elástica con otra idéntica en reposo. Después del choque…',
      o: ['las dos salen con la mitad de la velocidad', 'la primera se detiene y la segunda sale con la velocidad de la primera', 'la primera rebota con la misma rapidez', 'quedan pegadas'], a: 1,
      w: 'Con masas iguales y e = 1, las velocidades se intercambian. Así se conservan p y Ec a la vez.' },
    { q: 'Un volante gira a 600 rpm y tiene I = 2 kg·m². ¿Cuánto vale su energía cinética de rotación?',
      o: ['360 000 J', '3 948 J', '628 J', '1 200 J'], a: 1,
      w: 'Hay que pasar a rad/s: ω = 600·2π/60 ≈ 62,8 rad/s. Ec = ½·2·62,8² ≈ 3 948 J. Usar 600 directamente da el primer valor, que es incorrecto.' },
    { q: 'Un cuerpo rígido tiene ΣF = 0 pero Στ ≠ 0. Si estaba en reposo…',
      o: ['sigue en reposo', 'su centro de masa acelera', 'empieza a girar pero su centro de masa no se traslada', 'se traslada y gira'], a: 2,
      w: 'Se cumple la primera condición de equilibrio pero no la segunda: no hay aceleración del CM, pero sí aceleración angular. Es el caso (c) del apunte de la Unidad 11.' },
    { q: 'El momento de inercia de un cuerpo depende de…',
      o: ['sólo de su masa', 'de su masa y de su velocidad angular', 'de su masa, de cómo está distribuida y del eje elegido', 'sólo de su forma'], a: 2,
      w: 'I = Σ m_i r_i². Cambia si cambia la masa, si la masa se reparte distinto o si se elige otro eje. No depende de ω.' }
  ];
  const list = document.getElementById('quiz-list'), score = document.getElementById('score');
  if (!list) return;
  let ok = 0, done = 0;
  const upd = () => { score.textContent = `${ok} de ${done} correctas · ${Q.length - done} sin responder`; };
  Q.forEach((it, i) => {
    const card = document.createElement('div'); card.className = 'q';
    const h = document.createElement('h4'); h.textContent = `${i + 1}. ${it.q}`; card.appendChild(h);
    const opts = document.createElement('div'); opts.className = 'opts';
    const why = document.createElement('p'); why.className = 'why'; why.hidden = true;
    it.o.forEach((t, j) => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = t;
      b.addEventListener('click', () => {
        [...opts.children].forEach((x, k) => { x.disabled = true; if (k === it.a) x.classList.add('ok'); });
        if (j !== it.a) b.classList.add('bad'); else ok++;
        done++; why.textContent = (j === it.a ? 'Correcto. ' : 'No. ') + it.w; why.hidden = false; upd();
      });
      opts.appendChild(b);
    });
    card.appendChild(opts); card.appendChild(why); list.appendChild(card);
  });
  upd();
})();
