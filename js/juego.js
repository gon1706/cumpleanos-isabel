
/* PROYECTO ISABEL — MOTOR DE AVENTURA
   Compatible con el index.html y estilos.css
   que estamos construyendo.
*/

"use strict";

const $ = id => document.getElementById(id);
const screens = ["intro", "map", "world", "end"];

const worlds = {
  dream: {
    name: "Isla del alba",
    description: "Algunos sueños dejan pistas incluso antes de tener nombre.",
    className: "dream"
  },
  stars: {
    name: "Constelación violeta",
    description: "Siete luces esperan que descubras su dibujo secreto.",
    className: "stars"
  },
  stage: {
    name: "Bahía de los ecos",
    description: "Cada recuerdo tiene su propio ritmo.",
    className: "stage"
  },
  memory: {
    name: "Faro del tiempo",
    description: "Hay cosas que solo comprendemos al mirar el camino recorrido.",
    className: "memory"
  }
};

const state = {
  completed: new Set(),
  current: null,
  found: new Set(),
  stars: [],
  melody: [],
  memoryOpen: new Set()
};

function show(id) {
  screens.forEach(screen => {
    const element = $(screen);

    if (element) {
      element.classList.toggle("hidden", screen !== id);
    }
  });

  window.scrollTo({ top: 0, behavior: "smooth" });

  // Preparar la experiencia final al entrar
  if (id === "end" && typeof buildEnding === "function") {
    buildEnding();
  }
}


function message(text) {
  const element = $("world-message");
  if (element) element.textContent = text;
}

function updateCounter() {
  const counter = $("counter");
  if (counter) {
    counter.textContent = `✦ ${state.completed.size}/4`;
  }

  document.querySelectorAll("[data-world]").forEach(button => {
    const done = state.completed.has(button.dataset.world);
    button.classList.toggle("completed", done);
  });
}


function completeWorld(id) {
  if (state.completed.has(id)) return;

  state.completed.add(id);
  updateCounter();

  message("✦ ¡Has recuperado un nuevo fragmento de tu aventura!");

  const area = $("play-area");

  const next = document.createElement("button");
  next.className = "gold";
  next.textContent = state.completed.size === 4
    ? "DESCUBRIR EL SECRETO FINAL ✨"
    : "REGRESAR AL MAPA 🗺️";

  next.style.cssText =
    "display:block;margin:30px auto;position:relative;z-index:5";

  next.onclick = () => {
    if (state.completed.size === 4) {
      show("end");
    } else {
      show("map");
    }
  };

  area.appendChild(next);

  // Mostrar la recompensa de esta isla
  showIslandReward(id);
}


function openWorld(id) {
  const world = worlds[id];
  if (!world) return;

  state.current = id;
  state.found.clear();
  state.stars = [];
  state.melody = [];
  state.memoryOpen.clear();

  $("world-title").textContent = world.name;
  $("world-description").textContent = world.description;
  $("world-progress").textContent =
    state.completed.has(id) ? "✦ Fragmento encontrado" : "✧ Misterio pendiente";

  const scene = $("world-scene");
  scene.className = `world-scene ${world.className}`;

  $("play-area").innerHTML = "";
  message("");
  show("world");

  if (id === "dream") buildDream();
  if (id === "stars") buildStars();
  if (id === "stage") buildStage();
  if (id === "memory") buildMemory();
}

/* NAVEGACIÓN ANIMADA ENTRE ISLAS */

let shipIsTravelling = false;

const islandPositions = {
  dream: { x: 23, y: 42 },
  stars: { x: 76, y: 38 },
  stage: { x: 32, y: 78 },
  memory: { x: 76, y: 78 }
};

function chopperSay(text) {
  const bubble = document.getElementById("chopper-bubble");
  if (bubble) bubble.textContent = text;
}



/* ==========================================
   SUNNY DE LOS SUEÑOS
   NAVEGACIÓN HACIA LOS PUERTOS
   ========================================== */

function travelToIsland(id) {
  if (shipIsTravelling || !islandPositions[id]) return;

  const ship = document.getElementById("ship");
  const ocean = document.getElementById("ocean");

  if (!ship || !ocean) {
    openWorld(id);
    return;
  }

  shipIsTravelling = true;

  document.querySelectorAll("[data-world]").forEach(button => {
    button.disabled = true;
  });

  chopperSay(
    "¡Sujétate fuerte, Isabel! ¡Zarpamos hacia una nueva aventura!"
  );

  /*
    Posiciones de los puertos sobre el mapa.

    Cada coordenada indica dónde se detendrá
    el CENTRO del barco, en porcentaje.
  */
  const ports = {
    dream:  { x: 43, y: 36 },
    stars:  { x: 59, y: 36 },
    stage:  { x: 43, y: 68 },
    memory: { x: 55, y: 65 }
  };

  const port = ports[id];

  if (!port) {
    shipIsTravelling = false;

    document.querySelectorAll("[data-world]").forEach(button => {
      button.disabled = false;
    });

    openWorld(id);
    return;
  }

  // Convertir porcentajes a píxeles.
  const x = ocean.clientWidth * port.x / 100;
  const y = ocean.clientHeight * port.y / 100;

  // Mantener el centro del Sunny en el puerto.
  const shipX = x - ship.offsetWidth / 2;
  const shipY = y - ship.offsetHeight / 2;

  ship.style.transition =
    "left 3s ease-in-out, top 3s ease-in-out";

  ship.style.left = `${shipX}px`;
  ship.style.top = `${shipY}px`;

  setTimeout(() => {
    shipIsTravelling = false;

    document.querySelectorAll("[data-world]").forEach(button => {
      button.disabled = false;
    });

    chopperSay(
      "¡Llegamos, Isabel! ¡Vamos a explorar esta isla!"
    );

    openWorld(id);
  }, 3200);
}



/* Sustituimos la navegación directa por el viaje */

document.querySelectorAll("[data-world]").forEach(button => {
  const replacement = button.cloneNode(true);
  button.replaceWith(replacement);

  replacement.addEventListener("click", () => {
    travelToIsland(replacement.dataset.world);
  });
});



function createButton(text, className, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = text;
  button.className = className;
  button.addEventListener("click", onClick);
  return button;
}

function addTitle(area, text) {
  const title = document.createElement("p");
  title.textContent = text;
  title.style.cssText =
    "text-align:center;font-size:18px;font-weight:800;padding:12px;position:relative;z-index:2";
  area.appendChild(title);
}

/* ======================================
   ISLA 1 — OBJETOS ESCONDIDOS
====================================== */




function buildDream() {
  const area = $("play-area");

  addTitle(area, "🌅 El jardín de los sueños olvidados");

  const introduction = document.createElement("p");
  introduction.className = "dream-introduction";
  introduction.textContent =
    "En este jardín descansan tres tesoros. Cada uno protege una parte de una historia que comenzó hace muchos años. Chopper necesita tu ayuda para descubrirlos.";
  area.appendChild(introduction);

  const clue = document.createElement("div");
  clue.className = "dream-clue";
  area.appendChild(clue);

  const treasureGrid = document.createElement("div");
  treasureGrid.className = "dream-treasure-grid";
  area.appendChild(treasureGrid);

  const progress = document.createElement("p");
  progress.className = "dream-progress";
  area.appendChild(progress);

  const storyPanel = document.createElement("div");
  storyPanel.className = "dream-story-panel";
  storyPanel.hidden = true;
  area.appendChild(storyPanel);

  const treasures = [
    {
      symbol: "🗝️",
      title: "El secreto de los comienzos",
      clue:
        "Soy pequeña, pero a veces separo lo imposible de lo posible. Puedo descansar años en un bolsillo o cajon, hasta que llega el momento en que alguien necesita cruzar al otro lado. ¿Qué soy?",
      story:
        "Hace muchos años, una niña tenía un sueño sencillo, pero poderoso: ser mejor cada día.\n\nCon el tiempo, aquella niña descubriría que los grandes cambios no siempre comienzan con grandes acontecimientos. A veces nacen de una pequeña decisión y del valor de dar el primer paso."
    },
    {
      symbol: "📖",
      title: "El secreto de los caminos",
      clue:
        "Tengo muchas hojas, pero nunca he sido un árbol. Puedo contar mil vidas sin haber vivido ninguna y enseñarte lugares que mis pies jamás recorrieron. ¿Qué soy?",
      story:
        "Aquella niña creció. Llegaron nuevas responsabilidades, estudios, trabajo y decisiones que exigían valentía.\n\nHubo un momento en el que tuvo que construir su camino lejos de su familia, sin dejar de perseguir sus metas. Cada esfuerzo se convirtió en una nueva página de su historia."
    },
    {
      symbol: "🌱",
      title: "El secreto de lo que vendrá",
      clue:
        "Duermo bajo la tierra sin tener una cama. No tengo manos, pero puedo alcanzar el cielo y aunque nadie vea lo que guardo, con agua y paciencia puedo mostrartelo. ¿Qué soy?",
      story:
        "Hoy, aquella niña continúa creciendo. Ha conseguido cosas que antes parecían lejanas y todavía tiene muchos sueños por cumplir.\n\nPorque su historia no está terminada. Cada día sigue sembrando nuevas oportunidades, aprendiendo y acercándose a la persona que desea ser."
    }
  ];

  let currentStep = 0;
  let waitingForNext = false;

  function showStep() {
    const current = treasures[currentStep];

    waitingForNext = false;
    storyPanel.hidden = true;
    storyPanel.replaceChildren();

    clue.textContent =
      `🔎 Misterio ${currentStep + 1}\n\n${current.clue}`;

    progress.textContent =
      `Fragmentos descubiertos: ${currentStep} de 3`;

    treasureGrid.replaceChildren();

    // Mantener las opciones en una posición estable
    [0, 1, 2].forEach(index => {
      const treasure = treasures[index];

      const button = createButton(
        treasure.symbol,
        "game-object",
        () => {
          if (waitingForNext) return;

          if (index !== currentStep) {
            message(
              "Chopper cree que ese tesoro pertenece a otro misterio. ¡Observa bien las palabras de la pista!"
            );
            return;
          }

          waitingForNext = true;
          state.found.add(index);
          button.classList.add("found");

          // Evitar que las alternativas sigan activas
          treasureGrid.querySelectorAll("button").forEach(
            item => item.disabled = true
          );

          message("");

          clue.textContent = "✨ ¡Misterio resuelto!";
          progress.textContent =
            `Fragmentos descubiertos: ${currentStep + 1} de 3`;

          const heading = document.createElement("h3");
          heading.textContent =
            `${current.symbol} ${current.title}`;

          const paragraph = document.createElement("p");
          paragraph.textContent = current.story;

          const nextButton = document.createElement("button");
          nextButton.type = "button";
          nextButton.className = "dream-next-button";

          const isLast = currentStep === treasures.length - 1;

          nextButton.textContent = isLast
            ? "✨ Completar el jardín"
            : "Continuar al siguiente acertijo →";

          nextButton.addEventListener("click", () => {
            if (isLast) {
              chopperSay(
                "¡Lo lograste, Isabel! Cada tesoro representa una parte de tu historia. ¡Y lo mejor todavía está por venir!"
              );
              completeWorld("dream");
              return;
            }

            currentStep++;
            message("");
            chopperSay(
              "¡Muy bien, Isabel! Hay otro misterio esperando por ti."
            );
            showStep();
          }, { once: true });

          
storyPanel.append(heading, paragraph);

// Secreto literario exclusivo del segundo acertijo
if (currentStep === 1) {
  const literaryNote = document.createElement("div");
  literaryNote.className = "dream-literary-note";

  const inscription = document.createElement("p");
  inscription.textContent =
    "Hay mapas que no señalan lugares, sino sueños que todavía esperan cumplirse. Y hay inviernos que parecen eternos, hasta que un día descubrimos que la nieve también puede dejar de caer.";

  const secretButton = document.createElement("button");
  secretButton.type = "button";
  secretButton.className = "dream-secret-button";
  secretButton.textContent = "✉️ Una nota escondida entre páginas";

  const secretText = document.createElement("p");
  secretText.className = "dream-secret-text";
  secretText.hidden = true;
  secretText.textContent =
    "Algunas historias nos acompañan mucho después de cerrar un libro. Quizá estas palabras te recuerden a dos historias que conoces muy bien. Y quizá, Isabel, algún día descubras que tu propia historia también merece ser contada.";

  secretButton.addEventListener("click", () => {
    secretText.hidden = !secretText.hidden;
    secretButton.textContent = secretText.hidden
      ? "✉️ Una nota escondida entre páginas"
      : "📖 Guardar el secreto";
  });

  literaryNote.append(
    inscription,
    secretButton,
    secretText
  );

  storyPanel.appendChild(literaryNote);
}

storyPanel.appendChild(nextButton);
storyPanel.hidden = false;


          chopperSay(
            "¡Encontraste un fragmento de la historia! Léelo con calma. Continuaremos cuando estés lista."
          );
        }
      );

      button.setAttribute(
        "aria-label",
        `Seleccionar ${treasure.title}`
      );

      treasureGrid.appendChild(button);
    });
  }

  showStep();
}




/* ======================================
   ISLA 2 — SIETE ESTRELLAS
====================================== */


function buildStars() {
  const area = $("play-area");

  addTitle(area, "🌌 El cielo de los recuerdos");

  const intro = document.createElement("p");
  intro.className = "stars-intro";
  intro.textContent =
    "Siete estrellas guardan fragmentos de una historia. Descúbrelos todos y reconstruye el camino que los une.";
  area.appendChild(intro);

  const memories = [
    {
      name: "El primer sueño",
      icon: "🌱",
      text: "Todo comenzó con una niña que quería superarse cada día, aunque todavía no conocía los caminos que la esperaban."
    },
    {
      name: "Las raíces",
      icon: "🏡",
      text: "Su familia y los recuerdos de Lima forman parte de sus raíces, incluso cuando la vida la lleva a otros lugares."
    },
    {
      name: "El gran paso",
      icon: "🧭",
      text: "Un día tuvo el valor de comenzar una etapa lejos de su familia, en Huancayo, llevando consigo sus sueños."
    },
    {
      name: "El esfuerzo",
      icon: "💪",
      text: "Trabajar, ahorrar y construir su independencia requirió constancia, responsabilidad y muchas decisiones."
    },
    {
      name: "El primer logro",
      icon: "🎓",
      text: "Su formación técnica en Administración fue una prueba de que la dedicación puede convertirse en un logro real."
    },
    {
      name: "El presente",
      icon: "💼",
      text: "Hoy aplica sus conocimientos en el área administrativa de un colegio y continúa creciendo profesionalmente."
    },
    {
      name: "Lo que viene",
      icon: "✨",
      text: "Mientras trabaja, continúa sus estudios universitarios relacionados con la gestión del talento humano. Su historia sigue avanzando."
    }
  ];

  // Posiciones de las estrellas en el cielo
  const positions = [
    [14, 40],
    [32, 18],
    [52, 43],
    [72, 20],
    [86, 58],
    [57, 76],
    [25, 72]
  ];

  const sky = document.createElement("div");
  sky.className = "stars-sky";
  area.appendChild(sky);

  const svg = document.createElementNS(
    "http://www.w3.org/2000/svg", "svg"
  );
  svg.setAttribute("viewBox", "0 0 100 100");
  svg.setAttribute("preserveAspectRatio", "none");
  svg.classList.add("stars-lines");
  sky.appendChild(svg);

  const counter = document.createElement("p");
  counter.className = "stars-counter";
  counter.textContent = "Estrellas descubiertas: 0 de 7";
  area.appendChild(counter);

  const memoryPanel = document.createElement("div");
  memoryPanel.className = "stars-memory-panel";
  memoryPanel.hidden = true;
  area.appendChild(memoryPanel);

  const orderingPanel = document.createElement("div");
  orderingPanel.className = "stars-ordering";
  orderingPanel.hidden = true;
  area.appendChild(orderingPanel);

  const discovered = new Set();
  let finished = false;

  // El orden en el que aparecerán las tarjetas
  const shuffledOrder = [4, 1, 6, 2, 0, 5, 3];
  let remaining = [...shuffledOrder];
  let selected = [];

  function revealMemory(index) {
    if (finished) return;

    const memory = memories[index];
    discovered.add(index);

    state.stars = [...discovered];

    const starButton = sky.querySelector(
      `[data-star="${index}"]`
    );

    if (starButton) {
      starButton.classList.add("active");
    }

    counter.textContent =
      `Estrellas descubiertas: ${discovered.size} de 7`;

    memoryPanel.replaceChildren();

    const title = document.createElement("h3");
    title.textContent = `${memory.icon} ${memory.name}`;

    const paragraph = document.createElement("p");
    paragraph.textContent = memory.text;

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "stars-action-button";
    closeButton.textContent = "Cerrar recuerdo";

    closeButton.addEventListener("click", () => {
      memoryPanel.hidden = true;

      if (discovered.size === memories.length) {
        showOrdering();
      }
    });

    memoryPanel.append(title, paragraph, closeButton);
    memoryPanel.hidden = false;

    chopperSay(
      "¡Una estrella ha recuperado su luz! Cada recuerdo tiene algo importante que contar."
    );
  }

  positions.forEach(([x, y], index) => {
    const button = createButton(
      "✦",
      "game-object star-object",
      () => revealMemory(index)
    );

    button.dataset.star = index;
    button.style.left = `${x}%`;
    button.style.top = `${y}%`;
    button.style.transform = "translate(-50%, -50%)";
    button.setAttribute(
      "aria-label",
      `Descubrir estrella ${index + 1}`
    );

    sky.appendChild(button);
  });

  
function showOrdering() {
  if (finished || discovered.size < memories.length) return;

  orderingPanel.hidden = false;
  orderingPanel.replaceChildren();

  const heading = document.createElement("h3");
  heading.textContent = "✨ Has recuperado las siete estrellas";

  const explanation = document.createElement("p");
  explanation.textContent =
    "Cada estrella representa un momento de tu historia, Isabel. Algunas hablan de tus comienzos, otras de tu valentía y otras de todo lo que todavía está por venir. Ahora descubre lo que pueden crear juntas.";

  const uniteButton = document.createElement("button");
  uniteButton.type = "button";
  uniteButton.className = "stars-action-button";
  uniteButton.textContent = "✨ Unir las siete estrellas";

  uniteButton.addEventListener("click", () => {
    if (finished) return;
    finished = true;

    drawConstellation();

    heading.textContent = "🌌 La constelación de Isabel";

    explanation.textContent =
      "No son solamente siete estrellas. Son siete recuerdos de una persona que ha aprendido, trabajado, tomado decisiones valientes y seguido adelante. Cada paso tiene su propia luz, y juntos forman una historia que todavía tiene mucho por brillar.";

    uniteButton.remove();

    chopperSay(
      "¡Mira, Isabel! ¡Es tu propia constelación! Cada estrella representa algo que has conseguido. ¡Y todavía quedan muchas por descubrir!"
    );

    const finishButton = document.createElement("button");
    finishButton.type = "button";
    finishButton.className = "stars-action-button";
    finishButton.textContent = "🌟 Recibir el fragmento estelar";

    finishButton.addEventListener(
  "click",
  () => {
    completeWorld("stars");
  },
  { once: true }
);

    orderingPanel.appendChild(finishButton);

    // Mostrar el cielo iluminado
    sky.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }, { once: true });

  orderingPanel.append(
    heading,
    explanation,
    uniteButton
  );
}


  function drawConstellation() {
    for (let index = 1; index < positions.length; index++) {
      const previous = positions[index - 1];
      const current = positions[index];

      const line = document.createElementNS(
        "http://www.w3.org/2000/svg", "line"
      );

      line.setAttribute("x1", previous[0]);
      line.setAttribute("y1", previous[1]);
      line.setAttribute("x2", current[0]);
      line.setAttribute("y2", current[1]);
      line.setAttribute("stroke", "#ffe5a0");
      line.setAttribute("stroke-width", ".8");

      svg.appendChild(line);
    }
  }
}


function showStarReward(onFinish) {
  const overlay = document.createElement("div");
  overlay.className = "star-reward-overlay";

  overlay.innerHTML = `
    <div class="star-reward-content">
      <div class="star-reward-sparkles">✦ ✧ ✦</div>

      <div class="star-reward-crystal">💎</div>

      <h2>¡Fragmento estelar conseguido!</h2>

      <p>
        Cada estrella representa un paso de tu historia,
        Isabel. Y juntas demuestran lo lejos que has llegado.
      </p>

      <div class="star-reward-chopper">
        <div class="star-reward-dialogue" id="reward-dialogue"
             aria-live="polite">
          ¡Lo sabía! Gonzalo me contó que eres muy inteligente,
          Isabel. ¡Pero ahora lo he comprobado yo mismo!
        </div>

        <img
          id="reward-chopper-image"
          alt="Chopper celebrando el logro"
        >
      </div>

      <button class="star-reward-continue" type="button">
        💬 Escuchar a Chopper
      </button>
    </div>
  `;

  document.body.appendChild(overlay);

  // Reutilizar la imagen de Chopper que ya funciona
  const originalChopper = document.querySelector(
    "#chopper img, .chopper img, img[alt*='Chopper']"
  );

  const rewardChopper = overlay.querySelector(
    "#reward-chopper-image"
  );

  if (originalChopper && originalChopper.src) {
    rewardChopper.src = originalChopper.src;
  } else {
    rewardChopper.replaceWith(
      document.createTextNode("🐾")
    );
  }

  const dialogue = overlay.querySelector("#reward-dialogue");
  const button = overlay.querySelector(".star-reward-continue");

  const phrases = [
    "¡Lo sabía! Gonzalo me contó que eres muy inteligente, Isabel. ¡Pero ahora lo he comprobado yo mismo!",
    "También me contó que trabajas, estudias y que nunca dejas de esforzarte por tus sueños. ¡Eso es admirable!",
    "¿Sabes algo? Gonzalo me habló mucho de ti. Me dijo que está muy orgulloso de la persona en la que te estás convirtiendo."
  ];

  let phraseIndex = 0;

  button.addEventListener("click", () => {
    phraseIndex++;

    if (phraseIndex < phrases.length) {
      dialogue.classList.remove("reward-dialogue-enter");

      // Reiniciar la pequeña animación del diálogo
      void dialogue.offsetWidth;

      dialogue.textContent = phrases[phraseIndex];
      dialogue.classList.add("reward-dialogue-enter");

      if (phraseIndex === phrases.length - 1) {
        button.textContent = "✨ Guardar mi fragmento";
      }
      return;
    }

    button.disabled = true;
    overlay.classList.add("star-reward-exit");

    setTimeout(() => {
      overlay.remove();

      if (typeof onFinish === "function") {
        onFinish();
      }
    }, 650);
  });
}


/* ======================================
   ISLA 3 — MELODÍA INTERACTIVA
====================================== */


function crearMusicaFestival() {
  const AudioContextClass =
    window.AudioContext || window.webkitAudioContext;

  let contexto = null;
  let temporizador = null;
  let paso = 0;
  let reproduciendo = false;
  let volumen = 0.18;

  const melodias = {
    bts: {
      tempo: 118,
      notas: [392, 493.88, 587.33, 493.88,
              440, 392, 329.63, 440]
    },
    tini: {
      tempo: 112,
      notas: [523.25, 659.25, 783.99, 659.25,
              587.33, 523.25, 440, 493.88]
    },
    paulo: {
      tempo: 94,
      notas: [329.63, 392, 440, 392,
              293.66, 329.63, 261.63, 293.66]
    }
  };

  function tocarNota(frecuencia, duracion, tipo) {
    if (!contexto) return;

    const oscilador = contexto.createOscillator();
    const ganancia = contexto.createGain();
    const inicio = contexto.currentTime;

    oscilador.type = tipo;
    oscilador.frequency.setValueAtTime(frecuencia, inicio);

    ganancia.gain.setValueAtTime(0.0001, inicio);
    ganancia.gain.exponentialRampToValueAtTime(
      volumen, inicio + 0.025
    );
    ganancia.gain.exponentialRampToValueAtTime(
      0.0001, inicio + duracion
    );

    oscilador.connect(ganancia);
    ganancia.connect(contexto.destination);

    oscilador.start(inicio);
    oscilador.stop(inicio + duracion + 0.02);
  }

  function detener() {
    reproduciendo = false;
    clearInterval(temporizador);
    temporizador = null;
  }

  async function reproducir(artista) {
    const melodia = melodias[artista];
    if (!melodia || !AudioContextClass) return false;

    detener();

    try {
      if (!contexto) {
        contexto = new AudioContextClass();
      }

      await contexto.resume();

      paso = 0;
      reproduciendo = true;

      const intervalo = 60000 / melodia.tempo / 2;

      function siguienteNota() {
        if (!reproduciendo) return;

        const frecuencia =
          melodia.notas[paso % melodia.notas.length];

        const tipo =
          artista === "paulo" ? "triangle" : "sine";

        tocarNota(frecuencia, intervalo / 1000 * 0.85, tipo);

        paso++;
      }

      siguienteNota();
      temporizador = setInterval(siguienteNota, intervalo);

      return true;
    } catch (error) {
      console.warn("No se pudo iniciar la música:", error);
      detener();
      return false;
    }
  }

  function cambiarVolumen(valor) {
    volumen = Math.max(0.001, Math.min(0.4, valor));
  }

  function cerrar() {
    detener();
    if (contexto) {
      contexto.close().catch(() => {});
      contexto = null;
    }
  }

  return {
    reproducir,
    detener,
    cambiarVolumen,
    cerrar,
    estaReproduciendo: () => reproduciendo
  };
}


function buildStage() {
  const area = $("play-area");
  if (!area) return;

  area.replaceChildren();
  state.melody = [];

  
const artists = [
  {
    id: "bts",
    name: "BTS",
    icon: "💜",
    song: "SWIM",
    file: "assets/musica/bts.mp3",
    image: "assets/artistas/bts.jpg",
    cutout: "assets/artistas/bts.png",
    hint: "Empieza por S y tiene cuatro letras."
  },
  {
    id: "tini",
    name: "Tini",
    icon: "💗",
    song: "Miénteme",
    file: "assets/musica/tini.mp3",
    image: "assets/artistas/tini.jpg",
    cutout: "assets/artistas/tini.png",
    hint: "Comienza con M y tiene ocho letras."
  },
  {
    id: "paulo",
    name: "Paulo Londra",
    icon: "💙",
    song: "Cuando Te Besé",
    file: "assets/musica/paulo.mp3",
    image: "assets/artistas/paulo.jpg",
    cutout: "assets/artistas/paulo.png",
    hint: "Son tres palabras: Cuando __ ___."
  }
];


  const completed = new Set();
  const audio = new Audio();
  audio.preload = "metadata";
  audio.volume = 0.65;

  let current = null;
  let timer = null;
  let animation = null;
  let context = null;
  let analyser = null;
  let frequencyData = null;
  let finished = false;
  let busy = false;
  let concertEnded = false;
  let messageIndex = -1;

  const root = document.createElement("div");
  root.className = "wc2-festival";

  root.innerHTML = `
    <header class="wc2-header">
      <span>✦ WHOLE CAKE MUSIC ✦</span>
      <h2>ISABEL WORLD TOUR</h2>
      <p>Una noche. Tres artistas. Una protagonista: Isabel.</p>
    </header>

    <div class="wc2-choice"></div>

  
<div class="wc2-stage" data-theme="bts">

  <div class="wc2-roof" aria-hidden="true">
    <div class="wc2-roof-beam"></div>
    <div class="wc2-roof-lamps">
      <i></i><i></i><i></i><i></i>
      <i></i><i></i><i></i><i></i>
    </div>
  </div>

  <div class="wc2-lights" aria-hidden="true">
    <i></i><i></i><i></i>
    <i></i><i></i><i></i>
  </div>

  <div class="wc2-atmosphere" aria-hidden="true"></div>
  <div class="wc2-stage-glow" aria-hidden="true"></div>

  <div class="wc2-top-sign">
    ISABEL · 24 · WORLD TOUR
  </div>

  <div class="wc2-side wc2-side-left">
    <span>★</span>
    <small>SOLO PARA TI</small>
  </div>

  <div class="wc2-main-screen">
    <img class="wc2-artist-image" alt="" hidden>
    <div class="wc2-symbol">🎤</div>
    <strong>ISABEL</strong>
    <small>EL ESCENARIO ES TUYO</small>
  </div>

  <div class="wc2-side wc2-side-right">
    <span>24</span>
    <small>FELIZ CUMPLEAÑOS</small>
  </div>

  <div class="wc2-message-banner"></div>
  <div class="wc2-bars" aria-hidden="true"></div>

  
  <div class="wc2-platform"></div>

  <div class="wc2-stage-steps" aria-hidden="true">
    <i></i><i></i><i></i>
  </div>

  <div class="wc2-audience" aria-hidden="true"></div>
  <div class="wc2-flash" aria-hidden="true"></div>
  <div class="wc2-countdown" hidden>3</div>

</div>

    <div class="wc2-controls" hidden>
      <button type="button" class="wc2-pause">⏸ Pausar</button>
      <label>
        🔊 Volumen
        <input class="wc2-volume" type="range"
               min="0" max="1" step="0.05" value="0.65">
      </label>
      <span class="wc2-clock">0:00 / 1:00</span>
    </div>

    <section class="wc2-guess" hidden>
      <h3>🎵 ¿Reconoces esta canción?</h3>
      <p>Puedes responder en cualquier momento del concierto.</p>

      <form class="wc2-form">
        <input class="wc2-answer" type="text"
               placeholder="Escribe el nombre de la canción"
               autocomplete="off" required>
        <button type="submit">¡Adivinar! ✨</button>
      </form>

      <p class="wc2-feedback" role="status"></p>
      <button type="button" class="wc2-hint">💡 Pedir una pista</button>
    </section>

    <section class="wc2-chopper-message" hidden>
      <img src="assets/personajes/Chopper.png" alt="Chopper">
      <div>
        <h3>¡Excelente, Isabel! 🌟</h3>
        <p>
          ¡Gonzalo me había contado tus preferencias musicales!
          ¡Sabía que reconocerías esta canción!
          Pero todavía nos quedan sorpresas por descubrir.
        </p>
        <button type="button" class="wc2-next">Continuar →</button>
      </div>
    </section>

    <p class="wc2-status" role="status">
      Elige a tu primer artista para comenzar el espectáculo.
    </p>
  `;

  area.appendChild(root);

  const choice = root.querySelector(".wc2-choice");
  const stage = root.querySelector(".wc2-stage");
  const controls = root.querySelector(".wc2-controls");
  const guess = root.querySelector(".wc2-guess");
  const chopperMessage = root.querySelector(".wc2-chopper-message");
  const status = root.querySelector(".wc2-status");
  const clock = root.querySelector(".wc2-clock");
  const pauseButton = root.querySelector(".wc2-pause");
  const answer = root.querySelector(".wc2-answer");
  const feedback = root.querySelector(".wc2-feedback");
  const hintButton = root.querySelector(".wc2-hint");
  const bars = root.querySelector(".wc2-bars");
  const banner = root.querySelector(".wc2-message-banner");
  const flash = root.querySelector(".wc2-flash");
  const audience = root.querySelector(".wc2-audience");

  for (let i = 0; i < 32; i++) {
    bars.appendChild(document.createElement("i"));
  }

  for (let i = 0; i < 45; i++) {
    const light = document.createElement("span");
    light.textContent = i % 3 === 0 ? "✦" : "✧";
    light.style.setProperty("--delay", `${(i % 11) * -0.17}s`);
    audience.appendChild(light);
  }

  function normalize(value) {
    return value.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");
  }

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remaining = Math.floor(seconds % 60);
    return `${minutes}:${String(remaining).padStart(2, "0")}`;
  }

  function isActive() {
    return root.isConnected && !root.closest(".hidden");
  }

  function prepareAnalyzer() {
    if (analyser) return;

    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return;

    try {
      context = new AudioContextClass();
      const source = context.createMediaElementSource(audio);
      analyser = context.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.72;

      frequencyData = new Uint8Array(analyser.frequencyBinCount);
      source.connect(analyser);
      analyser.connect(context.destination);
    } catch (error) {
      console.warn("No se pudo activar el analizador:", error);
    }
  }

  function stopAnimation() {
    if (animation !== null) {
      cancelAnimationFrame(animation);
      animation = null;
    }
    stage.classList.remove("wc2-playing");
    flash.style.opacity = "0";
    banner.classList.remove("visible");
  }

  function stopAudio() {
    clearInterval(timer);
    timer = null;
    audio.pause();
    stopAnimation();
  }

  function cleanExit() {
    stopAudio();
    audio.removeAttribute("src");
    audio.load();
  }

  const observer = new MutationObserver(() => {
    if (!isActive()) {
      cleanExit();
      observer.disconnect();
    }
  });

  observer.observe(document.body, {
    attributes: true,
    subtree: true,
    attributeFilter: ["class"]
  });

  function startAnimation() {
    stopAnimation();
    stage.classList.add("wc2-playing");

    const messages = [
      { time: 8, text: "✨ ¡Isabel, este concierto es solo para ti!" },
      { time: 23, text: "💖 ¡Hoy todas las luces brillan por tus 24 años!" },
      { time: 42, text: "🌟 ¡Que nunca dejes de perseguir tus sueños!" }
    ];

    messageIndex = -1;

    function frame() {
      if (!isActive() || audio.paused) {
        animation = null;
        return;
      }

      if (analyser && frequencyData) {
        analyser.getByteFrequencyData(frequencyData);

        const bass = frequencyData
          .slice(0, 12)
          .reduce((sum, value) => sum + value, 0) / (12 * 255);

        const energy = frequencyData
          .reduce((sum, value) => sum + value, 0) /
          (frequencyData.length * 255);

        stage.style.setProperty("--wc2-energy", energy.toFixed(3));
        stage.style.setProperty("--wc2-bass", bass.toFixed(3));

        bars.querySelectorAll("i").forEach((bar, index) => {
          const bin = Math.min(
            frequencyData.length - 1,
            2 + index * 2
          );
          const height = 0.3 + frequencyData[bin] / 255 * 3.5;
          bar.style.transform = `scaleY(${height})`;
        });

        flash.style.opacity =
          bass > 0.52 ? String(Math.min(0.22, bass * 0.24)) : "0";
      }

      const seconds = audio.currentTime;

      messages.forEach((item, index) => {
        if (seconds >= item.time &&
            seconds < item.time + 5 &&
            messageIndex !== index) {
          messageIndex = index;
          banner.textContent = item.text;
          banner.classList.add("visible");
        }

        if (seconds >= item.time + 5 &&
            messageIndex === index) {
          banner.classList.remove("visible");
        }
      });

      animation = requestAnimationFrame(frame);
    }

    frame();
  }

  function updateChoices() {
    choice.replaceChildren();

    artists.forEach(artist => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "wc2-artist";
      button.disabled =
        completed.has(artist.id) || busy || finished;

      button.textContent =
        `${completed.has(artist.id) ? "✅" : artist.icon} ${artist.name}`;

      button.addEventListener("click", () => startConcert(artist));
      choice.appendChild(button);
    });
  }

  async function startConcert(artist) {
    if (busy || finished || completed.has(artist.id)) return;

    stopAudio();

    current = artist;
    busy = true;
    concertEnded = false;

    choice.hidden = true;
    controls.hidden = false;
    guess.hidden = false;
    chopperMessage.hidden = true;

    feedback.textContent = "";
    answer.value = "";
    hintButton.hidden = false;

    stage.dataset.theme = artist.id;
    stage.querySelector(".wc2-symbol").textContent = artist.icon;
    stage.querySelector(".wc2-main-screen strong").textContent = artist.name;
    
const artistImage = stage.querySelector(".wc2-artist-image");

artistImage.src = artist.image;
artistImage.alt = `Imagen de ${artist.name}`;
artistImage.hidden = false;


stage.classList.remove("wc2-has-artist", "wc2-reveal");
stage.classList.add("wc2-intro");

clearTimeout(stage._introTimer);
clearTimeout(stage._revealTimer);

stage._introTimer = setTimeout(() => {
  if (!stage.isConnected || current !== artist) return;

  stage.classList.remove("wc2-intro");
  stage.classList.add("wc2-reveal");

  stage._revealTimer = setTimeout(() => {
    if (!stage.isConnected || current !== artist) return;
    stage.classList.add("wc2-has-artist");


  }, 1300);
}, 1800);



    pauseButton.textContent = "⏸ Pausar";
    clock.textContent = "0:00 / 1:00";
    status.textContent = `🎤 ¡Bienvenida al concierto de ${artist.name}!`;

    audio.src = artist.file;
    audio.currentTime = 0;

    try {
      prepareAnalyzer();

      if (context && context.state === "suspended") {
        await context.resume();
      }

      await audio.play();
      startAnimation();

      if (typeof lanzarConfetiConcierto === "function") {
        lanzarConfetiConcierto(artist.id);
      }

      timer = setInterval(() => {
        if (!isActive()) {
          cleanExit();
          return;
        }

        const elapsed = audio.currentTime || 0;
        clock.textContent = formatTime(elapsed);

        // La música puede continuar después del primer minuto.
// Isabel decidirá cuándo pasar al siguiente concierto.
      }, 200);

    } catch (error) {
      console.error("Error al reproducir:", error);
      stopAudio();
      busy = false;
      choice.hidden = false;
      controls.hidden = true;
      guess.hidden = true;

      status.textContent =
        `No se pudo reproducir ${artist.file}. Revisa el archivo.`;

      updateChoices();
    }
  }

  function endConcert() {
    if (!current || !busy || concertEnded) return;

    concertEnded = true;
    stopAudio();
    controls.hidden = true;
    guess.hidden = false;

    status.textContent =
      "🎵 El espectáculo terminó, pero todavía puedes adivinar la canción.";
  }

  audio.addEventListener("ended", endConcert);

  pauseButton.addEventListener("click", async () => {
    if (!current || concertEnded) return;

    if (audio.paused) {
      try {
        if (context && context.state === "suspended") {
          await context.resume();
        }
        await audio.play();
        startAnimation();
        pauseButton.textContent = "⏸ Pausar";
      } catch (error) {
        status.textContent = "No se pudo reanudar la música.";
      }
    } else {
      audio.pause();
      stopAnimation();
      pauseButton.textContent = "▶ Reanudar";
    }
  });

  root.querySelector(".wc2-volume").addEventListener("input", event => {
    audio.volume = Number(event.target.value);
  });

  root.querySelector(".wc2-form").addEventListener("submit", event => {
    event.preventDefault();
    if (!current || guess.hidden) return;

    if (normalize(answer.value) !== normalize(current.song)) {
      feedback.textContent =
        "💗 ¡Casi! Inténtalo nuevamente o pide una pista.";
      return;
    }

    // La canción sigue reproduciéndose después de acertar.
// Isabel decide cuándo pasar al siguiente concierto.
completed.add(current.id);
    state.melody.push(current.id);

    guess.hidden = true;
    chopperMessage.hidden = false;
    status.textContent = "¡Acertaste! Chopper quiere felicitarte.";
    
const celebration = document.createElement("div");
celebration.className = "wc2-confetti";
stage.appendChild(celebration);

const colors = ["#ffd166", "#ff79c6", "#a78bfa", "#67e8f9", "#ffffff"];

for (let i = 0; i < 100; i++) {
  const piece = document.createElement("span");
  piece.style.left = `${Math.random() * 100}%`;
  piece.style.background = colors[i % colors.length];
  piece.style.animationDelay = `${Math.random() * 1.8}s`;
  piece.style.animationDuration = `${2.5 + Math.random() * 2}s`;
  piece.style.setProperty("--drift", `${Math.random() * 180 - 90}px`);
  celebration.appendChild(piece);
}

setTimeout(() => celebration.remove(), 6500);

  });

  hintButton.addEventListener("click", () => {
    if (!current) return;
    feedback.textContent = `💡 ${current.hint}`;
    hintButton.hidden = true;
  });

  root.querySelector(".wc2-next").addEventListener("click", () => {
    stopAudio();

    current = null;
    busy = false;
    concertEnded = false;

    chopperMessage.hidden = true;
    choice.hidden = false;

    stage.dataset.theme = "bts";
    stage.querySelector(".wc2-symbol").textContent = "🎤";
    stage.querySelector(".wc2-main-screen strong").textContent = "ISABEL";
    
stage.classList.remove("wc2-has-artist");

const artistImage = stage.querySelector(".wc2-artist-image");
artistImage.hidden = true;
artistImage.removeAttribute("src");


    updateChoices();

    if (completed.size === artists.length) {
      finished = true;
      choice.hidden = true;
      status.textContent =
        "🎉 ¡Los tres conciertos están completos! ¡Bravo, Isabel!";

      cleanExit();

      setTimeout(() => {
        if (isActive()) completeWorld("stage");
      }, 1200);
    } else {
      status.textContent =
        `✨ ${completed.size} de 3 conciertos completados. ¡Elige el siguiente!`;
    }
  });

  updateChoices();
}


/* ======================================
   ISLA 4 — CÁPSULA DE RECUERDOS
====================================== */


function buildMemory() {
  const area = $("play-area");

  // Reiniciar los capítulos al entrar a la isla
  state.memoryOpen = new Set();

  const chapters = [
    {
      symbol: "🌸",
      title: "La niña que soñaba",
      subtitle: "Capítulo I · Los primeros sueños",
      story:
        "Mucho antes de esta aventura, existía una niña llamada Isabel que soñaba con crecer, aprender y convertirse cada día en una mejor versión de sí misma.",
      message:
        "¡Qué bonito comienzo! Los sueños más importantes no siempre son enormes. A veces empiezan con las ganas de ser mejor que ayer.",
      photo: ""
    },
    {
      symbol: "🏡",
      title: "El lugar donde empezó todo",
      subtitle: "Capítulo II · Sus raíces",
      story:
        "En Lima quedaron personas, momentos y recuerdos que forman parte de quien eres. Aunque la vida te lleve a nuevos lugares, el cariño de tu familia sigue acompañándote.",
      message:
        "Gonzalo me dijo que tu familia es una parte muy importante de tu historia. ¡Los buenos recuerdos pueden viajar con nosotros a cualquier lugar!",
      photo: ""
    },
    {
      symbol: "🦋",
      title: "El valor de comenzar",
      subtitle: "Capítulo III · Una nueva etapa",
      story:
        "Llegar a Huancayo significó comenzar una etapa diferente: nuevos desafíos, nuevas responsabilidades y la oportunidad de construir tu propio camino. Y aun cuando no todo fue sencillo, continuaste avanzando.",
      message:
        "¡Eso requiere mucho valor, Isabel! A veces ser valiente no significa no tener miedo, sino seguir adelante incluso cuando algo es nuevo.",
      photo: ""
    },
    {
      symbol: "🌟",
      title: "Todo lo que estás logrando",
      subtitle: "Capítulo IV · La mujer de hoy",
      story:
        "Has trabajado, te has esforzado, has estudiado Administración y continuas tu formación universitaria mientras cumples nuevas responsabilidades. Cada esfuerzo forma parte de la persona en la que te estás convirtiendo.",
      message:
        "¡Ahora entiendo por qué Gonzalo admira tanto tu perseverancia! Y lo más emocionante es que tu historia todavía tiene muchos capítulos por delante.",
      photo: ""
    }
  ];

  const museum = document.createElement("div");
  museum.className = "memory-museum";

  museum.innerHTML = `
    <div class="memory-museum-header">
      <span class="memory-museum-tag">✦ EL MUSEO DE LOS RECUERDOS ✦</span>
      <h2>Isabel, esta es tu historia 💝</h2>
      <p>
        Cuatro capítulos. Cuatro momentos importantes.
        Una historia que todavía se está escribiendo.
      </p>
    </div>

    <div class="memory-museum-progress">
      <span class="memory-progress-text">Capítulos descubiertos: 0 / 4</span>
      <div class="memory-progress-track">
        <div class="memory-progress-fill"></div>
      </div>
    </div>

    <div class="memory-chapters"></div>
    <div class="memory-story-viewer" hidden></div>
    <div class="memory-museum-footer"></div>
  `;

  area.appendChild(museum);

  const chapterContainer = museum.querySelector(".memory-chapters");
  const viewer = museum.querySelector(".memory-story-viewer");
  const progressText = museum.querySelector(".memory-progress-text");
  const progressFill = museum.querySelector(".memory-progress-fill");
  const footer = museum.querySelector(".memory-museum-footer");

  let activeChapter = -1;
  let rewardReady = false;

  function updateProgress() {
    const count = state.memoryOpen.size;

    progressText.textContent =
      `Capítulos descubiertos: ${count} / ${chapters.length}`;

    progressFill.style.width =
      `${(count / chapters.length) * 100}%`;
  }

  function openChapter(index) {
    const chapter = chapters[index];

    if (!state.memoryOpen.has(index)) {
      state.memoryOpen.add(index);
      updateProgress();
    }

    activeChapter = index;

    chapterContainer.querySelectorAll(".memory-chapter-card")
      .forEach((card, cardIndex) => {
        card.classList.toggle("selected", cardIndex === index);
        card.classList.toggle(
          "discovered",
          state.memoryOpen.has(cardIndex)
        );
      });

    viewer.hidden = false;
    viewer.innerHTML = "";

    const photoArea = document.createElement("div");
    photoArea.className = "memory-photo-area";

    if (chapter.photo) {
      const image = document.createElement("img");
      image.src = chapter.photo;
      image.alt = `Recuerdo de ${chapter.title}`;
      photoArea.appendChild(image);
    } else {
      photoArea.textContent = chapter.symbol;
      photoArea.classList.add("memory-photo-placeholder");
    }

    const storyContent = document.createElement("div");
    storyContent.className = "memory-story-content";

    const subtitle = document.createElement("span");
    subtitle.className = "memory-story-subtitle";
    subtitle.textContent = chapter.subtitle;

    const title = document.createElement("h3");
    title.textContent = chapter.title;

    const story = document.createElement("p");
    story.className = "memory-story-text";
    story.textContent = chapter.story;


const chopperMessage = document.createElement("div");
chopperMessage.className = "memory-chopper-message";

const chopperPortrait = document.createElement("img");
chopperPortrait.src = "assets/personajes/Chopper.png";
chopperPortrait.alt = "Chopper";
chopperPortrait.className = "memory-chopper-portrait";

const chopperBubble = document.createElement("div");
chopperBubble.className = "memory-chopper-bubble";

const chopperLabel = document.createElement("span");
chopperLabel.className = "memory-chopper-label";
chopperLabel.textContent = "✦ UN MENSAJE DE CHOPPER";

const chopperText = document.createElement("p");
chopperText.textContent = chapter.message;

chopperBubble.append(chopperLabel, chopperText);
chopperMessage.append(chopperPortrait, chopperBubble);


    storyContent.append(
      subtitle,
      title,
      story,
      chopperMessage
    );

    viewer.append(photoArea, storyContent);

    if (state.memoryOpen.size === chapters.length && !rewardReady) {
      rewardReady = true;

      const finishButton = document.createElement("button");
      finishButton.className = "memory-finish-button";
      finishButton.textContent = "💝 Recuperar el último fragmento";

      finishButton.addEventListener("click", () => {
        finishButton.disabled = true;
        completeWorld("memory");
      }, { once: true });

      footer.appendChild(finishButton);

      message(
        "✨ ¡Has descubierto los cuatro capítulos! El último fragmento te espera."
      );
    }
  }

  chapters.forEach((chapter, index) => {
    const button = document.createElement("button");
    button.className = "memory-chapter-card";
    button.type = "button";

    const symbol = document.createElement("span");
    symbol.className = "memory-chapter-symbol";
    symbol.textContent = chapter.symbol;

    const number = document.createElement("span");
    number.className = "memory-chapter-number";
    number.textContent = `CAPÍTULO ${index + 1}`;

    const title = document.createElement("strong");
    title.textContent = chapter.title;

    button.append(symbol, number, title);

    button.addEventListener("click", () => {
      openChapter(index);
    });

    chapterContainer.appendChild(button);
  });
}


/* ======================================
   NAVEGACIÓN GENERAL
====================================== */

function resetGame() {
  state.completed.clear();
  state.current = null;
  state.found.clear();
  state.stars = [];
  state.melody = [];
  state.memoryOpen.clear();

  updateCounter();
  show("intro");
}

function init() {
  $("start")?.addEventListener("click", () => show("map"));

  $("back")?.addEventListener("click", () => show("map"));

  $("end-map")?.addEventListener("click", () => show("map"));

  $("reset")?.addEventListener("click", () => {
    if (confirm("¿Quieres comenzar nuevamente la aventura?")) {
      resetGame();
    }
  });

  updateCounter();
  show("intro");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

/* INTERACCIONES DE CHOPPER */

const chopperMessages = [
  "¡Isabel! ¡Qué emoción verte aquí!",
  "¡Hay cuatro islas esperando por ti!",
  "¡Cada aventura esconde una sorpresa!",
  "¡No olvides explorar cada rincón!",
  "¡Estoy seguro de que encontrarás algo increíble!"
];

let chopperMessageIndex = 0;

const islandRewards = {
  dream: {
    icon: "🌅",
    title: "¡Fragmento de los Sueños conseguido!",
    description:
      "Algunos sueños nacen cuando somos pequeños y nos acompañan durante toda la vida.",
    phrases: [
      "¡Lo conseguiste, Isabel! Je, je... ¿Sabes? Hay alguien que me habló de una niña que siempre quiso ser mejor cada día.",
      "También me contó que te encantan las historias de Alice Kellen. ¡Creo que ya descubriste una pequeña referencia escondida entre las páginas!",
      "¡Ups! ¿He dicho demasiado? Solo diré que Gonzalo quería que recordaras algo: tus sueños de niña siguen siendo importantes."
    ]
  },

  stars: {
    icon: "💎",
    title: "¡Fragmento Estelar conseguido!",
    description:
      "Cada estrella representa una decisión, un esfuerzo y un logro que forman parte de tu historia.",
    phrases: [
      "¡Lo sabía! Gonzalo me dijo que eras muy inteligente, Isabel. ¡Pero ahora lo he comprobado yo mismo!",
      "Me habló de lo valiente que fuiste al comenzar una nueva etapa lejos de tu familia, y de cómo has seguido trabajando y estudiando.",
      "¿Sabes qué fue lo que más me llamó la atención? La admiración con la que Gonzalo hablaba de tus logros. ¡Creo que tienes muchas razones para sentirte orgullosa!"
    ]
  },

  stage: {
    icon: "🎵",
    title: "¡Fragmento de la Melodía conseguido!",
    description:
      "Hay canciones que nos hacen sonreír, recordar y sentir que estamos viviendo una aventura.",
    phrases: [
      "¡Yujuuu! ¡Sabía que disfrutarías esta isla! Gonzalo me dio algunas pistas sobre tus gustos musicales.",
      "¡BTS, Jungkook y Tini! ¡Tuve que aprenderme todos esos nombres para preparar esta aventura contigo!",
      "Pero hay algo que Gonzalo no me pidió guardar en secreto: le encanta verte disfrutar de las cosas que te hacen feliz. ¡Ahora sigamos, que falta poco!"
    ]
  },

  memory: {
    icon: "💝",
    title: "¡Fragmento de la Memoria conseguido!",
    description:
      "Los recuerdos guardan las personas, los lugares y los momentos que nos ayudan a comprender quiénes somos.",
    phrases: [
      "Isabel... creo que ha llegado el momento de contarte algo. Gonzalo me habló de tus sueños, de tu familia, de tus esfuerzos y de tantas cosas que te hacen especial.",
      "No quería que esta aventura fuera solamente un juego. Quería que pudieras mirar tu propia historia y recordar todo lo que has conseguido a tus 24 años.",
      "¡Y ahora tengo una última misión! Gonzalo me encargó acompañarte hasta una sorpresa que preparó especialmente para ti. ¡Vamos a descubrirla!"
    ]
  }
};

function showIslandReward(id) {
  const reward = islandRewards[id];
  if (!reward) return;

  // Evitar ventanas duplicadas
  if (document.querySelector(".island-reward-overlay")) return;

  const overlay = document.createElement("div");
  overlay.className = "island-reward-overlay";

  const content = document.createElement("div");
  content.className = "island-reward-content";

  const sparkles = document.createElement("div");
  sparkles.className = "island-reward-sparkles";
  sparkles.textContent = "✦ ✧ ✦";

  const crystal = document.createElement("div");
  crystal.className = "island-reward-crystal";
  crystal.textContent = reward.icon;

  const title = document.createElement("h2");
  title.textContent = reward.title;

  const description = document.createElement("p");
  description.className = "island-reward-description";
  description.textContent = reward.description;

  const chopperArea = document.createElement("div");
  chopperArea.className = "island-reward-chopper";

  const dialogue = document.createElement("div");
  dialogue.className = "island-reward-dialogue";
  dialogue.textContent = reward.phrases[0];

  const chopperImage = document.createElement("img");
  chopperImage.alt = "Chopper celebrando la aventura";

  // Reutilizar la imagen de Chopper que ya funciona
  const originalChopper = document.querySelector(
    "#chopper img, .chopper img, img[alt*='Chopper']"
  );

  if (originalChopper && originalChopper.src) {
    chopperImage.src = originalChopper.src;
  } else {
    chopperImage.style.display = "none";
  }

  chopperArea.append(dialogue, chopperImage);

  const button = document.createElement("button");
  button.type = "button";
  button.className = "island-reward-button";
  button.textContent = "💬 Escuchar a Chopper";

  content.append(
    sparkles,
    crystal,
    title,
    description,
    chopperArea,
    button
  );

  overlay.appendChild(content);
  document.body.appendChild(overlay);

  let phraseIndex = 0;

  button.addEventListener("click", () => {
    phraseIndex++;

    if (phraseIndex < reward.phrases.length) {
      dialogue.textContent = reward.phrases[phraseIndex];

      dialogue.classList.remove("island-dialogue-enter");
      void dialogue.offsetWidth;
      dialogue.classList.add("island-dialogue-enter");

      if (phraseIndex === reward.phrases.length - 1) {
        button.textContent = "✨ Guardar mi fragmento";
      }

      return;
    }

    button.disabled = true;
    overlay.classList.add("island-reward-exit");

    setTimeout(() => {
      overlay.remove();
    }, 450);
  });
}


function buildEnding() {
  const container = $("final-content");
  const star = document.querySelector(".final-star");
  const endingMessage = $("ending-message");

  if (!container || !star || !endingMessage) return;

  container.replaceChildren();
  star.classList.remove("final-star-awakened");

  endingMessage.textContent =
    "Cuatro islas. Cuatro fragmentos. Una historia que siempre ha sido tuya.";

  chopperSay(
    "¡Isabel! ¡Recuperaste los cuatro fragmentos! " +
    "Pero todavía nos esperan las sorpresas más especiales."
  );

  // Rutas de los archivos del proyecto.
  const archivos = {
    luffy: "assets/videos/luffy_cumpleanos_isabel.mp4",
    pequena: "assets/fotos/isabel_pequena.jpg",
    actual: "assets/fotos/isabel_actual.jpg",
    mama: "assets/videos/mama.mp4",
    papa: "assets/videos/papa.mp4"
  };

  // Estilos exclusivos del final.
  if (!document.getElementById("isabel-final-styles")) {
    const style = document.createElement("style");
    style.id = "isabel-final-styles";
    style.textContent = `
      .isabel-final-scene {
        max-width: 850px;
        margin: 26px auto;
        padding: 30px 22px;
        border: 1px solid rgba(255,225,169,.35);
        border-radius: 24px;
        background: linear-gradient(
          145deg,
          rgba(44,29,80,.96),
          rgba(22,19,50,.97)
        );
        box-shadow: 0 20px 65px rgba(0,0,0,.3);
        color: #fff;
        text-align: center;
        animation: isabelSceneIn .65s ease both;
      }

      @keyframes isabelSceneIn {
        from { opacity: 0; transform: translateY(18px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .isabel-final-scene h2,
      .isabel-final-scene h3 {
        color: #ffe6b3;
        margin: 12px 0 18px;
      }

      .isabel-final-scene p {
        line-height: 1.85;
        margin: 14px 0;
      }

      .isabel-final-tag {
        color: #f7c7ff;
        letter-spacing: 2px;
        font-size: 12px;
        font-weight: 800;
      }

      .isabel-final-button {
        display: block;
        margin: 24px auto 0;
        padding: 14px 24px;
        border: 1px solid #ffe0a0;
        border-radius: 30px;
        background: linear-gradient(135deg,#f5ca76,#f6a8cf);
        color: #2c2044;
        font-weight: 800;
        font-size: 15px;
        cursor: pointer;
      }

      .isabel-final-button:disabled {
        opacity: .5;
        cursor: default;
      }

      .isabel-final-video {
        width: 100%;
        max-width: 720px;
        margin: 18px auto;
        display: block;
        border-radius: 16px;
        background: #080811;
        box-shadow: 0 12px 40px rgba(0,0,0,.4);
      }

      .isabel-final-photos {
        display: grid;
        grid-template-columns: repeat(2,minmax(0,1fr));
        gap: 16px;
        margin: 24px 0;
      }

      .isabel-final-photo {
        background: rgba(255,255,255,.07);
        padding: 12px;
        border-radius: 18px;
        min-width: 0;
      }

      .isabel-final-photo img {
        display: block;
        width: 100%;
        height: 270px;
        object-fit: cover;
        border-radius: 12px;
      }

      .isabel-final-photo strong {
        display: block;
        margin-top: 12px;
        color: #ffe0ad;
      }

      .isabel-dialogue {
        padding: 20px;
        margin: 18px auto;
        border-radius: 18px;
        background: rgba(255,255,255,.07);
        border-left: 4px solid #e9a7f8;
        text-align: left;
        animation: isabelSceneIn .5s ease both;
      }

      .isabel-dialogue strong {
        color: #ffe1ab;
      }

      .isabel-letter {
        max-width: 690px;
        margin: 22px auto;
        padding: 25px;
        border-radius: 14px;
        background: #fff5e8;
        color: #513a4c;
        text-align: left;
        box-shadow: 0 10px 30px rgba(0,0,0,.2);
      }

      .isabel-letter p { color: #513a4c; }

      .isabel-video-grid {
        display: grid;
        grid-template-columns: repeat(2,minmax(0,1fr));
        gap: 18px;
      }

      @media (max-width: 600px) {
        .isabel-final-photos,
        .isabel-video-grid {
          grid-template-columns: 1fr;
        }

        .isabel-final-photo img {
          height: 300px;
        }

        .isabel-final-scene {
          padding: 22px 14px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function createScene(html) {
    container.replaceChildren();

    const scene = document.createElement("section");
    scene.className = "isabel-final-scene";
    scene.innerHTML = html;

    container.appendChild(scene);
    scene.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

    return scene;
  }

  function createVideo(src) {
    const video = document.createElement("video");
    video.className = "isabel-final-video";
    video.src = src;
    video.controls = true;
    video.playsInline = true;
    video.preload = "metadata";
    return video;
  }

  function showLuffy() {
    chopperSay(
      "¡Isabel! ¡Alguien del Sombrero de Paja " +
      "tiene un mensaje para ti!"
    );

    const scene = createScene(`
      <span class="isabel-final-tag">
        ✦ UN MENSAJE DESDE EL GRAND LINE ✦
      </span>
      <h2>🏴‍☠️ ¡Una sorpresa de Luffy!</h2>
      <p>
        Un capitán muy especial ha cruzado los mares
        para acompañarte en este cumpleaños.
      </p>
      <div class="isabel-luffy-video"></div>
      <button class="isabel-final-button" type="button">
        💝 Continuar hacia un recuerdo especial
      </button>
    `);

    const video = createVideo(archivos.luffy);
    scene.querySelector(".isabel-luffy-video").appendChild(video);

    scene.querySelector("button").addEventListener(
      "click",
      () => {
        video.pause();
        showTwoIsabels();
      },
      { once: true }
    );
  }

  function showTwoIsabels() {
    chopperSay(
      "Isabel, antes de conocer tu próximo destino, " +
      "quiero presentarte a alguien que conoces desde siempre..."
    );

    const scene = createScene(`
      <span class="isabel-final-tag">
        ✦ EL ENCUENTRO A TRAVÉS DEL TIEMPO ✦
      </span>
      <h2>🌸 La niña que fuiste y la mujer que eres</h2>
      <p>
        A veces necesitamos mirar atrás para descubrir
        lo lejos que hemos llegado.
      </p>

      
<div class="isabel-encuentro">
  <img
    src="assets/imagenes/encuentro_isabel.png"
    alt="Isabel adulta sentada frente a su versión de pequeña"
    class="isabel-encuentro-imagen"
  >
  <p class="isabel-encuentro-frase">
    Dos versiones de una misma persona.
    Una llena de sueños y otra que ha luchado por cumplirlos.
  </p>
</div>


      <div class="isabel-dialogue-box" aria-live="polite"></div>

      <button class="isabel-final-button" type="button">
        💬 Comenzar la conversación
      </button>
    `);


    const lines = [
      {
        who: "Isabel pequeña 🌸",
        text: "Hola... ¿De verdad eres yo cuando sea grande?"
      },
      {
        who: "Isabel de hoy 🦋",
        text: "Sí, pequeña. Soy tú, unos cuantos sueños y muchas experiencias después."
      },
      {
        who: "Isabel pequeña 🌸",
        text: "¿Y qué pasó con nosotras? ¿Logramos hacer cosas bonitas?"
      },
      {
        who: "Isabel de hoy 🦋",
        text: "Muchas. Un día salimos de Lima para empezar una nueva etapa en Huancayo. Extrañamos a nuestra familia, pero aprendimos a ser valientes."
      },
      {
        who: "Isabel pequeña 🌸",
        text: "¿Y seguimos estudiando? Siempre quise aprender muchas cosas."
      },
      {
        who: "Isabel de hoy 🦋",
        text: "Claro que sí. Trabajamos, ahorramos, estudiamos Administración y conseguimos nuestro título técnico. Y ahora seguimos trabajando mientras estudiamos en la universidad."
      },
      {
        who: "Isabel pequeña 🌸",
        text: "¡Guau! ¿Entonces ya cumplimos todos nuestros sueños?"
      },
      {
        who: "Isabel de hoy 🦋",
        text: "Todavía no, y eso es lo más bonito. Nos quedan muchísimas cosas por descubrir, personas por conocer y momentos por vivir."
      },
      {
        who: "Isabel pequeña 🌸",
        text: "¿Y somos felices?"
      },
      {
        who: "Isabel de hoy 🦋",
        text: "Tenemos días maravillosos y otros difíciles. Pero también tenemos personas que nos quieren, recuerdos inolvidables y razones para seguir sonriendo."
      },
      {
        who: "Isabel pequeña 🌸",
        text: "Entonces... ¿estás orgullosa de mí?"
      },
      {
        who: "Isabel de hoy 🦋",
        text: "Muchísimo. Porque gracias a ti empezó todo. Gracias por soñar incluso antes de saber hasta dónde llegaríamos."
      },
      {
        who: "Isabel pequeña 🌸",
        text: "Prométeme que nunca vamos a dejar de intentarlo."
      },
      {
        who: "Isabel de hoy 🦋",
        text: "Te lo prometo. Y hoy, que cumplimos 24 años, quiero decirte algo: lo estamos haciendo muy bien."
      }
    ];

    const dialogueBox = scene.querySelector(".isabel-dialogue-box");
    const button = scene.querySelector("button");
    let index = 0;

    button.addEventListener("click", () => {
      if (index < lines.length) {
        const line = lines[index];

        const bubble = document.createElement("div");
        bubble.className = "isabel-dialogue";

        const speaker = document.createElement("strong");
        speaker.textContent = line.who;

        const paragraph = document.createElement("p");
        paragraph.textContent = line.text;

        bubble.append(speaker, paragraph);
        dialogueBox.appendChild(bubble);

        bubble.scrollIntoView({
          behavior: "smooth",
          block: "nearest"
        });

        index++;

        button.textContent =
          index < lines.length
            ? "💬 Continuar conversación"
            : "💝 Descubrir los mensajes de mi familia";

        return;
      }

      showLetter();
    });
  }

  function showFamily() {
    chopperSay(
      "¡Qué encuentro tan especial! " +
      "Ahora hay personas que quieren acompañarte " +
      "con unas palabras desde el corazón."
    );

    const scene = createScene(`
      <span class="isabel-final-tag">
        ✦ VOCES QUE TE ACOMPAÑAN ✦
      </span>
      <h2>💝 Mensajes de tu familia</h2>
      <p>
        Para la Isabel de pequeña y para la mujer
        que hoy cumple 24 años.
      </p>

      <div class="isabel-video-grid">
        <div>
          <h3>🌷 Un mensaje de mamá</h3>
          <div class="isabel-mama-video"></div>
        </div>
        <div>
          <h3>⭐ Un mensaje de papá</h3>
          <div class="isabel-papa-video"></div>
        </div>
      </div>

      <button class="isabel-final-button" type="button">
        💌 Leer el último mensaje
      </button>
    `);

    const mama = createVideo(archivos.mama);
    const papa = createVideo(archivos.papa);

    scene.querySelector(".isabel-mama-video").appendChild(mama);
    scene.querySelector(".isabel-papa-video").appendChild(papa);

    scene.querySelector("button").addEventListener(
      "click",
      () => {
        mama.pause();
        papa.pause();
        showLetter();
      },
      { once: true }
    );
  }

  function showLetter() {
    chopperSay(
      "Isabel, Gonzalo ha preparado unas palabras " +
      "especialmente para ti. Léelas con calma."
    );

    const scene = createScene(`
      <span class="isabel-final-tag">
        ✦ EL ÚLTIMO MENSAJE ✦
      </span>
      <h2>💌 Para Isabel, en sus 24 años</h2>

      
<div class="isabel-letter">
  <p><strong>Mi querida chinita:</strong></p>

  <p>
    Hoy no quería celebrar únicamente tu cumpleaños.
    Quiero celebrar tu historia, tus sueños y todo lo
    que has conseguido con tanto esfuerzo.
  </p>

  <p>
    Admiro a la mujer que decidió construir su propio
    camino; a esa mujer que trabajó, estudió, obtuvo
    su título técnico y que continúa esforzándose
    cada día por crecer y alcanzar sus metas.
  </p>

  <p>
    También guardo con muchísimo cariño nuestras
    aventuras, como aquel primer viaje juntos a Ica
    y, después, nuestro viaje a la selva.
    Son recuerdos que siempre tendrán un lugar
    especial en mi corazón.
  </p>

  <p>
    Mi princesita, espero que nunca olvides cuánto
    vales, cuánto has avanzado y todos los sueños
    que todavía puedes alcanzar. Porque conozco
    tus capacidades, sé lo inteligente que eres
    y admiro esa perseverancia que te caracteriza.
  </p>

  <p>
    Hoy quise entregarte algo que hice especialmente
    para ti. Sé que no te lo esperabas, y esa es
    la mejor parte de todo. A estas alturas, ya
    habrás vivido muchas sorpresas que no esperabas,
    y espero que cada una te haya regalado una
    sonrisa y un recuerdo bonito.
  </p>

  <p>
    Recuerda siempre que este dia no es solo especial
    para ti, sino para mi tambien.
    El cumpleaños del amor de mi vida.
  </p>

  <p>
    Feliz cumpleaños número 24, mi guapa.
    Estoy y siempre estare muy orgulloso de ti.
  </p>

  <p>
    <strong>Con muchísimo cariño, tu Gonzalini. 💝</strong>
  </p>
</div>


      <button class="isabel-final-button" type="button">
        🎂 Celebrar mis 24 años
      </button>
    `);

    
    // Efectos románticos de la carta final
    document.querySelector(".isabel-romance-effects")?.remove();

    const romanceLayer = document.createElement("div");
    romanceLayer.className = "isabel-romance-effects";
    document.body.appendChild(romanceLayer);

    const symbols = ["💗", "💖", "💕", "✨", "🌸", "💝"];

    // Corazones y destellos flotando lentamente
    for (let i = 0; i < 24; i++) {
      const particle = document.createElement("span");
      particle.className = "isabel-romance-particle";
      particle.textContent = symbols[i % symbols.length];

      particle.style.left = `${Math.random() * 100}%`;
      particle.style.setProperty(
        "--particle-size",
        `${15 + Math.random() * 18}px`
      );
      particle.style.setProperty(
        "--particle-time",
        `${7 + Math.random() * 6}s`
      );
      particle.style.setProperty(
        "--particle-delay",
        `${Math.random() * -12}s`
      );
      particle.style.setProperty(
        "--particle-drift",
        `${Math.random() * 180 - 90}px`
      );

      romanceLayer.appendChild(particle);
    }

    // Lluvia especial al llegar a la firma
    const signature = scene.querySelector(".isabel-letter p:last-child");
    let burstPlayed = false;

    function launchHeartBurst() {
      if (burstPlayed) return;
      burstPlayed = true;

      for (let i = 0; i < 32; i++) {
        const heart = document.createElement("span");
        heart.className = "isabel-romance-burst";
        heart.textContent = symbols[i % symbols.length];

        const angle = (Math.PI * 2 * i) / 32;
        const distance = 100 + Math.random() * 300;

        heart.style.setProperty(
          "--burst-x",
          `${Math.cos(angle) * distance}px`
        );
        heart.style.setProperty(
          "--burst-y",
          `${Math.sin(angle) * distance}px`
        );
        heart.style.setProperty(
          "--burst-size",
          `${20 + Math.random() * 22}px`
        );
        heart.style.setProperty(
          "--burst-rotation",
          `${Math.random() * 180 - 90}deg`
        );

        romanceLayer.appendChild(heart);
        heart.addEventListener(
          "animationend",
          () => heart.remove(),
          { once: true }
        );
      }
    }

    if (signature) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            launchHeartBurst();
            observer.disconnect();
          }
        },
        { threshold: 0.8 }
      );

      observer.observe(signature);
    }

    // Retirar efectos al salir de la carta
    scene.querySelector("button").addEventListener(
      "click",
      () => romanceLayer.remove(),
      { once: true }
    );


    scene.querySelector("button").addEventListener(
      "click",
      showBirthday,
      { once: true }
    );
  }

  function showBirthday() {
    chopperSay(
      "¡Feliz cumpleaños, Isabel! " +
      "¡Que esta nueva etapa esté llena de sueños y aventuras!"
    );

    createScene(`
      <span class="isabel-final-tag">
        ✦ EL VERDADERO TESORO ✦
      </span>

      <div style="font-size:60px;margin:20px">🎂</div>
      <div style="font-size:90px;font-weight:900;color:#ffe1a0">
        24
      </div>

      <h2>¡Feliz cumpleaños, Isabel!</h2>

      <p>
        Que nunca te falten sueños, motivos para sonreír
        y personas con quienes compartir tu felicidad.
      </p>

      <h3>El verdadero tesoro siempre fuiste tú. 💖</h3>

      <div style="font-size:34px;margin:24px">
        ✨ 💝 🌸 🎉 💜 ✨
      </div>
    `);
  }

  // Primera escena: unir los fragmentos.
  const opening = createScene(`
    <span class="isabel-final-tag">
      ✦ EL ÚLTIMO CAPÍTULO ✦
    </span>

    <h2>El verdadero tesoro</h2>

    <div style="font-size:38px;margin:24px">
      🌅 💎 🎵 💝
    </div>

    <p>
      Cuatro fragmentos guardan tus sueños,
      tus esfuerzos, tus alegrías y tus recuerdos.
    </p>

    <p>
      Ahora ha llegado el momento de unirlos
      para descubrir el secreto final.
    </p>

    <button class="isabel-final-button" type="button">
      ✨ Unir mis cuatro fragmentos
    </button>
  `);

  opening.querySelector("button").addEventListener(
    "click",
    () => {
      star.classList.add("final-star-awakened");
      showLuffy();
    },
    { once: true }
  );
}

/* ACCESO RÁPIDO PARA PRUEBAS DEL PROYECTO */

function activarPruebasIsabel() {
  const params = new URLSearchParams(window.location.search);

  // Solo se activa cuando la dirección termina en ?prueba=final
  if (params.get("prueba") !== "final") return;

  const boton = document.createElement("button");
  boton.type = "button";
  boton.textContent = "🛠️ IR AL FINAL";

  boton.style.cssText = `
    position: fixed;
    top: 15px;
    right: 15px;
    z-index: 999999;
    padding: 12px 18px;
    border: 2px solid #ffe1a4;
    border-radius: 30px;
    background: #302449;
    color: white;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 5px 20px rgba(0,0,0,.35);
  `;

  boton.addEventListener("click", () => {
    show("end");
  });

  document.body.appendChild(boton);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", activarPruebasIsabel);
} else {
  activarPruebasIsabel();
}

/* ==========================================
   CHOPPER - DIÁLOGO INTERACTIVO
   ========================================== */

(function activarDialogoChopper() {
  const boton = document.getElementById("chopper-button");
  const burbuja = document.getElementById("chopper-bubble");

  if (!boton || !burbuja) return;

  // Evitar instalar el comportamiento dos veces.
  if (boton.dataset.dialogoActivo === "si") return;
  boton.dataset.dialogoActivo = "si";

  // El mensaje comienza oculto.
  burbuja.classList.add("chopper-cerrado");
  boton.setAttribute("aria-expanded", "false");
  boton.setAttribute("aria-controls", "chopper-bubble");

  boton.addEventListener("click", function () {
    const estaCerrado = burbuja.classList.toggle("chopper-cerrado");

    boton.setAttribute(
      "aria-expanded",
      String(!estaCerrado)
    );
  });
})();

/* CONFETI CINEMATOGRÁFICO - WHOLE CAKE MUSIC */

function lanzarConfetiConcierto(artista) {
  const anterior = document.querySelector(".wc-confetti-layer");
  if (anterior) anterior.remove();

  const colores = {
    bts: ["#a855f7", "#d8b4fe", "#ffffff", "#facc15", "#ec4899"],
    tini: ["#ff4fa3", "#ffd1e8", "#ffffff", "#ffd166", "#ff86c8"],
    paulo: ["#38bdf8", "#93c5fd", "#ffffff", "#facc15", "#22d3ee"]
  };

  const paleta = colores[artista] || colores.bts;

  const capa = document.createElement("div");
  capa.className = "wc-confetti-layer";
  capa.setAttribute("aria-hidden", "true");

  document.body.appendChild(capa);

  // Explosión inicial desde ambos lados de la pantalla.
  for (let i = 0; i < 180; i++) {
    const pieza = document.createElement("span");
    pieza.className = "wc-confetti-piece";

    const lado = i % 2 === 0 ? "izquierda" : "derecha";
    const origenX = lado === "izquierda" ? -5 : 105;

    const destinoX = Math.random() * 110 - 5;
    const destinoY = Math.random() * 110 + 15;

    pieza.style.setProperty("--origen-x", `${origenX}vw`);
    pieza.style.setProperty("--destino-x", `${destinoX}vw`);
    pieza.style.setProperty("--destino-y", `${destinoY}vh`);
    pieza.style.setProperty("--giro", `${Math.random() * 1440}deg`);

    pieza.style.backgroundColor =
      paleta[Math.floor(Math.random() * paleta.length)];

    pieza.style.width = `${5 + Math.random() * 9}px`;
    pieza.style.height = `${7 + Math.random() * 13}px`;

    pieza.style.animationDelay = `${Math.random() * 0.7}s`;
    pieza.style.animationDuration = `${3 + Math.random() * 3}s`;

    if (Math.random() > 0.75) {
      pieza.style.borderRadius = "50%";
    }

    capa.appendChild(pieza);
  }

  // Retirar el confeti después de la celebración.
  setTimeout(() => {
    capa.remove();
  }, 7500);
}
