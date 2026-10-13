export function rankMessage(vector, references, { threshold = .5, margin = .06 } = {}) {
  if (!Array.isArray(vector) || !vector.length || vector.some(x => !Number.isFinite(x))) throw new Error('Invalid embedding');
  const scores = references.map(category => {
    const candidates = category.vectors.map((ref, i) => {
      if (ref.length !== vector.length) throw new Error('Embedding dimension mismatch');
      let dot = 0, a = 0, b = 0;
      for (let j = 0; j < vector.length; j++) { dot += vector[j] * ref[j]; a += vector[j] ** 2; b += ref[j] ** 2; }
      return { score: a && b ? dot / Math.sqrt(a * b) : 0, example: category.examples[i] };
    }).sort((a, b) => b.score - a.score);
    return { id: category.id, name: category.name, action: category.action, ...candidates[0] };
  }).sort((a, b) => b.score - a.score);
  if (scores.length < 2) throw new Error('At least two categories are required');
  const gap = scores[0].score - scores[1].score;
  const review = scores[0].id === 'review' || scores[0].score < threshold || gap < margin;
  return { category: review ? 'review' : scores[0].id, review, scores, gap, reason: scores[0].id === 'review' ? 'Matches a review example' : scores[0].score < threshold ? 'No close example' : gap < margin ? 'Two categories are close' : 'Closest example match' };
}
export function csvCell(value) {
  let text = String(value ?? '');
  if (/^[\s]*[=+@-]/.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
}
export function exportCSV(rows) {
  return ['message,suggested_category,reviewed_category,similarity,reason', ...rows.map(row => [row.message, row.suggested, row.reviewed, row.score.toFixed(3), row.reason].map(csvCell).join(','))].join('\r\n');
}
