/* ============================================================
   Verity - shared logic, ported from the original vanilla-JS
   app.js into a typed module. Behavior is intentionally kept
   the same as the plain-HTML version (including the accuracy
   fixes made earlier): adaptive speech-pause detection with a
   250ms minimum, stroke-boundary-aware handwriting hesitation
   counting, and simplified "Normal / Some Signs / Many Signs"
   status wording.
   ============================================================ */

const LS_USER = "verity_user";
const LS_HISTORY = "verity_history";
const LS_ACCOUNTS = "verity_accounts";
const LS_GEMINI_KEY = "verity_gemini_key";
const LS_THEME = "verity_theme";
const LS_MANGO_AFFECTION = "verity_mango_affection";
const LS_GAME_XP = "verity_game_xp";
const LS_TERMS_ACCEPTED = "verity_terms_accepted";

/* ---------- storage (with in-memory fallback) ---------- */
const memoryStore: Record<string, string> = {};
let storageWorks = true;
try {
  window.localStorage.setItem("__verity_test__", "1");
  window.localStorage.removeItem("__verity_test__");
} catch {
  storageWorks = false;
}
export function safeGet(key: string): string | null {
  if (storageWorks) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return memoryStore[key] ?? null;
    }
  }
  return memoryStore[key] ?? null;
}
export function safeSet(key: string, value: string) {
  if (storageWorks) {
    try {
      window.localStorage.setItem(key, value);
      return;
    } catch {
      /* fall through to memory */
    }
  }
  memoryStore[key] = value;
}
export function safeRemove(key: string) {
  if (storageWorks) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
  delete memoryStore[key];
}

/* ---------- user session ---------- */
export interface VerityUser {
  username: string;
  email: string;
}
export function getUser(): VerityUser | null {
  const raw = safeGet(LS_USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
export function setUser(u: VerityUser) {
  safeSet(LS_USER, JSON.stringify(u));
}
export function signOut() {
  safeRemove(LS_USER);
}

/* ---------- accounts / auth ---------- */
export interface EncryptedBlob {
  iv: string;
  salt: string;
  cipher: string;
}
interface Account {
  username: string;
  salt: string; // password salt
  hash: string; // password hash
  personalInfo?: EncryptedBlob; // AES-GCM encrypted email + optional health intake fields
}
function getAccounts(): Account[] {
  const raw = safeGet(LS_ACCOUNTS);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
function saveAccounts(accounts: Account[]) {
  safeSet(LS_ACCOUNTS, JSON.stringify(accounts));
}
function randomSalt(): string {
  const arr = new Uint8Array(16);
  (window.crypto || (window as any).msCrypto).getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  return bytes;
}
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
async function hashPassword(password: string, salt: string): Promise<string> {
  if (window.crypto?.subtle) {
    const data = new TextEncoder().encode(salt + password);
    const digest = await window.crypto.subtle.digest("SHA-256", data);
    return bytesToHex(new Uint8Array(digest));
  }
  // Non-cryptographic fallback for insecure contexts without Web Crypto.
  let h = 0;
  const str = salt + password;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return String(h);
}

/* ---------- encryption for personal information (email, date of birth, symptom notes) ----------
   Data is encrypted client-side with AES-GCM, using a key derived (via PBKDF2) from the
   account's own password. That means the encrypted blob can only be read again by someone
   who supplies the correct password - the same way the password itself is never stored in
   plain text. Since this is a fully client-side demo there's no server to keep the key
   separate from the data, so this protects against casual inspection of localStorage rather
   than a determined attacker with script-execution access to the page - the same limitation
   any browser-only app has. */
async function deriveAesKey(password: string, saltHex: string): Promise<CryptoKey> {
  const keyMaterial = await window.crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
  return window.crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: hexToBytes(saltHex) as BufferSource, iterations: 100_000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}
export async function encryptPersonalData<T extends object>(data: T, password: string): Promise<EncryptedBlob> {
  const plaintext = new TextEncoder().encode(JSON.stringify(data));
  if (!window.crypto?.subtle) {
    // Fallback for non-secure contexts without Web Crypto: base64 only (not real encryption).
    return { iv: "", salt: "", cipher: btoa(JSON.stringify(data)) };
  }
  const salt = randomSalt();
  const key = await deriveAesKey(password, salt);
  const ivBytes = window.crypto.getRandomValues(new Uint8Array(12));
  const cipherBuf = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv: ivBytes }, key, plaintext);
  return { iv: bytesToHex(ivBytes), salt, cipher: bytesToHex(new Uint8Array(cipherBuf)) };
}
export async function decryptPersonalData<T = Record<string, unknown>>(blob: EncryptedBlob, password: string): Promise<T | null> {
  if (!blob.iv) {
    try {
      return JSON.parse(atob(blob.cipher));
    } catch {
      return null;
    }
  }
  try {
    const key = await deriveAesKey(password, blob.salt);
    const plainBuf = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv: hexToBytes(blob.iv) as BufferSource }, key, hexToBytes(blob.cipher) as BufferSource);
    return JSON.parse(new TextDecoder().decode(plainBuf));
  } catch {
    return null; // wrong password, or data tampered with
  }
}

export interface PersonalInfo {
  email: string;
  dob?: string;
  symptomDuration?: string;
  notes?: string;
}

export function findAccount(username: string): Account | undefined {
  return getAccounts().find((a) => a.username.toLowerCase() === username.toLowerCase());
}
export async function createAccount(username: string, password: string, personalInfo: PersonalInfo) {
  const accounts = getAccounts();
  if (accounts.some((a) => a.username.toLowerCase() === username.toLowerCase())) {
    throw new Error("That username is already taken.");
  }
  const salt = randomSalt();
  const hash = await hashPassword(password, salt);
  const personalInfoEnc = await encryptPersonalData(personalInfo, password);
  accounts.push({ username, salt, hash, personalInfo: personalInfoEnc });
  saveAccounts(accounts);
}
export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  const account = findAccount(username);
  if (!account) return false;
  const hash = await hashPassword(password, account.salt);
  return hash === account.hash;
}
export async function getAccountPersonalInfo(username: string, password: string): Promise<PersonalInfo | null> {
  const account = findAccount(username);
  if (!account?.personalInfo) return null;
  return decryptPersonalData<PersonalInfo>(account.personalInfo, password);
}
export function deleteAccount(username: string) {
  saveAccounts(getAccounts().filter((a) => a.username !== username));
}
export async function changePassword(username: string, oldPassword: string, newPassword: string): Promise<boolean> {
  const accounts = getAccounts();
  const idx = accounts.findIndex((a) => a.username.toLowerCase() === username.toLowerCase());
  if (idx === -1) return false;
  const account = accounts[idx];
  const oldHash = await hashPassword(oldPassword, account.salt);
  if (oldHash !== account.hash) return false;
  const salt = randomSalt();
  const hash = await hashPassword(newPassword, salt);
  let personalInfo = account.personalInfo;
  if (personalInfo) {
    const decrypted = await decryptPersonalData<PersonalInfo>(personalInfo, oldPassword);
    if (decrypted) personalInfo = await encryptPersonalData(decrypted, newPassword);
  }
  accounts[idx] = { ...account, salt, hash, personalInfo };
  saveAccounts(accounts);
  return true;
}
export async function updatePersonalInfo(username: string, password: string, updates: Partial<PersonalInfo>): Promise<boolean> {
  const accounts = getAccounts();
  const idx = accounts.findIndex((a) => a.username.toLowerCase() === username.toLowerCase());
  if (idx === -1) return false;
  const account = accounts[idx];
  const hash = await hashPassword(password, account.salt);
  if (hash !== account.hash) return false;
  const current = account.personalInfo ? (await decryptPersonalData<PersonalInfo>(account.personalInfo, password)) || { email: "" } : { email: "" };
  const merged: PersonalInfo = { ...current, ...updates };
  const personalInfo = await encryptPersonalData(merged, password);
  accounts[idx] = { ...account, personalInfo };
  saveAccounts(accounts);
  setSessionPersonalInfo(merged);
  return true;
}

/* ---------- extra profile fields (non-sensitive: display name, phone) ---------- */
const LS_PROFILE_PREFIX = "verity_profile_";
export interface UserProfile {
  displayName?: string;
  phone?: string;
}
export function getUserProfile(username: string): UserProfile {
  const raw = safeGet(LS_PROFILE_PREFIX + username.toLowerCase());
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}
export function setUserProfile(username: string, profile: UserProfile) {
  safeSet(LS_PROFILE_PREFIX + username.toLowerCase(), JSON.stringify(profile));
}

/* ---------- accessibility: text size ---------- */
const LS_TEXT_SCALE = "verity_text_scale";
export function getTextScale(): number {
  const v = parseFloat(safeGet(LS_TEXT_SCALE) || "1");
  return isNaN(v) ? 1 : v;
}
export function applyTextScale(scale: number) {
  document.documentElement.style.fontSize = `${16 * scale}px`;
}
export function setTextScale(scale: number) {
  const clamped = Math.max(0.85, Math.min(1.4, scale));
  safeSet(LS_TEXT_SCALE, String(clamped));
  applyTextScale(clamped);
}

/* In-memory only (never persisted to localStorage) - holds the current session's decrypted
   personal info, available only after a successful login/signup for this browser tab. */
let sessionPersonalInfo: PersonalInfo | null = null;
export function setSessionPersonalInfo(info: PersonalInfo | null) {
  sessionPersonalInfo = info;
}
export function getSessionPersonalInfo(): PersonalInfo | null {
  return sessionPersonalInfo;
}

const DISPOSABLE_EMAIL_DOMAINS = ["mailinator.com", "10minutemail.com", "tempmail.com", "guerrillamail.com", "yopmail.com"];
const PLACEHOLDER_EMAIL_DOMAINS = ["example.com", "test.com", "email.com", "domain.com"];
export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return false;
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  if (DISPOSABLE_EMAIL_DOMAINS.includes(domain)) return false;
  if (PLACEHOLDER_EMAIL_DOMAINS.includes(domain)) return false;
  return true;
}

/* ---------- theme ---------- */
export function getTheme(): "light" | "dark" {
  return (safeGet(LS_THEME) as "light" | "dark") || "light";
}
export function applyTheme(theme: "light" | "dark") {
  document.documentElement.classList.toggle("dark", theme === "dark");
}
export function toggleTheme(): "light" | "dark" {
  const next = getTheme() === "dark" ? "light" : "dark";
  safeSet(LS_THEME, next);
  applyTheme(next);
  return next;
}
export function setTheme(next: "light" | "dark") {
  safeSet(LS_THEME, next);
  applyTheme(next);
}

/* ---------- scoring / bands ---------- */
export type Band = "typical" | "some" | "several";
export function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}
export function bandFor(p: number): Band {
  if (p < 0.4) return "typical";
  if (p < 0.65) return "some";
  return "several";
}
export function bandLabel(b: Band) {
  return { typical: "Status: Normal", some: "Status: Some Signs", several: "Status: Many Signs" }[b];
}
export function bandColor(b: Band) {
  return { typical: "var(--text-soft)", some: "var(--text)", several: "var(--blue-deep)" }[b];
}
export function bandClass(b: Band) {
  return "band-" + b;
}
export function computeStdDev(arr: number[]): number {
  if (!arr.length) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const variance = arr.reduce((a, b) => a + (b - mean) * (b - mean), 0) / arr.length;
  return Math.sqrt(variance);
}

/* ---------- speech analysis (adaptive threshold, 250ms+ pause rule) ---------- */
export interface SpeechMetrics {
  durationSec: number;
  speakingRatio: number;
  silenceRatio: number;
  estWordsPerMin: number;
  pauseCount: number;
  avgVol: number;
  variability: number;
}
export function computeSpeechMetrics(samples: number[], durationSec: number): SpeechMetrics {
  const n = samples.length;
  const mean = samples.reduce((a, b) => a + b, 0) / n;
  const max = Math.max(...samples);
  const sorted = [...samples].sort((a, b) => a - b);
  const noiseFloor = sorted[Math.floor(n * 0.15)] || 0;
  let threshold = Math.max(noiseFloor * 1.8, mean * 0.3, 0.004);
  if (threshold >= max * 0.9) threshold = max * 0.3;

  const silentFlags = samples.map((s) => s < threshold);
  const silentCount = silentFlags.filter(Boolean).length;
  const silenceRatio = silentCount / n;
  const speakingRatio = 1 - silenceRatio;
  const variability = computeStdDev(samples);
  let estWordsPerMin = Math.round(70 + speakingRatio * 100 - silenceRatio * 20);
  estWordsPerMin = Math.max(20, Math.min(220, estWordsPerMin));

  const samplesPerSec = durationSec > 0 ? n / durationSec : 0;
  const minPauseSamples = Math.max(2, Math.round(samplesPerSec * 0.25));
  const firstVoiced = silentFlags.indexOf(false);
  const lastVoiced = silentFlags.lastIndexOf(false);

  let pauseCount = 0;
  let run = 0;
  if (firstVoiced !== -1) {
    for (let i = firstVoiced; i <= lastVoiced; i++) {
      if (silentFlags[i]) {
        run++;
      } else {
        if (run >= minPauseSamples) pauseCount++;
        run = 0;
      }
    }
    if (run >= minPauseSamples) pauseCount++;
  }

  return { durationSec, speakingRatio, silenceRatio, estWordsPerMin, pauseCount, avgVol: mean, variability };
}
export function probabilityFromSpeechMetrics(r: SpeechMetrics): number {
  return clamp01(0.15 + r.silenceRatio * 0.35 + (r.pauseCount > 4 ? 0.15 : 0) + (r.estWordsPerMin < 90 ? 0.15 : 0));
}

/** Turns a decoded audio file into the same per-window RMS "samples" array that live
 *  microphone capture produces, so an uploaded audio file goes through the exact same real
 *  analysis as a live recording  -  no separate, fabricated scoring path for uploads. */
export function computeSpeechSamplesFromAudioBuffer(buffer: AudioBuffer): number[] {
  const data = buffer.getChannelData(0);
  const windowSize = Math.max(256, Math.floor(buffer.sampleRate * 0.02)); // ~20ms windows
  const samples: number[] = [];
  for (let i = 0; i < data.length; i += windowSize) {
    let sum = 0;
    const end = Math.min(i + windowSize, data.length);
    for (let j = i; j < end; j++) sum += data[j] * data[j];
    samples.push(Math.sqrt(sum / (end - i)));
  }
  return samples;
}

/* ---------- handwriting analysis ---------- */
export interface HandwritingPoint {
  x: number;
  y: number;
  t: number;
}
export interface HandwritingMetrics {
  totalTimeSec: number;
  strokeCount: number;
  pointCount: number;
  avgSpeed: number;
  speedVariability: number;
  pauseCount: number;
  strokes: [number, number, number][][];
}
export function computeHandwritingMetrics(points: HandwritingPoint[], strokes: HandwritingPoint[][], strokeCount: number, pauseCount: number): HandwritingMetrics {
  const totalTimeMs = points[points.length - 1].t - points[0].t;
  let totalDist = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    totalDist += Math.sqrt(dx * dx + dy * dy);
  }
  const avgSpeed = totalTimeMs ? totalDist / (totalTimeMs / 1000) : 0;

  const speeds: number[] = [];
  for (let j = 1; j < points.length; j++) {
    const dt = points[j].t - points[j - 1].t;
    if (dt < 4) continue; // filter near-duplicate timestamps
    const ddx = points[j].x - points[j - 1].x;
    const ddy = points[j].y - points[j - 1].y;
    speeds.push(Math.sqrt(ddx * ddx + ddy * ddy) / (dt / 1000));
  }
  const speedVariability = computeStdDev(speeds);

  const t0 = points[0].t;
  const strokesCompact: [number, number, number][][] = strokes.map((stroke) =>
    stroke.map((p) => [Math.round(p.x), Math.round(p.y), p.t - t0] as [number, number, number])
  );

  return {
    totalTimeSec: totalTimeMs / 1000,
    strokeCount,
    pointCount: points.length,
    avgSpeed,
    speedVariability,
    pauseCount,
    strokes: strokesCompact,
  };
}
export function probabilityFromHandwriting(r: HandwritingMetrics): number {
  // No longer adds a bonus just for using a mouse instead of a touchscreen  - 
  // the score depends only on measured writing behavior.
  return clamp01(0.15 + (r.pauseCount > 4 ? 0.2 : 0) + (r.speedVariability > 250 ? 0.15 : 0) + (r.strokeCount > 25 ? 0.1 : 0));
}

/** Result of a fast, offline sanity check on a drawn sentence: does the ink actually look like it
 *  traces out real writing spread across the box, or is it just scribbling in place? This runs
 *  regardless of whether a Gemini key is set, since the geometric score above can't tell the
 *  difference on its own. */
export interface DrawingSanityCheck {
  looksValid: boolean;
  reason?: string;
}
export function assessDrawingSanity(points: HandwritingPoint[], strokeCount: number, canvasWidth: number, expectedText?: string): DrawingSanityCheck {
  if (points.length < 12) {
    return { looksValid: false, reason: "Please write the full sentence before analyzing." };
  }

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  let totalDist = 0;
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
    if (i > 0) {
      const dx = p.x - points[i - 1].x;
      const dy = p.y - points[i - 1].y;
      totalDist += Math.sqrt(dx * dx + dy * dy);
    }
  }
  const horizontalRange = maxX - minX;
  const verticalRange = maxY - minY;
  const coverageRatio = canvasWidth ? horizontalRange / canvasWidth : 0;

  // Real handwriting of a sentence should stretch left-to-right across most of the box.
  if (coverageRatio < 0.45) {
    return { looksValid: false, reason: "That doesn't look like it spans the full sentence - please write it out from one side of the box to the other." };
  }

  // Scribbling back-and-forth in a small area piles up a lot of ink relative to how far it
  // actually traveled horizontally. Real writing has a much lower ink-to-progress ratio.
  const inkDensityRatio = horizontalRange > 4 ? totalDist / horizontalRange : Infinity;
  if (inkDensityRatio > 8) {
    return { looksValid: false, reason: "That looks like scribbling rather than actual writing - please write the sentence normally, letter by letter." };
  }

  // Real letters constantly rise and fall (loops, ascenders, descenders, crossing the x-height
  // line) - count how many times the pen's vertical direction actually reverses (ignoring tiny
  // jitter). A wavy scribble or a smooth loop-the-loop has very few reversals compared to a real
  // sentence's worth of individual letters, even if it spans the whole box.
  let reversals = 0;
  let lastDir = 0;
  let sinceLast = 0;
  for (let i = 1; i < points.length; i++) {
    const dy = points[i].y - points[i - 1].y;
    sinceLast += dy;
    if (Math.abs(sinceLast) < 4) continue; // ignore sub-pixel jitter
    const dir = sinceLast > 0 ? 1 : -1;
    if (lastDir !== 0 && dir !== lastDir) reversals++;
    lastDir = dir;
    sinceLast = 0;
  }

  // A real sentence needs a reasonable number of pen lifts/strokes AND vertical reversals
  // relative to its character count - a single smooth squiggle covering the whole box, however
  // wide, is very unlikely to be real writing.
  if (expectedText) {
    const wordCount = expectedText.trim().split(/\s+/).length;
    const charCount = expectedText.replace(/\s+/g, "").length;
    const minReversals = Math.max(8, Math.round(charCount * 0.6));
    if (reversals < minReversals) {
      return { looksValid: false, reason: "That doesn't look like it forms real letters and words - please try writing the sentence again, letter by letter." };
    }
    if (strokeCount < Math.max(2, Math.ceil(wordCount * 0.4)) && inkDensityRatio > 5) {
      return { looksValid: false, reason: "That doesn't look like it forms real letters and words - please try writing the sentence again." };
    }
  }

  // Very flat, nearly straight-line motion (almost no vertical variation) rarely looks like
  // actual cursive or print letters, which naturally rise and fall.
  if (verticalRange < 6) {
    return { looksValid: false, reason: "That looks like a flat line rather than handwriting - please write the sentence normally." };
  }

  return { looksValid: true };
}

/* ---------- Gemini photo analysis ---------- */
export function getGeminiKey(): string {
  return safeGet(LS_GEMINI_KEY) || "";
}
export function setGeminiKey(key: string) {
  safeSet(LS_GEMINI_KEY, key);
}

function buildGeminiPrompt(expectedText?: string): string {
  const target = expectedText
    ? `The person was asked to write this exact sentence: "${expectedText}". Read every word in the image as carefully ` +
      "as an OCR/transcription tool would, letter by letter, and put your best-effort transcription of what's actually " +
      'written into "transcription" (even if it\'s messy or only partially legible - write your best guess at each word). ' +
      "Then compare that transcription against the target sentence above: minor spelling slips, a missed word here or " +
      "there, or sloppy letterforms are still a genuine attempt and should count as a match - but if the writing is a " +
      "different sentence entirely, is mostly illegible, or is clearly just scribbling/doodling that doesn't spell out " +
      'the target sentence, set "matchesExpectedText" to false. Otherwise set it to true. '
    : "";
  return (
    "You are looking at an image that is supposed to contain a short handwritten sentence, as part of " +
    "a non-clinical screening demo (not a diagnosis) that looks at handwriting motor patterns. " +
    target +
    "First, check whether the image actually shows real, legible handwritten words - meaning it must contain " +
    "recognizable letters that form real words, not typed text, not a blank page, not an unrelated photo, not a " +
    "screenshot, and not meaningless scribbles, random lines, zigzags, or doodles that don't spell anything. " +
    'If it does NOT show real legible handwritten words, set "containsHandwriting" to false, "matchesExpectedText" to ' +
    'false, set every numeric field to 0, and explain what you actually saw in "notes" (for example, say so plainly if ' +
    "it looks like random scribbling rather than actual writing). Do not invent scores for an image with no real " +
    'handwriting in it. If it DOES show real handwritten words, set "containsHandwriting" to true and rate these ' +
    "visual qualities on a 0-100 scale (100 = very steady/consistent/typical for a healthy adult, 0 = very irregular), " +
    "based only on what is visibly in the image: legibility, strokeSteadiness (wavering/tremor in the pen strokes), " +
    "spacingConsistency (evenness of spacing between letters/words), and letterSizeConsistency (uniformity of " +
    'letter size). Also include a 0-100 "confidence" reflecting how confident you are in this reading given ' +
    "image quality, lighting, and angle. " +
    "Respond with ONLY raw JSON, no markdown fences, no extra commentary, in exactly this shape: " +
    '{"containsHandwriting":true|false,"matchesExpectedText":true|false,"transcription":"your best-effort reading of ' +
    'the words in the image, or an empty string if none",' +
    '"confidence":0-100,"legibility":0-100,"strokeSteadiness":0-100,' +
    '"spacingConsistency":0-100,"letterSizeConsistency":0-100,"notes":"one short plain-language sentence describing what you observed"}'
  );
}

const GEMINI_MODEL_CANDIDATES = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-flash-lite", "gemini-1.5-flash-latest"];

export interface GeminiAnalysis {
  legibility: number;
  strokeSteadiness: number;
  spacingConsistency: number;
  letterSizeConsistency: number;
  confidence: number | null;
  notes: string;
  transcription?: string;
  matchesExpectedText?: boolean | null;
}
export type GeminiResult = { ok: true; analysis: GeminiAnalysis } | { ok: false; reason: string };

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] || "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Exports a drawing canvas (white background composited in, since the canvas itself is transparent) as a File, so the
 *  same real content-aware Gemini check used for uploaded photos can also be run against on-screen drawings. */
export function canvasToFile(canvas: HTMLCanvasElement, filename = "drawing.png"): Promise<File> {
  return new Promise((resolve, reject) => {
    const composited = document.createElement("canvas");
    composited.width = canvas.width;
    composited.height = canvas.height;
    const ctx = composited.getContext("2d");
    if (!ctx) {
      reject(new Error("Canvas not supported"));
      return;
    }
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, composited.width, composited.height);
    ctx.drawImage(canvas, 0, 0);
    composited.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Could not export drawing"));
        return;
      }
      resolve(new File([blob], filename, { type: "image/png" }));
    }, "image/png");
  });
}

function normalizeForCompare(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
}

export async function analyzeHandwritingPhoto(file: File, apiKey: string, expectedText?: string): Promise<GeminiResult> {
  if (!apiKey) return { ok: false, reason: "Please enter your Gemini API key first." };
  if (!file) return { ok: false, reason: "Please choose a photo to analyze." };

  let base64: string;
  try {
    base64 = await fileToBase64(file);
  } catch {
    return { ok: false, reason: "Couldn't read that image file." };
  }

  const body = {
    contents: [{ parts: [{ text: buildGeminiPrompt(expectedText) }, { inline_data: { mime_type: file.type || "image/jpeg", data: base64 } }] }],
    generationConfig: { temperature: 0.2, response_mime_type: "application/json" },
  };

  let res: Response | null = null;
  let lastStatus = 0;
  let sawRateLimit = false;

  for (const model of GEMINI_MODEL_CANDIDATES) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      } catch {
        return { ok: false, reason: "Could not reach Gemini - check your internet connection and try again." };
      }
      if (res.ok || res.status !== 429 || attempt === 1) break;
      sawRateLimit = true;
      await new Promise((r) => setTimeout(r, 1500));
    }
    if (res.ok) break;
    lastStatus = res.status;
    if (res.status === 429) sawRateLimit = true;
    if (res.status !== 404 && res.status !== 429 && res.status !== 403) break;
    res = null;
  }

  if (!res) {
    if (sawRateLimit) {
      return { ok: false, reason: "Gemini's free-tier limit was hit on every available model. Wait about a minute and try again." };
    }
    return { ok: false, reason: `None of Gemini's current models responded (last status ${lastStatus}). Your key may not have access yet.` };
  }
  if (!res.ok) {
    if (res.status === 400) return { ok: false, reason: "Gemini rejected that request. Double-check your API key." };
    if (res.status === 429) return { ok: false, reason: "Gemini's rate limit was hit - wait a moment and try again." };
    return { ok: false, reason: `Gemini returned an error (status ${res.status}).` };
  }

  let data: any;
  try {
    data = await res.json();
  } catch {
    return { ok: false, reason: "Got an unreadable response from Gemini." };
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return { ok: false, reason: "Gemini didn't return an analysis for that image - try a clearer photo." };

  const cleaned = text.trim().replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();
  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      try {
        parsed = JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        /* still no good */
      }
    }
    if (!parsed) return { ok: false, reason: "Couldn't parse Gemini's response - try again." };
  }

  if (parsed.containsHandwriting === false) {
    return { ok: false, reason: `That doesn't look like a photo of handwriting${parsed.notes ? " - " + parsed.notes : ""}. Try a clear, well-lit photo.` };
  }

  const fields = ["legibility", "strokeSteadiness", "spacingConsistency", "letterSizeConsistency"] as const;
  for (const f of fields) {
    const v = parsed[f];
    if (typeof v !== "number" || isNaN(v)) return { ok: false, reason: "Gemini's response was missing expected fields - try again." };
    parsed[f] = Math.max(0, Math.min(100, v));
  }
  parsed.notes = typeof parsed.notes === "string" ? parsed.notes : "";
  parsed.transcription = typeof parsed.transcription === "string" ? parsed.transcription : "";
  parsed.confidence = typeof parsed.confidence === "number" && !isNaN(parsed.confidence) ? Math.max(0, Math.min(100, parsed.confidence)) : null;

  if (parsed.confidence !== null && parsed.confidence < 40) {
    return { ok: false, reason: "Gemini wasn't confident enough in this photo (lighting/angle/quality). Try a clearer, straight-on photo." };
  }

  // Enforce that what was actually written matches the sentence they were asked to write  - 
  // this is the real content check, not just a legibility/steadiness score.
  if (expectedText) {
    const modelSaysMismatch = parsed.matchesExpectedText === false;
    // Belt-and-suspenders local cross-check: if Gemini transcribed something, make sure it
    // actually overlaps with the target sentence's words rather than trusting the flag blindly.
    let localMismatch = false;
    if (parsed.transcription) {
      const targetWords = new Set(normalizeForCompare(expectedText).split(" ").filter((w) => w.length > 2));
      const gotWords = normalizeForCompare(parsed.transcription).split(" ").filter((w) => w.length > 2);
      const overlap = gotWords.filter((w) => targetWords.has(w)).length;
      const neededOverlap = Math.max(1, Math.ceil(targetWords.size * 0.4));
      localMismatch = targetWords.size > 0 && overlap < neededOverlap;
    }
    if (modelSaysMismatch || localMismatch) {
      const readBack = parsed.transcription ? ` We read: "${parsed.transcription}".` : "";
      return {
        ok: false,
        reason: `That doesn't match the sentence you were asked to write ("${expectedText}").${readBack} Please write out that exact sentence and try again.`,
      };
    }
  }

  return { ok: true, analysis: parsed as GeminiAnalysis };
}
export function probabilityFromGeminiAnalysis(a: GeminiAnalysis): number {
  const avg = (a.legibility + a.strokeSteadiness + a.spacingConsistency + a.letterSizeConsistency) / 4;
  return clamp01(1 - avg / 100);
}

/* ---------- daily activity dots: speech / handwriting / games, whichever order you do them ---------- */
export type DailyActivity = "speech" | "handwriting" | "games";
const DAILY_ACTIVITIES: DailyActivity[] = ["speech", "handwriting", "games"];
function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}
export function markDailyActivity(activity: DailyActivity) {
  safeSet(`verity_daily_${activity}`, todayKey());
}
export function getDailyActivityStatus(): Record<DailyActivity, boolean> {
  const today = todayKey();
  return {
    speech: safeGet("verity_daily_speech") === today,
    handwriting: safeGet("verity_daily_handwriting") === today,
    games: safeGet("verity_daily_games") === today,
  };
}
/** How many of the 3 daily activities are done today, in the order they were completed
 *  (fills left-to-right no matter which activity you did first). */
export function getDailyActivityCount(): number {
  const status = getDailyActivityStatus();
  return DAILY_ACTIVITIES.filter((a) => status[a]).length;
}

/* ---------- history ---------- */
export interface HistoryEntry {
  id: string;
  timestamp: number;
  modality: "speech" | "handwriting";
  probability: number;
  band: Band;
  metrics: any;
  source?: string;
}
export function getHistory(): HistoryEntry[] {
  const raw = safeGet(LS_HISTORY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
export function addHistoryEntry(entry: Omit<HistoryEntry, "id" | "timestamp">): HistoryEntry {
  const full: HistoryEntry = { ...entry, id: Math.random().toString(36).slice(2), timestamp: Date.now() };
  const history = getHistory();
  history.push(full);
  safeSet(LS_HISTORY, JSON.stringify(history));
  return full;
}
export function clearHistory() {
  safeRemove(LS_HISTORY);
}
export function historyToCsv(history: HistoryEntry[]): string {
  const rows = [["timestamp", "date", "modality", "probability", "band"]];
  history.forEach((h) => {
    rows.push([String(h.timestamp), new Date(h.timestamp).toISOString(), h.modality, String(h.probability), h.band]);
  });
  return rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
}
export function computeTrend(history: HistoryEntry[]): { direction: "up" | "down" | "flat"; deltaPct: number } {
  if (history.length < 2) return { direction: "flat", deltaPct: 0 };
  const windowSize = Math.max(1, Math.min(3, Math.floor(history.length / 2)));
  const recent = history.slice(-windowSize);
  const earlier = history.slice(0, history.length - windowSize);
  if (!earlier.length) return { direction: "flat", deltaPct: 0 };
  const avg = (arr: HistoryEntry[]) => arr.reduce((a, b) => a + b.probability, 0) / arr.length;
  const delta = avg(recent) - avg(earlier);
  const deltaPct = Math.round(Math.abs(delta) * 100);
  if (deltaPct < 4) return { direction: "flat", deltaPct };
  return { direction: delta > 0 ? "up" : "down", deltaPct };
}

/* ---------- games XP / leveling ---------- */
export function getGameXP(): number {
  const v = parseInt(safeGet(LS_GAME_XP) || "0", 10);
  return isNaN(v) ? 0 : v;
}
export function setGameXP(v: number) {
  safeSet(LS_GAME_XP, String(Math.max(0, Math.round(v))));
}
export function xpNeededForLevel(level: number): number {
  return 100 + (level - 1) * 50;
}
export function levelFromXP(xp: number): { level: number; into: number; need: number } {
  let level = 1;
  let remaining = xp;
  while (remaining >= xpNeededForLevel(level)) {
    remaining -= xpNeededForLevel(level);
    level++;
  }
  return { level, into: remaining, need: xpNeededForLevel(level) };
}

/* ---------- misc utils ---------- */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---------- Mango relationship (a little tamagotchi-style bond) ---------- */
export function getMangoAffection(): number {
  const v = parseInt(safeGet(LS_MANGO_AFFECTION) || "0", 10);
  return isNaN(v) ? 0 : v;
}
export function addMangoAffection(amount: number): number {
  const next = Math.max(0, getMangoAffection() + amount);
  safeSet(LS_MANGO_AFFECTION, String(next));
  return next;
}

const LS_MANGO_PET_COUNT = "verity_mango_pet_count";
export function getMangoPetCount(): number {
  const v = parseInt(safeGet(LS_MANGO_PET_COUNT) || "0", 10);
  return isNaN(v) ? 0 : v;
}
/** Increments the lifetime pet counter; returns the new total. */
export function incrementMangoPetCount(): number {
  const next = getMangoPetCount() + 1;
  safeSet(LS_MANGO_PET_COUNT, String(next));
  return next;
}
export interface MangoStage {
  name: string;
  emoji: string;
  next: number | null; // affection needed for the next stage, or null if maxed out
}
export function mangoStageFor(affection: number): MangoStage {
  if (affection < 20) return { name: "New Friend", emoji: "🥚", next: 20 };
  if (affection < 60) return { name: "Good Friend", emoji: "🌱", next: 60 };
  if (affection < 150) return { name: "Close Friend", emoji: "🌼", next: 150 };
  if (affection < 300) return { name: "Best Friend", emoji: "⭐", next: 300 };
  return { name: "Inseparable", emoji: "💛", next: null };
}

/* ---------- Mango coins (earned from achievements and leveling up, spent in the shop) ---------- */
const LS_MANGO_COINS = "verity_mango_coins";
export function getMangoCoins(): number {
  const v = parseInt(safeGet(LS_MANGO_COINS) || "0", 10);
  return isNaN(v) ? 0 : v;
}
export function addMangoCoins(amount: number): number {
  const next = Math.max(0, getMangoCoins() + amount);
  safeSet(LS_MANGO_COINS, String(next));
  return next;
}
export function spendMangoCoins(amount: number): boolean {
  const bal = getMangoCoins();
  if (bal < amount) return false;
  safeSet(LS_MANGO_COINS, String(bal - amount));
  return true;
}

/* ---------- Mango shop: cosmetics you buy with coins and equip on your pet ---------- */
export type MangoSlot = "hat" | "outfit" | "background" | "color";

export interface MangoItem {
  id: string;
  slot: MangoSlot;
  name: string;
  emoji: string;
  price: number;
  /** Only set for slot "color" - the 3-stop gradient Mango's body is recolored with. */
  gradient?: [string, string, string];
}

export const MANGO_SHOP: MangoItem[] = [
  // hats
  { id: "hat-crown", slot: "hat", name: "Tiny Crown", emoji: "👑", price: 60 },
  { id: "hat-party", slot: "hat", name: "Party Hat", emoji: "🎉", price: 25 },
  { id: "hat-wizard", slot: "hat", name: "Wizard Hat", emoji: "🧙", price: 80 },
  { id: "hat-bow", slot: "hat", name: "Cute Bow", emoji: "🎀", price: 20 },
  { id: "hat-cap", slot: "hat", name: "Baseball Cap", emoji: "🧢", price: 15 },
  { id: "hat-halo", slot: "hat", name: "Halo", emoji: "😇", price: 100 },
  // outfits
  { id: "outfit-scarf", slot: "outfit", name: "Cozy Scarf", emoji: "🧣", price: 20 },
  { id: "outfit-bowtie", slot: "outfit", name: "Bow Tie", emoji: "🎗️", price: 15 },
  { id: "outfit-cape", slot: "outfit", name: "Hero Cape", emoji: "🦸", price: 70 },
  { id: "outfit-sweater", slot: "outfit", name: "Little Sweater", emoji: "🧶", price: 35 },
  { id: "outfit-sunglasses", slot: "outfit", name: "Cool Sunglasses", emoji: "🕶️", price: 30 },
  // backgrounds
  { id: "bg-beach", slot: "background", name: "Beach", emoji: "🏖️", price: 50 },
  { id: "bg-space", slot: "background", name: "Outer Space", emoji: "🌌", price: 75 },
  { id: "bg-garden", slot: "background", name: "Garden", emoji: "🌷", price: 45 },
  { id: "bg-city", slot: "background", name: "City Lights", emoji: "🌆", price: 65 },
  // colors - recolor Mango's body gradient
  { id: "color-classic", slot: "color", name: "Classic", emoji: "🥭", price: 0, gradient: ["#f2887e", "#f5a15c", "#f8c04a"] },
  { id: "color-mint", slot: "color", name: "Mint", emoji: "🟢", price: 40, gradient: ["#8fe0c2", "#6fcf9e", "#4fae7e"] },
  { id: "color-berry", slot: "color", name: "Berry", emoji: "🟣", price: 55, gradient: ["#d98fe0", "#b06fcf", "#8a4fae"] },
  { id: "color-sky", slot: "color", name: "Sky", emoji: "🔵", price: 45, gradient: ["#8fc4e0", "#6fa0cf", "#4f7dae"] },
  { id: "color-rose", slot: "color", name: "Rose Gold", emoji: "🌸", price: 65, gradient: ["#f2a8b8", "#e88fa0", "#d97a8f"] },
  { id: "color-charcoal", slot: "color", name: "Charcoal", emoji: "⚫", price: 90, gradient: ["#8a8f99", "#6b7078", "#4a4e54"] },
];

const LS_MANGO_INVENTORY = "verity_mango_inventory";
const LS_MANGO_EQUIPPED = "verity_mango_equipped";

export function getMangoInventory(): string[] {
  const raw = safeGet(LS_MANGO_INVENTORY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/** Buys a shop item with coins; returns false (and spends nothing) if you can't afford it or
 *  already own it. */
export function purchaseMangoItem(itemId: string): boolean {
  const item = MANGO_SHOP.find((i) => i.id === itemId);
  if (!item) return false;
  const owned = getMangoInventory();
  if (owned.includes(itemId)) return false;
  if (!spendMangoCoins(item.price)) return false;
  safeSet(LS_MANGO_INVENTORY, JSON.stringify([...owned, itemId]));
  return true;
}

export function getMangoEquipped(): Partial<Record<MangoSlot, string>> {
  const raw = safeGet(LS_MANGO_EQUIPPED);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/** Equips an owned item in its slot, or pass null to unequip that slot. */
export function equipMangoItem(slot: MangoSlot, itemId: string | null) {
  const equipped = getMangoEquipped();
  if (itemId === null) {
    delete equipped[slot];
  } else {
    if (!getMangoInventory().includes(itemId)) return;
    equipped[slot] = itemId;
  }
  safeSet(LS_MANGO_EQUIPPED, JSON.stringify(equipped));
}

/* ---------- secret platinum trophy: a hidden, multi-step sequence hunted across the site ---------- */
export const SECRET_STEPS = ["konami", "pet-mango", "footer-clicks"] as const;
export type SecretStepId = (typeof SECRET_STEPS)[number];

const LS_SECRET_STEPS = "verity_secret_steps";

export function getSecretSteps(): SecretStepId[] {
  const raw = safeGet(LS_SECRET_STEPS);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/** Marks one step of the hidden platinum-trophy sequence as found. Returns true only the first
 *  time all steps are complete, so the caller can fire the platinum unlock exactly once. */
export function markSecretStep(step: SecretStepId): boolean {
  const steps = new Set(getSecretSteps());
  const alreadyHadAll = SECRET_STEPS.every((s) => steps.has(s));
  steps.add(step);
  safeSet(LS_SECRET_STEPS, JSON.stringify(Array.from(steps)));
  const hasAllNow = SECRET_STEPS.every((s) => steps.has(s));
  return hasAllNow && !alreadyHadAll;
}

export function hasPlatinumTrophy(): boolean {
  const steps = new Set(getSecretSteps());
  return SECRET_STEPS.every((s) => steps.has(s));
}

/* ---------- terms of use / privacy policy acceptance ---------- */
export function hasAcceptedTerms(): boolean {
  return safeGet(LS_TERMS_ACCEPTED) === "1";
}
export function acceptTerms() {
  safeSet(LS_TERMS_ACCEPTED, "1");
}

/* ---------- personal best scores per game (there's no server, so this is a
   "your own top scores" leaderboard rather than a shared/multiplayer one) ---------- */
const LS_GAME_BESTS = "verity_game_bests";
export function getGameBests(): Record<string, number> {
  const raw = safeGet(LS_GAME_BESTS);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}
/** Records a new attempt for a game; returns true if it beat the previous best. */
export function updateGameBest(gameKey: string, value: number, higherIsBetter: boolean): boolean {
  const bests = getGameBests();
  const prev = bests[gameKey];
  const isNewBest = prev === undefined || (higherIsBetter ? value > prev : value < prev);
  if (isNewBest) {
    bests[gameKey] = value;
    safeSet(LS_GAME_BESTS, JSON.stringify(bests));
  }
  return isNewBest;
}

/* ---------- tracks which achievements have already triggered a popup, so the celebration
   pops up exactly once, the moment each one is unlocked, rather than every dashboard visit ---------- */
const LS_SEEN_ACHIEVEMENTS = "verity_seen_achievements_v3"; // bumped again so the interactive tilt cutscene replays for already-unlocked achievements
export function getSeenAchievements(): string[] {
  const raw = safeGet(LS_SEEN_ACHIEVEMENTS);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
export function markAchievementsSeen(titles: string[]) {
  const seen = new Set(getSeenAchievements());
  titles.forEach((t) => seen.add(t));
  safeSet(LS_SEEN_ACHIEVEMENTS, JSON.stringify(Array.from(seen)));
}
