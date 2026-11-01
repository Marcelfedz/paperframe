// Shared data for examples/chain-of-thought (Wei et al., "Chain-of-Thought Prompting Elicits Reasoning in Large
// Language Models", NeurIPS 2022, arXiv:2201.11903v6, CC BY 4.0). Pure data, no drawing.
// import { PAL, FIG1, T2, … } from './_data.js'
//
// All boxes are in page px of paper/page-NN.png (200 dpi, 1700 × 2200, US letter), measured on v6.
// Boxes of figures and panels were measured from the PNGs (tight non-white bounds, ±3 px); line boxes come from
// words.json. Real numbers are copied from the paper's tables exactly as printed (briefing.md, verified facts).
// Anything marked ILLUSTRATIVE is ours: label it on screen as illustrative.
//
// Text quirks (see briefing.md, Source files):
// - Figures 1, 3, 4, 7, 8 and Table 20 are real text: findPhrase works on them. Figure labels are words too.
// - p. 2 prints ⟨input, chain of thought, output⟩ and pdftotext reads the angle brackets as letters: the words are
//   "hinput," and "outputi." — pass the phrase exactly as in PH.triples.
// - Em dashes glue words: "thought—a", "steps—significantly" are single words. Pass phrases with the dash attached.
// - Hyphenated line breaks are two words ("chain-" + "of-thought", "outper-" + "form"): pass them with the space.
// - p. 5 left column is interleaved line by line with Figure 4's caption in words.json, so a phrase that crosses a
//   line break there does not match. Highlight it line by line (PH.errors46 is already split).

// ── Colours (fixed for the whole video; the cover teaches them) ──────────────────────────────────
// Sampled from the paper's own figures. Chain of thought = the blue of Figure 1's highlighted reasoning (p. 1),
// which is also the CoT line in Figures 4, 7 and 8. Model output / correct = Figure 1's green (Model Output tab,
// highlighted output, ✓). Standard prompting = neutral: Figure 4 draws it as a thin black line.
// Red = wrong (Figure 1's ✗). Orange = "prior supervised best" (Figure 4/7 dashed line). Dark green dashed = human.
// Note: Figures 2, 5 and 6 are bar charts in another scheme (standard yellow #FFE036, CoT orange #D1691F). Those
// pages keep their own colours on screen; our rebuilds always use PAL.
export const PAL = {
  cot: '#56C1FF',        // fill: Figure 1 (p. 1) chain-of-thought highlight
  cotInk: '#1F5FBF',     // outline / label ink for chain-of-thought parts (darker step of the same blue)
  cotLine: '#0000FF',    // Figure 4/7/8 CoT line, reference only
  std: '#E6E6E6',        // fill: standard prompting (neutral)
  stdInk: '#4A4A4A',     // outline / label ink for standard prompting (Figure 4's black line, softened)
  out: '#61D836',        // fill: Figure 1 Model Output tab, output highlight and ✓
  outInk: '#3E8E1F',     // outline / label ink for output and "correct"
  bad: '#FF0000',        // Figure 1 ✗; red = wrong
  badInk: '#C81E1E',
  input: '#F2F2F2',      // fill: the question / input part of a triple (Figure 1 frames are grey #929292)
  inputInk: '#929292',
  prior: '#FF8000',      // Figure 4 / 7 "Prior supervised best" dashed line
  human: '#00733D',      // Figure 7 "Human" dashed line (also the bold-green gain cells of Tables 2, 4, 5)
  model: '#F1F1F1',      // the model block (neutral, ink outline)
};

// Task families as Figure 3 colours its tabs (p. 4). REFERENCE ONLY: they appear on the real crops. Don't use them
// as fills for our own parts: orange belongs to "prior best" and blue to chain of thought.
export const FAM = {
  arithmetic: '#34A853',
  commonsense: '#FF9800',
  symbolic: '#4FC3F7',
};

// ── Verbatim phrases (all checked against words.json with a findPhrase clone) ─────────────────────
// Page in the key comment. Yellow when the voice reads them verbatim, mint when it paraphrases (see prompts).
export const PH = {
  // p. 1
  key: 'generating a chain of thought—a series of intermediate reasoning steps—significantly improves the ability of large language models to perform complex reasoning',
  fewDemos: 'a few chain of thought demonstrations are provided as exemplars in prompting',
  eight: 'prompting a PaLM 540B with just eight chain-of-thought exemplars achieves state-of-the-art accuracy on the GSM8K benchmark of math word problems',
  verifier: 'surpassing even finetuned GPT-3 with a verifier',
  threeModels: 'Experiments on three large language models',          // abstract says three; Section 3.1 says five
  affil: 'Google Research, Brain Team',
  venue: '36th Conference on Neural Information Processing Systems (NeurIPS 2022).',
  authors: ['Jason Wei', 'Xuezhi Wang', 'Dale Schuurmans', 'Maarten Bosma', 'Brian Ichter', 'Fei Xia', 'Ed H. Chi', 'Quoc V. Le', 'Denny Zhou'],
  fig1Ex: 'Roger started with 5 balls. 2 cans of 3 tennis balls each is 6 tennis balls. 5 + 6 = 11.',
  fig1Out: 'The cafeteria had 23 apples originally. They used 20 to make lunch. So they had 23 - 20 = 3. They bought 6 more apples, so they have 3 + 6 = 9.',
  fig1Wrong: 'A: The answer is 27.',
  // p. 2
  scaling: 'scaling up model size alone has not proved sufficient',
  threeKinds: 'arithmetic, commonsense, and symbolic reasoning',      // nth 1 on p. 2
  rationales: 'generating natural language rationales that lead to the final answer',
  trainScratch: 'by training from scratch',
  finetune: 'or finetuning a pretrained model',
  costly: 'it is costly to create a large set of high quality rationales',
  prompt: 'one can simply “prompt” the model with a few input–output exemplars demonstrating the task',
  poorly: 'it works poorly on tasks that require reasoning abilities, and often does not improve substantially with increasing language model scale',
  combine: 'we combine the strengths of these two ideas in a way that avoids their limitations',
  triples: 'triples: hinput, chain of thought, outputi.',
  definition: 'a series of intermediate natural language reasoning steps that lead to the final output',
  definitionFull: 'chain of thought is a series of intermediate natural language reasoning steps that lead to the final output',   // 2 lines
  // p. 3, p. 4
  eightHand: 'we manually composed a set of eight few-shot exemplars with chains of thought',
  allButAQuA: 'we used this single set of eight chain of thought exemplars for all benchmarks except AQuA, which is multiple choice instead of free response',
  pearQ: 'Q: Yes or no: Would a pear sink in water?',
  pearA: 'The density of a pear is about 0.6 g/cm^3, which is less than water. Thus, a pear would float.',
  coinQ: 'Q: A coin is heads up. Maybelle flips the coin. Shalonda does not flip the coin. Is the coin still heads up?',
  coinA: 'The coin was flipped by Maybelle. So the coin was flipped 1 time, which is an odd number. The coin started heads up, so after an odd number of flips, it will be tails up.',
  fiveModels: 'We evaluate five large language models.',
  sizesGPT: '350M, 1.3B, 6.7B, and 175B parameters',
  sizesLaMDA: '422M, 2B, 8B, 68B, and 137B parameters',
  sizesPaLM: '8B, 62B, and 540B parameters',
  greedy: 'We sample from the models via greedy decoding',
  followUp: 'follow-up work shows chain-of-thought prompting can be improved by taking the majority final answer over many sampled generations',
  emergent: 'chain-of-thought prompting is an emergent ability of model scale',   // p. 4, Section 3.2
  only100B: 'only yields performance gains when used with models of ∼100B parameters',
  fluent: 'fluent but illogical chains of thought',
  fluentFull: 'models of smaller scale produced fluent but illogical chains of thought, leading to lower performance than standard prompting',
  lowerPerf: 'leading to lower performance than standard prompting',
  noHelpSmall: 'does not positively impact performance for small models',
  emergentShort: 'an emergent ability of model scale',
  // p. 5
  doubled: 'more than doubled for the largest GPT and PaLM models',
  eqOnlyHead: 'Equation only.',
  eqOnly: 'equation only prompting does not help much for GSM8K',
  eqWhy: 'too challenging to directly translate into an equation without the natural language reasoning steps in chain of thought',
  errors46: ['The summary of this analysis is that 46% of the', 'chains of thought were almost correct, barring'],
  wrong50: ['We also randomly examined 50 random sam-', 'ples for which the model gave the wrong answer.'],
  errors54: 'the other 54% of the chains of thought had major errors in semantic understanding or coherence',
  // p. 6
  varHead: 'Variable compute only.',
  dots: 'only sequence of dots (. . .) equal to the number of characters in the equation needed to solve the problem',
  sameAsBase: 'This variant performs about the same as the baseline',        // nth 1 = variable compute, nth 2 = after answer
  sameShort: 'about the same as the baseline',                               // nth 1 = variable compute, nth 2 = after answer
  utility: 'there appears to be utility from expressing intermediate steps via natural language',
  afterHead: 'Chain of thought after answer.',
  after: 'the chain of thought prompt is only given after the answer',
  beyond: 'useful for reasons beyond just activating knowledge',
  annotators: 'two other co-authors of this paper (Annotators B and C) independently wrote chains of thought for the same few-shot exemplars',
  allSets: 'all sets of chain of thought prompts outper- form the standard baseline by a large margin',
  gsm8kSets: 'three sets of eight exemplars randomly sampled from the GSM8K training set',
  // p. 7, p. 8
  sports: 'outperforming an unaided sports enthusiast on sports understanding (95.4% vs 84%)',
  csqaMinimal: 'though note that gain was minimal on CSQA',
  toyTasks: 'We use the following two toy tasks.',
  toyShort: 'two toy tasks',
  lastLetterHead: 'Last letter concatenation.',
  coinHead: 'Coin flip.',                                                  // nth 3 on p. 8 (1 and 2 are Figure 8 titles)
  amy: '“Amy Brown” → “yn”',
  twoWords: 'the model only sees exemplars of names with two words, and then performs last letter concatenation on names with 3 and 4 words',
  flipsToo: 'We do the same for the number of potential flips in the coin flip task.',
  oodFails: 'As for the OOD evaluations, standard prompting fails for both tasks.',
  coinSolved: 'standard prompting already solves coin flip with PaLM 540, though not for LaMDA 137B',
  // p. 9
  notReasoning: 'although chain of thought emulates the thought processes of human reasoners, this does not answer whether the neural network is actually “reasoning,” which we leave as an open question',
  noGuarantee: 'there is no guarantee of correct reasoning paths, which can lead to both correct and incorrect answers',
  costlyServe: 'the emergence of chain-of-thought reasoning only at large model scales makes it costly to serve in real-world applications',
  lowerBound: 'standard prompting only provides a lower bound on the capabilities of large language models',
  noFinetune: 'No language models were finetuned in the process of writing this paper.',
  // p. 13 (reference list) and p. 35
  scRef: 'Xuezhi Wang, Jason Wei, Dale Schuurmans, Quoc Le, Ed Chi, and Denny Zhou. 2022a.',
  scTitle: 'Self-consistency improves chain of thought reasoning in language models.',
  t20Caption: 'Table 20: Few-shot exemplars for full chain of thought prompt for math word problems.',
  t20Used: 'This set of exemplars was used for all math word problem datasets except AQuA.',
  // more p. 1, 4, 8, 9 pieces used by the prompts
  title: 'Chain-of-Thought Prompting Elicits Reasoning in Large Language Models',   // p. 1, 2 lines (bold, normal text)
  pearNo: 'So the answer is no.',                                              // p. 4, nth 1 = StrategyQA panel (2 lines)
  coinEx: 'A coin is heads up. Phoebe flips the coin. Osvaldo does not flip the coin. Is the coin still heads up?',   // p. 8 bullet
  notReasoning1: 'although chain of thought emulates the thought processes of human reasoners',                     // p. 9
  notReasoning2: 'this does not answer whether the neural network is actually “reasoning,” which we leave as an open question',
  priorRow: 'Prior best N/A (finetuning) 55',                                  // p. 20, Table 1 first row
  ablationIntro: 'Figure 5 shows an ablation study with three variations of chain of thought described below.',   // p. 5
  fig6Lamda: 'Figure 6 shows these results for LaMDA 137B on GSM8K and MAWPS',  // p. 6
};

// ── Page 1 ───────────────────────────────────────────────────────────────────────────────────────
export const P1 = {
  title: { x0: 368, y0: 281, x1: 1332, y1: 379 },                    // bold title, 2 lines
  titleLines: [{ x0: 366, y0: 281, x1: 1334, y1: 324 }, { x0: 576, y0: 336, x1: 1124, y1: 379 }],   // bold, normal text: findPhrase works too
  authors: { x0: 422, y0: 505, x1: 1284, y1: 580 },                  // 2 rows of names
  affil: { x0: 683, y0: 609, x1: 1017, y1: 634 },                    // "Google Research, Brain Team"
  stamp: { x0: 50, y0: 602, x1: 101, y1: 1556 },                     // vertical side stamp "arXiv:2201.11903v6 [cs.CL] 10 Jan 2023" (read bottom to top)
  stampDate: { x0: 51, y0: 602, x1: 101, y1: 870 },                  // "10 Jan 2023" part of the stamp (v6 date)
  abstract: { x0: 399, y0: 773, x1: 1304, y1: 1201 },               // heading "Abstract" sits above, at y ≈ 770
  venue: { x0: 300, y0: 2038, x1: 1070, y1: 2061 },                  // footer "36th Conference … (NeurIPS 2022)."
};

// ── Page 1 · Figure 1 (Standard vs Chain-of-Thought prompting) ────────────────────────────────────
// Panel frames measured from page-01.png. Every line in the figure is real text (lines from words.json).
export const FIG1 = {
  all: { x0: 326, y0: 1263, x1: 1374, y1: 1776 },                    // both columns, headings included
  caption: { x0: 300, y0: 1808, x1: 1403, y1: 1863 },
  withCaption: { x0: 300, y0: 1263, x1: 1404, y1: 1864 },
  std: {
    head: { x0: 479, y0: 1269, x1: 713, y1: 1292 },                  // "Standard Prompting"
    input: { x0: 326, y0: 1296, x1: 846, y1: 1584 },                 // Model Input frame (tab included)
    output: { x0: 326, y0: 1622, x1: 846, y1: 1729 },                // Model Output frame
    exemplar: { x0: 345, y0: 1336, x1: 825, y1: 1462 },              // Q: Roger … A: The answer is 11.
    question: { x0: 345, y0: 1478, x1: 802, y1: 1558 },              // Q: The cafeteria … do they have?
    answer: { x0: 350, y0: 1668, x1: 586, y1: 1704 },                // "A: The answer is 27." plus the ✗
    x: { x0: 548, y0: 1667, x1: 581, y1: 1701 },                     // red ✗ (vector)
  },
  cot: {
    head: { x0: 961, y0: 1269, x1: 1296, y1: 1292 },                 // "Chain-of-Thought Prompting"
    input: { x0: 855, y0: 1296, x1: 1374, y1: 1606 },
    output: { x0: 855, y0: 1621, x1: 1374, y1: 1776 },
    exemplar: { x0: 876, y0: 1338, x1: 1356, y1: 1488 },             // Q: Roger … with the blue chain
    chainLines: [                                                    // the paper's blue highlight (chain only, "The answer is 11." excluded)
      { x0: 906, y0: 1437, x1: 1350, y1: 1460 },
      { x0: 882, y0: 1461, x1: 1175, y1: 1484 },
    ],
    question: { x0: 876, y0: 1503, x1: 1332, y1: 1582 },
    answer: { x0: 876, y0: 1658, x1: 1347, y1: 1762 },               // the whole generated answer
    outLines: [                                                      // the paper's green highlight (generated chain)
      { x0: 904, y0: 1663, x1: 1343, y1: 1686 },
      { x0: 880, y0: 1687, x1: 1310, y1: 1709 },
      { x0: 880, y0: 1710, x1: 1291, y1: 1733 },
    ],
    finalLine: { x0: 880, y0: 1734, x1: 987, y1: 1757 },             // "answer is 9."
    tick: { x0: 992, y0: 1715, x1: 1040, y1: 1760 },                 // green ✓ (vector)
  },
  tabs: {                                                             // pill tabs on each frame
    stdIn: { x0: 340, y0: 1296, x1: 520, y1: 1325 },
    stdOut: { x0: 340, y0: 1622, x1: 520, y1: 1650 },
  },
};

// ── Page 2 · Figure 2 (GSM8K bars) ───────────────────────────────────────────────────────────────
// REAL: the printed labels are rounded (33, 55, 18, 57). Tables 1 and 2 give 17.9 and 56.9 for PaLM 540B.
export const FIG2 = {
  box: { x0: 968, y0: 284, x1: 1419, y1: 712 },                      // legend + plot + axis label
  plot: { x0: 995, y0: 424, x1: 1400, y1: 712 },
  caption: { x0: 960, y0: 752, x1: 1404, y1: 928 },
  bars: {
    finetunedGPT3: { x0: 1108, y0: 590, x1: 1164, y1: 668, v: 33 },  // "Finetuned GPT-3 175B" (hatched cream), Cobbe et al. 2021
    priorBest: { x0: 1169, y0: 539, x1: 1225, y1: 668, v: 55 },      // "Prior best" (hatched blue), Cobbe et al. 2021
    palmStd: { x0: 1230, y0: 625, x1: 1286, y1: 668, v: 18 },        // PaLM 540B standard (yellow)
    palmCoT: { x0: 1291, y0: 534, x1: 1347, y1: 668, v: 57 },        // PaLM 540B chain of thought (orange)
  },
  labels: { v55: { x0: 1183, y0: 510, x1: 1211, y1: 535 }, v57: { x0: 1305, y0: 506, x1: 1333, y1: 530 }, v33: { x0: 1122, y0: 561, x1: 1150, y1: 586 }, v18: { x0: 1244, y0: 596, x1: 1272, y1: 621 } },
};

// ── Page 4 · Figure 3 (nine ⟨input, chain of thought, output⟩ examples) ──────────────────────────
// Panels in reading order; boxes include the coloured tab. Text inside is real (findPhrase works).
export const FIG3 = {
  all: { x0: 306, y0: 203, x1: 1397, y1: 1069 },
  caption: { x0: 300, y0: 1101, x1: 1400, y1: 1159 },
  withCaption: { x0: 300, y0: 203, x1: 1400, y1: 1160 },
  panels: [
    { key: 'mwpFree', name: 'Math Word Problems (free response)', fam: 'arithmetic', x0: 306, y0: 203, x1: 667, y1: 482 },
    { key: 'mwpChoice', name: 'Math Word Problems (multiple choice)', fam: 'arithmetic', x0: 669, y0: 203, x1: 1033, y1: 482 },
    { key: 'csqa', name: 'CSQA (commonsense)', fam: 'commonsense', x0: 1034, y0: 203, x1: 1396, y1: 482 },
    { key: 'strategyqa', name: 'StrategyQA', fam: 'commonsense', x0: 306, y0: 496, x1: 667, y1: 775 },
    { key: 'date', name: 'Date Understanding', fam: 'commonsense', x0: 669, y0: 496, x1: 1033, y1: 775 },
    { key: 'sports', name: 'Sports Understanding', fam: 'commonsense', x0: 1034, y0: 496, x1: 1396, y1: 775 },
    { key: 'saycan', name: 'SayCan (Instructing a robot)', fam: 'commonsense', x0: 306, y0: 790, x1: 667, y1: 1069 },
    { key: 'lastLetter', name: 'Last Letter Concatenation', fam: 'symbolic', x0: 669, y0: 790, x1: 1033, y1: 1069 },
    { key: 'coin', name: 'Coin Flip (state tracking)', fam: 'symbolic', x0: 1034, y0: 790, x1: 1397, y1: 1069 },
  ],
};

// ── Page 5 · Figure 4 (solve rate vs model scale; LaMDA · GPT · PaLM × GSM8K · SVAMP · MAWPS) ────
// Vector plot, but every label is a word in words.json. Subplot boxes are the plot areas (axes included).
export const FIG4 = {
  all: { x0: 867, y0: 221, x1: 1387, y1: 1073 },
  legend: { x0: 1035, y0: 221, x1: 1372, y1: 308 },
  caption: { x0: 850, y0: 1112, x1: 1403, y1: 1318 },
  colHeads: { x0: 983, y0: 341, x1: 1354, y1: 359 },                 // "LaMDA  GPT  PaLM"
  xAxis: { x0: 962, y0: 1007, x1: 1382, y1: 1073 },                  // tick labels + "Model scale (# parameters in billions)"
  sub: {
    gsm8k: { lamda: { x0: 960, y0: 369, x1: 1088, y1: 560 }, gpt: { x0: 1110, y0: 369, x1: 1238, y1: 560 }, palm: { x0: 1259, y0: 369, x1: 1387, y1: 560 } },
    svamp: { lamda: { x0: 960, y0: 588, x1: 1088, y1: 779 }, gpt: { x0: 1110, y0: 588, x1: 1238, y1: 779 }, palm: { x0: 1259, y0: 588, x1: 1387, y1: 779 } },
    mawps: { lamda: { x0: 957, y0: 808, x1: 1085, y1: 999 }, gpt: { x0: 1106, y0: 808, x1: 1234, y1: 999 }, palm: { x0: 1256, y0: 808, x1: 1384, y1: 999 } },
  },
  rowLabels: { x0: 867, y0: 373, x1: 950, y1: 999 },                 // "GSM8K / SVAMP / MAWPS solve rate (%)" (rotated)
};

// ── Page 6 · Figures 5 and 6 ─────────────────────────────────────────────────────────────────────
// Figure 5: GSM8K, LaMDA 137B and PaLM 540B, five bars each. Only LaMDA's values are printed (Table 6, p. 23);
// PaLM's ablation bars are plotted, never printed: don't state them.
export const FIG5 = {
  all: { x0: 1029, y0: 216, x1: 1394, y1: 665 },
  plot: { x0: 1029, y0: 382, x1: 1394, y1: 665 },
  legend: { x0: 1050, y0: 216, x1: 1394, y1: 370 },
  caption: { x0: 1015, y0: 704, x1: 1403, y1: 850 },
};
export const FIG6 = {
  all: { x0: 969, y0: 948, x1: 1402, y1: 1534 },                    // LaMDA 137B, GSM8K and MAWPS, 8 bars each
  caption: { x0: 959, y0: 1573, x1: 1404, y1: 1720 },
};

// ── Page 7 · Figure 7 (commonsense, PaLM 8B / 62B / 540B) ───────────────────────────────────────
export const FIG7 = {
  all: { x0: 326, y0: 1455, x1: 1369, y1: 1745 },
  caption: { x0: 300, y0: 1784, x1: 1402, y1: 1920 },
  legend: { x0: 1105, y0: 1524, x1: 1369, y1: 1638 },
  sub: {                                                             // title + ticks + plot, approximate (±4 px)
    csqa: { x0: 326, y0: 1456, x1: 484, y1: 1705 },
    strategyqa: { x0: 503, y0: 1455, x1: 637, y1: 1705 },
    date: { x0: 640, y0: 1460, x1: 788, y1: 1705 },
    sports: { x0: 796, y0: 1455, x1: 939, y1: 1705 },
    saycan: { x0: 945, y0: 1455, x1: 1090, y1: 1705 },
  },
};

// ── Page 8 · Figure 8 (symbolic: in domain vs OOD, PaLM) ────────────────────────────────────────
export const FIG8 = {
  all: { x0: 970, y0: 216, x1: 1388, y1: 900 },
  caption: { x0: 960, y0: 941, x1: 1403, y1: 1057 },
  legend: { x0: 1030, y0: 216, x1: 1366, y1: 271 },
  sub: {
    letter2: { x0: 978, y0: 298, x1: 1199, y1: 548 },                // "Letter Concat: 2 (in domain)"
    letter4: { x0: 1217, y0: 298, x1: 1381, y1: 548 },               // "Letter Concat: 4 (OOD)"
    coin2: { x0: 970, y0: 578, x1: 1189, y1: 828 },                  // "Coin Flip: 2 (in domain)"
    coin4: { x0: 1211, y0: 578, x1: 1370, y1: 828 },                 // "Coin Flip: 4 (OOD)"
  },
};

// ── Tables (boxes + the printed values) ─────────────────────────────────────────────────────────
// Tables list their cells column by column in words.json: never findPhrase a single number. Mark a cell with the
// row's y and the column's x. All values REAL, as printed.

export const T1 = {                      // p. 20 · Table 1: five arithmetic benchmarks, with prior best (finetuning)
  page: 20,
  box: { x0: 319, y0: 737, x1: 1374, y1: 1392 },
  withCaption: { x0: 299, y0: 607, x1: 1402, y1: 1392 },
  cols: { gsm8k: { x0: 740, x1: 790 } },
  rows: {
    priorBest: { y0: 780, y1: 809, gsm8k: 55 },                      // "N/A (finetuning) 55a", a = Cobbe et al. (2021)
    palmStd: { y0: 1296, y1: 1321, gsm8k: 17.9 },
    palmCoT: { y0: 1327, y1: 1352, gsm8k: 56.9 },                    // printed "56.9 (+39.0)"
    palmCalc: { y0: 1363, y1: 1380, gsm8k: 58.6 },                   // "+ ext. calc" (post-hoc calculator) — don't use on screen
  },
};

export const T2 = {                      // p. 21 · Table 2: standard vs CoT, five arithmetic benchmarks, all model sizes
  page: 21,
  box: { x0: 336, y0: 400, x1: 1358, y1: 983 },
  withCaption: { x0: 299, y0: 309, x1: 1404, y1: 983 },
  header: { x0: 564, y0: 411, x1: 657, y1: 436 },                    // "GSM8K"
  cols: { gsm8kStd: { x0: 572, x1: 620 }, gsm8kCoT: { x0: 637, x1: 685 } },
  // GSM8K solve rate (%), standard / CoT, exactly as printed. b = parameters in billions (from p. 4).
  rows: {
    lamda: [
      { m: '420M', b: 0.422, y0: 543, y1: 568, std: 2.6, cot: 0.4 },
      { m: '2B', b: 2, y0: 573, y1: 598, std: 3.6, cot: 1.9 },
      { m: '8B', b: 8, y0: 603, y1: 628, std: 3.2, cot: 1.6 },
      { m: '68B', b: 68, y0: 633, y1: 658, std: 5.7, cot: 8.2 },
      { m: '137B', b: 137, y0: 664, y1: 689, std: 6.5, cot: 14.3 },
    ],
    gpt: [                                                           // GPT-3 sizes "presumably correspond" (p. 4)
      { m: '350M', b: 0.35, y0: 708, y1: 733, std: 2.2, cot: 0.5 },
      { m: '1.3B', b: 1.3, y0: 738, y1: 763, std: 2.4, cot: 0.5 },
      { m: '6.7B', b: 6.7, y0: 769, y1: 794, std: 4.0, cot: 2.4 },
      { m: '175B', b: 175, y0: 799, y1: 824, std: 15.6, cot: 46.9 },
    ],
    palm: [
      { m: '8B', b: 8, y0: 887, y1: 912, std: 4.9, cot: 4.1 },
      { m: '62B', b: 62, y0: 918, y1: 942, std: 9.6, cot: 29.9 },
      { m: '540B', b: 540, y0: 948, y1: 973, std: 17.9, cot: 56.9 },
    ],
  },
};

export const T4 = {                      // p. 22 · Table 4: commonsense. PaLM 540B row only (the video's numbers)
  page: 22,
  box: { x0: 336, y0: 459, x1: 1358, y1: 1032 },
  withCaption: { x0: 299, y0: 359, x1: 1400, y1: 1032 },
  cols: {
    csqa: { std: { x0: 572, x1: 620 }, cot: { x0: 637, x1: 685 } },
    strategyqa: { std: { x0: 738, x1: 786 }, cot: { x0: 803, x1: 851 } },
    date: { std: { x0: 904, x1: 952 }, cot: { x0: 969, x1: 1017 } },
    sports: { std: { x0: 1070, x1: 1118 }, cot: { x0: 1135, x1: 1183 } },
    saycan: { std: { x0: 1236, x1: 1284 }, cot: { x0: 1301, x1: 1349 } },
  },
  palm540: { y0: 997, y1: 1022, csqa: [78.1, 79.9], strategyqa: [68.6, 77.8], date: [49.0, 65.3], sports: [80.5, 95.4], saycan: [80.8, 91.7] },
  sportsHuman: 84,                       // p. 7 text: "an unaided sports enthusiast … (95.4% vs 84%)"; Figure 7 draws it as "Human"
};

export const T5 = {                      // p. 22 · Table 5: symbolic, in domain (2) vs OOD (3, 4). PaLM 540B row
  page: 22,
  box: { x0: 311, y0: 1412, x1: 1382, y1: 1858 },
  withCaption: { x0: 299, y0: 1353, x1: 1399, y1: 1858 },
  cols: {
    letter2: { std: { x0: 538, x1: 573 }, cot: { x0: 580, x1: 628 } },
    letter3: { std: { x0: 685, x1: 720 }, cot: { x0: 727, x1: 775 } },
    letter4: { std: { x0: 832, x1: 867 }, cot: { x0: 874, x1: 923 } },
    coin2: { std: { x0: 966, x1: 1014 }, cot: { x0: 1021, x1: 1084 } },
    coin3: { std: { x0: 1127, x1: 1175 }, cot: { x0: 1182, x1: 1231 } },
    coin4: { std: { x0: 1274, x1: 1322 }, cot: { x0: 1330, x1: 1378 } },
  },
  palm540: { y0: 1825, y1: 1850, letter2: [7.6, 99.4], letter3: [0.2, 94.8], letter4: [0.0, 63.0], coin2: [98.1, 100.0], coin3: [49.3, 98.6], coin4: [54.8, 90.2] },
};

export const T6 = {                      // p. 23 · Table 6: ablation and robustness, LaMDA 137B, GSM8K column (mean over 5 seeds)
  page: 23,
  box: { x0: 403, y0: 460, x1: 1290, y1: 961 },
  withCaption: { x0: 299, y0: 219, x1: 1400, y1: 961 },
  cols: { label: { x0: 419, x1: 729 }, gsm8k: { x0: 785, x1: 882 } },   // value + "±sd"
  rows: [
    { k: 'std', m: 'Standard prompting', y0: 516, y1: 540, v: 6.5 },
    { k: 'cot', m: 'Chain of thought prompting', y0: 546, y1: 571, v: 14.3 },
    { k: 'eq', m: 'equation only', y0: 628, y1: 655, v: 5.4 },
    { k: 'var', m: 'variable compute only', y0: 658, y1: 685, v: 6.4 },
    { k: 'after', m: 'reasoning after answer', y0: 689, y1: 716, v: 6.1 },
    { k: 'annB', m: 'different annotator (B)', y0: 773, y1: 800, v: 15.5 },
    { k: 'annC', m: 'different annotator (C)', y0: 803, y1: 830, v: 17.6 },
    { k: 'concise', m: 'intentionally concise style', y0: 834, y1: 860, v: 11.1 },
    { k: 'alpha', m: 'exemplars from GSM8K (α)', y0: 864, y1: 891, v: 12.6 },
    { k: 'beta', m: 'exemplars from GSM8K (β)', y0: 894, y1: 921, v: 12.7 },
    { k: 'gamma', m: 'exemplars from GSM8K (γ)', y0: 924, y1: 951, v: 12.6 },
  ],
};

// ── Page 35 · Table 20: the eight math exemplars actually used (REAL) ──────────────────────────────
// Each exemplar = a Q block (input) and an A block (chain of thought + "The answer is N."). The paper highlights
// the chain part of each A in pale lavender (#E5E5FF). Figure 1's Roger example is NOT one of these eight.
export const T20 = {
  page: 35,
  box: { x0: 300, y0: 928, x1: 1433, y1: 1997 },                     // framed prompt
  caption: { x0: 299, y0: 850, x1: 1400, y1: 906 },
  title: { x0: 317, y0: 941, x1: 751, y1: 963 },                     // "PROMPT FOR MATH WORD PROBLEMS" (small caps: split letters)
  ex: [                                                              // x span of every block: 312–1412
    { q: { y0: 968, y1: 1026 }, a: { y0: 1035, y1: 1096 }, key: 'trees' },
    { q: { y0: 1113, y1: 1143 }, a: { y0: 1152, y1: 1183 }, key: 'cars' },
    { q: { y0: 1199, y1: 1230 }, a: { y0: 1239, y1: 1300 }, key: 'chocolates' },
    { q: { y0: 1317, y1: 1375 }, a: { y0: 1384, y1: 1442 }, key: 'lollipops' },
    { q: { y0: 1459, y1: 1517 }, a: { y0: 1526, y1: 1584 }, key: 'toys' },
    { q: { y0: 1600, y1: 1659 }, a: { y0: 1668, y1: 1729 }, key: 'computers' },
    { q: { y0: 1745, y1: 1804 }, a: { y0: 1812, y1: 1874 }, key: 'golf' },
    { q: { y0: 1890, y1: 1921 }, a: { y0: 1930, y1: 1991 }, key: 'bagels' },
  ],
  x0: 312,
  x1: 1412,
};

// ── Body-text regions (pages 2, 5, 9, 13) that aren't single phrases ─────────────────────────────
export const P2 = {
  intro: { x0: 300, y0: 200, x1: 945, y1: 960 },                     // Section 1 left column beside Figure 2
  twoIdeas: { x0: 299, y0: 601, x1: 1405, y1: 1080 },                // "This work explores …" to "(Brown et al., 2020)." (left column, then full width from y 964)
  limits: { x0: 300, y0: 1105, x1: 1405, y1: 1400 },                 // "Both of the above ideas, however, have key limitations" … Figure 1
};
export const P9 = {
  limits: { x0: 299, y0: 633, x1: 1405, y1: 931 },                   // "As for limitations, …" paragraph
  discussion: { x0: 299, y0: 200, x1: 1405, y1: 610 },                // end of Section 6 discussion, incl. the lower-bound line (y 497–552)
};
export const P13 = {
  scRef: { x0: 300, y0: 1687, x1: 1405, y1: 1772 },                  // Wang et al. 2022a reference, three lines
};

// ── 3D: the scale terrace (machine beat of segment 05-scale) ─────────────────────────────────────
// Geometry ILLUSTRATIVE (ours); heights REAL (T2, GSM8K). Desk coordinates, z up. x is log10 of parameters:
// x = 560 + 260·log10(billions), precomputed. One row per family, LaMDA at the back, PaLM in front.
// Per size: a standard bar (PAL.std / PAL.stdInk) and a CoT bar (PAL.cot / PAL.cotInk), dx apart.
export const SCALE = {
  hPerPct: 5,                            // z px per percentage point (56.9 → 284 px)
  bar: { w: 34, d: 34 },
  dx: 20,                                // standard at x − dx, CoT at x + dx
  axis: { x0: 410, x1: 1320, ticks: [0, 20, 40, 60] },               // GSM8K solve rate (%), from 0
  rows: {
    lamda: { y: 400, label: '\\text{LaMDA}' },
    gpt: { y: 560, label: '\\text{GPT-3}' },
    palm: { y: 720, label: '\\text{PaLM}' },
  },
  x: { 0.35: 441, 0.422: 463, 1.3: 590, 2: 638, 6.7: 775, 8: 795, 62: 1026, 68: 1036, 137: 1116, 175: 1143, 540: 1270 },
  threshold: { b: 100, x: 1080, label: '\\sim 100\\text{B}' },       // p. 4: gains only at ~100B parameters
  priorBest: { v: 55, label: '\\text{prior best (finetuned)}\\;55' },   // orange glass plate across the PaLM row
};

// ── 3D: the prompt stack (segment 03-idea) ──────────────────────────────────────────────────────
// Layout ILLUSTRATIVE; the cards on it are REAL crops (Figure 1, p. 1; Table 20, p. 35).
// A triple stands as three stacked slabs: input (PAL.input), chain (PAL.cot), output (PAL.out).
export const STACK = {
  triple: { w: 300, d: 70, h: { input: 18, chain: 26, output: 12 }, gap: 4 },
  exemplars: { x: 520, y0: 380, dy: 52, n: 8 },                       // eight triples in a row going back (Table 20 count)
  question: { x: 900, y: 560 },                                       // the new question (Figure 1 cafeteria crop)
  model: { x0: 1060, y0: 470, x1: 1300, y1: 650, h: 120, label: '\\text{PaLM 540B}' },   // label only on the idea beat with p. 1
  answer: { x: 1450, y: 560 },                                        // the generated triple comes out here
};
