# Narration — ReAct: Synergizing Reasoning and Acting in Language Models

Paper video. Style folio (`docs/style-folio.md`). Facts and guardrails: `briefing.md`.

## cover

This is page one of a paper that went up on {arXiv|archive} on October sixth, twenty twenty-two.

Seven authors, from Princeton and Google's Brain team.

Reasoning and acting in language models, the abstract says, had mostly been studied as separate topics. One line puts them together.

Generate both reasoning traces and task-specific actions in an interleaved manner.

Think, act, read what comes back, think again.

They called it {ReAct|ree-act}, for reason plus act. At {ICLR|I-C-L-R} twenty twenty-three it was an oral, in the top five percent of papers.

By the end, you'll be able to read a {ReAct|ree-act} trace, see where it breaks, and know what its numbers actually say.

(pause 2)

## problem

Page two opens with the paper's running example, a question with two hops.

The Apple Remote was originally designed for one program. What other device can control that program?

Asked straight out, the model answers: {iPod|eye-pod}. Wrong.

Asked to think step by step, it reasons fluently, from a fact it made up: that the remote was designed for Apple {TV|T-V}. Wrong again.

The paper calls this reasoning a static black box, not grounded in the external world.

Now give the model a search tool, and no room to think. It even reaches the right page, then answers: yes.

One side reasons without facts. The other finds facts and can't reason over them.

## loop

Section two. The idea of {ReAct|ree-act} is simple.

Among its actions, the model gets one more: writing a thought.

A thought does not affect the external environment, so nothing comes back. It only adds to the context, the running record the model reads before its next step.

That makes a loop with three parts. Thought. Action. Observation.

(pause 1)

Here's the same question, the {ReAct|ree-act} way.

Thought one: search Apple Remote, find the program it was designed for. The search comes back with a name: Front Row.

Thought two: search Front Row. Could not find. The tool offers similar titles.

Thought three changes the plan: search Front Row, software.

Thought four reads the answer out of what came back: the keyboard function keys. Finish. Correct.

Every step is on the page, so you can see where each fact came from.

## tools

Section three point one gives the model a deliberately small tool: three actions on Wikipedia.

Search returns the first five sentences of a page, or five similar titles.

Lookup returns the next sentence containing a string, like Control F in a browser.

Finish submits the answer.

The authors call it significantly weaker than state-of-the-art retrievers. On purpose: the model has to reason about what to look up.

Nothing is trained. The model is {PaLM|palm}, five hundred and forty billion parameters, frozen, with six hand-written examples in its prompt.

## household

{ALFWorld|alf-world} is a text game set in a house: the model reads what it sees, and types what to do.

The task: put some pepper shaker on a drawer.

Acting alone, the model tries to take a pepper shaker from the sink basin, where there is none. Nothing happens. It tries again. Nothing happens.

With {ReAct|ree-act}, the first thought is a plan: a pepper shaker is more likely to appear in cabinets, or on countertops.

It finds one on countertop three, and writes the next step: put it in the drawer. Done.

Here thoughts are sparse. The model decides when one is worth writing.

## failures

The authors also read two hundred {HotpotQA|hot-pot Q-A} runs by hand, right and wrong, from both methods, and sorted the failures in table two.

Chain of thought's main failure is invention: fifty-six percent of its wrong answers came from hallucination. For {ReAct|ree-act}, zero. It isn't immune: six percent of its right answers rested on a hallucinated step.

{ReAct|ree-act} breaks in its own ways. Forty-seven percent of its failures are reasoning errors, including repeating its last thought and action, stuck in a loop.

Twenty-three percent are searches that return nothing useful, and derail the run.

Written thoughts have an upside: a person can fix them. In the appendix, editing two thoughts turns a failed household run into a success.

## evidence

Table one: one frozen model, different prompts.

On {FEVER|fever}, fact checking, {ReAct|ree-act} beats chain of thought: sixty point nine to fifty-six point three. On {HotpotQA|hot-pot Q-A}, it loses: twenty-seven point four to twenty-nine point four.

The best scores mix the two, switching when one gets stuck or unsure: thirty-five point one, and sixty-four point six. Still far below the best supervised systems.

The household game is where it pulls ahead. Table three: {ReAct|ree-act}'s best prompt solves seventy-one percent of the unseen games. Acting alone, forty-five. An imitation-learning agent trained on a hundred thousand expert runs per task type, thirty-seven.

That gap is the abstract's thirty-four points: best prompt against best run. Averaged over its six prompts, {ReAct|ree-act} scores fifty-seven.

On {WebShop|web shop}, an online store, it succeeds forty percent of the time. The best trained method, twenty-nine point one. Human experts, fifty-nine point six.

## after

Its limits: harder tasks need more examples than fit in a prompt.

Fine-tuning helps: trained on three thousand {ReAct|ree-act} runs, an eight-billion-parameter model beat every prompting method at sixty-two billion.

Its ethics statement warns that a model that acts can look up private information, or do harm. Here, it couldn't buy anything, or edit Wikipedia.

In March twenty twenty-three, Reflexion built on it: when a {ReAct|ree-act} agent fails, it writes a reflection on what went wrong, and tries again.

Thought, action, observation, each one written down where you can read it.

{ReAct|ree-act}: Synergizing Reasoning and Acting in Language Models. Yao and colleagues, {ICLR|I-C-L-R} twenty twenty-three. The paper is right next to this video.
