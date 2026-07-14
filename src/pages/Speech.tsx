import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Mic } from "lucide-react";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { ScoreBlock, BreakdownGrid } from "@/components/ScoreBlock";
import { DifficultySelector, type Difficulty } from "@/components/LevelBar";
import { ButtonHoldAndRelease } from "@/components/ui/hold-and-release-button";
import { AIVoiceInput } from "@/components/ui/ai-voice-input";
import { FileUploadZone } from "@/components/ui/file-upload-zone";
import {
  computeSpeechMetrics,
  computeSpeechSamplesFromAudioBuffer,
  probabilityFromSpeechMetrics,
  bandFor,
  addHistoryEntry,
  markDailyActivity,
  type SpeechMetrics,
  type Band,
} from "@/lib/verity";

// Easy always uses the same sentence; the other tiers pick a random passage each attempt.
const PASSAGES: Record<Difficulty, string[]> = {
  Easy: ["The quick brown fox jumps over the lazy dog near the riverbank on a calm autumn morning."],
  Medium: [
    "The old lighthouse keeper climbed the winding stairs every evening, checking each lamp before the fishing boats returned home through the fog.",
    "She poured a cup of tea, opened the window, and watched the neighborhood slowly wake up under a pale morning sky.",
    "The children built a small sandcastle near the shore, laughing as the gentle waves crept closer with each passing minute.",
  ],
  Hard: [
    "Despite the unpredictable weather, the botanists carefully catalogued each unfamiliar species, comparing their observations against decades of archived research before drawing any conclusions.",
    "The negotiations continued late into the evening, as both delegations struggled to reconcile their conflicting priorities without abandoning previous commitments.",
    "Constructing the bridge required engineers to account for shifting tides, unpredictable winds, and the surrounding wildlife's delicate migratory patterns.",
  ],
  Extreme: [
    "The committee's unprecedented decision to reallocate municipal infrastructure funding sparked considerable controversy among constituents, particularly those who felt previous commitments regarding neighborhood revitalization had been insufficiently prioritized.",
    "Economists remain divided over whether the proposed regulatory framework would meaningfully curb speculative volatility or simply displace it toward less transparent, unregulated markets.",
    "The archaeological team's meticulous excavation uncovered artifacts whose provenance challenged long-held assumptions about the region's early trade relationships and cultural diffusion.",
  ],
};

function pickPassage(d: Difficulty): string {
  const options = PASSAGES[d];
  return options[Math.floor(Math.random() * options.length)];
}

type Stage = "idle" | "recording" | "done";

export default function Speech() {
  const [difficulty, setDifficultyState] = useState<Difficulty>("Easy");
  const [passage, setPassage] = useState(() => pickPassage("Easy"));

  function setDifficulty(d: Difficulty) {
    setDifficultyState(d);
    setPassage(pickPassage(d));
  }
  const [stage, setStage] = useState<Stage>("idle");
  const [seconds, setSeconds] = useState(0);
  const [metrics, setMetrics] = useState<SpeechMetrics | null>(null);
  const [probability, setProbability] = useState(0);
  const [band, setBand] = useState<Band>("typical");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [levels, setLevels] = useState<number[]>(Array(24).fill(0));

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const samplesRef = useRef<number[]>([]);
  const rafRef = useRef<number>(0);
  const timerRef = useRef<number>(0);
  const startTimeRef = useRef(0);
  const streamRef = useRef<MediaStream | null>(null);

  async function startRecording() {
    setError("");
    setMetrics(null);
    setAudioUrl(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;
      samplesRef.current = [];

      const dataArray = new Uint8Array(analyser.fftSize);
      function sample() {
        analyser.getByteTimeDomainData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const v = (dataArray[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / dataArray.length);
        samplesRef.current.push(rms);
        rafRef.current = requestAnimationFrame(sample);
      }
      sample();

      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioUrl(URL.createObjectURL(blob));
      };
      mr.start();
      startTimeRef.current = Date.now();
      setStage("recording");
      setSeconds(0);
      timerRef.current = window.setInterval(() => {
        setSeconds(Math.round((Date.now() - startTimeRef.current) / 1000));
        const recent = samplesRef.current.slice(-6);
        const avg = recent.length ? recent.reduce((a, b) => a + b, 0) / recent.length : 0;
        setLevels((prev) => [...prev.slice(1), Math.min(1, avg * 6)]);
      }, 120);
    } catch {
      setError("Couldn't access your microphone. Please check permissions and try again.");
    }
  }

  /** Stops and throws away the current recording without analyzing it - for when you don't
   *  like how it went and just want a clean slate, no half-finished result saved anywhere. */
  function cancelRecording() {
    cancelAnimationFrame(rafRef.current);
    clearInterval(timerRef.current);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.onstop = null;
      if (mediaRecorderRef.current.state !== "inactive") mediaRecorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current?.close();
    chunksRef.current = [];
    samplesRef.current = [];
    setLevels(Array(24).fill(0));
    setStage("idle");
  }

  function stopRecording() {
    cancelAnimationFrame(rafRef.current);
    clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current?.close();

    const durationSec = (Date.now() - startTimeRef.current) / 1000;
    const samples = samplesRef.current;
    if (samples.length < 8 || durationSec < 1.5) {
      setError("That recording was too short - please try again and read the whole passage.");
      setStage("idle");
      return;
    }
    const m = computeSpeechMetrics(samples, durationSec);
    const p = probabilityFromSpeechMetrics(m);
    const b = bandFor(p);
    setMetrics(m);
    setProbability(p);
    setBand(b);
    addHistoryEntry({ modality: "speech", probability: p, band: b, metrics: m });
    markDailyActivity("speech");
    setStage("done");
    setLevels(Array(24).fill(0));
  }

  /** Runs an uploaded audio file through the exact same real metrics as a live recording -
   *  decode it, compute the same RMS envelope, then reuse the identical scoring functions.
   *  No shortcuts or made-up numbers for the upload path. */
  async function analyzeUploadedAudio(file: File) {
    setError("");
    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioCtx = new AudioContext();
      const buffer = await audioCtx.decodeAudioData(arrayBuffer);
      const samples = computeSpeechSamplesFromAudioBuffer(buffer);
      audioCtx.close();
      if (samples.length < 8 || buffer.duration < 1.5) {
        setError("That audio file is too short to analyze - please upload a longer recording.");
        return;
      }
      const m = computeSpeechMetrics(samples, buffer.duration);
      const p = probabilityFromSpeechMetrics(m);
      const b = bandFor(p);
      setMetrics(m);
      setProbability(p);
      setBand(b);
      setAudioUrl(URL.createObjectURL(file));
      addHistoryEntry({ modality: "speech", probability: p, band: b, metrics: m });
    markDailyActivity("speech");
      setStage("done");
    } catch {
      setError("Couldn't read that audio file - please try a different format (MP3, WAV, or M4A).");
    }
  }

  return (
    <div className="container" style={{ paddingTop: 56, paddingBottom: 96, maxWidth: 640 }}>
      <RevealOnScroll>
        <div className="runner-card">
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "var(--blue-deep)",
              color: "var(--bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
            }}
          >
            <Mic size={24} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6, textAlign: "center" }}>Speech test</h1>
          <p className="text-text-soft" style={{ textAlign: "center", marginBottom: 22, fontSize: 14 }}>
            Read the passage below out loud at a normal pace
          </p>

          {stage === "idle" && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ textAlign: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: "var(--text-soft)", fontWeight: 600 }}>Difficulty</span>
              </div>
              <DifficultySelector value={difficulty} onChange={setDifficulty} />
            </div>
          )}

          <div
            className="card"
            style={{ padding: "20px 22px", background: "var(--bg)", fontSize: 17, lineHeight: 1.6, marginBottom: 24 }}
          >
            "{passage}"
          </div>

          {error && <div style={{ color: "var(--text)", fontWeight: 700, fontSize: 13.5, marginBottom: 16, borderLeft: "3px solid var(--text)", paddingLeft: 10 }}>{error}</div>}

          {stage !== "done" && (
            <div style={{ textAlign: "center" }}>
              <AIVoiceInput
                onStart={startRecording}
                onStop={stopRecording}
                levels={stage === "recording" ? levels : undefined}
              />
              {stage === "recording" && (
                <div style={{ marginTop: 14 }}>
                  <ButtonHoldAndRelease
                    holdDuration={3000}
                    label="Hold to delete recording"
                    holdingLabel="Keep holding to delete…"
                    onComplete={cancelRecording}
                  />
                </div>
              )}
              {stage === "idle" && (
                <div style={{ marginTop: 24, textAlign: "left" }}>
                  <div style={{ textAlign: "center", marginBottom: 10, fontSize: 12.5, color: "var(--text-soft)" }}>
                    or upload an existing audio recording instead
                  </div>
                  <FileUploadZone kind="audio" onFileSelected={(f) => analyzeUploadedAudio(f)} />
                </div>
              )}
            </div>
          )}

          {stage === "done" && metrics && (
            <div>
              <ScoreBlock probability={probability} band={band} />
              <BreakdownGrid
                items={[
                  { value: `${metrics.estWordsPerMin} wpm`, label: "How fast you spoke", note: "Words per minute - most people fall between 110–160." },
                  { value: `${Math.round(metrics.silenceRatio * 100)}%`, label: "Quiet time", note: "How much of the recording had no speech in it." },
                  { value: `${metrics.pauseCount}`, label: "Longer pauses", note: "Pauses lasting more than a quarter-second." },
                  { value: `${metrics.durationSec.toFixed(1)}s`, label: "Total time", note: "How long your recording lasted." },
                ]}
              />
              {audioUrl && (
                <div style={{ marginTop: 8 }}>
                  <audio controls src={audioUrl} style={{ width: "100%" }} />
                </div>
              )}
              <div style={{ textAlign: "center", marginTop: 20 }}>
                <ButtonHoldAndRelease
                  holdDuration={1200}
                  label="Hold to discard & try again"
                  holdingLabel="Keep holding…"
                  onComplete={() => {
                    setStage("idle");
                    setMetrics(null);
                    setAudioUrl(null);
                    setPassage(pickPassage(difficulty));
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </RevealOnScroll>
    </div>
  );
}
