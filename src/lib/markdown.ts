import {
  profile,
  chapters,
  capabilityGroups,
  education,
  certifications,
  awardsFractal,
  awardsExternal,
  publications,
  type Project,
  type ProjectBlock,
  type ProjectSection,
} from "@/data/content";
import { SITE_URL, caseStudies, sideProjects, getCaseStudy, isGated, quickFacts } from "@/lib/site";

/* ──────────────────────────────────────────────────────────
   Markdown renderings of the portfolio, for AI agents and LLMs:
   /llms.txt, /llms-full.txt, and the .md twin of every page.
   Generated from the same content.ts as the OS and the HTML pages,
   and gated by the same isGated() rule — an NDA'd dossier never
   appears here either.
   ────────────────────────────────────────────────────────── */

const url = (path: string) => `${SITE_URL}${path}`;

function block(b: ProjectBlock): string {
  switch (b.kind) {
    case "para":
      return b.text;
    case "subhead":
      return `#### ${b.text}`;
    case "callout":
      return `> **${b.label}:** ${b.text}`;
    case "stats":
      return b.items.map((s) => `- **${s.value}** — ${s.label}${s.sub ? ` (${s.sub})` : ""}`).join("\n");
    case "pillars":
      return b.items.map((p) => `- **${p.title}** — ${p.sub}`).join("\n");
    case "list":
      return b.items.map((it) => `- ${it}`).join("\n");
    case "findings":
      return b.items.map((f) => `- **${f.label}.** ${f.text}`).join("\n");
  }
}

function dossier(sections: ProjectSection[]): string {
  return sections
    .map((s) => [`### ${titleCase(s.title)}`, ...s.blocks.map(block)].join("\n\n"))
    .join("\n\n");
}

// "THE SETUP" → "The Setup" — dossier titles are HUD-style caps in content.ts
function titleCase(s: string): string {
  return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ── One case study ── */
export function caseStudyMd(p: Project, { heading = "#" }: { heading?: "#" | "##" } = {}): string {
  const out: string[] = [];
  out.push(`${heading} ${p.name}`);
  out.push(`*${p.tagline}*`);
  const meta = [`Status: ${p.status}`, p.year, p.role].filter(Boolean).join(" · ");
  out.push(meta);
  out.push(`Canonical: ${url(`/work/${p.id}`)}`);
  out.push(p.description);

  if (p.intel?.length) {
    out.push(p.intel.map((s) => `- **${s.value}** — ${s.label}`).join("\n"));
  }

  if (isGated(p)) {
    out.push(`> **Under NDA — active engagement.** ${p.classified}`);
  } else {
    if (p.objectives?.length) {
      out.push(
        ["### Objectives", p.objectives.map((o) => `- [${o.done ? "x" : " "}] ${o.text}`).join("\n")].join("\n\n")
      );
    }
    if (p.dossier?.length) out.push(dossier(p.dossier));
    if (p.debrief) out.push(["### Debrief", p.debrief].join("\n\n"));
    if (p.classified) out.push(`> ${p.classified}`);
  }

  out.push(`Topics: ${p.tags.join(", ")}`);
  return out.join("\n\n");
}

/* ── /work ── */
export function workIndexMd(): string {
  return [
    `# Work — ${profile.name}`,
    "Case studies in AI and enterprise UX, plus side projects.",
    "## Case studies",
    caseStudies.map((p) => `- [${p.name}](${url(`/work/${p.id}.md`)}): ${p.tagline} ${p.description}`).join("\n"),
    "## Side projects",
    sideProjectsList(),
  ].join("\n\n");
}

function sideProjectsList(): string {
  return sideProjects
    .map((p) => `- ${p.github ? `[${p.name}](${p.github})` : p.name} (${p.status}, ${p.year}): ${p.description}`)
    .join("\n");
}

/* ── /about ── */
export function aboutMd(): string {
  const caps = Object.values(capabilityGroups)
    .flat()
    .map((c) => {
      const ev = c.evidence
        .map((e) => {
          const cs = e.projectId ? getCaseStudy(e.projectId) : undefined;
          const link = cs ? ` ([${cs.name}](${url(`/work/${cs.id}.md`)}))` : e.href ? ` ([source](${e.href}))` : "";
          return `  - **${e.signal}** — ${e.detail}${link}`;
        })
        .join("\n");
      return `- **${c.name}** — ${c.claim}\n${ev}`;
    })
    .join("\n");

  const experience = [...chapters]
    .reverse()
    .map((c) =>
      [
        `### ${titleCase(c.title)} (${c.period})`,
        ...[...c.missions].reverse().map((m) =>
          [
            `#### ${m.role}`,
            `${m.period} · ${m.location}`,
            m.objectives.map((o) => `- ${o.text}`).join("\n"),
            m.weapons.length ? `Skills: ${m.weapons.join(", ")}` : "",
          ]
            .filter(Boolean)
            .join("\n\n")
        ),
      ].join("\n\n")
    )
    .join("\n\n");

  return [
    `# ${profile.name} — ${profile.designation}`,
    `${profile.tagline} · ${profile.location}`,
    profile.bio,
    "## Quick facts",
    quickFacts.map((f) => `- ${f}`).join("\n"),
    "## Capabilities, with evidence",
    caps,
    "## Experience",
    experience,
    "## Education",
    `${education.degree} — ${education.institution} (${education.period}), CGPA ${education.cgpa}`,
    "## Commendations",
    [...awardsFractal, ...awardsExternal].map((a) => `- ${a.title} (${a.year})`).join("\n"),
    "## Writing",
    publications.map((p) => `- ${p.href ? `[${p.title}](${p.href})` : p.title} — ${p.venue}`).join("\n"),
    "## Certifications",
    certifications.map((c) => `- ${c.title} — ${c.org}`).join("\n"),
    "## Contact",
    contactLines(),
  ].join("\n\n");
}

/* ── / ── */
export function homeMd(): string {
  return [
    `# ${profile.name} — ${profile.designation}`,
    profile.bioShort,
    `This is the plain-text view of ${url("/")}, an interactive OS-themed portfolio ("KR//OS"). The same content as readable pages:`,
    [
      `- [Work — case studies](${url("/work.md")})`,
      ...caseStudies.map((p) => `  - [${p.name}](${url(`/work/${p.id}.md`)}): ${p.tagline}`),
      `- [About, experience & capabilities](${url("/about.md")})`,
      `- [Resume (PDF)](${url("/Kaustav_Roy_CV.pdf")})`,
    ].join("\n"),
    "## Quick facts",
    quickFacts.map((f) => `- ${f}`).join("\n"),
  ].join("\n\n");
}

function contactLines(): string {
  return [
    `- Email: ${profile.social.email}`,
    `- LinkedIn: ${profile.social.linkedin}`,
    `- Medium: ${profile.social.medium}`,
    `- GitHub: https://github.com/kaustavr19`,
    `- Resume (PDF): ${url("/Kaustav_Roy_CV.pdf")}`,
  ].join("\n");
}

/* ── /llms.txt — the llmstxt.org shape: H1, blockquote summary, then
   H2 sections of annotated links. Concise by design; the full text is
   in /llms-full.txt. ── */
export function llmsTxt(): string {
  return [
    `# ${profile.name}`,
    `> ${profile.designation} at Fractal Analytics (Bengaluru, India) designing AI-powered enterprise products — explainable AI, human-in-the-loop decisioning, enterprise UX and design systems. Featured at Google I/O 2024.`,
    `This site is an interactive, OS-themed portfolio. Every page also has a Markdown version (append \`.md\` to the URL, or send \`Accept: text/markdown\`). The complete portfolio as one document is at ${url("/llms-full.txt")}.`,
    "## Quick facts",
    quickFacts.map((f) => `- ${f}`).join("\n"),
    "## Case studies",
    caseStudies.map((p) => `- [${p.name}](${url(`/work/${p.id}.md`)}): ${p.description}`).join("\n"),
    "## Profile",
    [
      `- [About, experience & capabilities](${url("/about.md")}): bio, roles at Fractal and Eugenie.ai, evidence-linked capabilities, awards, education`,
      `- [All work](${url("/work.md")}): case studies and side projects`,
      `- [Resume (PDF)](${url("/Kaustav_Roy_CV.pdf")})`,
    ].join("\n"),
    "## Contact",
    contactLines(),
    "## Optional",
    sideProjects.map((p) => `- ${p.github ? `[${p.name}](${p.github})` : p.name}: ${p.tagline}`).join("\n"),
  ].join("\n\n");
}

/* ── /llms-full.txt — everything public, one document. ── */
export function llmsFullTxt(): string {
  return [
    aboutMd(),
    "---",
    "# Case studies",
    ...caseStudies.map((p) => caseStudyMd(p, { heading: "##" })),
    "---",
    "# Side projects",
    sideProjectsList(),
  ].join("\n\n");
}

/* ── Path → markdown, for the /md/[...path] route ── */
export function markdownFor(path: string[]): string | null {
  const key = path.join("/");
  if (key === "index") return homeMd();
  if (key === "about") return aboutMd();
  if (key === "work") return workIndexMd();
  if (path.length === 2 && path[0] === "work") {
    const p = getCaseStudy(path[1]);
    return p ? caseStudyMd(p) : null;
  }
  return null;
}

export const markdownPaths: string[][] = [["index"], ["about"], ["work"], ...caseStudies.map((p) => ["work", p.id])];

/* The HTML page a markdown twin duplicates — sent as a canonical Link header
   so search engines index the page, not the .md copy. */
export function htmlPathFor(path: string[]): string {
  const key = path.join("/");
  return key === "index" ? "/" : `/${key}`;
}

export function markdownResponse(body: string, htmlPath: string): Response {
  return new Response(body.trim() + "\n", {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      Vary: "Accept",
      Link: `<${url(htmlPath)}>; rel="canonical"`,
    },
  });
}
