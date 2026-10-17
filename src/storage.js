import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

/** Directory rendered documents are persisted in. */
export function dataDir() {
  return process.env.MD_BEAUTIFIER_DATA_DIR || '/app/data';
}

/** Retention for persisted documents, in ms. Default: 1 hour. */
export function ttlMs() {
  const hours = Number(process.env.FILE_TTL_HOURS ?? '');
  return (Number.isFinite(hours) && hours > 0 ? hours : 1) * 3_600_000;
}

/** Create the data dir (and parents) if needed. */
export function ensureDataDir(dir = dataDir()) {
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/** Write rendered HTML to <dataDir>/<uuid>.html and return the uuid. */
export function saveFile(content) {
  ensureDataDir();
  const id = crypto.randomUUID();
  fs.writeFileSync(path.join(dataDir(), `${id}.html`), content, 'utf8');
  return id;
}

/**
 * Delete .html files in the data dir whose mtime is older than the TTL.
 * Returns the list of removed file names. Never throws for per-file errors.
 */
export function sweepExpired({ dir = dataDir(), ttl = ttlMs(), now = Date.now() } = {}) {
  if (!fs.existsSync(dir)) return [];
  const removed = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
    const p = path.join(dir, entry.name);
    try {
      if (now - fs.statSync(p).mtimeMs > ttl) {
        fs.unlinkSync(p);
        removed.push(entry.name);
      }
    } catch {
      // unreadable/unlinkable file: leave it for the next sweep
    }
  }
  return removed;
}
