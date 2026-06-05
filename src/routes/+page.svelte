<script>
  import { onMount } from 'svelte';
  import { questions } from '$lib/data/questions';
  import { modes, intros, learningSections, allLearningItems, studyGuides } from '$lib/data/content';
  import Stat from '$lib/components/ui/Stat.svelte';
  import FigureCaption from '$lib/components/ui/FigureCaption.svelte';
  import Options from '$lib/components/ui/Options.svelte';
  import Feedback from '$lib/components/ui/Feedback.svelte';
  import ZoomTools from '$lib/components/ui/ZoomTools.svelte';
  import Icon from '$lib/components/ui/Icon.svelte';

  let screen = $state('onboarding');
  let mode = $state('pfeilnaht');
  let deck = $state([]);
  let qIndex = $state(0);
  let answers = $state([]);
  let selected = $state(null);
  let lastAnswer = $state(null);
  let sheetOpen = $state(false);
  let tap = $state(null);
  let theme = $state('parchment');
  let userName = $state('');
  let nameDraft = $state('');
  let xp = $state(0);
  let streak = $state(0);
  let accuracy = $state(0);
  let dailyDone = $state(0);
  let completedSessions = $state(0);
  let sequenceOrder = $state([]);
  let placements = $state({});
  let selectedArea = $state('Todas');
  let hydrated = $state(false);
  let studyFirst = $state(true);
  let modeMastery = $state({
    pfeilnaht: 0,
    hotspot: 0,
    label: 0,
    sequence: 0,
    ctg: 0
  });

  let current = $derived(deck[qIndex]);
  let dailyPct = $derived(Math.round((dailyDone / 12) * 100));
  let introMeta = $derived(intros[mode === 'daily' ? 'pfeilnaht' : mode] || intros.pfeilnaht);
  let studyGuide = $derived(studyGuides[mode] || studyGuides.pfeilnaht);
  let visibleLearningItems = $derived(
    selectedArea === 'Todas' ? allLearningItems : allLearningItems.filter((item) => item.area === selectedArea)
  );
  let areaOptions = $derived(['Todas', ...learningSections.map((section) => section.area)]);
  let pendingDaily = $derived(Math.max(0, 12 - dailyDone));
  let level = $derived(Math.max(1, Math.floor(xp / 120) + 1));
  let lowestMastery = $derived.by(() => {
    if (!completedSessions) return null;
    let minMode = null;
    let minVal = Infinity;
    const modeNames = {
      pfeilnaht: 'Sutura sagital',
      hotspot: 'Hotspots anatómicos',
      label: 'Rotulado de cráneo/pelvis',
      sequence: 'Secuencia de maniobras',
      ctg: 'Desaceleraciones en CTG'
    };
    for (const [key, val] of Object.entries(modeMastery)) {
      if (val < minVal) {
        minVal = val;
        minMode = key;
      }
    }
    return { name: modeNames[minMode] || minMode, value: minVal };
  });

  onMount(() => {
    const saved = localStorage.getItem('obstetraclick-progress');
    if (saved) {
      try {
        const progress = JSON.parse(saved);
        if (progress.userName) {
          userName = progress.userName;
          nameDraft = userName;
          xp = Number(progress.xp ?? xp);
          streak = Number(progress.streak ?? streak);
          accuracy = Number(progress.accuracy ?? accuracy);
          dailyDone = Number(progress.dailyDone ?? dailyDone);
          completedSessions = Number(progress.completedSessions ?? completedSessions);
          theme = progress.theme || theme;
          selectedArea = progress.selectedArea || selectedArea;
          studyFirst = progress.studyFirst ?? studyFirst;
          modeMastery = progress.modeMastery || modeMastery;
        } else {
          localStorage.removeItem('obstetraclick-progress');
        }
      } catch {
        localStorage.removeItem('obstetraclick-progress');
      }
    }
    screen = userName ? 'home' : 'onboarding';
    document.documentElement.dataset.theme = theme;
    hydrated = true;
  });

  $effect(() => {
    if (hydrated) {
      localStorage.setItem(
        'obstetraclick-progress',
        JSON.stringify({ userName, xp, streak, accuracy, dailyDone, completedSessions, theme, selectedArea, modeMastery, studyFirst })
      );
    }
  });

  function setTheme(value) {
    theme = value;
    document.documentElement.dataset.theme = value;
  }

  function saveProfile() {
    const trimmed = nameDraft.trim();
    if (!trimmed) return;
    userName = trimmed.slice(0, 28);
    xp = 0;
    streak = 0;
    accuracy = 0;
    dailyDone = 0;
    completedSessions = 0;
    modeMastery = {
      hotspot: 0,
      pfeilnaht: 0,
      label: 0,
      sequence: 0,
      ctg: 0
    };
    screen = 'home';
  }

  function resetProfile() {
    if (confirm('¿Estás seguro de que querés borrar todo tu progreso y empezar de nuevo?')) {
      userName = '';
      nameDraft = '';
      xp = 0;
      streak = 0;
      accuracy = 0;
      dailyDone = 0;
      completedSessions = 0;
      modeMastery = {
        hotspot: 0,
        pfeilnaht: 0,
        label: 0,
        sequence: 0,
        ctg: 0
      };
      localStorage.removeItem('obstetraclick-progress');
      screen = 'onboarding';
    }
  }

  function startMode(nextMode) {
    mode = nextMode;
    deck = questions[nextMode].map((q) => ({ mode: nextMode, q }));
    qIndex = 0;
    answers = [];
    resetQuestionState();
    if (studyFirst) {
      screen = 'study';
    } else {
      screen = 'intro';
    }
  }

  function startDaily() {
    mode = 'daily';
    deck = [
      { mode: 'pfeilnaht', q: questions.pfeilnaht[0] },
      { mode: 'hotspot', q: questions.hotspot[0] },
      { mode: 'ctg', q: questions.ctg[0] }
    ];
    qIndex = 0;
    answers = [];
    resetQuestionState();
    if (studyFirst) {
      screen = 'study';
    } else {
      screen = 'intro';
    }
  }

  function closeStudy() {
    if (studyFirst) {
      backHome();
    } else {
      screen = 'intro';
    }
  }

  function resetQuestionState() {
    selected = null;
    lastAnswer = null;
    sheetOpen = false;
    tap = null;
    sequenceOrder = current?.q?.items ? [...current.q.items] : [];
    placements = {};
  }

  function enterQuiz() {
    screen = 'quiz';
    sequenceOrder = current?.q?.items ? [...current.q.items] : [];
  }

  function enterStudy() {
    screen = 'study';
  }

  function backHome() {
    screen = 'home';
    mode = 'pfeilnaht';
    deck = [];
    resetQuestionState();
  }

  function openAtlas() {
    screen = 'atlas';
  }

  function openHeatmap() {
    screen = 'heatmap';
  }

  function answer(result) {
    lastAnswer = result;
    setTimeout(() => {
      sheetOpen = true;
    }, 180);
  }

  function nextQuestion() {
    const correct = !!lastAnswer?.correct;
    answers = [...answers, correct];
    if (qIndex >= deck.length - 1) {
      xp += correct ? 15 : 3;
      const nextAnswers = answers;
      const sessionAccuracy = Math.round((nextAnswers.filter(Boolean).length / nextAnswers.length) * 100);

      if (completedSessions === 0) {
        accuracy = sessionAccuracy;
      } else {
        accuracy = Math.round((accuracy * completedSessions + sessionAccuracy) / (completedSessions + 1));
      }

      // Update modeMastery
      if (mode === 'daily') {
        deck.forEach((item, index) => {
          const qCorrect = nextAnswers[index];
          const mId = item.mode;
          if (modeMastery[mId] === 0) {
            modeMastery[mId] = qCorrect ? 100 : 0;
          } else {
            modeMastery[mId] = Math.round((modeMastery[mId] * 3 + (qCorrect ? 100 : 0)) / 4);
          }
        });
      } else {
        if (modeMastery[mode] === 0) {
          modeMastery[mode] = sessionAccuracy;
        } else {
          modeMastery[mode] = Math.round((modeMastery[mode] * 3 + sessionAccuracy) / 4);
        }
      }

      if (mode === 'daily') dailyDone = Math.min(12, dailyDone + deck.length);
      completedSessions += 1;
      if (nextAnswers.filter(Boolean).length >= 2) streak += 1;
      sheetOpen = false;
      screen = 'results';
    } else {
      qIndex += 1;
      resetQuestionState();
    }
  }

  function chooseOption(option) {
    if (lastAnswer) return;
    selected = option.id;
    answer({ correct: option.id === current.q.correctId });
  }

  function handleHotspot(event) {
    if (lastAnswer) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    tap = { x, y };

    let best = null;
    let bestDistance = Infinity;
    for (const zone of current.q.zones) {
      const distance = Math.hypot(zone.cx - x, zone.cy - y);
      if (distance < bestDistance) {
        best = zone;
        bestDistance = distance;
      }
    }

    answer({ correct: best?.id === current.q.correctId && bestDistance < 22 });
  }

  function handleHotspotKey(event) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    if (lastAnswer) return;
    tap = { x: 50, y: 50 };
    answer({ correct: false });
  }

  function placeTerm(slotId, termId) {
    if (lastAnswer) return;
    placements = { ...placements, [slotId]: termId };
    if (current.q.slots.every((slot) => ({ ...placements, [slotId]: termId })[slot.id])) {
      const next = { ...placements, [slotId]: termId };
      answer({ correct: current.q.slots.every((slot) => next[slot.id] === slot.correctTermId) });
    }
  }

  function moveSequence(index, direction) {
    if (lastAnswer) return;
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= sequenceOrder.length) return;
    const next = [...sequenceOrder];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    sequenceOrder = next;
  }

  function submitSequence() {
    answer({ correct: sequenceOrder.every((item, index) => item.rank === index + 1) });
  }

  // Generate CTG paths with baseline variability and DIP II late decelerations (decalage)
  let ctgFhrPath = $state('');
  let ctgUcPath = $state('');
  function generateCtgPaths() {
    const fhrPoints = [];
    const ucPoints = [];
    for (let x = 40; x <= 360; x += 2) {
      let ucY = 140; // baseline
      if (x >= 90 && x <= 170) {
        const t = (x - 90) / 80;
        ucY -= 40 * Math.sin(t * Math.PI);
      }
      if (x >= 210 && x <= 290) {
        const t = (x - 210) / 80;
        ucY -= 45 * Math.sin(t * Math.PI);
      }

      let fhrY = 45; // baseline 140 bpm (y=45)
      if (x >= 110 && x <= 200) {
        let decelVal = 0;
        if (x < 160) {
          decelVal = 22 * Math.sin(((x - 110) / 50) * (Math.PI / 2));
        } else {
          decelVal = 22 * Math.cos(((x - 160) / 40) * (Math.PI / 2));
        }
        fhrY += decelVal;
      }
      if (x >= 230 && x <= 320) {
        let decelVal = 0;
        if (x < 280) {
          decelVal = 26 * Math.sin(((x - 230) / 50) * (Math.PI / 2));
        } else {
          decelVal = 26 * Math.cos(((x - 280) / 40) * (Math.PI / 2));
        }
        fhrY += decelVal;
      }
      const noise = 1.6 * Math.sin(x * 0.8) + 2.2 * Math.cos(x * 1.6) + 0.8 * Math.sin(x * 3.2);
      fhrY += noise;
      fhrPoints.push(`${x},${fhrY.toFixed(1)}`);
      ucPoints.push(`${x},${ucY.toFixed(1)}`);
    }
    ctgFhrPath = 'M ' + fhrPoints.join(' L ');
    ctgUcPath = 'M ' + ucPoints.join(' L ');
  }
  generateCtgPaths();
</script>

<svelte:head>
  <meta
    name="description"
    content="ObstetraClick entrena preguntas visuales de obstetricia: hotspots, sutura sagital, CTG, secuencias y mapas anatómicos."
  />
</svelte:head>

<div class="stage">
  <main class="phone" aria-label="Aplicación ObstetraClick">
    <div class="app">
      <div class="grain"></div>

      {#if screen === 'onboarding'}
        <section class="content onboarding-screen">
          <div class="topbar">
            <span class="chip chip-accent">Nuevo perfil</span>
            <span class="topbar-spacer"></span>
            <button class="icon-btn" aria-label="Modo contraste" onclick={() => setTheme(theme === 'ink' ? 'parchment' : 'ink')}>
              <Icon name="contrast" />
            </button>
          </div>

          <div class="onboarding-plate">
            <img src="/learning-images/fetal-head-orientation.png" alt="" />
          </div>

          <div style="margin: 20px 0 18px">
            <div class="eyebrow" style="margin-bottom: 8px">ObstetraClick</div>
            <h1 class="h1">¿Con qué nombre<br /><em>querés practicar?</em></h1>
            <p class="body" style="margin: 14px 0 0">
              Empezás desde cero. La app guarda solo tu nombre, racha y progreso de práctica en este navegador.
            </p>
          </div>

          <form class="name-form" onsubmit={(e) => { e.preventDefault(); saveProfile(); }}>
            <label class="label" for="display-name">Nombre visible</label>
            <input
              id="display-name"
              bind:value={nameDraft}
              maxlength="28"
              autocomplete="given-name"
              placeholder="Ej. Ana"
            />
            <button class="btn" type="submit" disabled={!nameDraft.trim()}>
              Entrar desde cero <Icon name="chevron" />
            </button>
          </form>
        </section>
      {:else if screen === 'home'}
        <section class="content">
          <div class="topbar">
            <span class="chip">{userName}</span>
            <button class="icon-btn" style="margin-left: 4px" aria-label="Restablecer perfil" onclick={resetProfile} title="Restablecer perfil">
              <Icon name="user-x" />
            </button>
            <span class="topbar-spacer"></span>
            <span class="chip">Racha {streak}d</span>
            <button class="icon-btn" aria-label="Modo contraste" onclick={() => setTheme(theme === 'ink' ? 'parchment' : 'ink')}>
              <Icon name="contrast" />
            </button>
          </div>

          <div style="margin: 8px 0 22px">
            <div class="eyebrow" style="margin-bottom: 6px">21 de mayo · Curso de revalidación</div>
            <h1 class="h1">Obstetra<em>Click</em><br />entrena tu ojo clínico.</h1>
          </div>

          <article class="card" style="padding: 18px; margin-bottom: 14px; position: relative; overflow: hidden">
            <div style="position: absolute; right: -28px; top: -20px; width: 138px; opacity: 0.1">
              {@render FetalSkull()}
            </div>
            <div style="position: relative">
              <div class="row" style="gap: 8px; margin-bottom: 10px">
                <span class="chip chip-accent"><Icon name="calendar" size={12} /> Repaso diario</span>
                <span class="chip">{pendingDaily} pendientes</span>
              </div>
              <h2 class="h2"><em>Sutura sagital</em>, Hodge y CTG</h2>
              <p class="body-sm" style="max-width: 88%; margin: 7px 0 16px">
                {#if dailyDone === 0}
                  Sin intentos todavía. Empezá estudiando los criterios visuales y después hacé el test corto.
                {:else}
                  {dailyDone} de 12 imágenes resueltas. Hoy toca tacto, planos y patrones de curvas.
                {/if}
              </p>
              <div class="progress" style="margin-bottom: 14px"><span style={`width: ${dailyPct}%`}></span></div>
              <button class="btn" onclick={startDaily}>Estudiar y practicar <Icon name="chevron" /></button>
            </div>
          </article>

          <div class="row" style="gap: 10px; margin-bottom: 22px">
            <Stat label="XP" value={xp} />
            <Stat label="Aciertos" value={completedSessions ? `${accuracy}%` : '—'} />
            <Stat label="Nivel" value={level} />
          </div>

          <div class="row" style="gap: 10px; margin-bottom: 12px">
            <span class="eyebrow">Modos visuales</span>
            <span style="flex: 1; height: 0.5px; background: var(--hairline)"></span>
            <span class="label">5 activos</span>
          </div>

          <div class="segmented-control" style="margin-bottom: 16px">
            <button class:active={studyFirst} onclick={() => studyFirst = true}>Estudiar primero</button>
            <button class:active={!studyFirst} onclick={() => studyFirst = false}>Evaluar directo</button>
          </div>

          <div class="mode-grid" style="margin-bottom: 24px">
            {#each modes as item (item.id)}
              <button class:wide={item.wide} class="mode-card" onclick={() => startMode(item.id)}>
                <div class="mode-figure">
                  <div class="mode-figure-inner">
                    {#if item.id === 'hotspot'}
                      {@render Pelvis(true)}
                    {:else if item.id === 'pfeilnaht'}
                      {@render Pfeilnaht('vHHL', 220)}
                    {:else if item.id === 'label'}
                      {@render FetalSkull()}
                    {:else if item.id === 'sequence'}
                      {@render ManeuverGrid()}
                    {:else}
                      {@render CTGStrip()}
                    {/if}
                  </div>
                </div>
                <div style="padding: 12px; flex: 1">
                  <div class="row" style="margin-bottom: 4px">
                    <span class="label" style="font-size: 9px">Nro. {item.figure}</span>
                    <span style="flex: 1; margin-left: 6px; height: 0.5px; background: var(--hairline)"></span>
                  </div>
                  <div class="h3" style="font-style: italic">{item.title}</div>
                  <div class="body-sm" style="font-size: 12px">{item.sub}</div>
                  <div class="label" style="font-size: 9px; margin-top: 8px">{item.count}</div>
                </div>
              </button>
            {/each}
          </div>

          <button class="card" style="width: 100%; border: 0.5px solid var(--hairline); padding: 14px; text-align: left; color: var(--ink); cursor: pointer" onclick={openHeatmap}>
            <div class="row" style="gap: 14px">
              <div style="width: 66px">{@render HeatmapFigure()}</div>
              <div style="flex: 1">
                <div class="h3" style="font-style: italic">Mapa de puntos flojos</div>
                <div class="body-sm">
                  {completedSessions && lowestMastery ? `Valor más bajo: ${lowestMastery.name} · ${lowestMastery.value}%` : 'Se activa después de la primera sesión.'}
                </div>
              </div>
              <Icon name="chevron" />
            </div>
          </button>

          <button class="card atlas-entry" onclick={openAtlas}>
            <div class="row" style="gap: 14px">
              <div class="atlas-stack">
                <span>{@render MiniVisual('skull')}</span>
                <span>{@render MiniVisual('doppler')}</span>
                <span>{@render MiniVisual('sectio')}</span>
              </div>
              <div style="flex: 1">
                <div class="h3" style="font-style: italic">Catálogo visual completo</div>
                <div class="body-sm">{allLearningItems.length} visualizaciones en 5 áreas, con objetivos y formato de examen.</div>
              </div>
              <Icon name="chevron" />
            </div>
          </button>
        </section>
      {:else if screen === 'intro'}
        <section class="content">
          <div class="topbar">
            <button class="icon-btn" aria-label="Volver" onclick={backHome}><Icon name="close" /></button>
          </div>
          <div class="eyebrow" style="margin: 18px 0 10px">Módulo {mode === 'daily' ? 'diario' : mode}</div>
          <h1 class="h1">{introMeta.titlePre}<br /><em>{introMeta.title}</em></h1>
          <p class="body" style="margin: 14px 0 20px">{introMeta.intro}</p>
          <div class="card" style="padding: 14px; margin-bottom: 14px">
            <div class="eyebrow" style="margin-bottom: 10px">En esta sesión</div>
            <div class="col" style="gap: 11px">
              {#each introMeta.bullets as bullet, index (index)}
                <div class="row" style="gap: 12px; align-items: flex-start">
                  <span style="font-family: var(--f-display); color: var(--accent); font-style: italic">{String(index + 1).padStart(2, '0')}</span>
                  <span class="body-sm" style="color: var(--ink)">{bullet}</span>
                </div>
              {/each}
            </div>
          </div>
          <div class="card row" style="padding: 14px; gap: 12px; margin-bottom: 24px">
            <div style="width: 82px">
              {#if mode === 'ctg'}{@render CTGStrip()}{:else}{@render LearningImage(studyGuide.image, studyGuide.title)}{/if}
            </div>
            <div>
              <div class="label">Estudio breve · 3 preguntas</div>
              <div class="h3" style="font-style: italic">mirar antes de responder</div>
            </div>
          </div>
          <button class="btn" onclick={enterStudy}>Estudiar primero <Icon name="chevron" /></button>
          <button class="btn secondary" style="margin-top: 10px" onclick={enterQuiz}>Ir directo al test</button>
        </section>
      {:else if screen === 'study'}
        <section class="content">
          <div class="topbar">
            <button class="icon-btn" aria-label="Volver" onclick={closeStudy}><Icon name="close" /></button>
            <span class="topbar-spacer"></span>
            <span class="chip chip-accent">Estudio</span>
          </div>

          <div class="study-hero">
            <img src={studyGuide.image} alt="" />
          </div>
          <div class="eyebrow" style="margin: 18px 0 10px">Antes del test</div>
          <h1 class="h1">{studyGuide.title}</h1>
          <p class="body" style="margin: 14px 0 18px">{studyGuide.intro}</p>

          <div class="study-steps">
            {#each studyGuide.steps as step, index (index)}
              <article class="card row" style="gap: 12px; padding: 14px">
                <span class="study-index">{String(index + 1).padStart(2, '0')}</span>
                <p class="body-sm" style="margin: 0; color: var(--ink)">{step}</p>
              </article>
            {/each}
          </div>

          <button class="btn" style="margin-top: 18px" onclick={enterQuiz}>Ahora practicar <Icon name="chevron" /></button>
        </section>
      {:else if screen === 'quiz' && current}
        <section class="content">
          <div class="topbar">
            <button class="icon-btn" aria-label="Cerrar" onclick={backHome}><Icon name="close" /></button>
            <div class="progress" style="flex: 1"><span style={`width: ${((qIndex + 1) / deck.length) * 100}%`}></span></div>
            <span class="chip">{qIndex + 1}/{deck.length}</span>
          </div>

          <FigureCaption q={current.q} />

          {#if current.mode === 'hotspot'}
            <p class="body" style="color: var(--ink); margin-bottom: 16px">{current.q.prompt}</p>
            <div
              class="figure-shell"
              style="--height: 320px"
              role="button"
              tabindex="0"
              aria-label="Tocar gráfico hotspot"
              onpointerup={handleHotspot}
              onkeydown={handleHotspotKey}
            >
              <ZoomTools />
              <div class="figure-pan">
                <div style="width: 88%">
                  {#if current.q.illustration === 'pelvis'}
                    {@render Pelvis(true, lastAnswer && !lastAnswer.correct ? current.q.correctId : null)}
                  {:else}
                    {@render FetalSkull(lastAnswer && !lastAnswer.correct ? current.q.correctId : null)}
                  {/if}
                </div>
              </div>
              {#if tap}<span class="hot-pin" style={`left:${tap.x}%; top:${tap.y}%; color:${lastAnswer?.correct ? 'var(--accent-3)' : 'var(--bad)'}`}></span>{/if}
            </div>
            {#if !lastAnswer}<p class="body-sm" style="border-left: 2px solid var(--accent); padding-left: 12px">{current.q.hint}</p>{/if}
          {:else if current.mode === 'pfeilnaht'}
            <p class="body" style="color: var(--ink); margin-bottom: 14px">{current.q.prompt}</p>
            <div class="figure-shell" style="--height: 280px">
              <ZoomTools />
              <div class="figure-pan">{@render Pfeilnaht(current.q.position, 250)}</div>
            </div>
            <Options options={current.q.options} {lastAnswer} correctId={current.q.correctId} {selected} onChoose={chooseOption} />
          {:else if current.mode === 'label'}
            <p class="body" style="color: var(--ink); margin-bottom: 14px">{current.q.prompt}</p>
            <div class="card" style="position: relative; padding: 12px; margin-bottom: 16px">
              {@render FetalSkull()}
              {#each current.q.slots as slot (slot.id)}
                <select
                  class="dd-slot"
                  class:filled={!!placements[slot.id]}
                  style={`left:${slot.x}%; top:${slot.y}%; transform: translate(-50%, -50%)`}
                  disabled={!!lastAnswer}
                  value={placements[slot.id] || ''}
                  onchange={(event) => placeTerm(slot.id, event.currentTarget.value)}
                >
                  <option value="">...</option>
                  {#each current.q.terms as term (term.id)}
                    <option value={term.id}>{term.label}</option>
                  {/each}
                </select>
              {/each}
            </div>
            <div class="row" style="gap: 8px; flex-wrap: wrap">
              {#each current.q.terms as term (term.id)}<span class="dd-tile">{term.label}</span>{/each}
            </div>
          {:else if current.mode === 'sequence'}
            <p class="body" style="color: var(--ink); margin-bottom: 14px">{current.q.prompt}</p>
            <div class="col" style="gap: 10px">
              {#each sequenceOrder as item, index (item.id)}
                <div class="sequence-card">
                  <div>{@render ManeuverThumb(item.id)}</div>
                  <div>
                    <div class="h3" style="font-size: 17px">{item.label}</div>
                    <div class="body-sm">Posición {index + 1}</div>
                  </div>
                  <div class="col" style="gap: 5px">
                    <button class="icon-btn" aria-label="Subir" onclick={() => moveSequence(index, -1)}>↑</button>
                    <button class="icon-btn" aria-label="Bajar" onclick={() => moveSequence(index, 1)}>↓</button>
                  </div>
                </div>
              {/each}
            </div>
            <button class="btn" style="margin-top: 16px" onclick={submitSequence}>Chequear orden</button>
          {:else if current.mode === 'ctg'}
            <p class="body" style="color: var(--ink); margin-bottom: 14px">{current.q.prompt}</p>
            <div class="figure-shell" style="--height: 235px">
              <div class="figure-pan">{@render CTGStrip()}</div>
            </div>
            <Options options={current.q.options} {lastAnswer} correctId={current.q.correctId} {selected} onChoose={chooseOption} />
          {/if}

          <Feedback {sheetOpen} {lastAnswer} rationale={current.q.rationale} buttonLabel={qIndex >= deck.length - 1 ? 'Resultado' : 'Seguir'} onNext={nextQuestion} />
        </section>
      {:else if screen === 'results'}
        <section class="content">
          <div class="topbar"><span class="chip chip-accent">Sesión lista</span></div>
          <h1 class="h1" style="margin: 24px 0 12px">Resultado<br /><em>{answers.filter(Boolean).length}/{answers.length}</em> correctas</h1>
          <p class="body">La sesión actualiza XP, porcentaje de aciertos y el atlas visual. Repetí los módulos con zonas rojas.</p>
          <div class="card" style="padding: 18px; margin: 20px 0">
            <div class="row" style="gap: 12px">
              <Stat label="XP" value={`+${answers.filter(Boolean).length * 15 + (answers.length - answers.filter(Boolean).length) * 3}`} />
              <Stat label="Racha" value={`${streak}d`} />
              <Stat label="Aciertos" value={`${accuracy}%`} />
            </div>
          </div>
          <button class="btn" onclick={backHome}>Volver al inicio</button>
          <button class="btn secondary" style="margin-top: 10px" onclick={openHeatmap}>Abrir atlas</button>
        </section>
      {:else if screen === 'heatmap'}
        <section class="content">
          <div class="topbar">
            <button class="icon-btn" aria-label="Volver" onclick={backHome}><Icon name="close" /></button>
            <span class="topbar-spacer"></span>
            <button class="icon-btn" aria-label="Modo contraste" onclick={() => setTheme(theme === 'ink' ? 'parchment' : 'ink')}><Icon name="contrast" /></button>
          </div>
          <div class="eyebrow" style="margin: 18px 0 10px">Mapa anatómico</div>
          <h1 class="h1">Dónde tu ojo<br /><em>todavía duda</em></h1>
          <div class="card" style="padding: 20px; margin: 18px 0">
            {@render HeatmapFigure(true)}
          </div>
          {#each [
            ['Sutura sagital y fontanelas', modeMastery.pfeilnaht, 'Distinguir anterior/posterior más rápido'],
            ['Hodge y espinas ciáticas', modeMastery.hotspot, 'Fijar el plano III'],
            ['Rotulado de estructuras', modeMastery.label, 'Identificar hitos en cráneo y pelvis'],
            ['Secuencia de maniobras', modeMastery.sequence, 'Ordenar McRoberts, Rubin, etc.'],
            ['Decalage en CTG', modeMastery.ctg, 'Reconocer DIP II con seguridad']
          ] as row (row[0])}
            <div class="atlas-row">
              <span class="chip">{row[1]}%</span>
              <div>
                <div class="h3" style="font-size: 17px">{row[0]}</div>
                <div class="body-sm">{row[2]}</div>
              </div>
              <div class="progress"><span style={`width:${row[1]}%`}></span></div>
            </div>
          {/each}
        </section>
      {:else if screen === 'atlas'}
        <section class="content">
          <div class="topbar">
            <button class="icon-btn" aria-label="Volver" onclick={backHome}><Icon name="close" /></button>
            <span class="topbar-spacer"></span>
            <span class="chip">{visibleLearningItems.length}/{allLearningItems.length}</span>
          </div>
          <div class="eyebrow" style="margin: 18px 0 10px">Atlas visual de estudio</div>
          <h1 class="h1">Todos los complejos<br /><em>visuales de examen</em></h1>
          <p class="body" style="margin: 14px 0 16px">
            Cada tarjeta trae una visualización esquemática generada para la app, formato típico de pregunta,
            marcadores relevantes y una perla clínica.
          </p>
          <div class="card" style="padding: 14px; margin-bottom: 14px">
            <div class="row" style="gap: 12px">
              <Stat label="Láminas" value={allLearningItems.length} />
              <Stat label="Áreas" value={learningSections.length} />
              <Stat label="Progreso" value={`${dailyDone}/12`} />
            </div>
          </div>
          <div class="area-tabs" aria-label="Filtrar por área">
            {#each areaOptions as area (area)}
              <button class:active={selectedArea === area} onclick={() => (selectedArea = area)}>{area}</button>
            {/each}
          </div>
          <div class="learning-list">
            {#each visibleLearningItems as item (item.title)}
              <article class="learning-card">
                <div class="learning-visual">{@render LearningVisual(item.visual)}</div>
                <div class="learning-copy">
                  <div class="row" style="gap: 8px; flex-wrap: wrap; margin-bottom: 8px">
                    <span class="chip">{item.area}</span>
                    <span class="chip chip-soft">{item.mode}</span>
                  </div>
                  <h2 class="h2" style="font-size: 25px">{item.title}</h2>
                  <p class="body-sm">{item.prompt}</p>
                  <div class="marker-grid">
                    {#each item.markers as marker (marker)}
                      <span>{marker}</span>
                    {/each}
                  </div>
                  <div class="pearl">{item.pearl}</div>
                </div>
              </article>
            {/each}
          </div>
        </section>
      {/if}
    </div>
  </main>
</div>
{#snippet MiniVisual(kind)}
  <svg viewBox="0 0 44 44" width="44" height="44" aria-hidden="true">
    <rect x="1" y="1" width="42" height="42" rx="9" fill="var(--bg-2)" stroke="var(--hairline)" />
    {#if kind === 'skull'}
      <ellipse cx="22" cy="22" rx="12" ry="15" fill="none" stroke="var(--line)" />
      <path d="M22 9v25M15 15l7 4 7-4M14 30l8-4 8 4" stroke="var(--accent)" fill="none" />
    {:else if kind === 'doppler'}
      <path d="M5 33 C12 6 17 6 23 33 C30 7 34 10 39 33" fill="none" stroke="var(--accent)" stroke-width="2" />
      <line x1="5" y1="33" x2="39" y2="33" stroke="var(--line)" stroke-opacity="0.45" />
    {:else}
      <path d="M9 28h26M22 10v25" stroke="var(--accent)" stroke-width="2.2" />
      <path d="M12 18 Q22 10 32 18" fill="none" stroke="var(--line)" />
    {/if}
  </svg>
{/snippet}

{#snippet LearningVisual(kind)}
  {#if kind === 'skull'}
    {@render LearningImage('/learning-images/fetal-head-orientation.png', 'Orientación de cráneo fetal')}
  {:else if kind === 'pelvis'}
    {@render LearningImage('/learning-images/hodge-planes-pelvis.png', 'Pelvis y descenso fetal')}
  {:else if kind === 'floor'}
    {@render LearningImage('/learning-images/pelvic-floor.png', 'Capas del suelo pélvico')}
  {:else if kind === 'placenta'}
    {@render LearningImage('/learning-images/fetal-circulation.png', 'Circulación fetal y placentaria')}
  {:else if kind === 'leopold'}
    {@render LearningImage('/learning-images/leopold-maneuvers.png', 'Maniobras de Leopold')}
  {:else if kind === 'ultrasound'}
    {@render LearningImage('/learning-images/fetal-ultrasound.png', 'Patrones ecográficos / BPD')}
  {:else if kind === 'skin'}
    {@render LearningImage('/learning-images/skin-changes.png', 'Cambios cutáneos en el embarazo')}
  {:else if kind === 'previa'}
    {@render LearningImage('/learning-images/placenta-previa.png', 'Implantación placentaria / Previa')}
  {:else if kind === 'doppler'}
    {@render LearningImage('/learning-images/doppler-waveforms.png', 'Ondas Doppler de arteria umbilical')}
  {:else if kind === 'torch'}
    {@render LearningImage('/learning-images/torch-exanthems.png', 'Manifestaciones clínicas de infecciones TORCH')}
  {:else if kind === 'pfeilnaht'}
    {@render LearningImage('/learning-images/fetal-head-orientation.png', 'Sutura sagital en pelvis')}
  {:else if kind === 'deflexion'}
    {@render LearningImage('/learning-images/deflexion-presentations.png', 'Presentaciones de deflexión cefálica')}
  {:else if kind === 'ctg'}
    {@render CTGStrip()}
  {:else if kind === 'tear'}
    {@render LearningImage('/learning-images/perineal-tears.png', 'Desgarros perineales')}
  {:else if kind === 'placenta-inspection'}
    {@render LearningImage('/learning-images/placenta-inspection.png', 'Inspección de placenta y cotiledones')}
  {:else if kind === 'shoulder'}
    {@render LearningImage('/learning-images/shoulder-maneuvers.png', 'Distocia de hombros y maniobras')}
  {:else if kind === 'instrumental'}
    {@render LearningImage('/learning-images/instrumental-delivery.png', 'Parto instrumental')}
  {:else if kind === 'sectio'}
    {@render LearningImage('/learning-images/cesarean-incisions.png', 'Incisiones de cesárea')}
  {/if}
{/snippet}

{#snippet LearningImage(src, alt)}
  <div class="generated-plate">
    <img {src} {alt} />
  </div>
{/snippet}

{#snippet Pelvis(showPlanes = true, answer = null)}
  <svg viewBox="0 0 320 360" width="100%" style="display: block; color: var(--line)">
    <defs><pattern id="pelv-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="currentColor" stroke-opacity="0.18" stroke-width="0.6" /></pattern></defs>
    <!-- Background medical illustration -->
    <image href="/learning-images/pelvis-background.png" x="0" y="0" width="320" height="360" opacity="0.85" />

    <!-- Sacrum and coccyx -->
    <path d="M180 80 Q210 100 220 140 Q228 180 224 215 Q220 245 200 270" fill="url(#pelv-hatch)" stroke="currentColor" stroke-width="1.4" opacity="0.15" />
    <path d="M200 270 Q198 285 188 290" fill="none" stroke="currentColor" stroke-width="1.4" opacity="0.15" />
    <circle cx="178" cy="98" r="2.5" fill="currentColor" opacity="0.2" />
    <!-- Symphysis pubis -->
    <ellipse cx="105" cy="165" rx="13" ry="22" fill="url(#pelv-hatch)" stroke="currentColor" stroke-width="1.2" opacity="0.15" />
    <!-- Ischial Spine -->
    <path d="M150 215 q -10 -6 -25 -3 q -6 4 -2 10 q 12 6 28 -1 z" fill="url(#pelv-hatch)" stroke="currentColor" stroke-width="1.2" opacity="0.15" />
    <path d="M147 213 l -7 -3 l 0 6 z" fill="currentColor" opacity="0.3" />
    <!-- Fetal descent path -->
    <path d="M118 180 Q135 220 155 245 Q170 260 188 268" fill="none" stroke="currentColor" stroke-width="1.2" stroke-opacity="0.3" stroke-dasharray="3 3" />
    <ellipse cx="170" cy="278" rx="14" ry="9" fill="url(#pelv-hatch)" stroke="currentColor" stroke-width="1.2" />

    {#if answer}
      <!-- Feedback labels are revealed only after answering, so hotspot questions stay unlabelled. -->
      <g opacity="0.52" font-family="var(--f-mono)" font-size="8" fill="currentColor">
        <line x1="178" y1="98" x2="230" y2="85" stroke="currentColor" stroke-width="0.8" stroke-dasharray="2 2" />
        <text x="232" y="88" text-anchor="start" stroke="var(--bg-card)" stroke-width="2.2" paint-order="stroke">Promontorio</text>

        <line x1="147" y1="213" x2="58" y2="222" stroke="currentColor" stroke-width="0.8" stroke-dasharray="2 2" />
        <text x="60" y="218" text-anchor="start" stroke="var(--bg-card)" stroke-width="2.2" paint-order="stroke">Espinas ciáticas</text>

        <line x1="105" y1="165" x2="60" y2="165" stroke="currentColor" stroke-width="0.8" stroke-dasharray="2 2" />
        <text x="62" y="160" text-anchor="start" stroke="var(--bg-card)" stroke-width="2.2" paint-order="stroke">Sínfisis púbica</text>
      </g>

      <!-- Conjugata vera line and label (Inlet diameter) -->
      <g opacity="0.65">
        <line x1="178" y1="98" x2="105" y2="142" stroke="var(--accent)" stroke-width="1" stroke-dasharray="2 2" />
        <text x="141" y="117" font-family="var(--f-mono)" font-size="7" fill="var(--accent)" text-anchor="middle" transform="rotate(-31 141 117)">Conjugata vera (~11 cm)</text>
      </g>
    {/if}

    <!-- DeLee Scale along the descent path, centered at station 0 / ischial spines (147, 208) -->
    <g opacity="0.8" stroke="currentColor" stroke-width="1">
      <line x1="124" y1="146" x2="170" y2="270" stroke-dasharray="2 2" stroke-opacity="0.4" />
      {#each [-3, -2, -1, 0, 1, 2, 3] as tick (tick)}
        {@const tx = 147 + tick * 7.67}
        {@const ty = 208 + tick * 20.67}
        {@const isZero = tick === 0}
        <line x1={tx - (isZero ? 6 : 4)} y1={ty} x2={tx + (isZero ? 6 : 4)} y2={ty} stroke={isZero ? 'var(--accent)' : 'currentColor'} stroke-width={isZero ? 1.6 : 1} />
        {#if answer}
          <text x={tx - (isZero ? 9 : 7)} y={ty + 2.5} font-family="var(--f-mono)" font-size={isZero ? '8' : '7'} font-weight={isZero ? 'bold' : 'normal'} stroke="var(--bg-card)" stroke-width="2.5" paint-order="stroke" fill={isZero ? 'var(--accent)' : 'currentColor'} text-anchor="end">{tick > 0 ? `+${tick}` : tick}</text>
        {/if}
      {/each}
      {#if answer}
        <text x="188" y="150" font-family="var(--f-mono)" font-size="7" stroke="var(--bg-card)" stroke-width="2.5" paint-order="stroke" fill="currentColor" opacity="0.75" text-anchor="middle">Estaciones DeLee (cm)</text>
      {/if}
    </g>

    {#if showPlanes}
      {#each [{y:112,id:'I'}, {y:157,id:'II'}, {y:208,id:'III'}, {y:310,id:'IV'}] as plane (plane.id)}
        <g opacity={answer && answer !== plane.id ? 0.24 : 1}>
          <!-- Oblique lines parallel to the pelvic inlet (slope -0.6 centered at x=155) -->
          <line x1="60" y1={plane.y + 57} x2="250" y2={plane.y - 57} stroke={answer === plane.id ? 'var(--accent-3)' : 'currentColor'} stroke-width={answer === plane.id ? 2 : 1} stroke-dasharray={answer === plane.id ? '0' : '4 4'} stroke-opacity={answer === plane.id ? 1 : 0.45} />
          {#if answer}
            <text x="256" y={plane.y - 57 + 4} font-family="var(--f-display)" font-size="14" font-weight="600" fill={answer === plane.id ? 'var(--accent-3)' : 'currentColor'} stroke="var(--bg-card)" stroke-width="3" paint-order="stroke" style="letter-spacing: 0.1em;">{plane.id}</text>
          {/if}
        </g>
      {/each}
    {/if}
  </svg>
{/snippet}

{#snippet FetalSkull(highlight = null)}
  <svg viewBox="0 0 280 340" width="100%" style="display: block; color: var(--line)">
    <defs>
      <pattern id="skull-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
        <line x1="0" y1="0" x2="0" y2="5" stroke="currentColor" stroke-opacity="0.08" stroke-width="0.5" />
      </pattern>

      <!-- Radial gradient for anterior/large fontanelle glow -->
      <radialGradient id="bregma-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.65" />
        <stop offset="60%" stop-color="var(--accent)" stop-opacity="0.25" />
        <stop offset="100%" stop-color="var(--accent)" stop-opacity="0" />
      </radialGradient>

      <!-- Radial gradient for posterior/small fontanelle glow -->
      <radialGradient id="lambda-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.7" />
        <stop offset="65%" stop-color="var(--accent)" stop-opacity="0.25" />
        <stop offset="100%" stop-color="var(--accent)" stop-opacity="0" />
      </radialGradient>

      <!-- Soft passive radial gradient to mark fontanelle locations subtly -->
      <radialGradient id="soft-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="currentColor" stop-opacity="0.15" />
        <stop offset="100%" stop-color="currentColor" stop-opacity="0" />
      </radialGradient>
    </defs>
    <!-- Background medical illustration (rotated to align anterior fontanelle at bottom) -->
    <image href="/learning-images/fetal-skull-background.png" x="0" y="0" width="280" height="340" transform="rotate(180 140 170)" opacity="0.9" />

    <ellipse cx="140" cy="170" rx="100" ry="130" fill="url(#skull-hatch)" stroke="currentColor" stroke-width="1.4" opacity="0.1" />

    <!-- Wavy Sutures -->
    <!-- Sagittal Suture: connects Lambda base (140,82) to Bregma top (140,228) -->
    <path d="M 140 82 L 138 90 L 142 98 L 139 106 L 141 114 L 138 122 L 142 130 L 139 138 L 141 146 L 138 154 L 142 162 L 139 170 L 141 178 L 138 186 L 142 194 L 139 202 L 141 210 L 138 218 L 140 228" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linejoin="round" opacity="0.2" />

    <!-- Frontal (Metopic) Suture: from Bregma bottom (140,262) to metopic suture (140,295) -->
    <path d="M 140 262 L 139 270 L 141 278 L 139 286 L 140 295" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linejoin="round" opacity="0.2" />

    <!-- Lambdoid Sutures: branch from the two base corners of the Lambda triangle (132,82 and 148,82) -->
    <path d="M 132 82 L 121 87 L 123 92 L 112 97 L 114 101 L 90 105" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linejoin="round" opacity="0.2" />
    <path d="M 148 82 L 159 87 L 157 92 L 168 97 L 166 101 L 190 105" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linejoin="round" opacity="0.2" />

    <!-- Coronal Sutures: branch from the lateral corners of the Bregma rhomboid (124,245 and 156,245) -->
    <path d="M 124 245 L 113 243 L 114 239 L 102 238 L 103 234 L 80 235" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linejoin="round" opacity="0.2" />
    <path d="M 156 245 L 167 243 L 166 239 L 178 238 L 177 234 L 200 235" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linejoin="round" opacity="0.2" />

    <!-- Glow circles under fontanelles for interactivity and selection highlights -->
    <circle cx="140" cy="74" r="16" fill="url(#soft-glow)" opacity="0.65" pointer-events="none" />
    <circle cx="140" cy="245" r="24" fill="url(#soft-glow)" opacity="0.65" pointer-events="none" />

    {#if highlight === 'small-font'}
      <circle cx="140" cy="74" r="24" fill="url(#lambda-glow)" opacity="1" pointer-events="none" />
    {/if}
    {#if highlight === 'large-font'}
      <circle cx="140" cy="245" r="32" fill="url(#bregma-glow)" opacity="1" pointer-events="none" />
    {/if}

    <!-- Fontanelles -->
    <!-- Fontanela Menor / Lambda (triangle): base at y=82, apex at y=60 -->
    <polygon points="140,60 132,82 148,82" fill={highlight === 'small-font' ? 'var(--accent)' : 'currentColor'} opacity={highlight === 'small-font' ? 0.78 : 0.12} />

    <!-- Fontanela Mayor / Bregma (rhomboid): centers at x=140, y=245 -->
    <polygon points="140,228 124,245 140,262 156,245" fill={highlight === 'large-font' ? 'var(--accent)' : 'none'} stroke="currentColor" stroke-width="1.4" opacity={highlight === 'large-font' ? 0.78 : 0.12} />

    <!-- Face / Eyes placeholders at the bottom (anterior guide) -->
    <line x1="140" y1="295" x2="140" y2="305" stroke="currentColor" stroke-width="1.4" opacity="0.15" />
    <circle cx="110" cy="288" r="4" fill="none" stroke="currentColor" opacity="0.15" /><circle cx="170" cy="288" r="4" fill="none" stroke="currentColor" opacity="0.15" />

    {#if highlight === 'small-font'}<circle cx="140" cy="74" r="22" fill="none" stroke="var(--accent)" stroke-width="1.6" stroke-dasharray="3 3" />{/if}
    {#if highlight === 'large-font'}<circle cx="140" cy="245" r="29" fill="none" stroke="var(--accent)" stroke-width="1.6" stroke-dasharray="3 3" />{/if}
  </svg>
{/snippet}

{#snippet Pfeilnaht(position = 'vHHL', size = 240)}
  <svg viewBox="0 0 240 240" width={size} height={size} style="display:block; color: var(--line)">
    <!-- Background medical illustration (rotated 180 deg to match anterior at bottom) -->
    <image href="/learning-images/pelvic-outlet-background.png" x="0" y="0" width="240" height="240" transform="rotate(180 120 120)" opacity="0.85" />

    <!-- Pelvic outlet rim -->
    <circle cx="120" cy="120" r="102" fill="none" stroke="currentColor" stroke-width="1.6" opacity="0.25" />
    <circle cx="120" cy="120" r="88" fill="none" stroke="currentColor" stroke-opacity="0.1" stroke-dasharray="3 4" />

    <!-- Programmatic backing circle representing the fetal head -->
    {#if position === 'asynk'}
      <circle cx="120" cy="85" r="62" fill="color-mix(in oklab, var(--bg-card) 75%, transparent)" stroke="currentColor" stroke-width="1.2" stroke-opacity="0.15" />
    {:else}
      <circle cx="120" cy="120" r="62" fill="color-mix(in oklab, var(--bg-card) 75%, transparent)" stroke="currentColor" stroke-width="1.2" stroke-opacity="0.15" />
    {/if}

    <!-- Anatomical Labels (Pubis at bottom, Sacrum at top) -->
    <text x="120" y="24" text-anchor="middle" font-family="var(--f-mono)" font-size="9" font-weight="bold" stroke="var(--bg-card)" stroke-width="3" paint-order="stroke" fill="currentColor" opacity="0.8">SACRO (Posterior)</text>
    <text x="120" y="228" text-anchor="middle" font-family="var(--f-mono)" font-size="9" font-weight="bold" stroke="var(--bg-card)" stroke-width="3" paint-order="stroke" fill="currentColor" opacity="0.8">SÍNFISIS (Anterior)</text>

    {#if position === 'vHHL'}
      <!-- Occiput Anterior Left (vHHL): Occiput (Lambda, triangle) points towards the symphysis pubis / left (bottom-right) -->
      <!-- Sagittal Suture -->
      <line x1="85" y1="85" x2="155" y2="155" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" />

      <!-- Fontanela Mayor / Bregma (rhomboid) - towards Sacrum / right (top-left) -->
      <polygon points="85,73 97,85 85,97 73,85" fill="color-mix(in oklab, var(--bg-card) 75%, transparent)" stroke="currentColor" stroke-width="1.8" />

      <!-- Fontanela Menor / Lambda (triangle) - towards Sínfisis / left (bottom-right) -->
      <polygon points="162,162 145,157 157,145" fill="var(--accent)" stroke="var(--accent)" stroke-width="1" />

      <!-- Direction arrow pointing towards Sínfisis (anterior descent/rotation) -->
      <path d="M170,145 Q185,160 185,175" fill="none" stroke="var(--accent-3)" stroke-width="2" stroke-linecap="round" marker-end="url(#arrow)" />

    {:else if position === 'hHHL'}
      <!-- Occiput Posterior Left (hHHL): Occiput (Lambda, triangle) points towards the sacrum / left (top-right) -->
      <!-- Sagittal Suture -->
      <line x1="85" y1="155" x2="155" y2="85" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" />

      <!-- Fontanela Mayor / Bregma (rhomboid) - towards Sínfisis / right (bottom-left) -->
      <polygon points="85,143 97,155 85,167 73,155" fill="color-mix(in oklab, var(--bg-card) 75%, transparent)" stroke="currentColor" stroke-width="1.8" />

      <!-- Fontanela Menor / Lambda (triangle) - towards Sacrum / left (top-right) -->
      <polygon points="162,78 145,83 157,95" fill="var(--accent)" stroke="var(--accent)" stroke-width="1" />

      <!-- Direction arrow pointing towards Sacrum (posterior descent) -->
      <path d="M170,95 Q185,80 185,65" fill="none" stroke="var(--accent-3)" stroke-width="2" stroke-linecap="round" marker-end="url(#arrow)" />

    {:else}
      <!-- Asynclitism (asynk): Suture displaced parallel/oblique to the midline -->
      <!-- Midline reference (diámetro transverso normal de la pelvis) -->
      <line x1="38" y1="120" x2="202" y2="120" stroke="currentColor" stroke-opacity="0.25" stroke-width="1.2" stroke-dasharray="3 3" />

      <!-- Displaced Sagittal Suture (horizontal, shifted towards Sacrum / top, i.e., y=85) -->
      <line x1="75" y1="85" x2="165" y2="85" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" />

      <!-- Fontanela Mayor / Bregma (rhomboid) at anterior end (viewer's left / maternal right) -->
      <polygon points="65,75 75,85 65,95 55,85" fill="color-mix(in oklab, var(--bg-card) 75%, transparent)" stroke="currentColor" stroke-width="1.8" />

      <!-- Fontanela Menor / Lambda (triangle) at posterior end (viewer's right / maternal left) -->
      <polygon points="187,85 167,75 167,95" fill="var(--accent)" stroke="var(--accent)" stroke-width="1" />

      <!-- Label or indication of displacement -->
      <g>
        <line x1="120" y1="114" x2="120" y2="88" stroke="var(--bad)" stroke-width="1.5" stroke-dasharray="2 2" />
        <polygon points="120,86 116,92 124,92" fill="var(--bad)" />
        <polygon points="120,116 116,110 124,110" fill="var(--bad)" />
        <rect x="132" y="93" width="76" height="15" rx="3" fill="color-mix(in oklab, var(--bg-card) 95%, transparent)" stroke="var(--bad)" stroke-opacity="0.3" stroke-width="0.8" />
        <text x="136" y="104" font-family="var(--f-mono)" font-size="8" fill="var(--bad)" font-weight="bold">ASINCLITISMO</text>
      </g>
    {/if}

    <text x="120" y="132" text-anchor="middle" font-family="var(--f-display)" font-style="italic" font-size="12" stroke="var(--bg-card)" stroke-width="2.5" paint-order="stroke" fill="currentColor" opacity="0.7">Sutura sagital</text>

    <!-- SVG Marker definitions -->
    <defs>
      <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="var(--accent-3)" />
      </marker>
    </defs>
  </svg>
{/snippet}

{#snippet CTGStrip()}
  <svg viewBox="0 0 380 175" width="100%" style="display:block; color: var(--line)">
    <rect x="0" y="0" width="380" height="175" rx="8" fill="var(--bg-card)" stroke="var(--hairline)" />
    <!-- Background clinical grid underlay -->
    <image href="/learning-images/ctg-strip.png" x="40" y="0" width="340" height="175" opacity="0.3" preserveAspectRatio="none" />

    <!-- Outer borders and split between FHR and UC -->
    <line x1="40" y1="0" x2="40" y2="175" stroke="currentColor" stroke-opacity="0.2" />
    <line x1="40" y1="87.5" x2="380" y2="87.5" stroke="currentColor" stroke-opacity="0.3" stroke-width="1.4" />

    <!-- Time grids (vertical lines, every 1 min = 60 units, start at x=40) -->
    <!-- Bold grids at x = 40, 100, 160, 220, 280, 340 -->
    {#each [40, 100, 160, 220, 280, 340] as vx (vx)}
      <line x1={vx} y1="0" x2={vx} y2="175" stroke="currentColor" stroke-opacity="0.25" stroke-width="1.2" />
    {/each}
    <!-- Thin grids at x = 70, 130, 190, 250, 310, 370 -->
    {#each [70, 130, 190, 250, 310, 370] as vx (vx)}
      <line x1={vx} y1="0" x2={vx} y2="175" stroke="currentColor" stroke-opacity="0.1" stroke-dasharray="2 2" />
    {/each}

    <!-- Horizontal Grid lines for FHR (bpm): 180, 160, 140, 120, 100 -->
    <!-- y values: 180=15, 160=30, 140=45, 120=60, 100=75 -->
    {#each [{y:15, val:'180'}, {y:30, val:'160'}, {y:45, val:'140'}, {y:60, val:'120'}, {y:75, val:'100'}] as grid (grid.val)}
      <line x1="40" y1={grid.y} x2="380" y2={grid.y} stroke="currentColor" stroke-opacity={grid.val === '120' || grid.val === '160' ? 0.18 : 0.08} stroke-width={grid.val === '120' || grid.val === '160' ? 1.2 : 0.8} />
      <text x="32" y={grid.y + 3} text-anchor="end" font-family="var(--f-mono)" font-size="8" fill="currentColor" opacity="0.6">{grid.val}</text>
    {/each}
    <text x="8" y="48" font-family="var(--f-mono)" font-size="7" fill="currentColor" opacity="0.5" transform="rotate(-90 8 48)" text-anchor="middle">FCF (lpm)</text>

    <!-- Horizontal Grid lines for UC (mmHg): 100, 50, 0 -->
    <!-- y values: 100=100, 50=122.5, 0=145 -->
    {#each [{y:100, val:'100'}, {y:122.5, val:'50'}, {y:145, val:'0'}] as grid (grid.val)}
      <line x1="40" y1={grid.y} x2="380" y2={grid.y} stroke="currentColor" stroke-opacity="0.08" stroke-width="0.8" />
      <text x="32" y={grid.y + 3} text-anchor="end" font-family="var(--f-mono)" font-size="8" fill="currentColor" opacity="0.6">{grid.val}</text>
    {/each}
    <text x="8" y="122" font-family="var(--f-mono)" font-size="7" fill="currentColor" opacity="0.5" transform="rotate(-90 8 122)" text-anchor="middle">CU (mmHg)</text>

    <!-- Underlay shading for normal FHR band (110 - 160 bpm, y=67.5 to y=30) -->
    <rect x="40" y="30" width="340" height="37.5" fill="var(--accent-3)" opacity="0.04" />

    <!-- FHR and UC curves -->
    <path d={ctgFhrPath} fill="none" stroke="var(--accent)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
    <path d={ctgUcPath} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.9" />

    <!-- Delay shading block to visually represent the late decel lag phase -->
    <rect x="250" y="15" width="30" height="130" fill="var(--bad)" opacity="0.06" pointer-events="none" />

    <!-- Clinical DIP II Late Decel visual indicators -->
    <!-- Highlight second contraction cycle: Peak at x=250, Nadir at x=280 -->
    <!-- Line from peak of contraction -->
    <line x1="250" y1="95" x2="250" y2="40" stroke="var(--bad)" stroke-opacity="0.4" stroke-width="1.2" stroke-dasharray="2 3" />
    <!-- Line from nadir of deceleration -->
    <line x1="280" y1="71" x2="280" y2="140" stroke="var(--bad)" stroke-opacity="0.4" stroke-width="1.2" stroke-dasharray="2 3" />

    <!-- Double-headed arrow between Peak (250) and Nadir (280) -->
    <path d="M250,83 L280,83" stroke="var(--bad)" stroke-width="1.8" marker-start="url(#d-arrow-left)" marker-end="url(#d-arrow-right)" />
    <text x="265" y="78" text-anchor="middle" font-family="var(--f-mono)" font-weight="bold" font-size="8" stroke="var(--bg-card)" stroke-width="2.5" paint-order="stroke" fill="var(--bad)">Decalage (>30s)</text>

    <!-- Markers for Peak and Nadir -->
    <circle cx="250" cy="95" r="3.5" fill="currentColor" stroke="var(--bg-card)" stroke-width="1" />
    <circle cx="280" cy="71" r="3.5" fill="var(--bad)" stroke="var(--bg-card)" stroke-width="1" />
    <text x="245" y="104" text-anchor="end" font-family="var(--f-mono)" font-size="7" stroke="var(--bg-card)" stroke-width="2.5" paint-order="stroke" fill="currentColor">Pico de contracción</text>
    <text x="285" y="65" text-anchor="start" font-family="var(--f-mono)" font-size="7" font-weight="bold" stroke="var(--bg-card)" stroke-width="2.5" paint-order="stroke" fill="var(--bad)">Nadir tardío (DIP II)</text>

    <!-- Marker definitions for double-headed arrow -->
    <defs>
      <marker id="d-arrow-left" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
        <path d="M 10 1.5 L 0 5 L 10 8.5 z" fill="var(--bad)" />
      </marker>
      <marker id="d-arrow-right" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
        <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="var(--bad)" />
      </marker>
    </defs>
  </svg>
{/snippet}

{#snippet PelvicFloor()}
  <svg viewBox="0 0 320 220" width="100%" style="display:block; color: var(--line)">
    <rect x="18" y="22" width="284" height="176" rx="16" fill="var(--bg-card)" stroke="currentColor" stroke-opacity="0.24" />
    <ellipse cx="160" cy="112" rx="102" ry="60" fill="none" stroke="currentColor" stroke-width="1.2" />
    <ellipse cx="160" cy="112" rx="74" ry="40" fill="color-mix(in oklab, var(--accent-3) 22%, transparent)" stroke="var(--accent-3)" />
    <ellipse cx="160" cy="112" rx="42" ry="22" fill="color-mix(in oklab, var(--accent) 18%, transparent)" stroke="var(--accent)" />
    <circle cx="160" cy="112" r="10" fill="var(--accent)" />
    <path d="M58 67 C102 126 218 126 262 67M70 153 C112 97 208 97 250 153" fill="none" stroke="currentColor" stroke-dasharray="5 5" opacity="0.55" />
    <text x="160" y="20" text-anchor="middle" font-family="var(--f-mono)" font-size="10" fill="currentColor">SUPERFICIAL → PROFUNDO</text>
    <text x="160" y="116" text-anchor="middle" font-family="var(--f-display)" font-size="13" fill="var(--bg-card)">Centro perineal</text>
    <text x="34" y="184" font-family="var(--f-display)" font-style="italic" font-size="14" fill="currentColor">M. levator ani</text>
  </svg>
{/snippet}

{#snippet PlacentaCirculation()}
  <svg viewBox="0 0 340 220" width="100%" style="display:block; color: var(--line)">
    <ellipse cx="92" cy="105" rx="54" ry="78" fill="color-mix(in oklab, var(--accent) 20%, var(--bg-card))" stroke="currentColor" />
    {#each Array(7) as _, i (i)}
      <path d={`M92 105 C${62 + i * 10} ${70 + (i % 2) * 22}, ${50 + i * 15} ${130 - (i % 3) * 16}, ${48 + i * 14} ${158 - (i % 2) * 22}`} fill="none" stroke="var(--accent)" stroke-width="2" />
    {/each}
    <path d="M145 105 C190 92 205 95 232 112" fill="none" stroke="var(--accent-2)" stroke-width="8" stroke-linecap="round" />
    <path d="M145 122 C188 142 208 145 234 128" fill="none" stroke="var(--accent)" stroke-width="5" stroke-linecap="round" />
    <ellipse cx="260" cy="118" rx="46" ry="54" fill="none" stroke="currentColor" />
    <path d="M240 112 C258 92 278 96 286 116M250 132 C262 120 276 121 292 135" fill="none" stroke="var(--accent-3)" stroke-width="2.4" />
    <circle cx="263" cy="114" r="8" fill="none" stroke="var(--accent)" />
    <text x="92" y="26" text-anchor="middle" font-family="var(--f-display)" font-style="italic" font-size="15">Árbol velloso</text>
    <text x="260" y="184" text-anchor="middle" font-family="var(--f-mono)" font-size="9">DV · FO · DA</text>
  </svg>
{/snippet}

{#snippet Leopold()}
  <svg viewBox="0 0 340 220" width="100%" style="display:block; color: var(--line)">
    {#each [0, 1, 2, 3] as step (step)}
      <g transform={`translate(${22 + step * 78}, 30)`}>
        <ellipse cx="34" cy="76" rx="28" ry="48" fill="var(--bg-card)" stroke="currentColor" />
        <ellipse cx="34" cy="76" rx="11" ry="20" fill="none" stroke="var(--accent)" />
        <path d={step === 0 ? 'M12 28 Q34 10 56 28' : step === 1 ? 'M6 66 Q16 52 26 66M62 66 Q52 52 42 66' : step === 2 ? 'M12 126 Q34 104 56 126' : 'M4 116 Q18 94 30 116M64 116 Q50 94 38 116'} fill="none" stroke="var(--accent)" stroke-width="4" stroke-linecap="round" />
        <text x="34" y="150" text-anchor="middle" font-family="var(--f-mono)" font-size="10">{step + 1}</text>
      </g>
    {/each}
    <text x="170" y="205" text-anchor="middle" font-family="var(--f-display)" font-style="italic" font-size="15">Compará la posición de las manos</text>
  </svg>
{/snippet}

{#snippet Ultrasound()}
  <svg viewBox="0 0 340 220" width="100%" style="display:block; color: var(--line)">
    <rect x="22" y="20" width="296" height="180" rx="12" fill="#171717" />
    <path d="M62 170 C76 88 129 45 188 55 C251 66 280 115 282 170" fill="none" stroke="#d9d3c4" stroke-width="3" opacity="0.84" />
    <ellipse cx="164" cy="106" rx="58" ry="40" fill="none" stroke="#f1e8d2" stroke-width="2" opacity="0.8" />
    <line x1="120" y1="104" x2="208" y2="104" stroke="var(--accent-2)" stroke-width="2.5" />
    <path d="M222 88 C240 92 252 104 262 120" fill="none" stroke="var(--accent)" stroke-width="2.3" />
    <line x1="224" y1="82" x2="246" y2="80" stroke="var(--accent-3)" stroke-width="2.5" />
    <text x="126" y="96" font-family="var(--f-mono)" font-size="9" fill="#f1e8d2">BPD</text>
    <text x="248" y="80" font-family="var(--f-mono)" font-size="9" fill="#f1e8d2">NT</text>
  </svg>
{/snippet}

{#snippet SkinChanges()}
  <svg viewBox="0 0 340 220" width="100%" style="display:block; color: var(--line)">
    <rect x="18" y="24" width="88" height="160" rx="16" fill="color-mix(in oklab, var(--accent-2) 20%, var(--bg-card))" stroke="currentColor" />
    <line x1="62" y1="44" x2="62" y2="164" stroke="var(--accent)" stroke-width="3" />
    <rect x="126" y="24" width="88" height="160" rx="16" fill="color-mix(in oklab, var(--accent-2) 16%, var(--bg-card))" stroke="currentColor" />
    <path d="M150 72 C164 54 188 58 194 78 C186 101 158 97 150 72Z" fill="var(--accent-2)" opacity="0.45" />
    <rect x="234" y="24" width="88" height="160" rx="16" fill="var(--bg-card)" stroke="currentColor" />
    {#each Array(16) as _, i (i)}
      <circle cx={252 + (i % 4) * 14} cy={56 + Math.floor(i / 4) * 24} r={2 + (i % 3)} fill={i % 5 === 0 ? 'var(--bad)' : 'var(--accent)'} opacity="0.82" />
    {/each}
    <text x="62" y="203" text-anchor="middle" font-family="var(--f-mono)" font-size="9">LINEA</text>
    <text x="170" y="203" text-anchor="middle" font-family="var(--f-mono)" font-size="9">CHLOASMA</text>
    <text x="278" y="203" text-anchor="middle" font-family="var(--f-mono)" font-size="9">PETEQUIAS</text>
  </svg>
{/snippet}

{#snippet PlacentaPrevia()}
  <svg viewBox="0 0 340 220" width="100%" style="display:block; color: var(--line)">
    {#each ['lateralis', 'marginalis', 'totalis'] as label, i (label)}
      <g transform={`translate(${24 + i * 104}, 18)`}>
        <path d="M48 8 C84 20 84 76 70 112 C64 132 58 150 48 176 C38 150 32 132 26 112 C12 76 12 20 48 8Z" fill="none" stroke="currentColor" />
        <rect x="38" y="148" width="20" height="36" rx="9" fill="var(--bg-2)" stroke="currentColor" />
        <ellipse cx={label === 'lateralis' ? 34 : label === 'marginalis' ? 48 : 48} cy={label === 'lateralis' ? 62 : label === 'marginalis' ? 130 : 150} rx="30" ry="18" fill="var(--accent)" opacity="0.72" />
        <line x1="14" y1="148" x2="82" y2="148" stroke="var(--bad)" stroke-dasharray="4 4" />
        <text x="48" y="205" text-anchor="middle" font-family="var(--f-mono)" font-size="8">{label}</text>
      </g>
    {/each}
  </svg>
{/snippet}

{#snippet Doppler()}
  <svg viewBox="0 0 340 220" width="100%" style="display:block; color: var(--line)">
    {#each ['normal', 'AEDV', 'REDV'] as label, r (label)}
      <g transform={`translate(20, ${28 + r * 58})`}>
        <line x1="0" y1="36" x2="300" y2="36" stroke="currentColor" stroke-opacity="0.25" />
        <path d={r === 0 ? 'M0 35 C18 0 34 0 46 35 C70 28 88 28 104 35 C122 0 140 0 152 35 C178 28 192 28 210 35 C230 0 248 0 260 35' : r === 1 ? 'M0 35 C20 0 36 0 48 35 C75 35 90 35 106 35 C126 0 143 0 156 35 C182 35 195 35 212 35 C232 0 250 0 262 35' : 'M0 35 C20 0 36 0 48 35 C72 49 92 50 106 35 C126 0 143 0 156 35 C180 50 198 49 212 35 C232 0 250 0 262 35'} fill="none" stroke={r === 0 ? 'var(--accent-3)' : r === 1 ? 'var(--warn)' : 'var(--bad)'} stroke-width="2.4" />
        <text x="286" y="18" font-family="var(--f-mono)" font-size="10" fill="currentColor">{label}</text>
      </g>
    {/each}
  </svg>
{/snippet}

{#snippet Torch()}
  <svg viewBox="0 0 340 220" width="100%" style="display:block; color: var(--line)">
    <circle cx="95" cy="90" r="54" fill="var(--bg-card)" stroke="currentColor" />
    {#each Array(22) as _, i (i)}
      <circle cx={62 + (i % 6) * 13} cy={62 + Math.floor(i / 6) * 17} r="3" fill="var(--bad)" opacity="0.8" />
    {/each}
    <circle cx="78" cy="82" r="7" fill="none" stroke="var(--accent)" stroke-width="2" />
    <circle cx="112" cy="82" r="7" fill="none" stroke="var(--accent)" stroke-width="2" />
    <rect x="190" y="42" width="92" height="104" rx="24" fill="var(--bg-card)" stroke="currentColor" />
    <circle cx="220" cy="82" r="10" fill="var(--accent-2)" opacity="0.7" />
    <path d="M214 128 C230 112 250 112 266 128" fill="none" stroke="var(--bad)" stroke-width="3" />
    <text x="95" y="174" text-anchor="middle" font-family="var(--f-mono)" font-size="9">Petequias</text>
    <text x="236" y="174" text-anchor="middle" font-family="var(--f-mono)" font-size="9">Catarata/vesículas</text>
  </svg>
{/snippet}

{#snippet PfeilnahtSet()}
  <div class="triple-visual">
    {@render Pfeilnaht('vHHL', 108)}
    {@render Pfeilnaht('hHHL', 108)}
    {@render Pfeilnaht('asynk', 108)}
  </div>
{/snippet}

{#snippet Deflexion()}
  <svg viewBox="0 0 340 220" width="100%" style="display:block; color: var(--line)">
      {#each ['Bregma', 'Frente', 'Cara'] as label, i (label)}
      <g transform={`translate(${28 + i * 102}, 28)`}>
        <path d="M22 132 Q54 152 84 132" fill="none" stroke="currentColor" />
        <ellipse cx="54" cy={i === 0 ? 76 : i === 1 ? 70 : 64} rx="28" ry="34" transform={`rotate(${i === 0 ? 14 : i === 1 ? 34 : 58} 54 76)`} fill="none" stroke="currentColor" stroke-width="1.5" />
        <circle cx={i === 2 ? 77 : 68} cy={i === 2 ? 62 : 72} r="3" fill="var(--accent)" />
        <path d="M54 108 L54 140" stroke="var(--accent-2)" stroke-width="2" />
        <text x="54" y="170" text-anchor="middle" font-family="var(--f-mono)" font-size="9">{label}</text>
      </g>
    {/each}
  </svg>
{/snippet}

{#snippet PerinealTears()}
  <svg viewBox="0 0 340 220" width="100%" style="display:block; color: var(--line)">
      {#each ['I', 'II', 'III', 'IV'] as grade, i (grade)}
      <g transform={`translate(${18 + i * 80}, 24)`}>
        <ellipse cx="36" cy="58" rx="22" ry="30" fill="none" stroke="currentColor" />
        <circle cx="36" cy="126" r="22" fill="none" stroke="currentColor" />
        <path d={`M36 86 C${36 + i * 2} ${104 + i * 8}, ${36 - i * 3} ${112 + i * 10}, 36 ${i > 2 ? 148 : 124}`} fill="none" stroke="var(--bad)" stroke-width={2 + i * 0.7} stroke-linecap="round" />
        {#if i >= 2}<circle cx="36" cy="126" r="25" fill="none" stroke="var(--bad)" stroke-width="2" />{/if}
        {#if i === 3}<circle cx="36" cy="126" r="10" fill="var(--bad)" opacity="0.35" />{/if}
        <text x="36" y="184" text-anchor="middle" font-family="var(--f-display)" font-style="italic" font-size="18">Grado {grade}</text>
      </g>
    {/each}
  </svg>
{/snippet}

{#snippet PlacentaInspection()}
  <svg viewBox="0 0 340 220" width="100%" style="display:block; color: var(--line)">
    <ellipse cx="128" cy="106" rx="78" ry="68" fill="color-mix(in oklab, var(--accent) 22%, var(--bg-card))" stroke="currentColor" />
    {#each Array(11) as _, i (i)}
      <path d={`M128 106 L${72 + (i % 5) * 28} ${58 + Math.floor(i / 5) * 54}`} stroke="currentColor" stroke-opacity="0.35" />
    {/each}
    <path d="M164 126 Q186 116 190 142 Q176 157 156 146Z" fill="var(--bg-card)" stroke="var(--bad)" stroke-width="2" />
    <path d="M198 84 C234 74 256 82 286 60" fill="none" stroke="var(--bad)" stroke-width="3" stroke-linecap="round" />
    <ellipse cx="284" cy="60" rx="26" ry="18" fill="none" stroke="var(--bad)" stroke-dasharray="5 4" />
    <text x="150" y="194" font-family="var(--f-mono)" font-size="9">Defecto cotiledón + vaso marginal</text>
  </svg>
{/snippet}

{#snippet Instrumental()}
  <svg viewBox="0 0 340 220" width="100%" style="display:block; color: var(--line)">
    <ellipse cx="116" cy="104" rx="56" ry="68" fill="none" stroke="currentColor" />
    <path d="M78 64 C36 92 42 140 84 154M154 64 C196 92 190 140 148 154" fill="none" stroke="var(--accent)" stroke-width="4" stroke-linecap="round" />
    <line x1="116" y1="44" x2="116" y2="164" stroke="currentColor" stroke-dasharray="5 5" opacity="0.45" />
    <ellipse cx="248" cy="106" rx="52" ry="62" fill="none" stroke="currentColor" />
    <circle cx="248" cy="82" r="20" fill="none" stroke="var(--accent-3)" stroke-width="4" />
    <circle cx="248" cy="82" r="4" fill="var(--accent-3)" />
    <text x="116" y="196" text-anchor="middle" font-family="var(--f-mono)" font-size="9">Forceps</text>
    <text x="248" y="196" text-anchor="middle" font-family="var(--f-mono)" font-size="9">Punto flexión</text>
  </svg>
{/snippet}

{#snippet Sectio()}
  <svg viewBox="0 0 340 220" width="100%" style="display:block; color: var(--line)">
    <g transform="translate(28, 24)">
      <ellipse cx="72" cy="80" rx="50" ry="68" fill="none" stroke="currentColor" />
      <path d="M26 126 Q72 144 118 126" stroke="var(--accent)" stroke-width="5" stroke-linecap="round" />
      <path d="M72 24 L72 148" stroke="var(--bad)" stroke-width="3" stroke-linecap="round" stroke-dasharray="7 5" />
      <text x="72" y="174" text-anchor="middle" font-family="var(--f-mono)" font-size="9">Piel</text>
    </g>
    <g transform="translate(194, 24)">
      <path d="M18 36 C72 -4 126 36 110 104 C104 140 40 140 34 104 C28 78 24 56 18 36Z" fill="none" stroke="currentColor" />
      <path d="M38 112 Q72 128 106 112" stroke="var(--accent-3)" stroke-width="5" stroke-linecap="round" />
      <path d="M72 34 L72 126" stroke="var(--bad)" stroke-width="3" stroke-linecap="round" />
      <text x="72" y="174" text-anchor="middle" font-family="var(--f-mono)" font-size="9">Uterus</text>
    </g>
  </svg>
{/snippet}

{#snippet ManeuverGrid()}
  <div style="display:grid; grid-template-columns:1fr 1fr; gap: 5px; padding: 8px">
    {@render ManeuverThumb('mcroberts')}{@render ManeuverThumb('suprapubic')}{@render ManeuverThumb('woods')}{@render ManeuverThumb('jacquemier')}
  </div>
{/snippet}

{#snippet ManeuverThumb(step)}
  <svg viewBox="0 0 70 70" width="100%" style="display:block; color: var(--line)">
    <defs>
      <marker id="m-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
        <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="var(--accent)" />
      </marker>
    </defs>
    <!-- Background medical illustration -->
    <image href={`/learning-images/${step}-background.png`} x="4" y="4" width="62" height="62" opacity="0.85" />
    <rect x="4" y="4" width="62" height="62" rx="8" fill="none" stroke="currentColor" stroke-opacity="0.22" />
    {#if step === 'mcroberts'}
      <!-- McRoberts: flexed thighs up against abdomen -->
      <line x1="8" y1="58" x2="62" y2="58" stroke="currentColor" stroke-opacity="0.2" stroke-dasharray="2 2" />
      <!-- Torso outline -->
      <path d="M 12 50 C 20 42, 32 42, 40 48 C 43 51, 45 54, 46 58" fill="none" stroke="currentColor" stroke-opacity="0.4" stroke-width="1.2" />
      <!-- Normal leg position (ghosted) -->
      <path d="M 44 50 L 52 32 L 60 45" fill="none" stroke="currentColor" stroke-opacity="0.15" stroke-width="1" stroke-dasharray="2 2" />
      <!-- Hyperflexed leg -->
      <path d="M 44 50 L 26 30 L 12 34" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      <!-- Flexion arrow -->
      <path d="M 52 28 C 44 18, 30 18, 22 24" fill="none" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round" marker-end="url(#m-arrow)" />
      <text x="35" y="65" text-anchor="middle" font-family="var(--f-mono)" font-size="6" fill="currentColor" opacity="0.7">Hiperflexión</text>
    {:else if step === 'suprapubic'}
      <!-- Suprapubic pressure: downwards/posterior force vector near pubic symphysis -->
      <!-- Maternal pelvis bones / symphysis pubis representation -->
      <path d="M 38 48 Q 42 46 44 50 Q 42 54 38 48 Z" fill="currentColor" fill-opacity="0.1" stroke="currentColor" stroke-width="0.8" />
      <text x="44" y="55" font-family="var(--f-mono)" font-size="5" fill="currentColor" opacity="0.6">Pubis</text>

      <!-- Fetal head already delivered, pointing downwards -->
      <circle cx="20" cy="54" r="5" fill="none" stroke="currentColor" stroke-opacity="0.3" stroke-dasharray="1 1" />
      <!-- Fetal neck & chest stuck behind pubis -->
      <path d="M 20 49 C 24 47 28 42 32 36 L 46 36" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.4" />

      <!-- Downward and posterior pressure arrow (Mazzanti/Rubin I) applied above pubis -->
      <path d="M 24 16 L 31 34" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" marker-end="url(#m-arrow)" />
      <text x="18" y="18" font-family="var(--f-mono)" font-size="7" fill="var(--accent)" font-weight="bold">Presión</text>
      <text x="35" y="65" text-anchor="middle" font-family="var(--f-mono)" font-size="6" fill="currentColor" opacity="0.7">Suprapúbica</text>
    {:else if step === 'woods'}
      <!-- Woods/Rubin rotation: internal shoulder rotation -->
      <!-- Pelvic inlet boundary -->
      <circle cx="35" cy="33" r="21" fill="none" stroke="currentColor" stroke-opacity="0.15" stroke-width="1" />

      <!-- Pubis (anterior / bottom of the pelvis in this projection) -->
      <circle cx="35" cy="54" r="2.5" fill="currentColor" opacity="0.5" />
      <text x="35" y="60" text-anchor="middle" font-family="var(--f-mono)" font-size="5" fill="currentColor" opacity="0.6">Pubis</text>

      <!-- Sacrum (posterior / top of the pelvis in this projection) -->
      <path d="M 31 12 Q 35 9 39 12" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.4" />
      <text x="35" y="8" text-anchor="middle" font-family="var(--f-mono)" font-size="5" fill="currentColor" opacity="0.6">Sacro</text>

      <!-- Fetal shoulders -->
      <line x1="23" y1="33" x2="47" y2="33" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" opacity="0.4" />
      <circle cx="35" cy="33" r="6" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.4" />

      <!-- Rotation arrows -->
      <path d="M 21 28 A 14 14 0 0 1 35 15" fill="none" stroke="var(--accent)" stroke-width="1.8" stroke-linecap="round" marker-end="url(#m-arrow)" />
      <path d="M 49 38 A 14 14 0 0 1 35 51" fill="none" stroke="var(--accent)" stroke-width="1.8" stroke-linecap="round" marker-end="url(#m-arrow)" />
      <text x="35" y="66" text-anchor="middle" font-family="var(--f-mono)" font-size="5.5" fill="currentColor" opacity="0.7">Rotación Int.</text>
    {:else if step === 'jacquemier'}
      <!-- Jacquemier: sweep and deliver posterior arm -->
      <!-- Birth canal boundaries -->
      <line x1="8" y1="16" x2="62" y2="16" stroke="currentColor" stroke-opacity="0.15" stroke-dasharray="2 2" />
      <line x1="8" y1="52" x2="62" y2="52" stroke="currentColor" stroke-opacity="0.15" stroke-dasharray="2 2" />

      <!-- Baby's chest and shoulder -->
      <path d="M 46 22 C 40 24 34 30 32 38 L 56 38" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4" />

      <!-- Swept posterior arm and hand -->
      <path d="M 35 28 C 26 31 21 37 25 43 C 27 45 34 44 46 44" fill="none" stroke="var(--accent)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />

      <!-- Direction arrow showing sweeping exit -->
      <path d="M 23 37 C 24 45 32 49 42 47" fill="none" stroke="var(--accent)" stroke-width="1.2" stroke-dasharray="2 2" marker-end="url(#m-arrow)" />
      <text x="44" y="27" font-family="var(--f-mono)" font-size="5.5" fill="var(--accent)">Brazo post.</text>
      <text x="35" y="65" text-anchor="middle" font-family="var(--f-mono)" font-size="6" fill="currentColor" opacity="0.7">Extracción</text>
    {/if}
  </svg>
{/snippet}

{#snippet HeatmapFigure(large = false)}
  <svg viewBox="0 0 220 260" width="100%" style={`display:block; color: var(--line); ${large ? 'max-height: 330px' : ''}`}>
    <!-- Background medical illustration -->
    <image href="/learning-images/heatmap-background.png" x="10" y="30" width="200" height="220" opacity="0.65" />
    <ellipse cx="110" cy="80" rx="32" ry="44" fill="color-mix(in oklab, var(--accent-2) 45%, var(--bg-card))" stroke="currentColor" stroke-width="1.2" opacity="0.8" />
    <path d="M66 142 C82 108 138 108 154 142 C164 164 149 196 110 214 C71 196 56 164 66 142Z" fill="color-mix(in oklab, var(--bad) 42%, var(--bg-card))" stroke="currentColor" stroke-width="1.2" opacity="0.8" />
    <path d="M84 154 Q110 126 136 154 Q128 184 110 195 Q92 184 84 154Z" fill="color-mix(in oklab, var(--accent-3) 52%, var(--bg-card))" stroke="currentColor" stroke-width="1.2" opacity="0.8" />
    <path d="M72 221 Q110 238 148 221" fill="none" stroke="var(--bad)" stroke-width="7" stroke-linecap="round" opacity="0.8" />
    <text x="110" y="24" text-anchor="middle" font-family="var(--f-mono)" font-size="10" fill="currentColor">VISUAL ATLAS</text>
  </svg>
{/snippet}
