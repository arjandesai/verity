import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Mic, Volume2 } from "lucide-react";
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
  getHistory,
  markDailyActivity,
  analyzeSpeechAudio,
  probabilityFromGeminiSpeechAnalysis,
  getGeminiKey,
  setGeminiKey,
  SPEECH_LANGUAGES,
  getUser,
  getUserProfile,
  type SpeechMetrics,
  type Band,
  type SpeechLanguageCode,
  type GeminiSpeechAnalysis,
} from "@/lib/verity";

// Easy always uses the same sentence; the other tiers pick a random passage each attempt.
// One full set of passages per supported language, so difficulty and content stay comparable
// no matter which language is selected.
const PASSAGES: Record<SpeechLanguageCode, Record<Difficulty, string[]>> = {
  en: {
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
  },
  es: {
    Easy: ["El rápido zorro marrón salta sobre el perro perezoso cerca del río en una tranquila mañana de otoño."],
    Medium: [
      "El anciano farero subía la escalera de caracol cada noche, revisando cada lámpara antes de que los barcos pesqueros volvieran a través de la niebla.",
      "Ella sirvió una taza de té, abrió la ventana y observó cómo el vecindario despertaba lentamente bajo un cielo pálido.",
      "Los niños construyeron un pequeño castillo de arena cerca de la orilla, riendo mientras las suaves olas se acercaban poco a poco.",
    ],
    Hard: [
      "A pesar del clima impredecible, los botánicos catalogaron cuidadosamente cada especie desconocida, comparando sus observaciones con décadas de investigación archivada antes de sacar conclusiones.",
      "Las negociaciones continuaron hasta bien entrada la noche, mientras ambas delegaciones luchaban por reconciliar sus prioridades sin abandonar compromisos previos.",
      "Construir el puente exigió que los ingenieros consideraran las mareas cambiantes, los vientos impredecibles y los delicados patrones migratorios de la fauna local.",
    ],
    Extreme: [
      "La decisión sin precedentes del comité de reasignar fondos de infraestructura municipal provocó una gran controversia entre los ciudadanos, especialmente entre quienes sentían que la revitalización del vecindario no había sido priorizada.",
      "Los economistas siguen divididos sobre si el marco regulatorio propuesto realmente frenaría la volatilidad especulativa o simplemente la desplazaría hacia mercados menos transparentes.",
      "La meticulosa excavación arqueológica reveló artefactos cuya procedencia desafió suposiciones arraigadas sobre las antiguas relaciones comerciales de la región.",
    ],
  },
  fr: {
    Easy: ["Le rapide renard brun saute par-dessus le chien paresseux près de la rivière par un calme matin d'automne."],
    Medium: [
      "Le vieux gardien de phare montait l'escalier en colimaçon chaque soir, vérifiant chaque lampe avant que les bateaux de pêche ne rentrent à travers le brouillard.",
      "Elle a versé une tasse de thé, ouvert la fenêtre et regardé le quartier se réveiller lentement sous un ciel pâle.",
      "Les enfants ont construit un petit château de sable près du rivage, riant tandis que les vagues douces se rapprochaient peu à peu.",
    ],
    Hard: [
      "Malgré le temps imprévisible, les botanistes ont soigneusement répertorié chaque espèce inconnue, comparant leurs observations à des décennies de recherches archivées avant de tirer des conclusions.",
      "Les négociations se sont poursuivies tard dans la soirée, les deux délégations peinant à concilier leurs priorités sans abandonner leurs engagements antérieurs.",
      "La construction du pont a exigé que les ingénieurs tiennent compte des marées changeantes, des vents imprévisibles et des délicats schémas migratoires de la faune environnante.",
    ],
    Extreme: [
      "La décision sans précédent du comité de réaffecter les fonds d'infrastructure municipale a suscité une vive controverse parmi les habitants, en particulier ceux qui estimaient que la revitalisation du quartier n'avait pas été suffisamment priorisée.",
      "Les économistes restent divisés quant à savoir si le cadre réglementaire proposé freinerait réellement la volatilité spéculative ou la déplacerait simplement vers des marchés moins transparents.",
      "La fouille archéologique méticuleuse a mis au jour des artefacts dont la provenance a remis en question des hypothèses de longue date sur les relations commerciales anciennes de la région.",
    ],
  },
  de: {
    Easy: ["Der schnelle braune Fuchs springt über den faulen Hund am Flussufer an einem ruhigen Herbstmorgen."],
    Medium: [
      "Der alte Leuchtturmwärter stieg jeden Abend die gewundene Treppe hinauf und prüfte jede Lampe, bevor die Fischerboote durch den Nebel zurückkehrten.",
      "Sie goss sich eine Tasse Tee ein, öffnete das Fenster und beobachtete, wie die Nachbarschaft langsam unter einem blassen Morgenhimmel erwachte.",
      "Die Kinder bauten eine kleine Sandburg am Ufer und lachten, während die sanften Wellen ihnen näher kamen.",
    ],
    Hard: [
      "Trotz des unberechenbaren Wetters katalogisierten die Botaniker sorgfältig jede unbekannte Art und verglichen ihre Beobachtungen mit jahrzehntealten Forschungsarchiven, bevor sie Schlüsse zogen.",
      "Die Verhandlungen zogen sich bis spät in den Abend hin, da beide Delegationen darum rangen, ihre widersprüchlichen Prioritäten zu vereinbaren, ohne frühere Zusagen aufzugeben.",
      "Der Brückenbau erforderte, dass die Ingenieure wechselnde Gezeiten, unvorhersehbare Winde und die empfindlichen Wanderungsmuster der örtlichen Tierwelt berücksichtigten.",
    ],
    Extreme: [
      "Die beispiellose Entscheidung des Ausschusses, kommunale Infrastrukturmittel umzuverteilen, löste unter den Bürgern erhebliche Kontroversen aus, insbesondere bei jenen, die frühere Zusagen zur Stadtteilerneuerung als vernachlässigt empfanden.",
      "Ökonomen sind weiterhin uneins darüber, ob der vorgeschlagene Regulierungsrahmen die spekulative Volatilität tatsächlich eindämmen oder sie lediglich in weniger transparente Märkte verlagern würde.",
      "Die sorgfältige archäologische Ausgrabung förderte Artefakte zutage, deren Herkunft langjährige Annahmen über die frühen Handelsbeziehungen der Region infrage stellte.",
    ],
  },
  hi: {
    Easy: ["तेज़ भूरी लोमड़ी शांत पतझड़ की सुबह नदी के किनारे आलसी कुत्ते के ऊपर से कूदती है।"],
    Medium: [
      "बूढ़ा लाइटहाउस रखवाला हर शाम घुमावदार सीढ़ियाँ चढ़ता था, मछली पकड़ने वाली नावों के कोहरे से लौटने से पहले हर लैंप की जाँच करता था।",
      "उसने एक कप चाय डाली, खिड़की खोली, और देखा कि पड़ोस धीरे-धीरे हल्के सुबह के आसमान के नीचे जाग रहा है।",
      "बच्चों ने किनारे के पास एक छोटा रेत का महल बनाया, हँसते हुए जैसे-जैसे कोमल लहरें धीरे-धीरे पास आती गईं।",
    ],
    Hard: [
      "अप्रत्याशित मौसम के बावजूद, वनस्पति वैज्ञानिकों ने सावधानीपूर्वक हर अपरिचित प्रजाति को सूचीबद्ध किया, कोई निष्कर्ष निकालने से पहले अपने अवलोकनों की तुलना दशकों के संग्रहीत शोध से की।",
      "बातचीत देर शाम तक जारी रही, क्योंकि दोनों प्रतिनिधिमंडल पिछली प्रतिबद्धताओं को छोड़े बिना अपनी परस्पर विरोधी प्राथमिकताओं को सुलझाने के लिए संघर्ष कर रहे थे।",
      "पुल के निर्माण के लिए इंजीनियरों को बदलते ज्वार, अप्रत्याशित हवाओं और आसपास के वन्यजीवों के नाजुक प्रवासी पैटर्न को ध्यान में रखना पड़ा।",
    ],
    Extreme: [
      "नगरपालिका बुनियादी ढांचे के धन को पुनः आवंटित करने के समिति के अभूतपूर्व निर्णय ने निवासियों के बीच काफी विवाद खड़ा कर दिया, विशेष रूप से उन लोगों के बीच जिन्हें लगा कि पड़ोस के पुनरुद्धार को पर्याप्त प्राथमिकता नहीं दी गई थी।",
      "अर्थशास्त्री इस बात पर विभाजित हैं कि क्या प्रस्तावित नियामक ढांचा वास्तव में सट्टा अस्थिरता को कम करेगा या इसे केवल कम पारदर्शी बाजारों की ओर स्थानांतरित करेगा।",
      "पुरातात्विक टीम की सावधानीपूर्वक खुदाई से ऐसी कलाकृतियाँ मिलीं जिनकी उत्पत्ति ने क्षेत्र के प्रारंभिक व्यापार संबंधों के बारे में लंबे समय से चली आ रही धारणाओं को चुनौती दी।",
    ],
  },
  zh: {
    Easy: ["在一个平静的秋日清晨，敏捷的棕色狐狸跳过了河边懒惰的狗。"],
    Medium: [
      "老灯塔看守人每天晚上都要爬上蜿蜒的楼梯，在渔船穿过雾气回港之前检查每一盏灯。",
      "她倒了一杯茶，打开窗户，看着社区在苍白的晨空下慢慢苏醒。",
      "孩子们在岸边堆了一座小沙堡，笑着看柔和的海浪一点点靠近。",
    ],
    Hard: [
      "尽管天气变化无常，植物学家们仍仔细记录了每一个未知物种，在得出结论之前将他们的观察与数十年的存档研究进行比较。",
      "谈判一直持续到深夜，双方代表团都在努力调和彼此冲突的优先事项，同时又不放弃之前的承诺。",
      "建造这座桥需要工程师考虑潮汐变化、不可预测的风力以及周边野生动物脆弱的迁徙规律。",
    ],
    Extreme: [
      "委员会重新分配市政基础设施资金的空前决定在居民中引发了相当大的争议，尤其是那些认为社区振兴承诺未得到充分重视的人。",
      "经济学家们仍然对拟议的监管框架能否真正抑制投机性波动，还是只会将其转移到透明度更低的市场存在分歧。",
      "考古队细致的发掘出土的文物，其来源挑战了人们对该地区早期贸易关系长期以来的假设。",
    ],
  },
  ar: {
    Easy: ["يقفز الثعلب البني السريع فوق الكلب الكسول بالقرب من ضفة النهر في صباح خريفي هادئ."],
    Medium: [
      "كان حارس المنارة العجوز يصعد الدرج الحلزوني كل مساء، يفحص كل مصباح قبل أن تعود قوارب الصيد عبر الضباب.",
      "صبت كوبًا من الشاي، وفتحت النافذة، وراقبت الحي يستيقظ ببطء تحت سماء الصباح الباهتة.",
      "بنى الأطفال قلعة رملية صغيرة بالقرب من الشاطئ، يضحكون بينما اقتربت الأمواج اللطيفة شيئًا فشيئًا.",
    ],
    Hard: [
      "على الرغم من الطقس غير المتوقع، قام علماء النبات بتصنيف كل نوع غير مألوف بعناية، ومقارنة ملاحظاتهم بعقود من الأبحاث المؤرشفة قبل استخلاص أي استنتاجات.",
      "استمرت المفاوضات حتى وقت متأخر من المساء، حيث كافح الوفدان للتوفيق بين أولوياتهما المتضاربة دون التخلي عن الالتزامات السابقة.",
      "تطلب بناء الجسر من المهندسين مراعاة المد والجزر المتغير والرياح غير المتوقعة وأنماط الهجرة الدقيقة للحياة البرية المحيطة.",
    ],
    Extreme: [
      "أثار قرار اللجنة غير المسبوق بإعادة تخصيص أموال البنية التحتية البلدية جدلاً كبيرًا بين السكان، لا سيما أولئك الذين شعروا أن التزامات إعادة إحياء الحي لم تحظ بالأولوية الكافية.",
      "لا يزال الاقتصاديون منقسمين حول ما إذا كان الإطار التنظيمي المقترح سيحد فعليًا من التقلبات المضاربة أو سينقلها ببساطة إلى أسواق أقل شفافية.",
      "كشفت الحفريات الأثرية الدقيقة عن قطع أثرية تحدى أصلها افتراضات طويلة الأمد حول علاقات التجارة المبكرة للمنطقة.",
    ],
  },
  pt: {
    Easy: ["A rápida raposa marrom pula sobre o cão preguiçoso perto do rio numa calma manhã de outono."],
    Medium: [
      "O velho faroleiro subia a escada em espiral todas as noites, verificando cada lâmpada antes que os barcos de pesca retornassem através da neblina.",
      "Ela serviu uma xícara de chá, abriu a janela e observou o bairro acordar lentamente sob um céu pálido de manhã.",
      "As crianças construíram um pequeno castelo de areia perto da costa, rindo enquanto as ondas suaves se aproximavam aos poucos.",
    ],
    Hard: [
      "Apesar do clima imprevisível, os botânicos catalogaram cuidadosamente cada espécie desconhecida, comparando suas observações com décadas de pesquisas arquivadas antes de tirar conclusões.",
      "As negociações continuaram até tarde da noite, enquanto ambas as delegações lutavam para conciliar suas prioridades conflitantes sem abandonar compromissos anteriores.",
      "A construção da ponte exigiu que os engenheiros considerassem marés variáveis, ventos imprevisíveis e os delicados padrões migratórios da vida selvagem ao redor.",
    ],
    Extreme: [
      "A decisão sem precedentes do comitê de realocar fundos de infraestrutura municipal gerou considerável controvérsia entre os moradores, especialmente aqueles que sentiram que os compromissos de revitalização do bairro não foram suficientemente priorizados.",
      "Os economistas permanecem divididos sobre se o marco regulatório proposto conteria de fato a volatilidade especulativa ou simplesmente a deslocaria para mercados menos transparentes.",
      "A escavação arqueológica meticulosa revelou artefatos cuja procedência desafiou suposições antigas sobre as primeiras relações comerciais da região.",
    ],
  },
};

function pickPassage(d: Difficulty, language: SpeechLanguageCode): string {
  const options = PASSAGES[language][d];
  return options[Math.floor(Math.random() * options.length)];
}

// Maps our language codes to BCP-47 locale tags so the browser's speech synthesis voice
// actually matches the passage's language instead of reading everything as English.
const SPEECH_LOCALE: Record<SpeechLanguageCode, string> = {
  en: "en-US",
  es: "es-ES",
  fr: "fr-FR",
  de: "de-DE",
  hi: "hi-IN",
  zh: "zh-CN",
  ar: "ar-SA",
  pt: "pt-BR",
};

type Stage = "idle" | "recording" | "done";

export default function Speech() {
  const [language, setLanguage] = useState<SpeechLanguageCode>("en");
  const [difficulty, setDifficultyState] = useState<Difficulty>("Easy");
  const [passage, setPassage] = useState(() => pickPassage("Easy", "en"));

  function setDifficulty(d: Difficulty) {
    setDifficultyState(d);
    setPassage(pickPassage(d, language));
  }
  function changeLanguage(l: SpeechLanguageCode) {
    setLanguage(l);
    setPassage(pickPassage(difficulty, l));
  }
  const [speaking, setSpeaking] = useState(false);
  function speakPassage() {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(passage);
    utter.lang = SPEECH_LOCALE[language];
    utter.rate = 0.92;
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utter);
  }
  const [stage, setStage] = useState<Stage>("idle");
  const [seconds, setSeconds] = useState(0);
  const [metrics, setMetrics] = useState<SpeechMetrics | null>(null);
  const [geminiAnalysis, setGeminiAnalysis] = useState<GeminiSpeechAnalysis | null>(null);
  const [probability, setProbability] = useState(0);
  const [band, setBand] = useState<Band>("typical");
  const [prevProbability] = useState<number | undefined>(() => {
    const prior = getHistory().filter((h) => h.modality === "speech");
    return prior.length ? prior[prior.length - 1].probability : undefined;
  });
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [levels, setLevels] = useState<number[]>(Array(24).fill(0));
  const [apiKey, setApiKeyState] = useState(getGeminiKey());
  const lastBlobRef = useRef<Blob | null>(null);
  const stopResolveRef = useRef<(() => void) | null>(null);

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
        lastBlobRef.current = blob;
        setAudioUrl(URL.createObjectURL(blob));
        stopResolveRef.current?.();
        stopResolveRef.current = null;
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

  async function stopRecording() {
    cancelAnimationFrame(rafRef.current);
    clearInterval(timerRef.current);

    const durationSec = (Date.now() - startTimeRef.current) / 1000;
    const samples = samplesRef.current;

    // Wait for the MediaRecorder's onstop event to actually fire and populate the blob,
    // instead of guessing at a fixed delay - a slow device or a big recording could otherwise
    // leave lastBlobRef pointing at stale or missing audio by the time we read it.
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      const stopped = new Promise<void>((resolve) => {
        stopResolveRef.current = resolve;
      });
      recorder.stop();
      await stopped;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current?.close();

    if (samples.length < 8 || durationSec < 1.5) {
      setError("That recording was too short - please try again and read the whole passage.");
      setStage("idle");
      return;
    }

    if (apiKey && lastBlobRef.current) {
      setBusy(true);
      const result = await analyzeSpeechAudio(lastBlobRef.current, apiKey, passage, language);
      setBusy(false);
      if (result.ok === false) {
        setError(result.reason);
        setStage("idle");
        setLevels(Array(24).fill(0));
        return;
      }
      const p = probabilityFromGeminiSpeechAnalysis(result.analysis);
      const b = bandFor(p);
      setGeminiAnalysis(result.analysis);
      setMetrics(null);
      setProbability(p);
      setBand(b);
      addHistoryEntry({ modality: "speech", probability: p, band: b, metrics: result.analysis });
      markDailyActivity("speech");
      setStage("done");
      setLevels(Array(24).fill(0));
      return;
    }

    const m = computeSpeechMetrics(samples, durationSec);
    const p = probabilityFromSpeechMetrics(m);
    const b = bandFor(p);
    setMetrics(m);
    setGeminiAnalysis(null);
    setProbability(p);
    setBand(b);
    addHistoryEntry({ modality: "speech", probability: p, band: b, metrics: m });
    markDailyActivity("speech");
    setStage("done");
    setLevels(Array(24).fill(0));
  }

  /** Runs an uploaded audio file through real analysis - Gemini's strict speech evaluation when
   *  an API key is set (the same accuracy bar as a live recording), or the same RMS-envelope
   *  metrics used for live recordings otherwise. No shortcuts or made-up numbers either way. */
  async function analyzeUploadedAudio(file: File) {
    setError("");
    setGeminiAnalysis(null);

    if (apiKey) {
      setBusy(true);
      const result = await analyzeSpeechAudio(file, apiKey, passage, language);
      setBusy(false);
      if (result.ok === false) {
        setError(result.reason);
        return;
      }
      const p = probabilityFromGeminiSpeechAnalysis(result.analysis);
      const b = bandFor(p);
      setGeminiAnalysis(result.analysis);
      setMetrics(null);
      setProbability(p);
      setBand(b);
      setAudioUrl(URL.createObjectURL(file));
      addHistoryEntry({ modality: "speech", probability: p, band: b, metrics: result.analysis });
      markDailyActivity("speech");
      setStage("done");
      return;
    }

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
            <div style={{ opacity: busy ? 0.5 : 1, pointerEvents: busy ? "none" : "auto" }}>
              <div style={{ marginBottom: 18 }}>
                <div style={{ textAlign: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: "var(--text-soft)", fontWeight: 600 }}>Difficulty</span>
                </div>
                <DifficultySelector value={difficulty} onChange={setDifficulty} />
              </div>

              <div style={{ marginBottom: 18 }}>
                <div style={{ textAlign: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: "var(--text-soft)", fontWeight: 600 }}>Language</span>
                </div>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <select
                    value={language}
                    onChange={(e) => changeLanguage(e.target.value as SpeechLanguageCode)}
                    disabled={busy}
                    style={{
                      padding: "8px 14px",
                      borderRadius: 999,
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                      color: "var(--text)",
                      fontSize: 13.5,
                      fontWeight: 600,
                    }}
                  >
                    {SPEECH_LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="field" style={{ marginBottom: 18, maxWidth: 360, marginLeft: "auto", marginRight: "auto" }}>
                <label>Gemini API key (for real, strict AI scoring)</label>
                <input
                  value={apiKey}
                  disabled={busy}
                  onChange={(e) => {
                    setApiKeyState(e.target.value);
                    setGeminiKey(e.target.value);
                  }}
                  placeholder="Paste your key"
                />
                <p className="text-text-soft" style={{ fontSize: 12, marginTop: 6 }}>
                  {apiKey
                    ? "Your recording is transcribed and scored by AI - a strict reading, not a lenient one."
                    : "Without a key, scoring falls back to a local pause/volume estimate instead of real transcription."}
                </p>
              </div>
            </div>
          )}

          <div
            className="card"
            style={{ padding: "20px 22px", background: "var(--bg)", fontSize: 17, lineHeight: 1.6, marginBottom: 10 }}
          >
            "{passage}"
          </div>

          {stage === "idle" && "speechSynthesis" in window && (
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={speakPassage}
                disabled={speaking}
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <Volume2 size={14} />
                {speaking ? "Playing…" : "Listen to passage"}
              </button>
            </div>
          )}

          {error && <div style={{ color: "var(--text)", fontWeight: 700, fontSize: 13.5, marginBottom: 16, borderLeft: "3px solid var(--text)", paddingLeft: 10 }}>{error}</div>}

          {stage !== "done" && (
            <div style={{ textAlign: "center", opacity: busy ? 0.5 : 1, pointerEvents: busy ? "none" : "auto" }}>
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

          {busy && stage !== "done" && (
            <p className="text-text-soft" style={{ textAlign: "center", fontSize: 13.5, marginTop: 14 }}>
              Analyzing with AI…
            </p>
          )}

          {stage === "done" && (metrics || geminiAnalysis) && (
            <div>
              <ScoreBlock
                probability={probability}
                band={band}
                modality="Speech test"
                age={(() => {
                  const u = getUser();
                  return u ? getUserProfile(u.username).age : undefined;
                })()}
                previousProbability={prevProbability}
              />
              {metrics && !geminiAnalysis && (
                <BreakdownGrid
                  items={[
                    { value: `${metrics.estWordsPerMin} wpm`, label: "How fast you spoke", note: "Words per minute - most people fall between 110–160." },
                    { value: `${Math.round(metrics.silenceRatio * 100)}%`, label: "Quiet time", note: "How much of the recording had no speech in it." },
                    { value: `${metrics.pauseCount}`, label: "Longer pauses", note: "Pauses lasting more than a quarter-second." },
                    { value: `${metrics.durationSec.toFixed(1)}s`, label: "Total time", note: "How long your recording lasted." },
                  ]}
                />
              )}
              {geminiAnalysis && (
                <BreakdownGrid
                  items={[
                    { value: `${geminiAnalysis.fluency}/100`, label: "Fluency", note: "How smooth and natural your delivery sounded." },
                    { value: `${geminiAnalysis.pauseSeverity}/100`, label: "Pause severity", note: "How long and frequent your pauses were (higher = more concerning)." },
                    { value: `${geminiAnalysis.wordFindingDifficulty}/100`, label: "Word-finding difficulty", note: "Hesitation, false starts, or searching for words." },
                    { value: `${geminiAnalysis.coherence}/100`, label: "Coherence", note: "How clear and on-topic your speech was." },
                  ]}
                />
              )}
              {geminiAnalysis?.transcription && (
                <p className="text-text-soft" style={{ fontSize: 13, marginTop: 10, fontStyle: "italic" }}>
                  We heard: "{geminiAnalysis.transcription}"
                </p>
              )}
              {geminiAnalysis?.notes && (
                <p className="text-text-soft" style={{ fontSize: 13.5, marginTop: 6 }}>{geminiAnalysis.notes}</p>
              )}
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
                    setGeminiAnalysis(null);
                    setAudioUrl(null);
                    setPassage(pickPassage(difficulty, language));
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
