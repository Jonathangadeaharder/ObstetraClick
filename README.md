# ObstetraClick

Aplicación de entrenamiento visual obstétrico. Láminas interactivas, hotspots anatómicos, quiz clínico y atlas visual — toda la interfaz en español rioplatense.

## Funcionalidades

- **5 modos de quiz**: Hotspot (tocar zona anatómica), Sutura sagital (diagnóstico de posición), Rotulado (arrastrar etiquetas), Secuencia (ordenar maniobras), CTG (leer curvas)
- **Repaso diario**: mezcla de preguntas de distintos módulos (12 objetivo)
- **Atlas visual**: 15 visualizaciones en 5 áreas (Bases anatómicas, Embarazo normal, Evaluación de riesgo, Parto y puerperio, Operaciones y maniobras)
- **Mapa de dominio**: heatmap de aciertos por modo
- **Flujo estudiar primero / evaluar directo**: toggle en pantalla de inicio
- **Gamificación**: XP, racha, porcentaje de aciertos, nivel (cada 120 XP)
- **Persistencia**: progreso en `localStorage` (nombre, stats, tema, dominio por modo)
- **Temas**: parchment (claro) / ink (oscuro)

## Stack

- **SvelteKit** (Svelte 5) con `@sveltejs/adapter-node`
- **pnpm** 9.15.0 (package manager)
- **Node** ≥ 20.10
- **Vite** 6
- **Docker** con Coolify + Traefik (puerto 3000)
- **SonarCloud** (calidad de código)

## Estructura

```text
src/
  app.html                # HTML shell (lang="es-AR")
  routes/
    +layout.svelte        # Layout raíz (importa styles.css)
    +page.svelte          # Pantalla única: onboarding → home → quiz → results
    styles.css            # Estilos globales, temas CSS custom properties
  lib/
    data/
      questions.ts        # Banco de preguntas por modo (hotspot, pfeilnaht, label, sequence, ctg)
      content.ts          # Modos, intros, atlas, guías de estudio
    components/ui/
      Stat.svelte         # Chip de estadística (XP, aciertos, nivel)
      FigureCaption.svelte # Fig. + título + latin
      Options.svelte      # Botones de opción A/B/C
      Feedback.svelte     # Sheet inferior con resultado + rationale
      ZoomTools.svelte    # Controles de zoom sobre figuras
      Icon.svelte         # Iconos SVG inline (close, chevron, calendar, contrast, user-x)
static/
  favicon.svg
  learning-images/        # 25 imágenes PNG de fondo para láminas SVG
```

## Desarrollo

```bash
pnpm install
pnpm run dev          # http://localhost:5173
pnpm run build        # salida en build/
pnpm run preview      # servidor de preview
pnpm run check        # svelte-check
```

## Docker

```bash
docker compose up     # expone puerto 3000 vía Traefik
```

Despliegue productivo vía Coolify con red externa `coolify` y labels Traefik para routing por Host.
