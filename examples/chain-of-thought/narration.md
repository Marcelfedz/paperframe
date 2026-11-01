# Narration — Chain-of-Thought Prompting Elicits Reasoning in Large Language Models

Paper video. Style folio (`docs/style-folio.md`). Facts and guardrails: `briefing.md`.

## cover

This is page one of a paper that went up on {arXiv|archive} on January twenty-eighth, twenty twenty-two.

Nine authors, from Google Research's Brain Team.

The abstract opens with the claim.

Generating a chain of thought, a series of intermediate reasoning steps, significantly improves the ability of large language models to perform complex reasoning.

No training, just a few worked examples in the prompt, with the reasoning written out.

With eight of them, {PaLM|palm}, at five hundred and forty billion parameters, reached state-of-the-art accuracy on {GSM8K|G-S-M eight K}, a benchmark of math word problems.

By the end, you'll know what a chain-of-thought prompt looks like, why it only works in large models, and which simpler explanations the authors tested.

(pause 2)

## problem

Page two starts from a limit.

Scaling up model size alone, the paper says, had not proved sufficient for arithmetic, commonsense, and symbolic reasoning.

There were two ideas to build on.

One: train a model to write out its reasoning before the answer. It works, but writing a large set of good rationales is costly.

Two: prompting. Show a large model a few questions with their answers, and it picks up the task. No training.

On reasoning, though, it works poorly, and a bigger model often doesn't help.

Figure one, left side. One solved example: Roger's tennis balls, the answer is eleven. Then a new question, about a cafeteria's apples.

The model answers twenty-seven. Wrong.

## idea

The paper keeps the prompting, and adds the reasoning.

Each example in the prompt becomes a triple: input, chain of thought, output.

Figure one, right side. Same first question, but now the example shows its work.

Roger started with five balls. Two cans of three tennis balls each is six tennis balls. Five plus six equals eleven.

The model follows the pattern, and writes its own chain for the new question.

Twenty-three apples, twenty used, that leaves three. Six more makes nine. Correct.

In the paper's words, a chain of thought is a series of intermediate natural language reasoning steps that lead to the final output.

The model stays the same. Only the examples in its prompt change.

## tasks

The authors wrote eight of these examples by hand, and used the same eight on every math benchmark but one, which is multiple choice.

Figure three shows the format beyond math.

Would a pear sink in water? The chain reasons from density: a pear would float. So, no.

A coin is heads up. Maybelle flips it, Shalonda doesn't. One flip, an odd number, so the coin ends tails up.

Five math benchmarks, five commonsense, two symbolic.

Five large language models, in sizes from under half a billion parameters to five hundred and forty billion.

Every answer was decoded greedily: one try per question.

## scale

Section three point two. Figure four plots solve rate against model size, for three model families.

For small models, chain of thought doesn't help.

They write fluent but illogical chains of thought, and score lower than with standard prompting.

The gains only appear around a hundred billion parameters.

Take {PaLM|palm} on {GSM8K|G-S-M eight K}.

At eight billion parameters: four point nine percent with standard prompting, four point one with chain of thought.

At sixty-two billion: nine point six, against twenty-nine point nine.

At five hundred and forty billion: seventeen point nine, against fifty-six point nine.

(pause 1)

That passes the previous best, fifty-five, which came from finetuning.

The authors call this an emergent ability of model scale.

## ablation

Section three point three asks if something simpler does the job.

Equation only: the model writes just the math, then the answer. On {GSM8K|G-S-M eight K}, that barely helps: the questions are too hard to turn straight into an equation.

Variable compute only: a row of dots, as long as the equation. Extra tokens, no words. About the same as the baseline.

Reasoning after the answer: the same kind of chain, written once the answer is out. Also about the same as the baseline.

The authors' reading: what helps is the reasoning itself, in words, before the answer.

And it isn't one lucky prompt. Chains written by two other co-authors, or taken from the {GSM8K|G-S-M eight K} training set, also beat standard prompting by a large margin.

## evidence

Section four turns to commonsense. On sports understanding, {PaLM|palm} with chain of thought reached ninety-five point four percent, above an unaided sports enthusiast at eighty-four.

On {CSQA|C-S-Q-A}, the gain was minimal.

Section five uses two toy tasks. Join the last letters of the words in a name. Or say whether a coin is still heads up after people flip it, or don't.

The examples in the prompt use two-word names and two people. The test goes up to four.

With standard prompting, {PaLM|palm} gets none of the four-word names right. With chain of thought, sixty-three percent.

Coin flips with four people: fifty-four point eight, against ninety point two.

## after

Section six lists the limits.

Chain of thought imitates how people reason. Whether the network is actually reasoning, the authors leave open.

Nothing guarantees a correct chain. Of fifty wrong answers they read by hand, forty-six percent of the chains were almost right.

And it only works at large scale, which makes it costly to serve.

Their broader point: standard prompting only provides a lower bound on the capabilities of large language models.

The paper already cites a follow-up: sample many chains, and take the majority answer. That is self-consistency.

In May twenty twenty-two, Kojima and colleagues dropped the examples, and added one line: let's think step by step.

Chain-of-Thought Prompting Elicits Reasoning in Large Language Models.

Wei and colleagues, {NeurIPS|neur-ips} twenty twenty-two.

(pause 2)
