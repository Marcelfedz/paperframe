# Narration — LLaMA: Open and Efficient Foundation Language Models

Paper video. Style folio (`docs/style-folio.md`). Facts and guardrails: `briefing.md`.

## cover

This is page one of a paper that went up on {arXiv|archive} on February twenty-seventh, twenty twenty-three.

Fourteen authors, all at Meta {AI|A-I}.

It introduces {LLaMA|llama}, language models from seven to sixty-five billion parameters, and its main claim is about data.

It is possible to train state-of-the-art models using publicly available datasets exclusively, without resorting to proprietary and inaccessible datasets.

Its second claim is about size: the thirteen-billion model outperforms {GPT-3|G-P-T three}, at a hundred and seventy-five billion, on most benchmarks.

And it ends with a release: all the models, to the research community.

By the end, you'll know what went into them, and how far the comparisons go.

(pause 2)

## problem

Earlier work by Hoffmann and colleagues found that, for a fixed training budget, smaller models trained on more data do best.

But that counts only the cost of training. Serve a model at scale, the paper argues, and the inference budget becomes critical.

The preferred model is not the fastest to train but the fastest at inference.

Hoffmann's work recommends a ten-billion-parameter model on two hundred billion tokens.

The authors find a seven-billion model still improving after a trillion.

So the plan is to train smaller models on more tokens than is typical.

Figure one: training loss for all four sizes. When training stops, every curve is still sloping down.

## data

Table one is the training data.

Sixty-seven percent is English web pages from {CommonCrawl|Common Crawl}, deduplicated and filtered for quality.

Fifteen percent is {C4|C-four}, another processed version of {CommonCrawl|Common Crawl}.

The rest comes in small slices: GitHub code, Wikipedia, books, {arXiv|archive} papers, and Stack Exchange answers.

About one point four trillion tokens in all. Most are seen once. Wikipedia and the books, about twice.

Every source met one restriction: publicly available, and compatible with open sourcing.

Other models, the introduction says, use data that is not public or not documented, such as a source listed only as books, two terabytes.

## machine

Section two point two: the network is a transformer, with three changes, each inspired by an earlier model named in brackets.

From {GPT3|G-P-T three}, pre-normalization: normalize the input of each sub-layer instead of its output, with {RMSNorm|R-M-S norm}.

From {PaLM|palm}, the {SwiGLU|swee-glue} activation, in place of {ReLU|ray-loo}.

From {GPTNeo|G-P-T neo}, rotary position embeddings at each layer, replacing the absolute ones.

(pause 1)

Table two gives the four sizes, from thirty-two layers to eighty.

The largest trains on two thousand and forty-eight {A100|A-one-hundred} {GPUs|G-P-Us}.

At about three hundred and eighty tokens per second on each, training on all one point four trillion tokens takes about twenty-one days.

## evidence

Section three compares the models on twenty benchmarks.

Table three is common sense reasoning, zero-shot: no worked examples in the prompt.

The other models' numbers are taken from their own papers.

Thirteen billion, against {GPT-3|G-P-T three}'s hundred and seventy-five.

They share seven tasks. The thirteen-billion model is ahead on five, and behind on two: {PIQA|P-I-Q-A} and {OpenBookQA|open-book Q-A}.

At the top, sixty-five billion, against Chinchilla at seventy and {PaLM|palm} at five hundred and forty.

Against Chinchilla, it scores higher on all five tasks Chinchilla reports.

Against {PaLM|palm}, it is ahead on five of seven, and behind on {BoolQ|bool-Q} and {WinoGrande|wino-grande}.

Several margins are under one point.

And the thirteen-billion model, the paper notes, runs on a single {GPU|G-P-U} at inference.

## limits

Not every table goes that way.

On {MMLU|M-M-L-U}, multiple-choice questions across many fields, the sixty-five-billion model scores sixty-three point four.

Chinchilla, sixty-seven point five. {PaLM|palm}, sixty-nine point three.

The authors offer a potential explanation: only a hundred and seventy-seven gigabytes of books and academic papers, against up to two terabytes of books for those models.

A brief instruction fine-tune lifts it to sixty-eight point nine, still far, the paper says, from the best reported, seventy-seven point four.

On {TruthfulQA|truthful Q-A}, it beats {GPT-3|G-P-T three}, point five seven to point two eight. But the rate is still low, and the authors conclude the model is likely to hallucinate incorrect answers.

## carbon

Section six estimates the carbon cost of training.

Energy is {GPU|G-P-U} hours times four hundred watts, times one point one for data-center overhead. Carbon is that energy times the {US|U-S} average grid.

{OPT|O-P-T} and {BLOOM|bloom} are recomputed the same way, as if trained in the same data center.

Table fifteen. The sixty-five-billion model took about a million {GPU|G-P-U} hours: a hundred and seventy-three tonnes of {CO2|C-O-two} equivalent.

{OPT|O-P-T}, at a hundred and seventy-five billion parameters: a hundred and thirty-seven. {BLOOM|bloom}, a hundred and eighty-three.

Developing all the models, the authors estimate, took about five months and one thousand and fifteen tonnes.

The authors hope that releasing the models, already trained, will reduce future emissions.

## after

Meta's announcement put the weights under a non-commercial research license, granted case by case to researchers who applied.

Others built on them. In March, Stanford's Alpaca fine-tuned the seven-billion model to follow instructions, and inherited the non-commercial license.

In July, Meta said the first {LLaMA|llama} had drawn more than a hundred thousand requests for access, and released {Llama 2|llama two}: seven to seventy billion parameters, free for research and commercial use.

Smaller models, trained longer on public data, and handed to researchers.

{LLaMA|llama}: Open and Efficient Foundation Language Models.

Touvron and colleagues, Meta {AI|A-I}, twenty twenty-three.

The paper is right next to this video.
