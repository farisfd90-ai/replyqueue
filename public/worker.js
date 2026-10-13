import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1';
import { MODEL } from './categories.js';
import { rankMessage } from './engine.js';
env.allowLocalModels = false;
env.backends.onnx.wasm.numThreads = 1;
let extractor;
self.onmessage = async ({ data }) => {
  try {
    if (data.type === 'load') {
      extractor = await pipeline('feature-extraction', MODEL, { dtype: 'q8', device: 'wasm', progress_callback: p => {
        if (p.status === 'progress') self.postMessage({ type: 'progress', file: p.file, progress: Math.round(p.progress || 0) });
      }});
      self.postMessage({ type: 'ready' });
    } else if (data.type === 'classify') {
      if (!extractor) throw new Error('Load the model first.');
      const started = performance.now();
      const references = [];
      for (const category of data.categories) {
        const output = await extractor(category.examples, { pooling: 'mean', normalize: true });
        references.push({ ...category, vectors: output.tolist() });
      }
      const results = [];
      for (let i = 0; i < data.messages.length; i++) {
        const output = await extractor(data.messages[i], { pooling: 'mean', normalize: true });
        results.push({ message: data.messages[i], ...rankMessage(output.tolist()[0], references) });
        self.postMessage({ type: 'processing', done: i + 1, total: data.messages.length });
      }
      self.postMessage({ type: 'results', results, elapsed: Math.round(performance.now() - started) });
    }
  } catch (error) { self.postMessage({ type: 'error', message: error.message }); }
};
