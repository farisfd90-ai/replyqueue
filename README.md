# ReplyQueue

A browser-local semantic reply queue for a small shop or freelance business. Built from scratch on October 13, 2026 for [DEV's Hacktoberfest Week 2: Side Hustle challenge](https://dev.to/challenges/hacktoberfest-week2-2026-10-12).

**Live demo:** https://farisfd90-ai.github.io/replyqueue/

## Try it

1. Open the demo in a modern browser and choose **Use sample inbox**.
2. Choose **Load local AI**. The first run downloads an open multilingual model and the inference runtime. This can take a few minutes depending on the connection.
3. Choose **Sort my inbox**. Inspect each message, its closest reference example, and the runner-up similarity score.
4. Review or change the categories. Export a reviewed CSV if useful.
5. Expand the category editor to replace the examples with phrases relevant to your business, then sort again.

No account, API key, paid service, transaction, or wallet is required. The app does not send replies or modify orders. It is a prototype with deliberately conservative suggestions, not a production support automation system.

## How the AI works

- Open inference framework: [Transformers.js](https://github.com/huggingface/transformers.js), version 3.8.1 (Apache 2.0), with ONNX Runtime in a Web Worker.
- Open weights: [Xenova/paraphrase-multilingual-MiniLM-L12-v2](https://huggingface.co/Xenova/paraphrase-multilingual-MiniLM-L12-v2), an ONNX conversion of the [Sentence Transformers multilingual MiniLM model](https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2) (Apache 2.0).
- Quantized `q8` inference on CPU/WASM. Embeddings use mean pooling and normalization.
- Each message is compared with editable example messages. A category's score is its highest cosine similarity to an example. The app shows the nearest example and runner-up category.
- A score below 0.50, a gap below 0.06, or a closest example in the review category puts the message into **Needs review**. These thresholds are heuristics; scores are not calibrated probabilities.
- All categories can be overridden by a person before export.

The neural embeddings are essential: removing the model removes the categorizer. This is not a rule engine labelled as AI. There is no generative response system and no message content is executed as instructions.

## Data boundaries

Messages and customized examples exist in page memory. There is no application backend, analytics, message storage, or account integration. The first model load contacts Hugging Face and jsDelivr for public model/runtime files, and GitHub Pages hosts the application; normal network metadata may be recorded by those providers. Inference runs on the user's device. Model assets may be cached by the browser. Fully offline startup is not guaranteed, because the app and runtime still need to be available.

Export downloads a CSV to the user's computer. Clear removes the current inbox and results from the page, but does not erase already downloaded files or browser model caches. Uploaded scripts are not accepted. Message text is rendered using `textContent`, and formula-like CSV values are prefixed to reduce spreadsheet formula injection.

Input limits: 30 messages, 500 characters per message, 1–8 examples per category, 300 characters per example. Short text is intended; the underlying tokenizer may truncate longer token sequences. English and Bahasa Melayu examples are included, but language support and local phrasing have not been validated on real customer data.

## Evaluation and limitations

All examples and evaluation messages are synthetic. No customer records or real users were used.

| Run | Exact expected result | Accepted task categories | Correct among accepted |
| --- | --- | --- | --- |
| Initial development set, 20 cases | 16/20 | 18/20 | 15/18 |
| Development set after adding explicit review examples | 18/20 | 14/20 | 14/14 |
| Separate 12-case holdout, after that change | 6/12 | 2/12 | 2/2 |

The holdout contains eight ordinary task requests and four review cases. The app correctly routed two of the eight task requests and sent the remaining six to review; all four review cases went to review. This is **low coverage**, not evidence of production accuracy. Two accepted messages are too few to estimate real precision. The developer saw the development cases and used their failures to add review examples; the 18/20 score is not an independent test. The held-out results were not used to retune the final model examples or thresholds.

Raw results, similarity scores, labels, and timings are committed in `evaluation/`. First-load/download time and Node CPU performance do not predict browser performance. Proper evaluation would need representative consented business messages, independent labels, and calibration for the business's cost of mistakes.

## Run locally

Requires Node.js 18+ (Node.js 20+ recommended for the inference dependency).

```sh
npm ci
npm start
```

Open http://127.0.0.1:4173. Dependencies are only needed for the local evaluation; the browser loads its pinned runtime from jsDelivr.

```sh
npm test
npm run evaluate
node evaluation/run.mjs holdout.json
```

GitHub Pages deploys the `public/` folder using `.github/workflows/pages.yml`. Model weights are downloaded from Hugging Face rather than stored in this repository.

## Side hustle hypothesis

The prospective buyer is a small seller who receives repetitive English/Malay customer messages and wants less sorting work without sending an inbox to a hosted AI service. A paid offering could be a one-time setup of their categories, examples, and reviewed CSV workflow. The public prototype is free. No customer, payment, revenue, or time saving has been claimed or validated.

## Attribution and AI assistance

Application code, synthetic samples, evaluation harness, and writing were prepared with Codex. Model, inference library, and ONNX runtime are third-party open-source work credited above. No partner prize category is claimed. The application source is MIT licensed; model and library licenses remain their own.

All project development began during the contest window. Any commits after October 18, 2026 at 11:59 PM PDT must be documented here to distinguish the submitted version from later changes.
