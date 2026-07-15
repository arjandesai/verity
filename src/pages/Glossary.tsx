import * as React from "react";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { RevealOnScroll } from "@/components/RevealOnScroll";

const TERMS: { term: string; def: string }[] = [
  { term: "Alzheimer's disease", def: "The most common cause of dementia, a progressive brain disease linked to a build-up of amyloid plaques and tau protein tangles that damage neural pathways over time." },
  { term: "Dementia", def: "An umbrella term for a decline in memory, thinking, and reasoning severe enough to interfere with daily life. Alzheimer's is the most common cause, but not the only one." },
  { term: "Mild cognitive impairment (MCI)", def: "A noticeable but relatively mild decline in cognitive ability that's greater than expected for someone's age, but doesn't yet interfere significantly with daily independence. Not everyone with MCI develops dementia." },
  { term: "Amyloid plaques", def: "Clumps of a protein fragment (beta-amyloid) that build up between neurons in Alzheimer's disease, thought to disrupt cell-to-cell communication." },
  { term: "Tau tangles", def: "Twisted fibers of a protein called tau that build up inside neurons in Alzheimer's disease, disrupting the cell's internal transport system." },
  { term: "Cognitive reserve", def: "The brain's built-up resilience to damage, shaped by education, mentally engaging activity, and lifestyle - higher reserve is linked to delayed onset of noticeable symptoms." },
  { term: "Biomarker", def: "A measurable biological or behavioral signal used as an indicator of a disease process - speech pacing and handwriting steadiness, as used in Verity, are examples of behavioral biomarkers." },
  { term: "Neuropsychological test", def: "A structured task used to assess specific cognitive abilities, such as memory, attention, or processing speed - the Trail Making game in Verity is a digital version of a real clinical test of this kind." },
  { term: "Early-onset Alzheimer's", def: "Alzheimer's disease that develops before age 65 - less common, but not rare, and often takes longer to diagnose because it isn't the first suspicion in a younger person." },
  { term: "Caregiver burden", def: "The physical, emotional, and financial strain experienced by those caring for someone with a cognitive condition - a real and well-documented factor in its own right." },
  { term: "Lecanemab / donanemab", def: "Newer disease-modifying drugs that target and help clear amyloid plaques, approved for use in early-stage Alzheimer's - a shift from older drugs that only manage symptoms." },
  { term: "Processing speed", def: "How quickly a person can take in information and respond to it - often one of the earliest cognitive domains affected by age-related and disease-related decline." },
  { term: "Executive function", def: "A set of higher-level cognitive skills including planning, organizing, and shifting between tasks, commonly assessed with tasks like Trail Making." },
  { term: "Screening tool", def: "A quick, low-risk check for early signs of a condition, meant to flag who might benefit from a full clinical evaluation - not a diagnosis on its own, which is exactly how Verity is meant to be used." },
];

/** A short glossary of the terms used elsewhere on the site (Research, Resources, the CREST
 *  report) - written in plain language so someone without a clinical background can look
 *  something up without leaving Verity. */
export default function Glossary() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TERMS;
    return TERMS.filter((t) => t.term.toLowerCase().includes(q) || t.def.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="container" style={{ paddingTop: 56, paddingBottom: 120, maxWidth: 680 }}>
      <RevealOnScroll>
        <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 6 }}>Glossary</h1>
        <p className="text-text-soft" style={{ marginBottom: 24 }}>
          Plain-language definitions for terms used across Verity and its research.
        </p>
      </RevealOnScroll>

      <RevealOnScroll delay={0.05}>
        <div style={{ position: "relative", marginBottom: 24 }}>
          <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-soft)" }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search terms..."
            style={{
              width: "100%",
              padding: "11px 14px 11px 38px",
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--bg)",
              color: "var(--text)",
              fontSize: 14,
            }}
          />
        </div>
      </RevealOnScroll>

      <RevealOnScroll delay={0.1}>
        {!filtered.length ? (
          <div className="card" style={{ padding: 30, textAlign: "center" }}>
            <p className="text-text-soft">No terms match "{query}".</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((t) => (
              <div key={t.term} className="card" style={{ padding: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 6 }}>{t.term}</div>
                <div style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--text-soft)" }}>{t.def}</div>
              </div>
            ))}
          </div>
        )}
      </RevealOnScroll>
    </div>
  );
}
