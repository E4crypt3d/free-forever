#!/usr/bin/env node
/* Free Forever — re-shoot the share images from their HTML sources.
 *
 *   node scripts/make-cards.mjs
 *
 * Both PNGs are committed because the deploy workflow only needs Node; this
 * script needs a Chromium binary, so it is run by hand after the counts or the
 * card copy change. Run scripts/build-static.mjs first: it keeps the counts in
 * assets/og-card.html in step with data/tools.js, and the deploy workflow fails
 * if the card's numbers and the data ever disagree.
 *
 * Chromium is looked for at $CHROME, then the usual binary names on PATH.
 */

import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const CANDIDATES = [process.env.CHROME, "chromium", "chromium-browser", "google-chrome", "chrome"]
  .filter(Boolean);

function findChrome() {
  for (const bin of CANDIDATES) {
    try {
      execFileSync(bin, ["--version"], { stdio: "ignore" });
      return bin;
    } catch {}
  }
  throw new Error("no Chromium found — set CHROME=/path/to/chromium");
}

const chrome = findChrome();

function shot(url, out, size) {
  const dir = mkdtempSync(join(tmpdir(), "ff-card-"));
  try {
    execFileSync(chrome, [
      "--headless",
      "--disable-gpu",
      "--no-sandbox",
      "--hide-scrollbars",
      "--force-device-scale-factor=1",
      `--window-size=${size}`,
      `--user-data-dir=${dir}`,
      `--screenshot=${join(ROOT, out)}`,
      "--virtual-time-budget=4000",
      url
    ], { stdio: "ignore" });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
  const bytes = statSync(join(ROOT, out)).size;
  console.log(`${out} — ${size} — ${(bytes / 1024).toFixed(1)} KB`);
  if (bytes > 600 * 1024) throw new Error(`${out} is over WhatsApp's 600 KB ceiling`);
}

// 1200x630, the size every Open Graph consumer expects.
shot(`file://${join(ROOT, "assets/og-card.html")}`, "assets/og-card.png", "1200,630");
// 180x180 square: apple-touch-icon is not a 1.9:1 banner.
shot(`file://${join(ROOT, "assets/icon.html")}`, "assets/icon-180.png", "180,180");
