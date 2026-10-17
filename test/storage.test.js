import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const prevDataDir = process.env.MD_BEAUTIFIER_DATA_DIR;
const prevTtl = process.env.FILE_TTL_HOURS;

test.afterEach(() => {
  for (const [k, v] of Object.entries({ MD_BEAUTIFIER_DATA_DIR: prevDataDir, FILE_TTL_HOURS: prevTtl })) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
});

const freshModule = async () => {
  // storage.js reads env at call time, so plain import is fine.
  return import('../src/storage.js');
};

test('saveFile writes <uuid>.html and returns the uuid', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mb-test-'));
  process.env.MD_BEAUTIFIER_DATA_DIR = dir;
  const { saveFile } = await freshModule();

  const id = saveFile('<html>hi</html>');
  assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  assert.equal(fs.readFileSync(path.join(dir, `${id}.html`), 'utf8'), '<html>hi</html>');
});

test('sweepExpired removes stale files, keeps fresh ones', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mb-test-'));
  process.env.MD_BEAUTIFIER_DATA_DIR = dir;
  delete process.env.FILE_TTL_HOURS; // default 1h
  const { sweepExpired } = await freshModule();

  const oldFile = path.join(dir, 'old.html');
  const newFile = path.join(dir, 'new.html');
  fs.writeFileSync(oldFile, '<html>old</html>');
  fs.writeFileSync(newFile, '<html>new</html>');
  const twoHoursAgo = (Date.now() - 2 * 3_600_000) / 1000;
  fs.utimesSync(oldFile, twoHoursAgo, twoHoursAgo);

  const removed = sweepExpired();
  assert.deepEqual(removed.map((n) => path.basename(n)).sort(), ['old.html']);
  assert.equal(fs.existsSync(oldFile), false);
  assert.equal(fs.existsSync(newFile), true);
});

test('ttlMs parses FILE_TTL_HOURS and falls back to 1h', async () => {
  process.env.FILE_TTL_HOURS = '0.5';
  const m1 = await freshModule();
  assert.equal(m1.ttlMs(), 30 * 60_000);
  process.env.FILE_TTL_HOURS = 'banana';
  const m2 = await freshModule();
  assert.equal(m2.ttlMs(), 3_600_000);
});
