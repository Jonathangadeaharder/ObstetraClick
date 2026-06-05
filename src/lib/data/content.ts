export type Mode = {
  id: string;
  figure: string;
  title: string;
  sub: string;
  count: string;
  wide?: boolean;
};

export type Intro = {
  titlePre: string;
  title: string;
  intro: string;
  bullets: string[];
};

export type LearningItem = {
  key: string;
  title: string;
  visual: string;
  mode: string;
  prompt: string;
  markers: string[];
  pearl: string;
};

export type LearningSection = {
  area: string;
  items: LearningItem[];
};

export type StudyGuide = {
  image: string;
  title: string;
  intro: string;
  steps: string[];
};

export type LearningItemWithArea = LearningItem & { area: string };

export const modes: Mode[] = [
  {
    id: "hotspot",
    figure: "01",
    title: "Hotspot",
    sub: "Marcá estructuras",
    count: "3 láminas",
  },
  {
    id: "pfeilnaht",
    figure: "02",
    title: "Sutura sagital",
    sub: "Pensá el tacto",
    count: "3 esquemas",
  },
  {
    id: "label",
    figure: "03",
    title: "Rotulado",
    sub: "Arrastrar y soltar",
    count: "1 lámina",
  },
  {
    id: "sequence",
    figure: "04",
    title: "Secuencia",
    sub: "Ordená maniobras",
    count: "1 serie",
  },
  {
    id: "ctg",
    figure: "05",
    title: "CTG",
    sub: "Leé la curva",
    count: "1 trazado",
    wide: true,
  },
];

export const intros: Record<string, Intro> = {
  hotspot: {
    titlePre: "Localizá",
    title: "sin dudar",
    intro:
      "Tocá láminas anatómicas sin rótulos. La zona objetivo tiene tolerancia para dedo, pero sigue siendo clínicamente preciso.",
    bullets: [
      "Planos de Hodge y estaciones de DeLee",
      "Fontanelas y suturas",
      "Marcadores de placenta y piso pelviano",
    ],
  },
  pfeilnaht: {
    titlePre: "Del 2D",
    title: "al tacto",
    intro:
      "Función central: unir recorrido de la sutura sagital, fontanela menor y orientación pélvica para llegar al diagnóstico de posición.",
    bullets: [
      "Diferenciar variedades anteriores y posteriores",
      "Reconocer el “mira estrellas”",
      "Deducir asinclitismo visualmente",
    ],
  },
  label: {
    titlePre: "Atlas",
    title: "rotulado",
    intro:
      "Ubicá términos técnicos directamente sobre los hitos gráficos. Sirve para fijar topografía con seguridad.",
    bullets: [
      "Láminas sin rótulos",
      "Etiquetas preparables en varios idiomas",
      "Feedback visual inmediato",
    ],
  },
  sequence: {
    titlePre: "Secuencias",
    title: "sin mezclar",
    intro:
      "Las maniobras obstétricas se evalúan como serie visual, no como texto memorizado.",
    bullets: [
      "Distocia de hombros",
      "Extracción instrumental",
      "Incisiones de cesárea",
    ],
  },
  ctg: {
    titlePre: "Curvas",
    title: "a primera vista",
    intro:
      "Los recortes de CTG entrenan reconocimiento de patrón: timing, forma y consecuencia clínica.",
    bullets: [
      "Desaceleraciones tempranas, variables y tardías",
      "Patrones sinusoidales",
      "Ubicar visualmente la decalage",
    ],
  },
};

export const learningSections: LearningSection[] = [
  {
    area: "Bases anatómicas",
    items: [
      {
        key: "skull",
        title: "Cráneo fetal",
        visual: "skull",
        mode: "Hotspot · Rotulado",
        prompt:
          "Localizar suturas y fontanelas; diferenciar la fontanela menor triangular de la mayor romboidal.",
        markers: [
          "Sutura sagittalis",
          "Sutura coronalis",
          "Sutura lambdoidea",
          "Fonticulus posterior",
          "Fonticulus anterior",
        ],
        pearl:
          "La fontanela menor marca el occipucio y es el punto clave de orientación en el tacto vaginal.",
      },
      {
        key: "pelvis",
        title: "Pelvis ósea y planos",
        visual: "pelvis",
        mode: "Hotspot · Asociación",
        prompt:
          "Asignar Hodge I-IV, estaciones de DeLee y estrecheces óseas en el modelo sagital de pelvis.",
        markers: [
          "Promontorio",
          "Conjugata vera",
          "Espinas ciáticas",
          "Ángulo subpúbico",
          "Hodge III",
        ],
        pearl:
          "Hodge III pasa por las espinas ciáticas y corresponde clínicamente a la estación 0.",
      },
      {
        key: "pelvic-floor",
        title: "Capas del piso pelviano",
        visual: "floor",
        mode: "Aislar capas",
        prompt:
          "Separar capa superficial, media y profunda; visualizar el centro tendinoso del periné durante el parto.",
        markers: [
          "M. bulbospongiosus",
          "M. transversus perinei",
          "M. puborectalis",
          "M. levator ani",
          "Centrum perinei",
        ],
        pearl:
          "Para desgarros y suturas importa qué capa está abierta y cuál sigue conservada.",
      },
      {
        key: "placenta-circulation",
        title: "Placenta y circulación fetal",
        visual: "placenta",
        mode: "Hotspot · Comparar vasos",
        prompt:
          "Reconocer vellosidades placentarias, vasos umbilicales y shunts fetales en una vista integrada.",
        markers: [
          "Ductus venosus",
          "Foramen ovale",
          "Ductus arteriosus",
          "V. umbilicalis",
          "Aa. umbilicales",
        ],
        pearl:
          "Los shunts fetales saltean hígado y pulmones; tras el nacimiento cambian las presiones y se modifica la circulación.",
      },
    ],
  },
  {
    area: "Embarazo normal",
    items: [
      {
        key: "leopold",
        title: "Maniobras de Leopold",
        visual: "leopold",
        mode: "Asociación visual",
        prompt:
          "Reconocer la posición de las manos en las cuatro maniobras, sobre todo Pawlik y la cuarta maniobra.",
        markers: [
          "Fondo uterino",
          "Dorso fetal",
          "Maniobra de Pawlik",
          "Descenso cefálico",
        ],
        pearl:
          "La cuarta maniobra se dirige hacia el estrecho superior y evalúa si la cabeza entró en la pelvis.",
      },
      {
        key: "ultrasound",
        title: "Patrones ecográficos",
        visual: "ultrasound",
        mode: "Marcar plano de medición",
        prompt:
          "Marcar TN en corte sagital de primer trimestre, más planos correctos para DBP y perímetro abdominal.",
        markers: [
          "Translucencia nucal",
          "Plano DBP",
          "Perímetro abdominal",
          "Burbuja gástrica",
          "Columna",
        ],
        pearl:
          "No mires primero el número: mirá el plano. Un plano mal elegido arruina cualquier medición.",
      },
      {
        key: "skin",
        title: "Cambios cutáneos y vasculares",
        visual: "skin",
        mode: "Mirada diferencial",
        prompt:
          "Diferenciar pigmentación fisiológica de signos de alarma como petequias o edema patológico.",
        markers: [
          "Línea nigra",
          "Cloasma gravídico",
          "Estrías",
          "Petequias",
          "Edema",
        ],
        pearl:
          "Los cambios fisiológicos suelen ser amplios y simétricos; el sangrado puntiforme exige contexto clínico.",
      },
    ],
  },
  {
    area: "Evaluación de riesgo",
    items: [
      {
        key: "placenta-previa",
        title: "Implantación placentaria",
        visual: "previa",
        mode: "Asociación · Detectar error",
        prompt:
          "Distinguir previa total, marginal y lateral; también accreta, increta y percreta.",
        markers: [
          "Orificio cervical interno",
          "Placenta previa total",
          "Marginal",
          "Invasión miometrial",
          "Serosa",
        ],
        pearl:
          "La relación con el orificio cervical interno define la previa; la profundidad define el espectro accreta.",
      },
      {
        key: "doppler",
        title: "Ondas Doppler",
        visual: "doppler",
        mode: "Lectura de curvas",
        prompt:
          "Reconocer AEDV, REDV y brain sparing a partir del componente diastólico.",
        markers: ["Sístole", "Diástole", "AEDV", "REDV", "Resistencia ACM"],
        pearl:
          "En la arteria umbilical, el flujo diastólico ausente o reverso es un signo de alto riesgo.",
      },
      {
        key: "torch",
        title: "Exantemas TORCH",
        visual: "torch",
        mode: "Reconocimiento de patrón",
        prompt:
          "Diferenciar petequias neonatales, signos de catarata y lesiones vesiculares por varicela.",
        markers: [
          "Blueberry muffin",
          "Catarata",
          "Vesículas",
          "Signos de hepatoesplenomegalia",
        ],
        pearl:
          "En infecciones importa el patrón de piel, ojos y estado general; no una manchita aislada.",
      },
    ],
  },
  {
    area: "Parto y puerperio",
    items: [
      {
        key: "pfeilnaht",
        title: "Orientaciones de sutura sagital",
        visual: "pfeilnaht",
        mode: "Quiz central · Diagnóstico de posición",
        prompt:
          "Traducir recorrido de la sutura sagital y fontanela menor en variedad anterior, posterior o asinclitismo.",
        markers: [
          "Sínfisis",
          "Sacro",
          "Sutura sagital",
          "Fontanela menor",
          "Asinclitismo",
        ],
        pearl:
          "Primero encontrá la fontanela; después pensá hacia dónde mira dentro de la pelvis materna.",
      },
      {
        key: "deflexion",
        title: "Actitudes de deflexión",
        visual: "deflexion",
        mode: "Reconocer vista lateral",
        prompt:
          "Distinguir presentación de bregma, frente y cara según punto guía y actitud cefálica.",
        markers: [
          "Bregma",
          "Frente",
          "Nariz/cejas",
          "Mentón",
          "Deflexión máxima",
        ],
        pearl:
          "Cuanto mayor la deflexión, mayor suele ser el diámetro obstétrico efectivo.",
      },
      {
        key: "ctg",
        title: "Patrones de CTG",
        visual: "ctg",
        mode: "Clasificación de curvas",
        prompt:
          "Ubicar patrones tempranos, variables, tardíos y sinusoidales con su decalage temporal.",
        markers: [
          "Pico de contracción",
          "Nadir",
          "DIP I",
          "DIP II",
          "Sinusoidal",
        ],
        pearl:
          "En el DIP II, el nadir de la frecuencia cardíaca fetal aparece después del pico de la contracción.",
      },
      {
        key: "tear",
        title: "Desgarros perineales",
        visual: "tear",
        mode: "Clasificar grado",
        prompt:
          "Reconocer límites entre grados I-IV, especialmente compromiso del esfínter y mucosa rectal.",
        markers: [
          "Mucosa vaginal",
          "Musculatura",
          "M. sphincter ani externus",
          "Mucosa rectal",
        ],
        pearl:
          "El grado III empieza con compromiso del esfínter anal externo; el grado IV abre la mucosa rectal.",
      },
      {
        key: "placenta-inspection",
        title: "Inspección placentaria",
        visual: "placenta-inspection",
        mode: "Buscar fallas",
        prompt:
          "Reconocer cotiledones incompletos, vasos marginales hacia placenta succenturiata e infartos.",
        markers: [
          "Defecto de cotiledón",
          "Vaso marginal",
          "Pista de succenturiata",
          "Infarto",
          "Cara fetal",
        ],
        pearl:
          "Un vaso marginal cortado puede sugerir una placenta accesoria retenida.",
      },
    ],
  },
  {
    area: "Operaciones y maniobras",
    items: [
      {
        key: "shoulder",
        title: "Maniobras para distocia de hombros",
        visual: "shoulder",
        mode: "Ordenar secuencia",
        prompt:
          "Ordenar McRoberts, presión suprapúbica, Woods/Rubin y Jacquemier.",
        markers: [
          "McRoberts",
          "Mazzanti/Rubin",
          "Woods",
          "Jacquemier",
          "Brazo posterior",
        ],
        pearl:
          "No hagas presión fúndica: la presión es suprapúbica y apunta a desimpactar el hombro anterior.",
      },
      {
        key: "instrumental",
        title: "Extracción instrumental",
        visual: "instrumental",
        mode: "Verificar colocación",
        prompt:
          "Ubicar ramas de fórceps frontomastoideas y punto de flexión para ventosa.",
        markers: [
          "Rama de fórceps",
          "Frontomastoideo",
          "Punto de flexión",
          "Sutura sagital",
          "Fontanela posterior",
        ],
        pearl:
          "La copa de vacío va sobre el punto de flexión, no sobre una fontanela ni sobre la cara.",
      },
      {
        key: "sectio",
        title: "Incisiones de cesárea",
        visual: "sectio",
        mode: "Distinguir incisión",
        prompt:
          "Diferenciar Pfannenstiel vs. laparotomía mediana y Kerr vs. incisión corporal vertical clásica.",
        markers: [
          "Pfannenstiel",
          "Mediana",
          "Kerr",
          "Histerotomía corporal vertical",
        ],
        pearl:
          "La incisión corporal longitudinal tiene riesgos distintos a la incisión transversa baja del segmento inferior.",
      },
    ],
  },
];

export const allLearningItems: LearningItemWithArea[] =
  learningSections.flatMap((section) =>
    section.items.map((item) => ({ ...item, area: section.area })),
  );

export const studyGuides: Record<string, StudyGuide> = {
  pfeilnaht: {
    image: "/learning-images/fetal-head-orientation.png",
    title: "Primero orientá el mapa interno",
    intro:
      "Antes de diagnosticar la posición, separá tres referencias: pubis materno, sacro y fontanela menor. Recién después le ponés nombre a la variedad.",
    steps: [
      "La sutura sagital te da el eje; la fontanela menor te dice hacia dónde mira el occipucio.",
      "Occipucio hacia pubis: variedad anterior. Occipucio hacia sacro: variedad posterior.",
      "Si la sutura no queda centrada, pensá en asinclitismo antes de elegir una variedad.",
    ],
  },
  hotspot: {
    image: "/learning-images/hodge-planes-pelvis.png",
    title: "Leé la pelvis como una escala",
    intro:
      "Los planos de Hodge no son líneas decorativas: sirven para ubicar descenso fetal y traducir tacto vaginal a una posición clínica.",
    steps: [
      "Hodge I se apoya en promontorio y borde superior de sínfisis.",
      "Hodge III pasa por las espinas ciáticas y equivale a estación 0.",
      "Hodge IV apunta hacia el cóccix y describe descenso profundo.",
    ],
  },
  label: {
    image: "/learning-images/fetal-head-orientation.png",
    title: "Fontanelas antes que nombres",
    intro:
      "La pregunta de rotulado se vuelve fácil si primero distinguís forma: triángulo posterior, rombo anterior.",
    steps: [
      "Fontanela menor: triangular, posterior, marca occipucio.",
      "Fontanela mayor: romboidal, anterior, aparece con deflexión.",
      "La sutura sagital une ambas y ayuda a reconstruir la orientación.",
    ],
  },
  sequence: {
    image: "/learning-images/leopold-maneuvers.png",
    title: "Pensá en secuencia, no en lista",
    intro:
      "Las maniobras se recuerdan mejor como decisiones escalonadas: posición, presión correcta, rotación y extracción.",
    steps: [
      "McRoberts modifica el ángulo pélvico y suele ser el primer movimiento.",
      "La presión es suprapúbica; la presión fúndica empeora la impactación.",
      "Si no alcanza, pasás a rotación interna o extracción del brazo posterior.",
    ],
  },
  ctg: {
    image: "/learning-images/fetal-ultrasound.png",
    title: "Ubicá timing y forma",
    intro:
      "En CTG la clave no es memorizar nombres: compará contracción, nadir y recuperación.",
    steps: [
      "Temprana: acompaña la contracción.",
      "Tardía: el nadir aparece después del pico de contracción.",
      "Variable: caída abrupta, forma cambiante, típica de compresión de cordón.",
    ],
  },
  daily: {
    image: "/learning-images/fetal-head-orientation.png",
    title: "Repaso corto, criterio amplio",
    intro:
      "El repaso diario mezcla tacto, anatomía y curvas. Usá el estudio rápido para recordar qué mirar antes de responder.",
    steps: [
      "Primero orientá el hallazgo visual.",
      "Después nombrá la estructura o patrón.",
      "Al final conectá con la consecuencia clínica.",
    ],
  },
};
