/* ──────────────────────────────────────────────────────────
   Ask KR-19 — text handling, the pre-LLM way.

   Everything here is deterministic and tiny: lower-casing, a stop-word
   list, a light suffix stemmer, a synonym table that folds words onto
   one canonical term, and a bounded edit distance for typos. The rest
   of the engine only ever compares these normalised terms.
   ────────────────────────────────────────────────────────── */

/* Words that carry no meaning for matching. Question words (who, when,
   how…) are NOT here — the question-type parser reads the raw text. */
export const STOP = new Set([
  "a", "an", "the", "and", "or", "but", "of", "to", "in", "on", "at", "for", "with", "by", "from", "as", "into", "about",
  "is", "are", "was", "were", "be", "been", "being", "am", "do", "does", "did", "doing", "done", "has", "have", "had",
  "he", "him", "his", "she", "her", "they", "them", "their", "you", "your", "yours", "i", "me", "my", "we", "us", "our",
  "it", "its", "this", "that", "these", "those", "there", "here",
  "what", "which", "who", "whom", "whose", "when", "where", "why", "how",
  "can", "could", "would", "should", "will", "shall", "may", "might", "must",
  "any", "some", "all", "much", "many", "very", "really", "just", "also", "so", "too", "than", "then", "ever",
  "tell", "know", "show", "give", "please", "pls", "plz", "kaustav", "roy", "kr", "kr19", "19", "mr",
  "s", "t", "d", "ll", "re", "ve", "m", "get", "got", "like", "thing", "things", "stuff", "bit", "lot",
]);

/* Folded synonyms: every key is rewritten to its value (after stemming),
   so "employer", "firm" and "company" all become one term. */
export const SYN: Record<string, string> = {
  employer: "company", firm: "company", organisation: "company", organization: "company", org: "company", workplace: "company",
  job: "role", title: "role", designation: "role",
  uni: "university", college: "university", school: "university", campus: "university",
  degree: "education", study: "education", qualification: "education",
  cv: "resume",
  salary: "compensation", ctc: "compensation", wage: "compensation",
  wfh: "remote", "work-from-home": "remote",
  relocation: "relocate", move: "relocate",
  recruit: "hire", employ: "hire",
  software: "tool",
  tech: "stack", technology: "stack", technologies: "stack",
  ui: "ux", interface: "ux",
  a11y: "accessibility", wcag: "accessibility",
  xai: "explainable", explainability: "explainable",
  ml: "ai", "machine-learning": "ai", llm: "ai", genai: "ai", agentic: "agent", agents: "agent",
  photo: "photography",
  prize: "award", recognition: "award", honour: "award", honor: "award", achievement: "award",
  article: "writing", blog: "writing", publication: "writing", wrote: "writing", write: "writing", written: "writing", medium: "writing",
  repository: "repo",
  site: "website", web: "website", url: "link", live: "live",
  customer: "client",
  personal: "side", hobby: "side",
};

/* Strip accents, unify quotes and ampersands, lower-case. */
export function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’‘`]/g, "'")
    .replace(/&/g, " and ")
    .toLowerCase();
}

/* Raw word list (keeps "+" and "#" so "c++" / "c#" survive). */
export function words(s: string): string[] {
  return norm(s)
    .replace(/'s\b/g, "")
    .split(/[^a-z0-9+#]+/)
    .filter(Boolean);
}

/* A deliberately light stemmer: enough to join "projects/project",
   "designed/designing/design", "studies/study" — not a full Porter. */
export function stem(w: string): string {
  if (w.length <= 3 || /\d/.test(w)) return w;
  if (w.endsWith("ies") && w.length > 4) return w.slice(0, -3) + "y";
  if (w.endsWith("sses")) return w.slice(0, -2);
  if (w.endsWith("ing") && w.length > 5) return trimDouble(w.slice(0, -3));
  if (w.endsWith("ed") && w.length > 4) return trimDouble(w.slice(0, -2));
  if (/(ches|shes|xes|zes)$/.test(w)) return w.slice(0, -2);
  if (w.endsWith("s") && !/(ss|us|is|ys)$/.test(w)) return w.slice(0, -1);
  if (w.endsWith("ly") && w.length > 5) return w.slice(0, -2);
  return w;
}
function trimDouble(w: string) {
  return /([bdgmnprt])\1$/.test(w) ? w.slice(0, -1) : w;
}

export function canon(w: string): string {
  if (SYN[w]) return SYN[w];
  const s = stem(w);
  return SYN[s] ?? s;
}

/* Meaningful, normalised terms of a text. */
export function terms(s: string): string[] {
  return words(s).filter((w) => !STOP.has(w)).map(canon);
}

/* Same, but keeps stop words — for matching multi-word names in order. */
export function allTerms(s: string): string[] {
  return words(s).map(canon);
}

/* Levenshtein distance, giving up past `max`. */
export function lev(a: string, b: string, max = 2): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      const v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      cur.push(v);
      if (v < best) best = v;
    }
    if (best > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

/* Typo-tolerant equality: exact for short words, 1 edit from 5 letters,
   2 edits from 8. Numbers must match exactly. */
export function fuzzyEq(a: string, b: string): boolean {
  if (a === b) return true;
  if (/\d/.test(a) || /\d/.test(b)) return false;
  const n = Math.min(a.length, b.length);
  if (n < 5) return false;
  return lev(a, b, n >= 8 ? 2 : 1) <= (n >= 8 ? 2 : 1);
}

/* Split text into sentences, for picking the best snippet. */
export function sentences(s: string): string[] {
  return s
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"“(])/)
    .map((x) => x.trim())
    .filter((x) => x.length > 2);
}

export function clip(s: string, max = 220): string {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  return cut.slice(0, Math.max(cut.lastIndexOf(" "), max - 20)).replace(/[,;:—–-]\s*$/, "") + "…";
}
