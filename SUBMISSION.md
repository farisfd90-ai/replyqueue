---
title: ReplyQueue: a local AI inbox sorter for a small side business
published: false
tags: devchallenge, hf26challenge, javascript, machinelearning
---

*This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 2: Side Hustle](https://dev.to/challenges/hacktoberfest-week2-2026-10-12).*

## What I Built

ReplyQueue turns short customer messages into a reviewable reply queue. Its intended user is a small online seller who handles an inbox after work: checking deliveries, answering stock questions, handling returns, and changing orders.

The business idea is a one-time setup service: help a seller define categories, add phrases their customers actually use, and produce a reviewed CSV they can work through. That is a hypothesis about what someone might pay for. I have no paying customer, revenue, or measured time saving to report.

I focused the prototype on English and Bahasa Melayu examples because a useful small-business tool should let someone bring the language they use. It runs a multilingual open model in the browser, shows the reference example behind each suggestion, and keeps the person responsible for the final category.

## Demo

**[Open ReplyQueue](https://farisfd90-ai.github.io/replyqueue/)**

Choose **Use sample inbox**, then **Load local AI**, then **Sort my inbox**. The first load downloads public model and runtime files and may take a few minutes. The sample messages are synthetic.

![ReplyQueue after a real browser inference run](https://farisfd90-ai.github.io/replyqueue/evidence/browser-demo.jpg)

Each card shows the suggested category, the closest example, and the runner-up score. You can change the category, filter for messages needing review, and export the reviewed queue. Expand the category editor to try your own reference examples.

One sample exposed a useful failure: “I want to change the size, but the parcel is already here” was suggested as Delivery. I changed it to Returns & refunds through the review control. The original AI suggestion stays visible, so the correction does not hide the mistake.

## Code

**[GitHub repository](https://github.com/farisfd90-ai/replyqueue)**

The repository includes the browser app, model worker, scoring code, tests, synthetic evaluation cases, and raw evaluation results. The application source is MIT licensed. This new project started on October 13, during the challenge window.

## How I Built It

The core is [Transformers.js](https://github.com/huggingface/transformers.js) 3.8.1 and the quantized ONNX version of [multilingual MiniLM](https://huggingface.co/Xenova/paraphrase-multilingual-MiniLM-L12-v2). The underlying [Sentence Transformers model](https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2) and framework are available under Apache 2.0 licenses.

A Web Worker creates normalized sentence embeddings using mean pooling. For each category, the app takes the highest cosine similarity between a message and that category's editable examples. A weak match below 0.50, a gap below 0.06 between the top two categories, or a nearest example in the review category sends the message to Needs review. These are heuristic thresholds, and the scores are similarity values rather than probabilities.

My first development evaluation got 16 of 20 expected results. It also confidently routed an acknowledgement and two mixed requests into task categories. I added explicit review examples, then reran those development cases: 18 of 20 expected results, with 14 task suggestions and all 14 correct.

The separate 12-case holdout told a less flattering story. It contained eight ordinary task requests and four messages expected to need review. Only two task requests received a category; six were sent to review. All four review cases went to review. Exact agreement was 6 of 12. Those two accepted requests are far too few to establish real precision.

That leaves a practical limitation: the default examples have low coverage on unfamiliar wording. I kept the raw results and did not retune the final examples or thresholds from the holdout. A seller-specific version needs representative messages, independent labels, and more testing before any production claims. The editable examples and human overrides give the prototype a way to explore that next step.

I used Codex to help implement the app, synthetic cases, verification, and this write-up. I ran genuine model inference in Node and in Brave. The browser processed the six-message sample in about 0.6 seconds after loading the model on this machine; that is one local observation, not a cross-device performance claim. Tests cover abstention and spreadsheet formula handling in CSV exports.

## Why Does Open Innovation Matter?

An open embedding model gives this small tool a workable cost and data boundary. There is no hosted inference bill, account, or API key, and the neural model does the semantic comparison on the user's device. A seller can inspect and change the examples that define a category without retraining a model or relying on a hidden instruction prompt.

There is also a useful boundary around actions. ReplyQueue sorts and explains. The person reviews. It has no ability to send a reply, approve a refund, or change an order.

Messages and customized examples stay in page memory. The app has no backend or analytics. Loading the model still contacts Hugging Face and jsDelivr, and hosting contacts GitHub Pages; those providers may receive normal network metadata. A downloaded CSV is a local copy the user must manage. I do not promise fully offline startup or production-grade privacy.

The next step is to test whether this workflow saves a real seller enough effort to justify a setup fee. The prototype makes that question concrete: a working queue, an inspectable model, visible mistakes, and a human who keeps the final say.
