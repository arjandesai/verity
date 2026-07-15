import * as React from "react";
import { Link } from "react-router-dom";
import { HeartHandshake, Phone, Stethoscope, BookOpenCheck, Users, ExternalLink } from "lucide-react";
import { RevealOnScroll } from "@/components/RevealOnScroll";

interface ResourceLink {
  title: string;
  org: string;
  description: string;
  url: string;
}

const HELPLINES: ResourceLink[] = [
  {
    title: "24/7 Helpline",
    org: "Alzheimer's Association",
    description: "Free, confidential care and support for people living with Alzheimer's, their families, and caregivers, in over 200 languages.",
    url: "https://www.alz.org/help-support/resources/helpline",
  },
  {
    title: "Dementia Helpline",
    org: "Alzheimer's Society (UK)",
    description: "Support and information for anyone affected by dementia in the UK.",
    url: "https://www.alzheimers.org.uk/get-support/dementia-connect-support-line",
  },
];

const LEARN: ResourceLink[] = [
  {
    title: "10 Early Signs and Symptoms",
    org: "Alzheimer's Association",
    description: "A plain-language checklist of the early warning signs, and how they differ from normal age-related changes.",
    url: "https://www.alz.org/alzheimers-dementia/10_signs",
  },
  {
    title: "Facts and Figures Report",
    org: "Alzheimer's Association",
    description: "The latest annual statistics on prevalence, diagnosis rates, caregiving, and costs.",
    url: "https://www.alz.org/alzheimers-dementia/facts-figures",
  },
  {
    title: "Preparing for a Doctor's Visit",
    org: "National Institute on Aging",
    description: "How to describe symptoms clearly, what questions to expect, and what to bring with you.",
    url: "https://www.nia.nih.gov/health/alzheimers-and-dementia/talking-your-doctor-about-memory-problems",
  },
];

const CAREGIVING: ResourceLink[] = [
  {
    title: "Caregiver Center",
    org: "Alzheimer's Association",
    description: "Guidance on daily care, safety, communication, and looking after your own wellbeing as a caregiver.",
    url: "https://www.alz.org/help-support/caregiving",
  },
  {
    title: "Family Caregiver Alliance",
    org: "FCA",
    description: "Practical tools, support groups, and policy resources for family caregivers.",
    url: "https://www.caregiver.org/",
  },
];

function Section({ icon, title, blurb, links }: { icon: React.ReactNode; title: string; blurb: string; links: ResourceLink[] }) {
  return (
    <div style={{ marginBottom: 34 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        {icon}
        <h2 style={{ fontSize: 19, fontWeight: 800 }}>{title}</h2>
      </div>
      <p className="text-text-soft" style={{ fontSize: 13.5, marginBottom: 14 }}>
        {blurb}
      </p>
      <div className="flex flex-col gap-3">
        {links.map((l) => (
          <a
            key={l.url}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            className="card"
            style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, color: "inherit" }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 14.5 }}>{l.title}</div>
              <div style={{ fontSize: 12, color: "var(--text-soft)", margin: "2px 0 6px" }}>{l.org}</div>
              <div style={{ fontSize: 13, lineHeight: 1.5 }}>{l.description}</div>
            </div>
            <ExternalLink size={15} style={{ flexShrink: 0, marginTop: 3, color: "var(--text-soft)" }} />
          </a>
        ))}
      </div>
    </div>
  );
}

/** A curated jumping-off point for real support - Verity's own screening tests are only useful
 *  as a first pass, so this page exists to point people toward actual helplines, caregiving
 *  guidance, and how to prepare for a real doctor's appointment, rather than leaving a concerning
 *  result with nowhere to go. */
export default function Resources() {
  return (
    <div className="container" style={{ paddingTop: 56, paddingBottom: 120, maxWidth: 720 }}>
      <RevealOnScroll>
        <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 6 }}>Resources</h1>
        <p className="text-text-soft" style={{ marginBottom: 30, lineHeight: 1.6 }}>
          Verity is a screening tool, not a diagnosis, and it isn't a substitute for real support. If a result has you
          concerned - or you're supporting someone who is - here are places with actual expertise to go next.
        </p>
      </RevealOnScroll>

      <RevealOnScroll delay={0.05}>
        <div className="card" style={{ padding: 20, marginBottom: 30, display: "flex", gap: 14, alignItems: "flex-start" }}>
          <Stethoscope size={22} style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>
            If you got a "several signs worth discussing" result on a Verity test, the single most useful next step is a
            conversation with a doctor, not another screening tool. Bring your{" "}
            <Link to="/dashboard" style={{ textDecoration: "underline" }}>
              dashboard history
            </Link>{" "}
            or a copied result summary with you - it gives them something concrete to start from.
          </div>
        </div>
      </RevealOnScroll>

      <RevealOnScroll delay={0.1}>
        <Section
          icon={<Phone size={20} />}
          title="Talk to someone now"
          blurb="Free helplines staffed by people who understand dementia and Alzheimer's - not an emergency service, but a real person to talk to."
          links={HELPLINES}
        />
      </RevealOnScroll>

      <RevealOnScroll delay={0.15}>
        <Section
          icon={<BookOpenCheck size={20} />}
          title="Learn more"
          blurb="Clear, non-alarmist information on symptoms, diagnosis, and what a doctor's visit actually involves."
          links={LEARN}
        />
      </RevealOnScroll>

      <RevealOnScroll delay={0.2}>
        <Section
          icon={<Users size={20} />}
          title="Caregiving support"
          blurb="For family members and caregivers - practical guidance, and support for your own wellbeing too."
          links={CAREGIVING}
        />
      </RevealOnScroll>

      <RevealOnScroll delay={0.25}>
        <div className="card" style={{ padding: 20, display: "flex", gap: 14, alignItems: "flex-start" }}>
          <HeartHandshake size={22} style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>
            Keeping a{" "}
            <Link to="/journal" style={{ textDecoration: "underline" }}>
              daily journal
            </Link>{" "}
            of how you're feeling, alongside your test results, can make these conversations easier - patterns are
            often clearer looking back than they are day to day.
          </div>
        </div>
      </RevealOnScroll>
    </div>
  );
}
