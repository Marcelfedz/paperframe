// Shared data for examples/react (ReAct, Yao et al., ICLR 2023). Pure data, no drawing.
// import { PAL, FIG1, … } from './_data.js'
//
// All boxes are in page px of paper/page-NN.png (200 dpi, 1700 × 2200, US letter).
// Real numbers are copied from the paper's tables (briefing.md, verified facts). Anything marked
// ILLUSTRATIVE is ours: label it on screen as illustrative.
//
// Figure text: Figures 1, 4 and 5 are set in a font with shifted glyph codes, so their words in
// words.json are garbled ("+RWVSRW4$" = "HotpotQA") and findPhrase() can't match them. The line
// boxes below were decoded once (char + 29) and grouped per panel; `t` is the decoded text for
// reference only (pdftotext drops parentheses and apostrophes, so never draw `t` as a quote).
// To highlight a figure line, pass its box straight to highlight(): lines = [{ x0, y0, x1, y1, n }]
// with n = t.length. Body text and tables ARE normal text: use findPhrase there.

// ── Colours (fixed for the whole video) ─────────────────────────────────────
// Sampled from Figure 1 itself (Google Docs palette in the paper's figures), so the 3D loop looks
// like the figure grown up. Thought = the paper's light-blue "Think" fill; action keywords in the
// paper's blue; observations neutral (the world's text, uncoloured in the figure). Green = useful /
// correct, red = hallucinated / wrong: the paper's own highlight meaning, kept.
export const PAL = {
  thought: '#CFE2F3',      // fill of Think[...] lines in Figure 1 (2b)
  thoughtInk: '#3D6FA8',   // outline / label for thought cards (darker step of the same blue)
  act: '#FCE5CD',          // pale warm fill for action cards (same Google palette family)
  actInk: '#3D85C6',       // the paper's keyword blue: Search[ ], Lookup[ ], Finish[ ], Think
  obs: '#EFEFEF',          // observation cards: neutral, the environment's text
  obsInk: '#6B6F76',
  good: '#93C47D',         // the paper's green highlight (useful / correct)
  goodMark: '#6AA84F',     // the paper's check mark
  bad: '#EA9999',          // the paper's red highlight (hallucinated / wrong); also its ✗
  env: '#F1F1F1',          // environment slabs (Wikipedia, the house)
};

// ── Page 2 · Figure 1 ───────────────────────────────────────────────────────
// Panel frames (rounded boxes in the figure), measured from page-02.png.
export const FIG1 = {
  all: { x0: 308, y0: 230, x1: 1392, y1: 1122 },       // whole figure, both halves
  top: { x0: 308, y0: 230, x1: 1392, y1: 688 },        // (1) HotpotQA half
  bottom: { x0: 308, y0: 706, x1: 1392, y1: 1122 },    // (2) ALFWorld half
  caption: { x0: 298, y0: 1150, x1: 1404, y1: 1292 },
  panels: {
    q: { x0: 318, y0: 245, x1: 850, y1: 333 },    // (1) question
    a1: { x0: 318, y0: 360, x1: 551, y1: 415 },   // (1a) Standard
    b1: { x0: 318, y0: 437, x1: 551, y1: 681 },   // (1b) CoT (Reason Only)
    c1: { x0: 565, y0: 360, x1: 848, y1: 681 },   // (1c) Act-Only
    d1: { x0: 862, y0: 245, x1: 1385, y1: 681 },  // (1d) ReAct (Reason + Act)
    q2: { x0: 313, y0: 732, x1: 848, y1: 812 },   // (2) ALFWorld task
    a2: { x0: 313, y0: 837, x1: 848, y1: 1115 },  // (2a) Act-Only
    b2: { x0: 862, y0: 727, x1: 1385, y1: 1115 }, // (2b) ReAct (Reason + Act)
  },
  // the figure's own verdict marks (✗ are vector, boxes approximate; ✓ from words.json)
  marks: {
    a1: { kind: 'x', x0: 528, y0: 389, x1: 549, y1: 411 },
    b1: { kind: 'x', x0: 528, y0: 657, x1: 549, y1: 679 },
    c1: { kind: 'x', x0: 826, y0: 654, x1: 847, y1: 676 },
    d1: { kind: 'check', x0: 1344, y0: 646, x1: 1373, y1: 684 },
    a2: { kind: 'x', x0: 813, y0: 1087, x1: 834, y1: 1109 },
    b2: { kind: 'check', x0: 1348, y0: 1078, x1: 1377, y1: 1116 },
  },
  // the paper's own red highlight in (1b): the made-up fact (lines 2–6 of b1, partial first line)
  hallucination: [
    { x0: 400, y0: 476, x1: 534, y1: 491 },   // "Apple Remote was" (right part of the line)
    { x0: 326, y0: 494, x1: 507, y1: 510 },
    { x0: 326, y0: 513, x1: 515, y1: 529 },
    { x0: 326, y0: 532, x1: 540, y1: 548 },
    { x0: 326, y0: 551, x1: 532, y1: 567 },
    { x0: 326, y0: 570, x1: 375, y1: 586 },   // "Touch."
  ],
};

// Decoded line boxes per panel (Figure 1 on p. 2, Figure 5 on p. 15). First entry of each panel is its label tab.
export const FIG1_LINES = {
  q: [
    { x0: 533, y0: 241, x1: 640, y1: 257, t: '1 Hotspot QA' },
    { x0: 329, y0: 270, x1: 818, y1: 286, t: 'Question: Aside from the Apple Remote, what other device' },
    { x0: 329, y0: 290, x1: 775, y1: 306, t: 'can control the program Apple Remote was originally' },
    { x0: 329, y0: 310, x1: 556, y1: 327, t: 'designed to interact with?' },
  ],
  a1: [
    { x0: 387, y0: 355, x1: 486, y1: 371, t: '1a Standard' },
    { x0: 332, y0: 384, x1: 431, y1: 400, t: 'Answer: iPod' },
  ],
  b1: [
    { x0: 352, y0: 432, x1: 517, y1: 448, t: '1b CoT Reason Only' },
    { x0: 326, y0: 457, x1: 532, y1: 472, t: 'Thought: Lets think step' },
    { x0: 326, y0: 476, x1: 534, y1: 491, t: 'by step. Apple Remote was' },
    { x0: 326, y0: 494, x1: 507, y1: 510, t: 'originally designed to' },
    { x0: 326, y0: 513, x1: 515, y1: 529, t: 'interact with Apple TV.' },
    { x0: 326, y0: 532, x1: 540, y1: 548, t: 'Apple TV can be controlled' },
    { x0: 326, y0: 551, x1: 532, y1: 567, t: 'by iPhone, iPad, and iPod' },
    { x0: 326, y0: 570, x1: 517, y1: 586, t: 'Touch. So the answer is' },
    { x0: 326, y0: 589, x1: 507, y1: 604, t: 'iPhone, iPad, and iPod' },
    { x0: 326, y0: 608, x1: 375, y1: 624, t: 'Touch.' },
    { x0: 326, y0: 644, x1: 540, y1: 660, t: 'Answer: iPhone, iPad, iPod' },
    { x0: 326, y0: 663, x1: 367, y1: 678, t: 'Touch' },
  ],
  c1: [
    { x0: 662, y0: 355, x1: 768, y1: 371, t: '1c Act-Only' },
    { x0: 578, y0: 380, x1: 800, y1: 396, t: 'Act 1: Search[Apple Remote]' },
    { x0: 578, y0: 399, x1: 822, y1: 415, t: 'Obs 1: The Apple Remote is a' },
    { x0: 578, y0: 418, x1: 710, y1: 434, t: 'remote control …' },
    { x0: 578, y0: 458, x1: 787, y1: 474, t: 'Act 2: Search[Front Row]' },
    { x0: 578, y0: 477, x1: 809, y1: 493, t: 'Obs 2: Could not find [Front' },
    { x0: 578, y0: 496, x1: 710, y1: 512, t: 'Row]. Similar: …' },
    { x0: 578, y0: 537, x1: 768, y1: 552, t: 'Act 3: Search[Front Row' },
    { x0: 586, y0: 556, x1: 680, y1: 571, t: 'software]' },
    { x0: 578, y0: 574, x1: 751, y1: 590, t: 'Obs 3: Front Row is a' },
    { x0: 578, y0: 593, x1: 784, y1: 609, t: 'discontinued media center' },
    { x0: 578, y0: 612, x1: 660, y1: 628, t: 'software …' },
    { x0: 578, y0: 653, x1: 727, y1: 668, t: 'Act 4: Finish[yes]' },
  ],
  d1: [
    { x0: 1033, y0: 241, x1: 1222, y1: 257, t: '1d ReAct Reason + Act' },
    { x0: 873, y0: 269, x1: 1309, y1: 284, t: 'Thought 1: I need to search Apple Remote and find the' },
    { x0: 873, y0: 285, x1: 1301, y1: 301, t: 'program it was originally designed to interact with.' },
    { x0: 873, y0: 302, x1: 1096, y1: 317, t: 'Act 1: Search[Apple Remote]' },
    { x0: 873, y0: 318, x1: 1342, y1: 334, t: 'Obs 1: The Apple Remote is a remote control introduced in' },
    { x0: 873, y0: 334, x1: 1350, y1: 350, t: 'October 2005 by Apple … originally designed to control the' },
    { x0: 873, y0: 351, x1: 1142, y1: 366, t: 'Front Row media center program …' },
    { x0: 873, y0: 384, x1: 1350, y1: 399, t: 'Thought 2: Apple Remote was originally designed to control' },
    { x0: 873, y0: 400, x1: 1374, y1: 416, t: 'the Front Row media center program. I need to search Front' },
    { x0: 873, y0: 417, x1: 1294, y1: 432, t: 'Row next and find what other device can control it.' },
    { x0: 873, y0: 433, x1: 1071, y1: 449, t: 'Act 2: Search[Front Row]' },
    { x0: 873, y0: 450, x1: 1326, y1: 465, t: 'Obs 2: Could not find [Front Row]. Similar: [Front Row' },
    { x0: 873, y0: 466, x1: 1295, y1: 482, t: 'Seat to Earth, Front Row Motorsports,Front Row' },
    { x0: 882, y0: 482, x1: 999, y1: 498, t: 'software, …]' },
    { x0: 873, y0: 515, x1: 1362, y1: 531, t: 'Thought 3: Front Row is not found. I need to search Front' },
    { x0: 873, y0: 532, x1: 1008, y1: 547, t: 'Row software .' },
    { x0: 873, y0: 548, x1: 1167, y1: 564, t: 'Act 3: Search[Front Row software]' },
    { x0: 873, y0: 565, x1: 1350, y1: 580, t: 'Obs 3: Front Row is a discontinued media center software …' },
    { x0: 873, y0: 598, x1: 1342, y1: 613, t: 'Thought 4: Front Row software is controlled by an Apple' },
    { x0: 873, y0: 614, x1: 1327, y1: 630, t: 'Remote or the keyboard function keys. So the answer is' },
    { x0: 873, y0: 631, x1: 1062, y1: 646, t: 'keyboard function keys.' },
    { x0: 873, y0: 647, x1: 1184, y1: 663, t: 'Act 4: Finish[keyboard function keys]' },
  ],
  q2: [
    { x0: 545, y0: 716, x1: 635, y1: 732, t: '2 AlfWorld' },
    { x0: 331, y0: 738, x1: 812, y1: 754, t: 'You are in the middle of a room. Looking quickly around' },
    { x0: 331, y0: 755, x1: 838, y1: 772, t: 'you, you see a cabinet 6, a cabinet 1, a coffee machine 1,' },
    { x0: 331, y0: 773, x1: 777, y1: 789, t: 'a countertop 3, a stove burner 1, and a toaster 1.' },
    { x0: 331, y0: 790, x1: 786, y1: 806, t: 'Your task is to: Put some pepper shaker on a drawer.' },
  ],
  a2: [
    { x0: 544, y0: 831, x1: 651, y1: 846, t: '2a Act-Only' },
    { x0: 328, y0: 842, x1: 501, y1: 857, t: 'Act 1: Go to drawer 1' },
    { x0: 328, y0: 858, x1: 575, y1: 874, t: 'Obs 1: The drawer 1 is closed.' },
    { x0: 328, y0: 891, x1: 493, y1: 906, t: 'Act 2: Open drawer 1' },
    { x0: 328, y0: 907, x1: 805, y1: 923, t: 'Obs 2: You open the drawer 1. The drawer 1 is open. In it,' },
    { x0: 328, y0: 924, x1: 641, y1: 939, t: 'you see a dishsponge 2, and a spoon 1.' },
    { x0: 328, y0: 957, x1: 526, y1: 972, t: 'Act 3: Go to sinkbasin 1' },
    { x0: 328, y0: 973, x1: 756, y1: 989, t: 'Obs 3: On the sinkbasin 1, you see a dishsponge 3, a' },
    { x0: 328, y0: 990, x1: 534, y1: 1005, t: 'spatula 1, and a spoon 2.' },
    { x0: 328, y0: 1023, x1: 682, y1: 1038, t: 'Act 4: Take peppershaker 1 from sinkbasin 1' },
    { x0: 328, y0: 1039, x1: 518, y1: 1055, t: 'Obs 4: Nothing happens.' },
    { x0: 328, y0: 1074, x1: 682, y1: 1090, t: 'Act 5: Take peppershaker 1 from sinkbasin 1' },
    { x0: 328, y0: 1093, x1: 518, y1: 1109, t: 'Obs 5: Nothing happens.' },
  ],
  b2: [
    { x0: 1032, y0: 716, x1: 1221, y1: 732, t: '2b ReAct Reason + Act' },
    { x0: 873, y0: 738, x1: 1334, y1: 754, t: 'Act 1: Think[First I need to find a pepper shaker...more' },
    { x0: 873, y0: 755, x1: 1382, y1: 770, t: 'likely to appear in cabinets 1-6, countertops 1-3, ... ]' },
    { x0: 873, y0: 771, x1: 1054, y1: 787, t: 'Act 2: Go to cabinet 1' },
    { x0: 873, y0: 788, x1: 1219, y1: 803, t: 'Obs 2: On the cabinet 1, you see a vase 2.' },
    { x0: 879, y0: 812, x1: 1336, y1: 824, t: 'Here the agent go to cabinet 1, then cabinet 2, 3, then countertop 1 and 2' },
    { x0: 873, y0: 833, x1: 1079, y1: 848, t: 'Act 6: Go to countertop 3' },
    { x0: 873, y0: 847, x1: 1342, y1: 862, t: 'Obs 6: On the countertop 3, you see a apple 1, a bread 1,' },
    { x0: 873, y0: 863, x1: 1194, y1: 879, t: '...... a pepper shaker 1, and a vase 3.' },
    { x0: 873, y0: 896, x1: 1243, y1: 912, t: 'Act 7: Take pepper shaker 1 from countertop 3' },
    { x0: 873, y0: 912, x1: 1375, y1: 928, t: 'Obs 7: You pick up the pepper shaker 1 from the countertop 3.' },
    { x0: 873, y0: 945, x1: 1350, y1: 961, t: 'Act 8: Think[Now I find a pepper shaker 1. Next, I need to' },
    { x0: 873, y0: 962, x1: 1068, y1: 977, t: 'put it in/on drawer 1.]' },
    { x0: 873, y0: 978, x1: 1046, y1: 994, t: 'Act 9: Go to drawer 1' },
    { x0: 873, y0: 995, x1: 1087, y1: 1010, t: 'Obs 9: Drawer 1 is closed.' },
    { x0: 873, y0: 1028, x1: 1046, y1: 1043, t: 'Act 10: Open drawer 1' },
    { x0: 873, y0: 1044, x1: 1095, y1: 1060, t: 'Obs 10: You open Drawer 1 …' },
    { x0: 873, y0: 1077, x1: 1219, y1: 1093, t: 'Act 11: Put pepper shaker 1 in/on drawer 1' },
    { x0: 873, y0: 1094, x1: 1293, y1: 1109, t: 'Obs 11: You put pepper shaker 1 in/on the drawer 1.' },
  ],
};

export const FIG5_LINES = {
  task: [
    { x0: 528, y0: 237, x1: 586, y1: 250, t: 'AlfWorld' },
    { x0: 318, y0: 256, x1: 783, y1: 270, t: 'You are in the middle of a room. Looking quickly around you,' },
    { x0: 318, y0: 271, x1: 790, y1: 286, t: 'you see a armchair 1, a cabinet 4, … a cabinet 1, a drawer 5,' },
    { x0: 318, y0: 286, x1: 790, y1: 301, t: '…, a drawer 1, a dresser 1, a garbagecan 1, a safe 1, a shelf' },
    { x0: 318, y0: 302, x1: 674, y1: 317, t: '12, …, a shelf 1, a sidetable 1, and a sofa 1.' },
    { x0: 318, y0: 318, x1: 643, y1: 332, t: 'Your task is to: put two keychain in safe.' },
  ],
  a: [
    { x0: 532, y0: 361, x1: 597, y1: 375, t: 'a ReAct' },
    { x0: 318, y0: 378, x1: 362, y1: 391, t: '......' },
    { x0: 318, y0: 392, x1: 777, y1: 406, t: 'Obs 16: You open the drawer 4. The drawer 4 is open. In it, you' },
    { x0: 318, y0: 407, x1: 551, y1: 420, t: 'see a keychain 3, and a watch 2.' },
    { x0: 318, y0: 421, x1: 792, y1: 435, t: 'Act 17: Think [Now I find the first keychain 3. Next, I need to' },
    { x0: 318, y0: 436, x1: 799, y1: 450, t: 'take it. I can find the second keychain 2 later in drawer 4. ]' },
    { x0: 318, y0: 450, x1: 588, y1: 464, t: 'Act 18: take keychain 3 from drawer 4' },
    { x0: 318, y0: 465, x1: 704, y1: 479, t: 'Obs 18: You pick up the keychain 3 from the drawer 4.' },
    { x0: 318, y0: 480, x1: 362, y1: 493, t: '......' },
    { x0: 318, y0: 494, x1: 573, y1: 508, t: 'Act 22: put keychain 3 in/on safe 1' },
    { x0: 318, y0: 509, x1: 668, y1: 522, t: 'Obs 22: You put the keychain 3 in/on the safe 1.' },
    { x0: 318, y0: 523, x1: 792, y1: 537, t: 'Act 23: Think [Now I put the first keychain in safe. Next, I need' },
    { x0: 318, y0: 538, x1: 776, y1: 552, t: 'to find the second keychain. I can directly go to drawer 4. ]' },
    { x0: 318, y0: 552, x1: 478, y1: 566, t: 'Act 24: go to drawer 4' },
    { x0: 318, y0: 567, x1: 719, y1: 581, t: 'Obs 24: The drawer 4 is open. In it, you see a watch 2.' },
    { x0: 318, y0: 582, x1: 778, y1: 595, t: 'Act 25: Think [Now I find the second keychain 2. Next, I need' },
    { x0: 318, y0: 596, x1: 408, y1: 610, t: 'to take it.]' },
    { x0: 318, y0: 611, x1: 588, y1: 624, t: 'Act 26: take keychain 2 from drawer 4' },
    { x0: 318, y0: 625, x1: 493, y1: 639, t: 'Obs 26: Nothing happens.' },
  ],
  b: [
    { x0: 1007, y0: 237, x1: 1211, y1: 250, t: 'b ReAct Human Thought edit' },
    { x0: 829, y0: 253, x1: 873, y1: 267, t: '......' },
    { x0: 829, y0: 268, x1: 1332, y1: 281, t: 'Obs 16: You open the drawer 4. The drawer 4 is open. In it, you see a' },
    { x0: 829, y0: 282, x1: 1019, y1: 296, t: 'keychain 3, and a watch 2.' },
    { x0: 829, y0: 297, x1: 1395, y1: 310, t: 'Act 17:ѕThinkѕ[Now I find the first keychain 3. Next, I need to take it. I' },
    { x0: 829, y0: 311, x1: 1220, y1: 325, t: 'can find the second keychain 2 later in drawer 4.]' },
    { x0: 829, y0: 326, x1: 1099, y1: 340, t: 'Act 18: take keychain 3 from drawer 4' },
    { x0: 829, y0: 340, x1: 1216, y1: 354, t: 'Obs 18: You pick up the keychain 3 from the drawer 4.' },
    { x0: 829, y0: 355, x1: 873, y1: 369, t: '......' },
    { x0: 829, y0: 370, x1: 1084, y1: 383, t: 'Act 22: put keychain 3 in/on safe 1' },
    { x0: 829, y0: 384, x1: 1179, y1: 398, t: 'Obs 22: You put the keychain 3 in/on the safe 1.' },
    { x0: 829, y0: 399, x1: 1357, y1: 412, t: 'Act 23: Thinkѕ[Now I put the first keychain in safe. Next, I need to find' },
    { x0: 829, y0: 413, x1: 1322, y1: 427, t: 'the second keychain, which is more likely to appear in dresser 1,' },
    { x0: 829, y0: 428, x1: 1318, y1: 442, t: 'garbagecan 1, safe 1, sidetable 1, sofa 1, shelf 1-12.]' },
    { x0: 829, y0: 442, x1: 997, y1: 456, t: 'Act 24: go to dresser 1' },
    { x0: 829, y0: 457, x1: 1368, y1: 471, t: 'Obs 24: On the dresser 1, you see a box 1, a creditcard 1, a keychain 2, a' },
    { x0: 829, y0: 472, x1: 1012, y1: 485, t: 'keychain 1, a laptop 1...' },
    { x0: 829, y0: 486, x1: 1350, y1: 500, t: 'Act 25: Thinkѕ[Now I find the second keychain 2. Next, I need to take' },
    { x0: 829, y0: 501, x1: 859, y1: 515, t: 'it.]' },
    { x0: 829, y0: 515, x1: 1106, y1: 529, t: 'Act 26: take keychain 2 from dresser 1' },
    { x0: 829, y0: 530, x1: 1223, y1: 544, t: 'Obs 26: You pick up the keychain 2 from the dresser 1.' },
    { x0: 829, y0: 544, x1: 1364, y1: 558, t: 'Act 27: Thinkѕ[Now I take the second keychain 2. Next, I need to put it' },
    { x0: 829, y0: 559, x1: 934, y1: 573, t: 'in/on safe 1.]' },
    { x0: 829, y0: 574, x1: 975, y1: 587, t: 'Act 28: go to safe 1' },
    { x0: 829, y0: 588, x1: 1368, y1: 602, t: 'Obs 28: The safe 1 is open. In it, you see a keychain 3, a statue 2, and a' },
    { x0: 829, y0: 603, x1: 888, y1: 617, t: 'watch 3.' },
    { x0: 829, y0: 617, x1: 1084, y1: 631, t: 'Act 29: put keychain 2 in/on safe 1' },
    { x0: 829, y0: 632, x1: 1179, y1: 646, t: 'Obs 29: You put the keychain 2 in/on the safe 1.' },
  ],
};

// Lines grouped into trajectory steps (k: thought | act | obs | answer | note). In 2b and Figure 5, 'Act N: Think[…]' is a thought.
export const FIG1_STEPS = {
  b1: [
    { id: 'Thought', k: 'thought', x0: 326, y0: 457, x1: 540, y1: 624 },
    { id: 'Answer', k: 'answer', x0: 326, y0: 644, x1: 540, y1: 678 },
  ],
  c1: [
    { id: 'Act1', k: 'act', x0: 578, y0: 380, x1: 800, y1: 396 },
    { id: 'Obs1', k: 'obs', x0: 578, y0: 399, x1: 822, y1: 434 },
    { id: 'Act2', k: 'act', x0: 578, y0: 458, x1: 787, y1: 474 },
    { id: 'Obs2', k: 'obs', x0: 578, y0: 477, x1: 809, y1: 512 },
    { id: 'Act3', k: 'act', x0: 578, y0: 537, x1: 768, y1: 571 },
    { id: 'Obs3', k: 'obs', x0: 578, y0: 574, x1: 784, y1: 628 },
    { id: 'Act4', k: 'act', x0: 578, y0: 653, x1: 727, y1: 668 },
  ],
  d1: [
    { id: 'Thought1', k: 'thought', x0: 873, y0: 269, x1: 1309, y1: 301 },
    { id: 'Act1', k: 'act', x0: 873, y0: 302, x1: 1096, y1: 317 },
    { id: 'Obs1', k: 'obs', x0: 873, y0: 318, x1: 1350, y1: 366 },
    { id: 'Thought2', k: 'thought', x0: 873, y0: 384, x1: 1374, y1: 432 },
    { id: 'Act2', k: 'act', x0: 873, y0: 433, x1: 1071, y1: 449 },
    { id: 'Obs2', k: 'obs', x0: 873, y0: 450, x1: 1326, y1: 498 },
    { id: 'Thought3', k: 'thought', x0: 873, y0: 515, x1: 1362, y1: 547 },
    { id: 'Act3', k: 'act', x0: 873, y0: 548, x1: 1167, y1: 564 },
    { id: 'Obs3', k: 'obs', x0: 873, y0: 565, x1: 1350, y1: 580 },
    { id: 'Thought4', k: 'thought', x0: 873, y0: 598, x1: 1342, y1: 646 },
    { id: 'Act4', k: 'act', x0: 873, y0: 647, x1: 1184, y1: 663 },
  ],
  a2: [
    { id: 'Act1', k: 'act', x0: 328, y0: 842, x1: 501, y1: 857 },
    { id: 'Obs1', k: 'obs', x0: 328, y0: 858, x1: 575, y1: 874 },
    { id: 'Act2', k: 'act', x0: 328, y0: 891, x1: 493, y1: 906 },
    { id: 'Obs2', k: 'obs', x0: 328, y0: 907, x1: 805, y1: 939 },
    { id: 'Act3', k: 'act', x0: 328, y0: 957, x1: 526, y1: 972 },
    { id: 'Obs3', k: 'obs', x0: 328, y0: 973, x1: 756, y1: 1005 },
    { id: 'Act4', k: 'act', x0: 328, y0: 1023, x1: 682, y1: 1038 },
    { id: 'Obs4', k: 'obs', x0: 328, y0: 1039, x1: 518, y1: 1055 },
    { id: 'Act5', k: 'act', x0: 328, y0: 1074, x1: 682, y1: 1090 },
    { id: 'Obs5', k: 'obs', x0: 328, y0: 1093, x1: 518, y1: 1109 },
  ],
  b2: [
    { id: 'Act1', k: 'thought', x0: 873, y0: 738, x1: 1382, y1: 770 },
    { id: 'Act2', k: 'act', x0: 873, y0: 771, x1: 1054, y1: 787 },
    { id: 'Obs2', k: 'obs', x0: 873, y0: 788, x1: 1219, y1: 803 },
    { id: 'Heretheagent', k: 'note', x0: 879, y0: 812, x1: 1336, y1: 824 },
    { id: 'Act6', k: 'act', x0: 873, y0: 833, x1: 1079, y1: 848 },
    { id: 'Obs6', k: 'obs', x0: 873, y0: 847, x1: 1342, y1: 879 },
    { id: 'Act7', k: 'act', x0: 873, y0: 896, x1: 1243, y1: 912 },
    { id: 'Obs7', k: 'obs', x0: 873, y0: 912, x1: 1375, y1: 928 },
    { id: 'Act8', k: 'thought', x0: 873, y0: 945, x1: 1350, y1: 977 },
    { id: 'Act9', k: 'act', x0: 873, y0: 978, x1: 1046, y1: 994 },
    { id: 'Obs9', k: 'obs', x0: 873, y0: 995, x1: 1087, y1: 1010 },
    { id: 'Act10', k: 'act', x0: 873, y0: 1028, x1: 1046, y1: 1043 },
    { id: 'Obs10', k: 'obs', x0: 873, y0: 1044, x1: 1095, y1: 1060 },
    { id: 'Act11', k: 'act', x0: 873, y0: 1077, x1: 1219, y1: 1093 },
    { id: 'Obs11', k: 'obs', x0: 873, y0: 1094, x1: 1293, y1: 1109 },
  ],
};

export const FIG5_STEPS = {
  a: [
    { id: 'Obs16', k: 'obs', x0: 318, y0: 392, x1: 777, y1: 420 },
    { id: 'Act17', k: 'thought', x0: 318, y0: 421, x1: 799, y1: 450 },
    { id: 'Act18', k: 'act', x0: 318, y0: 450, x1: 588, y1: 464 },
    { id: 'Obs18', k: 'obs', x0: 318, y0: 465, x1: 704, y1: 479 },
    { id: 'Act22', k: 'act', x0: 318, y0: 494, x1: 573, y1: 508 },
    { id: 'Obs22', k: 'obs', x0: 318, y0: 509, x1: 668, y1: 522 },
    { id: 'Act23', k: 'thought', x0: 318, y0: 523, x1: 792, y1: 552 },
    { id: 'Act24', k: 'act', x0: 318, y0: 552, x1: 478, y1: 566 },
    { id: 'Obs24', k: 'obs', x0: 318, y0: 567, x1: 719, y1: 581 },
    { id: 'Act25', k: 'thought', x0: 318, y0: 582, x1: 778, y1: 610 },
    { id: 'Act26', k: 'act', x0: 318, y0: 611, x1: 588, y1: 624 },
    { id: 'Obs26', k: 'obs', x0: 318, y0: 625, x1: 493, y1: 639 },
  ],
  b: [
    { id: 'Obs16', k: 'obs', x0: 829, y0: 268, x1: 1332, y1: 296 },
    { id: 'Act17', k: 'thought', x0: 829, y0: 297, x1: 1395, y1: 325 },
    { id: 'Act18', k: 'act', x0: 829, y0: 326, x1: 1099, y1: 340 },
    { id: 'Obs18', k: 'obs', x0: 829, y0: 340, x1: 1216, y1: 354 },
    { id: 'Act22', k: 'act', x0: 829, y0: 370, x1: 1084, y1: 383 },
    { id: 'Obs22', k: 'obs', x0: 829, y0: 384, x1: 1179, y1: 398 },
    { id: 'Act23', k: 'thought', x0: 829, y0: 399, x1: 1357, y1: 442 },
    { id: 'Act24', k: 'act', x0: 829, y0: 442, x1: 997, y1: 456 },
    { id: 'Obs24', k: 'obs', x0: 829, y0: 457, x1: 1368, y1: 485 },
    { id: 'Act25', k: 'thought', x0: 829, y0: 486, x1: 1350, y1: 515 },
    { id: 'Act26', k: 'act', x0: 829, y0: 515, x1: 1106, y1: 529 },
    { id: 'Obs26', k: 'obs', x0: 829, y0: 530, x1: 1223, y1: 544 },
    { id: 'Act27', k: 'thought', x0: 829, y0: 544, x1: 1364, y1: 573 },
    { id: 'Act28', k: 'act', x0: 829, y0: 574, x1: 975, y1: 587 },
    { id: 'Obs28', k: 'obs', x0: 829, y0: 588, x1: 1368, y1: 617 },
    { id: 'Act29', k: 'act', x0: 829, y0: 617, x1: 1084, y1: 631 },
    { id: 'Obs29', k: 'obs', x0: 829, y0: 632, x1: 1179, y1: 646 },
  ],
};

// ── Page 15 · Figure 5 (human thought edit, Appendix A.3) ───────────────────
export const FIG5 = {
  all: { x0: 305, y0: 228, x1: 1400, y1: 656 },
  caption: { x0: 298, y0: 685, x1: 1404, y1: 775 },
  panels: {
    task: { x0: 308, y0: 233, x1: 805, y1: 345 },
    a: { x0: 308, y0: 355, x1: 805, y1: 652 },    // (a) ReAct, fails
    b: { x0: 820, y0: 233, x1: 1398, y1: 652 },   // (b) ReAct (Human Thought edit), succeeds
  },
  marks: {
    a: { kind: 'x', x0: 763, y0: 616, x1: 784, y1: 638 },
    b: { kind: 'check', x0: 1345, y0: 609, x1: 1370, y1: 643 },
  },
  // the two edited thoughts in (b): the paper strikes the end of Act 17 and underlines what was added to Act 23
  edits: {
    act17struck: { x0: 829, y0: 311, x1: 1220, y1: 325 },   // "can find the second keychain (2) later in drawer 4." (struck in the paper)
    act23added: [                                            // ", which is more likely to appear in dresser (1), garbagecan (1), …" (underlined in the paper)
      { x0: 972, y0: 413, x1: 1340, y1: 427 },
      { x0: 829, y0: 428, x1: 1318, y1: 442 },
    ],
  },
};

// ── Body-text boxes that aren't plain phrases ───────────────────────────────
export const P1 = {
  title: { x0: 296, y0: 222, x1: 1404, y1: 320 },         // small-caps title (findPhrase can't match it: letters are split)
  titleLines: [{ x0: 298, y0: 225, x1: 1402, y1: 266 }, { x0: 298, y0: 280, x1: 720, y1: 318 }],
  stamp: { x0: 48, y0: 580, x1: 104, y1: 1560 },          // vertical arXiv side stamp "arXiv:2210.03629v3 [cs.CL] 10 Mar 2023"
  abstract: { x0: 396, y0: 660, x1: 1306, y1: 1345 },
};
export const P3 = {
  sec2: { x0: 296, y0: 1090, x1: 1006, y1: 1118 },       // "2 ReAct: Synergizing Reasoning + Acting" heading
  ctxDef: { x0: 741, y0: 1218, x1: 1104, y1: 1246 },     // c_t = (o_1, a_1, …, o_{t-1}, a_{t-1}, o_t)
  aug: { x0: 1091, y0: 1421, x1: 1230, y1: 1448 },       // Â = A ∪ L
  ctxUpd: { x0: 559, y0: 1545, x1: 726, y1: 1572 },      // c_{t+1} = (c_t, â_t)
};
export const P4 = {
  actionSpace: { x0: 296, y0: 1394, x1: 1406, y1: 1664 },  // "Action Space" paragraph, Section 3.1
};
export const P18 = {
  milhouse: { x0: 310, y0: 437, x1: 1400, y1: 795 },       // the Milhouse example in the ReAct HotpotQA prompt (Appendix C.1)
  thought2: { x0: 317, y0: 620, x1: 1384, y1: 657 },       // Thought 2 … look up "named after".
  action2: { x0: 317, y0: 664, x1: 722, y1: 679 },         // Action 2  Lookup[named after]
  obs2: { x0: 317, y0: 686, x1: 1400, y1: 723 },           // Observation 2 (Result 1 / 1) Milhouse was named after …
};
export const P33 = {
  searchError: { x0: 300, y0: 222, x1: 1420, y1: 445 },    // "Failure: Search error" block (ReAct, goddess frigg)
  hallucination: { x0: 300, y0: 509, x1: 1362, y1: 664 },  // "Failure: Hallucination" block (CoT, 1916 vs label 1909)
};

// ── Tables (boxes + the printed values) ─────────────────────────────────────
// Rows: { y0, y1 } in page px. Columns: { x0, x1 }. Values exactly as printed.
export const T1 = {                      // p. 5 · Table 1: PaLM-540B prompting, HotpotQA (EM) and Fever (Acc)
  page: 5,
  box: { x0: 300, y0: 225, x1: 764, y1: 540 },
  withCaption: { x0: 296, y0: 225, x1: 766, y1: 625 },
  cols: { method: { x0: 312, x1: 535 }, hotpot: { x0: 588, x1: 637 }, fever: { x0: 696, x1: 745 } },
  rows: [
    { m: 'Standard', y0: 301, y1: 322, hotpot: 28.7, fever: 57.1 },
    { m: 'CoT', y0: 326, y1: 347, hotpot: 29.4, fever: 56.3 },
    { m: 'CoT-SC', y0: 352, y1: 372, hotpot: 33.4, fever: 60.4 },
    { m: 'Act', y0: 389, y1: 410, hotpot: 25.7, fever: 58.9 },
    { m: 'ReAct', y0: 414, y1: 435, hotpot: 27.4, fever: 60.9 },
    { m: 'CoT-SC → ReAct', y0: 438, y1: 460, hotpot: 34.2, fever: 64.6 },   // best on Fever (bold)
    { m: 'ReAct → CoT-SC', y0: 465, y1: 486, hotpot: 35.1, fever: 62.0 },   // best on HotpotQA (bold)
    { m: 'Supervised SoTA', y0: 506, y1: 531, hotpot: 67.5, fever: 89.5 },
  ],
};
export const T2 = {                      // p. 6 · Table 2: success / failure modes, 50 + 50 runs per method (200 total), HotpotQA
  page: 6,
  box: { x0: 333, y0: 225, x1: 1367, y1: 415 },
  withCaption: { x0: 296, y0: 225, x1: 1404, y1: 495 },
  cols: { type: { x0: 446, x1: 592 }, def: { x0: 620, x1: 1192 }, react: { x0: 1220, x1: 1284 }, cot: { x0: 1312, x1: 1353 } },
  rows: [   // null = "-" in the paper
    { group: 'success', type: 'True positive', y0: 277, y1: 294, react: 94, cot: 86 },
    { group: 'success', type: 'False positive', y0: 299, y1: 316, react: 6, cot: 14 },
    { group: 'failure', type: 'Reasoning error', y0: 322, y1: 339, react: 47, cot: 16 },
    { group: 'failure', type: 'Search result error', y0: 344, y1: 362, react: 23, cot: null },
    { group: 'failure', type: 'Hallucination', y0: 366, y1: 384, react: 0, cot: 56 },
    { group: 'failure', type: 'Label ambiguity', y0: 388, y1: 406, react: 29, cot: 28 },
  ],
  // Percentages are within each group (success column sums: 100 / 100; failure: ReAct 99 (rounding), CoT 100).
};
export const T3 = {                      // p. 8 · Table 3: ALFWorld success rates (%), 134 unseen games
  page: 8,
  box: { x0: 300, y0: 225, x1: 1059, y1: 497 },
  withCaption: { x0: 296, y0: 225, x1: 1062, y1: 610 },
  cols: { method: { x0: 312, x1: 500 }, all: { x0: 1010, x1: 1047 } },
  colsTask: ['Pick', 'Clean', 'Heat', 'Cool', 'Look', 'Pick 2'],
  rows: [
    { m: 'Act (best of 6)', y0: 278, y1: 300, task: [88, 42, 74, 67, 72, 41], all: 45 },
    { m: 'ReAct (avg)', y0: 302, y1: 327, task: [65, 39, 83, 76, 55, 24], all: 57 },
    { m: 'ReAct (best of 6)', y0: 332, y1: 361, task: [92, 58, 96, 86, 78, 41], all: 71 },
    { m: 'ReAct-IM (avg)', y0: 372, y1: 394, task: [55, 59, 60, 55, 23, 24], all: 48 },
    { m: 'ReAct-IM (best of 6)', y0: 398, y1: 421, task: [62, 68, 87, 57, 39, 33], all: 53 },
    { m: 'BUTLER_g (best of 8)', y0: 438, y1: 462, task: [33, 26, 70, 76, 17, 12], all: 22 },
    { m: 'BUTLER (best of 8)', y0: 465, y1: 487, task: [46, 39, 74, 100, 22, 24], all: 37 },   // beam search; the others greedy
  ],
};
export const T4 = {                      // p. 8 · Table 4: WebShop score and success rate (SR), 500 test instructions
  page: 8,
  box: { x0: 1080, y0: 225, x1: 1362, y1: 465 },
  withCaption: { x0: 1074, y0: 225, x1: 1366, y1: 610 },
  cols: { method: { x0: 1092, x1: 1170 }, score: { x0: 1199, x1: 1246 }, sr: { x0: 1275, x1: 1322 } },
  rows: [
    { m: 'Act', y0: 276, y1: 297, score: 62.3, sr: 30.1 },
    { m: 'ReAct', y0: 302, y1: 327, score: 66.6, sr: 40.0 },
    { m: 'IL', y0: 339, y1: 361, score: 59.9, sr: 29.1 },
    { m: 'IL+RL', y0: 366, y1: 387, score: 62.4, sr: 28.7 },
    { m: 'Human Expert', y0: 410, y1: 457, score: 82.1, sr: 59.6 },
  ],
};

// ── The loop (desk coordinates, shared by loop, tools, failures and after) ──
// One geometry so the ring looks the same every time it comes back. Units: desk px (world x right,
// y down the desk, z up). Thought on the left, Action top-right, Observation bottom-right; the
// environment slab sits outside the ring on the right, so only Action → env → Observation crosses it.
// The context stack sits in the middle: every step's card lands on it (c_{t+1} = (c_t, â_t)).
export const LOOP = {
  c: { x: 900, y: 560 },
  r: 270,
  stations: {
    thought: { x: 630, y: 560, label: '\\text{Thought}', fill: 'thought' },
    act: { x: 1035, y: 326, label: '\\text{Action}', fill: 'act' },
    obs: { x: 1035, y: 794, label: '\\text{Observation}', fill: 'obs' },
  },
  slab: { w: 250, d: 120, h: 60 },          // each station: a slab this size, centred on its point
  env: { x0: 1360, y0: 420, x1: 1640, y1: 700, h: 110, label: '\\text{Wikipedia}' },   // household segment relabels it
  stack: { x: 900, y: 560, w: 300, d: 70, dz: 9 },   // context cards: footprint w × d, each card dz higher
};

// ── ALFWorld room (ILLUSTRATIVE layout) ─────────────────────────────────────
// Receptacles named in Figure 1 (2): the task text lists cabinet 6, cabinet 1, coffee machine 1,
// countertop 3, stove burner 1, toaster 1 (abridged in the figure); the trajectories add drawer 1,
// sinkbasin 1, cabinets 2–3, countertops 1–2. Positions are ours: label the room "layout illustrative".
export const ROOM = {
  floor: { x0: 520, y0: 250, x1: 1400, y1: 870 },
  items: {
    cabinet1: { x: 600, y: 300, label: '\\text{cabinet 1}', h: 90 },
    cabinet2: { x: 740, y: 300, label: '\\text{cabinet 2}', h: 90 },
    cabinet3: { x: 880, y: 300, label: '\\text{cabinet 3}', h: 90 },
    cabinet4: { x: 1020, y: 300, label: '\\text{cabinet 4}', h: 90 },
    cabinet5: { x: 1160, y: 300, label: '\\text{cabinet 5}', h: 90 },
    cabinet6: { x: 1300, y: 300, label: '\\text{cabinet 6}', h: 90 },
    countertop1: { x: 1330, y: 470, label: '\\text{countertop 1}', h: 60 },
    countertop2: { x: 1330, y: 610, label: '\\text{countertop 2}', h: 60 },
    countertop3: { x: 1330, y: 750, label: '\\text{countertop 3}', h: 60 },
    sinkbasin1: { x: 600, y: 600, label: '\\text{sinkbasin 1}', h: 50 },
    drawer1: { x: 600, y: 790, label: '\\text{drawer 1}', h: 45 },
    coffeemachine1: { x: 820, y: 800, label: '\\text{coffeemachine 1}', h: 70 },
    stoveburner1: { x: 1000, y: 800, label: '\\text{stoveburner 1}', h: 30 },
    toaster1: { x: 1150, y: 800, label: '\\text{toaster 1}', h: 40 },
  },
  shaker: 'countertop3',   // Figure 1 (2b), Obs 6: "… a pepper shaker 1, and a vase 3."
  // Visit orders, from the figure (no act numbers for the elided part of 2b: the figure's note and its numbering don't line up)
  actOnly: ['drawer1', 'drawer1', 'sinkbasin1', 'sinkbasin1', 'sinkbasin1'],   // go, open, go, take ✗, take ✗
  react: ['cabinet1', 'cabinet2', 'cabinet3', 'countertop1', 'countertop2', 'countertop3', 'drawer1'],
  reactThoughts: { first: 'Act1', second: 'Act8' },   // FIG1_STEPS.b2 ids of the only two thoughts (sparse)
};
