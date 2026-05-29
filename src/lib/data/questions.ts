export type Zone = { id: string; cx: number; cy: number };
export type Slot = { id: string; x: number; y: number; correctTermId: string };
export type Term = { id: string; label: string };
export type Option = { id: string; label: string; sub: string };
export type SequenceItem = { id: string; label: string; rank: number };

export type HotspotQuestion = {
	figure: string;
	title: string;
	latin: string;
	illustration: string;
	prompt: string;
	hint: string;
	zones: Zone[];
	correctId: string;
	rationale: string;
};

export type PfeilnahtQuestion = {
	figure: string;
	title: string;
	latin: string;
	position: string;
	prompt: string;
	correctId: string;
	options: Option[];
	rationale: string;
};

export type LabelQuestion = {
	figure: string;
	title: string;
	latin: string;
	prompt: string;
	slots: Slot[];
	terms: Term[];
	rationale: string;
};

export type SequenceQuestion = {
	figure: string;
	title: string;
	latin: string;
	prompt: string;
	items: SequenceItem[];
	rationale: string;
};

export type CtgQuestion = {
	figure: string;
	title: string;
	latin: string;
	prompt: string;
	correctId: string;
	options: Option[];
	rationale: string;
};

const pelvisZones: Zone[] = [
	{ id: 'I', cx: 50, cy: 31 },
	{ id: 'II', cx: 50, cy: 44 },
	{ id: 'III', cx: 50, cy: 58 },
	{ id: 'IV', cx: 50, cy: 86 }
];

export const questions: {
	hotspot: HotspotQuestion[];
	pfeilnaht: PfeilnahtQuestion[];
	label: LabelQuestion[];
	sequence: SequenceQuestion[];
	ctg: CtgQuestion[];
} = {
	hotspot: [
		{
			figure: '03',
			title: 'Plano de Hodge III',
			latin: 'Planum tertium · Spinae ischiadicae',
			illustration: 'pelvis',
			prompt: 'Marcá el plano que pasa por las espinas ciáticas.',
			hint: 'Cruza las estrecheces óseas y corresponde a la estación 0 de DeLee.',
			zones: pelvisZones,
			correctId: 'III',
			rationale:
				'Correcto: Hodge III es el plano de las espinas ciáticas. Clínicamente, acá se considera que la cabeza está encajada.'
		},
		{
			figure: '07',
			title: 'Fontanela menor',
			latin: 'Fonticulus posterior · Lambda',
			illustration: 'skull',
			prompt: 'Tocá la fontanela menor, la triangular.',
			hint: 'Está en el occipucio, donde se encuentran la sutura sagital y las lambdoideas.',
			zones: [
				{ id: 'small-font', cx: 50, cy: 21 },
				{ id: 'large-font', cx: 50, cy: 72 }
			],
			correctId: 'small-font',
			rationale:
				'La fontanela menor es triangular y en el tacto vaginal te orienta hacia dónde apunta el occipucio.'
		},
		{
			figure: '12',
			title: 'Fontanela mayor',
			latin: 'Fonticulus anterior · Bregma',
			illustration: 'skull',
			prompt: 'Marcá la fontanela mayor, la que tiene forma de rombo.',
			hint: 'Confluyen cuatro suturas: sagital, frontal y las dos coronales.',
			zones: [
				{ id: 'small-font', cx: 50, cy: 21 },
				{ id: 'large-font', cx: 50, cy: 72 }
			],
			correctId: 'large-font',
			rationale:
				'La fontanela mayor es romboidal. Si se vuelve el punto guía al tacto, pensá en una deflexión.'
		}
	],
	pfeilnaht: [
		{
			figure: '21',
			title: 'Orientación de la sutura sagital',
			latin: 'Tacto vaginal · Sutura sagittalis',
			position: 'vHHL',
			prompt:
				'La sutura sagital está oblicua y la fontanela menor se palpa a la izquierda y adelante. ¿Qué posición es?',
			correctId: 'vHHL',
			options: [
				{ id: 'vHHL', label: 'vHHL / anterior', sub: 'Occipucio anterior, mecánica favorable' },
				{ id: 'hHHL', label: 'hHHL / posterior', sub: 'Occipucio posterior, “mira estrellas”' },
				{ id: 'asynk', label: 'Asinclitismo', sub: 'Sutura desplazada hacia sacro o sínfisis' }
			],
			rationale:
				'La fontanela menor mira hacia el pubis materno: es una variedad anterior de occipucio.'
		},
		{
			figure: '22',
			title: 'Mira estrellas',
			latin: 'Varietas posterior',
			position: 'hHHL',
			prompt: 'La fontanela menor está orientada hacia el sacro. ¿Cómo nombrás el hallazgo?',
			correctId: 'hHHL',
			options: [
				{ id: 'vHHL', label: 'vHHL', sub: 'El occipucio apunta hacia adelante' },
				{ id: 'hHHL', label: 'hHHL / mira estrellas', sub: 'El occipucio apunta hacia atrás' },
				{ id: 'asynk', label: 'Asinclitismo', sub: 'Desviación lateral del eje' }
			],
			rationale:
				'En la variedad posterior, el occipucio apunta hacia el sacro. El parto puede alargarse, aunque todavía puede rotar.'
		},
		{
			figure: '23',
			title: 'Asinclitismo',
			latin: 'Sutura sagittalis lateralisata',
			position: 'asynk',
			prompt: 'La sutura sagital está claramente desplazada hacia el sacro. ¿Cuál es el diagnóstico?',
			correctId: 'asynk',
			options: [
				{ id: 'vHHL', label: 'vHHL', sub: 'Sutura centrada con orientación anterior' },
				{ id: 'synk', label: 'Sinclitismo', sub: 'Sutura sagital en el centro de la pelvis' },
				{ id: 'asynk', label: 'Asinclitismo', sub: 'Un parietal desciende como punto guía' }
			],
			rationale:
				'Una sutura sagital lateralizada es un asinclitismo. Lo importante es si se corrige con el progreso del parto.'
		}
	],
	label: [
		{
			figure: '08',
			title: 'Cráneo fetal',
			latin: 'Suturae · Fonticuli',
			prompt: 'Asigná cada término a su punto anatómico.',
			slots: [
				{ id: 's1', x: 50, y: 18, correctTermId: 'small-font' },
				{ id: 's2', x: 50, y: 72, correctTermId: 'large-font' },
				{ id: 's3', x: 33, y: 45, correctTermId: 'sagittal' },
				{ id: 's4', x: 24, y: 31, correctTermId: 'lambda' }
			],
			terms: [
				{ id: 'small-font', label: 'F. menor' },
				{ id: 'large-font', label: 'F. mayor' },
				{ id: 'sagittal', label: 'Sutura sagital' },
				{ id: 'lambda', label: 'Sutura lambdoidea' }
			],
			rationale:
				'Suturas y fontanelas son la base para diagnosticar posición y actitud fetal durante el trabajo de parto.'
		}
	],
	sequence: [
		{
			figure: '34',
			title: 'Distocia de hombros',
			latin: 'Secuencia de maniobras',
			prompt: 'Ordená las maniobras en la secuencia correcta.',
			items: [
				{ id: 'mcroberts', label: 'Posición de McRoberts', rank: 1 },
				{ id: 'suprapubic', label: 'Presión suprapúbica', rank: 2 },
				{ id: 'woods', label: 'Woods/Rubin Rotation', rank: 3 },
				{ id: 'jacquemier', label: 'Jacquemier: brazo posterior', rank: 4 }
			],
			rationale:
				'Primero van las medidas menos invasivas: McRoberts y presión suprapúbica. Después vienen las rotaciones internas y el brazo posterior.'
		}
	],
	ctg: [
		{
			figure: '41',
			title: 'Desaceleraciones en CTG',
			latin: 'DIP II · Decalage',
			prompt:
				'La caída de la frecuencia llega a su nadir después del pico de la contracción. ¿Qué patrón es?',
			correctId: 'late',
			options: [
				{
					id: 'early',
					label: 'Desaceleración temprana',
					sub: 'Espeja la contracción, suele ser compresión cefálica'
				},
				{
					id: 'late',
					label: 'Desaceleración tardía / DIP II',
					sub: 'Nadir después del máximo de la contracción'
				},
				{ id: 'variable', label: 'Desaceleración variable', sub: 'Cambian la forma y el timing' }
			],
			rationale:
				'Las desaceleraciones tardías, desfasadas respecto de la contracción, sugieren hipoperfusión uteroplacentaria y exigen reevaluación.'
		}
	]
};
