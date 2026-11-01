// Shared data for examples/llama (LLaMA: Open and Efficient Foundation Language Models, Touvron et al.,
// arXiv:2302.13971v1, 27 Feb 2023). Pure data, no drawing.
// import { PAL, MODELS, P1, T3, … } from './_data.js'
//
// All boxes are in page px of paper/page-NN.png: 200 dpi, A4, 1654 × 2339 px (NOT the 1700 × 2200 of
// US letter that the ReAct example uses). Measured from words.json (text) and the PNGs (rules, plot frames).
// REAL        copied from the paper; every value is in briefing.md, verified facts.
// TRACED      digitised from a figure's pixels: approximate, label it on screen ("traced from Figure 1").
// ILLUSTRATIVE ours: label it on screen (\text{illustrative} or \text{schematic}).
//
// Text: every page used here is normal text in words.json, including the tables and Figure 1's tick labels
// and legend (matplotlib text), so findPhrase() works on all of them. Two quirks:
// - Subscripts split words: "tCO2eq" is three words "tCO" "2" "eq", "CO2eq/KWh" is "CO" "2" "eq/KWh".
//   Pass phrases as 'tCO 2 eq = MWh × 0.385.' (checked).
// - Line-break hyphens stay in the word: pass 'publicly avail- able datasets' exactly like that (checked).
// - The arXiv side stamp on p. 1 is vertical text: markBox it (P1.sideStamp), don't highlight() it.

// ── Colours (fixed for the whole video) ─────────────────────────────────────
// REAL hues: the four model sizes keep the line colours of Figure 1 (p. 3) and Figure 2 (p. 8), sampled
// from the PNGs (matplotlib's default cycle). Chinchilla keeps its Figure 2 purple. Every other model
// (GPT-3, PaLM, OPT, BLOOM, Gopher) has no colour in the paper: neutral greys, told apart by label.
// The 65B model is RED in this video. So red never means "wrong" or "struck out" here: a model that is
// behind gets an ink outline and a small \text{behind} tag; a struck-out phrase gets an F.ink line.
export const PAL = {
  m7: '#1F77B4', m7Fill: '#B7D3E7',     // LLaMA 7B   (Figure 1 blue)
  m13: '#FF7F0E', m13Fill: '#FFD6B2',   // LLaMA 13B  (Figure 1 orange)
  m33: '#2CA02C', m33Fill: '#BBE1BB',   // LLaMA 33B  (Figure 1 green)
  m65: '#D62728', m65Fill: '#F2BABA',   // LLaMA 65B  (Figure 1 red)
  chinchilla: '#9467BD', chinchillaFill: '#DDCEEA',   // Figure 2, p. 8
  gpt3: '#8A8F98', gpt3Fill: '#E4E5E7',   // neutral light (ours)
  palm: '#4F545C', palmFill: '#C9CCD1',   // neutral dark (ours)
  other: '#9AA0A8', otherFill: '#EEEDEA', // OPT, BLOOM, Gopher, GPT-NeoX (ours)
  glass: 'rgba(120,130,140,0.18)',        // reference levels drawn as glass plates (e.g. code-davinci-002 77.4)
  // Table 1 data sources (ILLUSTRATIVE colours, kit pastels from F): one fixed colour per source
  web: '#E6E1D6', c4: '#D6CFBF', github: '#C4E6F4', wikipedia: '#F1F6C4', books: '#FBDDB5', arxiv: '#DCDDF0', stackexchange: '#CDEBD2',
  // the three borrowed changes in the machine segment (ILLUSTRATIVE, kit pastels)
  norm: '#F1F6C4', ffn: '#C4E6F4', attn: '#FBDDB5', rope: '#DCDDF0',
};

// ── The four models ─────────────────────────────────────────────────────────
// REAL, Table 2 (p. 3) and Figure 1 caption. `name` is how the paper names them in text ("LLaMA-65B");
// `params` is Table 2's printed count (6.7B … 65.2B), which differs from the names: show Table 2's
// numbers only when Table 2 is on screen, and the names everywhere else.
export const MODELS = [
  { key: 'm7', name: 'LLaMA-7B', short: '7B', params: 6.7, dim: 4096, heads: 32, layers: 32, lr: '3.0e-4', batch: '4M', tokensT: 1.0, color: '#1F77B4', fill: '#B7D3E7' },
  { key: 'm13', name: 'LLaMA-13B', short: '13B', params: 13.0, dim: 5120, heads: 40, layers: 40, lr: '3.0e-4', batch: '4M', tokensT: 1.0, color: '#FF7F0E', fill: '#FFD6B2' },
  { key: 'm33', name: 'LLaMA-33B', short: '33B', params: 32.5, dim: 6656, heads: 52, layers: 60, lr: '1.5e-4', batch: '4M', tokensT: 1.4, color: '#2CA02C', fill: '#BBE1BB' },
  { key: 'm65', name: 'LLaMA-65B', short: '65B', params: 65.2, dim: 8192, heads: 64, layers: 80, lr: '1.5e-4', batch: '4M', tokensT: 1.4, color: '#D62728', fill: '#F2BABA' },
];
// REAL, abstract p. 1: GPT-3's size, for the cover's size comparison ("LLaMA-13B outperforms GPT-3 (175B)").
export const GPT3_PARAMS = 175;

// ── Page 1 ──────────────────────────────────────────────────────────────────
export const P1 = {
  title: { x0: 326, y0: 210, x1: 1328, y1: 246 },        // "LLaMA: Open and Efficient Foundation Language Models" (findPhrase works)
  authors: { x0: 308, y0: 318, x1: 1345, y1: 473 },      // four lines, 14 names
  meta: { x0: 771, y0: 506, x1: 883, y1: 535 },          // "Meta AI"
  sideStamp: { x0: 48, y0: 728, x1: 104, y1: 1697 },     // vertical "arXiv:2302.13971v1 [cs.CL] 27 Feb 2023"
  abstract: { x0: 236, y0: 592, x1: 768, y1: 1058 },     // heading + body, left column
  introHead: { x0: 197, y0: 1088, x1: 427, y1: 1118 },
  introLeft: { x0: 192, y0: 1144, x1: 812, y1: 2007 },   // Hoffmann et al. / inference budget paragraphs
  rightHoffmann: { x0: 846, y0: 596, x1: 1464, y1: 820 },// "…a 7B model continues to improve even after 1T tokens."
  rightFocus: { x0: 845, y0: 852, x1: 1466, y1: 1377 },  // "The focus of this work…" (more tokens; single GPU)
  rightData: { x0: 842, y0: 1410, x1: 1466, y1: 1746 },  // "Unlike Chinchilla, PaLM, or GPT-3…" ("Books – 2TB")
  footnotes: { x0: 193, y0: 2056, x1: 813, y1: 2154 },   // equal contribution, e-mail addresses, GitHub URL: never zoom on the e-mails
  footnoteURL: { x0: 242, y0: 2120, x1: 713, y1: 2150 }, // "https://github.com/facebookresearch/llama"
};

// ── Page 2 · Table 1 (pre-training data) ────────────────────────────────────
// REAL. Sampling proportions sum to 100.0. Epochs are for the 1.4T-token runs (caption). Disk size as printed.
export const T1 = {
  box: { x0: 844, y0: 194, x1: 1463, y1: 538 },
  caption: { x0: 846, y0: 562, x1: 1465, y1: 728 },
  header: { y0: 216, y1: 243 },
  cols: { name: { x0: 850, x1: 1037 }, prop: { x0: 1037, x1: 1172 }, epochs: { x0: 1241, x1: 1330 }, disk: { x0: 1346, x1: 1458 } },
  rows: [
    { key: 'web', label: 'CommonCrawl', prop: 67.0, epochs: 1.10, disk: '3.3 TB', y0: 269, y1: 296, para: { page: 2, phrase: 'English CommonCrawl [67%].' } },
    { key: 'c4', label: 'C4', prop: 15.0, epochs: 1.06, disk: '783 GB', y0: 307, y1: 334, para: { page: 2, phrase: 'C4 [15%].' } },
    { key: 'github', label: 'Github', prop: 4.5, epochs: 0.64, disk: '328 GB', y0: 344, y1: 372, para: { page: 2, phrase: 'Github [4.5%].' } },
    { key: 'wikipedia', label: 'Wikipedia', prop: 4.5, epochs: 2.45, disk: '83 GB', y0: 382, y1: 409, para: { page: 2, phrase: 'Wikipedia [4.5%].' } },
    { key: 'books', label: 'Books', prop: 4.5, epochs: 2.23, disk: '85 GB', y0: 420, y1: 447, para: { page: 2, phrase: 'Gutenberg and Books3 [4.5%].' } },
    { key: 'arxiv', label: 'ArXiv', prop: 2.5, epochs: 1.06, disk: '92 GB', y0: 457, y1: 484, para: { page: 2, phrase: 'ArXiv [2.5%].' } },
    { key: 'stackexchange', label: 'StackExchange', prop: 2.0, epochs: 1.03, disk: '78 GB', y0: 495, y1: 522, para: { page: 2, phrase: 'Stack Exchange [2%].' } },
  ],
  totalTokensT: 1.4,   // REAL, p. 3: "roughly 1.4T tokens after tokenization"
};

// ── Page 3 · Table 2, Figure 1, Section 2.2 ─────────────────────────────────
export const T2 = {
  box: { x0: 315, y0: 193, x1: 1338, y1: 421 },
  caption: { x0: 396, y0: 447, x1: 1248, y1: 480 },
  header: { y0: 213, y1: 241 },
  cols: { params: { x0: 335, x1: 423 }, dimension: { x0: 456, x1: 582 }, heads: { x0: 615, x1: 710 }, layers: { x0: 743, x1: 842 },
    lr: { x0: 875, x1: 1027 }, batch: { x0: 1060, x1: 1181 }, tokens: { x0: 1214, x1: 1318 } },
  rows: { m7: { y0: 259, y1: 294 }, m13: { y0: 297, y1: 331 }, m33: { y0: 335, y1: 369 }, m65: { y0: 372, y1: 406 } },
};

// Section 2.2, the three borrowed changes (REAL text boxes; findPhrase also works on each heading)
export const P3 = {
  overall: { x0: 193, y0: 541, x1: 812, y1: 764 },     // "roughly 1.4T tokens…two epochs"
  arch: { x0: 193, y0: 793, x1: 812, y1: 1736 },       // all of Section 2.2
  preNorm: { x0: 193, y0: 1166, x1: 812, y1: 1315 },   // "Pre-normalization [GPT3]." paragraph
  swiglu: { x0: 193, y0: 1377, x1: 812, y1: 1530 },    // "SwiGLU activation function [PaLM]." paragraph (incl. the 2/3·4d line)
  rope: { x0: 193, y0: 1588, x1: 812, y1: 1736 },      // "Rotary Embeddings [GPTNeo]." paragraph
};

// Figure 1 (p. 3): training loss over tokens. Vector plot with real text (ticks, legend, axis labels).
export const FIG1 = {
  all: { x0: 836, y0: 526, x1: 1450, y1: 954 },        // plot + tick labels + axis titles
  frame: { x0: 932, y0: 553, x1: 1442, y1: 881 },      // plot frame (axes box)
  legend: { x0: 1236, y0: 562, x1: 1434, y1: 696 },
  caption: { x0: 845, y0: 984, x1: 1465, y1: 1149 },
  // axis calibration (from tick-label centres): page x = x0 + tokensB * kx; page y = y22 + (2.2 - loss) * ky
  axis: { x0: 960.5, kx: 0.3275, y22: 553, ky: 468.57, tokensMax: 1400, lossMin: 1.5, lossMax: 2.2 },
};

// TRACED from Figure 1's pixels (page-03.png): [billion tokens, training loss], one sample per 40B tokens.
// Approximate (about ±0.01 in loss); two 65B samples on loss spikes (480, 560) were replaced by the mean of
// their neighbours. Use for the 3D ribbons only, never print a value read from these on screen.
// Curve ends match the caption: 7B and 13B stop at 1.0T tokens, 33B and 65B at 1.4T.
export const FIG1_TRACE = {
  m7: [[20, 2.189], [40, 2.117], [80, 2.031], [120, 1.991], [160, 1.967], [200, 1.952], [240, 1.940], [280, 1.927], [320, 1.920], [360, 1.912], [400, 1.903], [440, 1.895], [480, 1.886], [520, 1.880], [560, 1.871], [600, 1.863], [640, 1.856], [680, 1.848], [720, 1.839], [760, 1.833], [800, 1.827], [840, 1.820], [880, 1.814], [920, 1.809], [960, 1.805], [1000, 1.803]],
  m13: [[20, 2.162], [40, 2.076], [80, 1.991], [120, 1.942], [160, 1.916], [200, 1.897], [240, 1.882], [280, 1.871], [320, 1.861], [360, 1.852], [400, 1.846], [440, 1.837], [480, 1.827], [520, 1.818], [560, 1.812], [600, 1.801], [640, 1.792], [680, 1.782], [720, 1.773], [760, 1.765], [800, 1.758], [840, 1.750], [880, 1.743], [920, 1.739], [960, 1.733], [1000, 1.730]],
  m33: [[20, 2.179], [40, 2.038], [80, 1.929], [120, 1.882], [160, 1.850], [200, 1.829], [240, 1.814], [280, 1.799], [320, 1.786], [360, 1.780], [400, 1.769], [440, 1.760], [480, 1.758], [520, 1.748], [560, 1.739], [600, 1.733], [640, 1.726], [680, 1.720], [720, 1.713], [760, 1.707], [800, 1.701], [840, 1.694], [880, 1.688], [920, 1.681], [960, 1.673], [1000, 1.666], [1040, 1.660], [1080, 1.656], [1120, 1.647], [1160, 1.643], [1200, 1.637], [1240, 1.632], [1280, 1.628], [1320, 1.624], [1360, 1.622], [1400, 1.617]],
  m65: [[20, 2.130], [40, 2.004], [80, 1.895], [120, 1.844], [160, 1.812], [200, 1.788], [240, 1.777], [280, 1.760], [320, 1.748], [360, 1.737], [400, 1.728], [440, 1.718], [480, 1.712], [520, 1.705], [560, 1.698], [600, 1.690], [640, 1.679], [680, 1.675], [720, 1.666], [760, 1.660], [800, 1.654], [840, 1.645], [880, 1.645], [920, 1.630], [960, 1.624], [1000, 1.613], [1040, 1.609], [1080, 1.600], [1120, 1.594], [1160, 1.588], [1200, 1.581], [1240, 1.577], [1280, 1.568], [1320, 1.564], [1360, 1.562], [1400, 1.558]],
};

// REAL, p. 1 (§1): the token budgets the problem segment puts side by side.
export const TOKENS = {
  hoffmann: { modelB: 10, tokensB: 200 },   // "Hoffmann et al. (2022) recommends training a 10B model on 200B tokens"
  llama7: { modelB: 7, tokensB: 1000 },     // "the performance of a 7B model continues to improve even after 1T tokens"
  trained: { m7: 1000, m13: 1000, m33: 1400, m65: 1400 },   // Figure 1 caption / Table 2
};

// ── Page 4 · Section 2.4 and Table 3 ────────────────────────────────────────
// REAL, p. 4: "around 380 tokens/sec/GPU on 2048 A100 GPU with 80GB of RAM" … "approximately 21 days".
export const TRAIN65 = { gpus: 2048, tokPerSecPerGpu: 380, tokensT: 1.4, days: 21,
  para: { x0: 192, y0: 1008, x1: 808, y1: 1193 } };
// ILLUSTRATIVE layout for the 2048 GPUs: a 32 × 64 grid of tiles (the count is real, the arrangement is ours).
export const GPU_GRID = { cols: 64, rows: 32 };

// Table 3: zero-shot common sense reasoning. Values exactly as printed; null = "-" (not reported).
// Cell box for (row, col) = { x0: cols[c].x0 - 6, y0: rows[r].y0 - 4, x1: cols[c].x1 + 6, y1: rows[r].y1 + 4 }.
// The other models' numbers are "from the corresponding papers" (p. 5), not re-run by the authors.
export const T3 = {
  box: { x0: 223, y0: 193, x1: 1429, y1: 663 },
  caption: { x0: 418, y0: 688, x1: 1226, y1: 720 },
  header: { y0: 214, y1: 241 },
  order: ['boolq', 'piqa', 'siqa', 'hellaswag', 'winogrande', 'arce', 'arcc', 'obqa'],
  cols: {
    boolq: { label: 'BoolQ', x0: 514, x1: 566 }, piqa: { label: 'PIQA', x0: 617, x1: 670 }, siqa: { label: 'SIQA', x0: 715, x1: 768 },
    hellaswag: { label: 'HellaSwag', x0: 832, x1: 886 }, winogrande: { label: 'WinoGrande', x0: 980, x1: 1033 },
    arce: { label: 'ARC-e', x0: 1116, x1: 1169 }, arcc: { label: 'ARC-c', x0: 1230, x1: 1283 }, obqa: { label: 'OBQA', x0: 1343, x1: 1396 },
  },
  // TeX for the column labels (the page spells them like this)
  texLabels: { boolq: '\\text{BoolQ}', piqa: '\\text{PIQA}', siqa: '\\text{SIQA}', hellaswag: '\\text{HellaSwag}', winogrande: '\\text{WinoGrande}', arce: '\\text{ARC-e}', arcc: '\\text{ARC-c}', obqa: '\\text{OBQA}' },
  rows: {
    gpt3: { label: 'GPT-3', size: '175B', y0: 266, y1: 294, v: [60.5, 81.0, null, 78.9, 70.2, 68.8, 51.4, 57.6] },
    gopher: { label: 'Gopher', size: '280B', y0: 304, y1: 331, v: [79.3, 81.8, 50.6, 79.2, 70.1, null, null, null] },
    chinchilla: { label: 'Chinchilla', size: '70B', y0: 342, y1: 369, v: [83.7, 81.8, 51.3, 80.8, 74.9, null, null, null] },
    palm62: { label: 'PaLM', size: '62B', y0: 379, y1: 406, v: [84.8, 80.5, null, 79.7, 77.0, 75.2, 52.5, 50.4] },
    palmcont: { label: 'PaLM-cont', size: '62B', y0: 417, y1: 444, v: [83.9, 81.4, null, 80.6, 77.0, null, null, null] },
    palm540: { label: 'PaLM', size: '540B', y0: 454, y1: 482, v: [88.0, 82.3, null, 83.4, 81.1, 76.6, 53.0, 53.4] },
    m7: { label: 'LLaMA', size: '7B', y0: 507, y1: 534, v: [76.5, 79.8, 48.9, 76.1, 70.1, 72.8, 47.6, 57.2] },
    m13: { label: 'LLaMA', size: '13B', y0: 545, y1: 572, v: [78.1, 80.1, 50.4, 79.2, 73.0, 74.8, 52.7, 56.4] },
    m33: { label: 'LLaMA', size: '33B', y0: 582, y1: 610, v: [83.1, 82.3, 50.4, 82.8, 76.0, 80.0, 57.8, 58.6] },
    m65: { label: 'LLaMA', size: '65B', y0: 620, y1: 647, v: [85.3, 82.8, 52.3, 84.2, 77.0, 78.9, 56.0, 60.2] },
  },
  llamaLabel: { x0: 241, y0: 564, x1: 340, y1: 591 },   // the merged "LLaMA" row label
};

// REAL, derived from T3 (counts checked by hand; the evidence segment speaks them):
// 13B vs GPT-3 175B: 7 shared tasks (SIQA has no GPT-3 value), ahead on 5, behind on PIQA and OBQA.
// 65B vs PaLM 540B: 7 shared tasks, ahead on 5, behind on BoolQ and WinoGrande (p. 5 text agrees).
// 65B vs Chinchilla 70B: 5 shared tasks, Table 3 shows 65B higher on all 5. NOTE: the p. 5 text says
// "outperforms Chinchilla-70B on all reported benchmarks but BoolQ", but Table 3 has 85.3 vs 83.7 on BoolQ.
// We follow the table and never put that p. 5 sentence on screen (briefing, guardrails).
export const CMP = {
  m13_gpt3: { a: 'm13', b: 'gpt3', tasks: ['boolq', 'piqa', 'hellaswag', 'winogrande', 'arce', 'arcc', 'obqa'], behind: ['piqa', 'obqa'] },
  m65_chinchilla: { a: 'm65', b: 'chinchilla', tasks: ['boolq', 'piqa', 'siqa', 'hellaswag', 'winogrande'], behind: [] },
  m65_palm540: { a: 'm65', b: 'palm540', tasks: ['boolq', 'piqa', 'hellaswag', 'winogrande', 'arce', 'arcc', 'obqa'], behind: ['boolq', 'winogrande'] },
  // every compared pair with a margin under one point (REAL, from T3; checked): 13B vs GPT-3 PIQA 80.1 vs 81.0 (behind)
  // and HellaSwag 79.2 vs 78.9; 65B vs PaLM-540B PIQA 82.8 vs 82.3 and HellaSwag 84.2 vs 83.4. None against Chinchilla.
  thin: [{ cmp: 'm13_gpt3', task: 'piqa' }, { cmp: 'm13_gpt3', task: 'hellaswag' }, { cmp: 'm65_palm540', task: 'piqa' }, { cmp: 'm65_palm540', task: 'hellaswag' }],
};

// ── Pages 6–7 · MMLU (Table 9) and instruction fine-tuning (Table 10) ───────
export const P6 = {
  mmlu: { x0: 845, y0: 992, x1: 1466, y1: 1760 },   // Section 3.6 paragraph
};
export const T9 = {
  box: { x0: 316, y0: 193, x1: 1337, y1: 717 },
  caption: { x0: 335, y0: 740, x1: 1309, y1: 774 },
  header: { y0: 214, y1: 241 },
  cols: { humanities: { x0: 649, x1: 702 }, stem: { x0: 792, x1: 845 }, social: { x0: 961, x1: 1014 }, other: { x0: 1123, x1: 1176 }, average: { x0: 1241, x1: 1294 } },
  // REAL, five-shot accuracy, the Average column (plus the row geometry)
  rows: {
    gpt3: { label: 'GPT-3', size: '175B', y0: 304, y1: 331, avg: 43.9 },
    gopher: { label: 'Gopher', size: '280B', y0: 342, y1: 369, avg: 60.0 },
    chinchilla: { label: 'Chinchilla', size: '70B', y0: 379, y1: 406, avg: 67.5 },
    palm540: { label: 'PaLM', size: '540B', y0: 507, y1: 534, avg: 69.3 },
    m7: { label: 'LLaMA', size: '7B', y0: 560, y1: 587, avg: 35.1 },
    m13: { label: 'LLaMA', size: '13B', y0: 598, y1: 625, avg: 46.9 },
    m33: { label: 'LLaMA', size: '33B', y0: 636, y1: 663, avg: 57.8 },
    m65: { label: 'LLaMA', size: '65B', y0: 673, y1: 700, avg: 63.4 },
  },
};
export const T10 = {
  box: { x0: 286, y0: 1563, x1: 713, y1: 2017 },
  caption: { x0: 192, y0: 2042, x1: 812, y1: 2142 },
  valueCol: { x0: 640, x1: 693 },
  rows: {
    chinchilla: { label: 'Chinchilla', size: '70B', y0: 1734, y1: 1761, v: 67.5 },
    m65: { label: 'LLaMA', size: '65B', y0: 1772, y1: 1799, v: 63.4 },
    llamaI: { label: 'LLaMA-I', size: '65B', y0: 1975, y1: 2002, v: 68.9 },
  },
  // REAL, p. 7 text, quoted from Iyer et al. (2022) by the authors: not a LLaMA number, not a Table 10 row
  sota: { label: 'GPT code-davinci-002', v: 77.4 },
  para: { x0: 845, y0: 835, x1: 1466, y1: 1359 },   // Section 4, right column
};
// REAL, p. 6 and Table 1: ArXiv + Gutenberg + Books3 "sums up to only 177GB" (= Books 85 GB + ArXiv 92 GB in Table 1),
// "while these models were trained on up to 2TB of books" (a potential explanation, hedged).
export const BOOKS = { llamaGB: 177, othersUpToTB: 2 };

// ── Page 10 · TruthfulQA (Table 14) and Section 6 ──────────────────────────
export const T14 = {
  box: { x0: 235, y0: 784, x1: 764, y1: 1141 },
  caption: { x0: 192, y0: 1166, x1: 812, y1: 1332 },
  cols: { truthful: { x0: 501, x1: 554 }, truthfulInf: { x0: 660, x1: 713 } },
  rows: {
    gpt3: { label: 'GPT-3', size: '175B', y0: 933, y1: 960, truthful: 0.28, truthfulInf: 0.25 },
    m65: { label: 'LLaMA', size: '65B', y0: 1099, y1: 1126, truthful: 0.57, truthfulInf: 0.53 },
  },
  para: { x0: 192, y0: 1394, x1: 812, y1: 1655 },
};
export const P10 = {
  carbonHead: { x0: 197, y0: 1689, x1: 490, y1: 1719 },
  formulaWh: { x0: 193, y0: 2117, x1: 814, y1: 2152 },     // "Wh = GPU-h×(GPU power consumption)×PUE,"
  formulaT: { x0: 991, y0: 760, x1: 1316, y1: 799 },       // "tCO2eq = MWh × 0.385."
  rightCol: { x0: 845, y0: 203, x1: 1466, y1: 1280 },
};

// ── Page 11 · Table 15 (carbon) ─────────────────────────────────────────────
// REAL, every value as printed. All six rows use the same assumptions (caption): A100-80GB at 400 W
// (thermal design power), PUE 1.1, US national average 0.385 kg CO2e per kWh, "in the same data center".
// The OPT and BLOOM rows are the LLaMA authors' recomputation, not what those projects reported:
// p. 10 says BLOOM's own grid gives 27 tCO2eq and OPT's gives 82 tCO2eq.
export const T15 = {
  box: { x0: 236, y0: 193, x1: 1416, y1: 550 },
  caption: { x0: 192, y0: 575, x1: 1463, y1: 709 },
  header: { y0: 214, y1: 281 },
  cols: { name: { x0: 257, x1: 442 }, gpu: { x0: 475, x1: 625 }, power: { x0: 700, x1: 774 }, gpuHours: { x0: 856, x1: 978 }, mwh: { x0: 1036, x1: 1159 }, tco2: { x0: 1280, x1: 1326 } },
  rows: [
    { key: 'opt', label: 'OPT-175B', gpuHours: 809472, mwh: 356, tco2: 137, y0: 304, y1: 331 },
    { key: 'bloom', label: 'BLOOM-175B', gpuHours: 1082880, mwh: 475, tco2: 183, y0: 342, y1: 369 },
    { key: 'm7', label: 'LLaMA-7B', gpuHours: 82432, mwh: 36, tco2: 14, y0: 394, y1: 422 },
    { key: 'm13', label: 'LLaMA-13B', gpuHours: 135168, mwh: 59, tco2: 23, y0: 432, y1: 459 },
    { key: 'm33', label: 'LLaMA-33B', gpuHours: 530432, mwh: 233, tco2: 90, y0: 470, y1: 497 },
    { key: 'm65', label: 'LLaMA-65B', gpuHours: 1022362, mwh: 449, tco2: 173, y0: 507, y1: 534 },
  ],
  assumptions: { watts: 400, pue: 1.1, kgPerKWh: 0.385 },
};
// REAL, p. 10: "we estimate that we used 2048 A100-80GB for a period of approximately 5 months to develop
// our models … around 2,638 MWh under our assumptions, and a total emission of 1,015 tCO2eq."
// Don't subtract the four final runs from this total and don't explain the difference: the paper doesn't.
export const DEV = { gpus: 2048, months: 5, mwh: 2638, tco2: 1015 };

// ── Page 11 · Conclusion ────────────────────────────────────────────────────
export const P11 = {
  conclusion: { x0: 845, y0: 1306, x1: 1466, y1: 2152 },
};

// ── What came after: external cards (no pages of other documents on the desk) ─
// REAL, each from a URL opened on 2026-11-01 (briefing, verified facts). Short typed text only:
// no screenshots, no logos, no page images. `quote` strings are verbatim and may appear as TeX.
export const EXT = {
  announce: { who: 'Meta AI blog', date: '24 Feb 2023', url: 'ai.meta.com/blog/large-language-model-llama-meta-ai',
    quote: 'noncommercial license focused on research use cases' },
  alpaca: { who: 'Stanford CRFM', date: 'Mar 2023', url: 'crfm.stanford.edu/2023/03/13/alpaca.html',
    facts: 'fine-tuned from LLaMA 7B · 52K instruction-following demonstrations',
    quote: 'Alpaca is based on LLaMA, which has a non-commercial license' },
  requests: { who: 'Meta AI blog', date: '18 Jul 2023', url: 'ai.meta.com/blog/llama-2', quote: 'more than 100,000 requests for access' },
  llama2: { who: 'Touvron et al.', date: '18 Jul 2023', id: 'arXiv:2307.09288', sizes: '7B to 70B', quote: 'free for research and commercial use' },
};
