import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { works, siteConfig, scheduleEvents } from "../../db/schema.js";

const SEED_WORKS = [
  {
    title: "1/2",
    year: 2025,
    category: "Interactive Systems",
    medium: "Interactive music for MediaPipe and Max/MSP",
    description: "An interactive electronic performance work situated between physical presence and digital mediation.",
    festivalSelections: "NYCEMF 2026; selected for SEAMUS 2026",
    featured: true,
    sortOrder: 1,
  },
  {
    title: "A Voice Intolerable to Heaven and Earth",
    year: 2025,
    category: "Electroacoustic",
    medium: "Fixed media electroacoustic composition",
    description: "A multi-section electroacoustic composition exploring electrostatics, imbalance, and sonic reconstruction.",
    festivalSelections: "University of Oregon premiere; CCMC Kyoto; ICMC Hamburg 2026; NYCEMF 2026; selected for SEAMUS 2026",
    featured: true,
    sortOrder: 2,
  },
  {
    title: "Sensitive Bounce",
    year: 2024,
    category: "Interactive Systems",
    medium: "Interactive electroacoustics and modern dance",
    description: "Interactive electroacoustic work combining audio reactivity and modern dance.",
    festivalSelections: "Xi'an Conservatory of Music; CCF China Computer Art Conference 2025",
    featured: false,
    sortOrder: 3,
  },
];

const SEED_SITE = {
  hero: {
    displayName: "Faming Qin",
    alias: "Populian",
    subtitle: "Electroacoustic Composer · Interactive Media Artist · Music Technology Researcher",
    statement: "Faming Qin, also known as Populian, is an electroacoustic composer, interactive media artist, and music technology researcher based in Xi'an, China. His work focuses on electroacoustic composition, real-time interaction, algorithmic sound systems, and the expressive relationship between physical gesture and digital mediation.",
    heroImage: "",
    portraitImage: "",
    featuredWorkIds: [],
  },
  about: {
    biography: "Faming Qin, also known as Populian, is an electroacoustic composer, interactive media artist, and music technology researcher based in Xi'an, China. His work focuses on electroacoustic composition, real-time interaction, algorithmic sound systems, and the expressive relationship between physical gesture and digital mediation.",
    education: [
      { institution: "Xi'an Conservatory of Music", degree: "Bachelor of Music in Electroacoustic Composition", years: "2023–Present" },
      { institution: "University of Oregon – Future Music Oregon Summer Academy", degree: "Kyma System Coursework", years: "" },
    ],
    skills: ["Max/MSP", "Ableton Live", "Kyma", "Logic Pro", "Pro Tools", "VCV Rack", "Python", "Interactive Media", "AI + Music Systems", "Sound Design"],
    awards: [
      "ICMC 2026 Selection",
      "SEAMUS 2026 Selection",
      "CCMC Futura Award",
      "China Collegiate Computing Competition Third Prize",
      "Excellent Award, China Creative Design Competition – Digital Soundscape Category",
      "National Endeavor Scholarship",
      "University Scholarship, Xi'an Conservatory of Music",
      "Outstanding Student Award, Xi'an Conservatory of Music",
    ],
    researchInterests: [
      "Neural-driven audio systems",
      "Real-time music interaction",
      "Network music performance",
      "Algorithmic music systems",
      "Human-computer interaction in music",
      "Interactive electroacoustic performance",
    ],
    artisticStatement: "My artistic practice explores the boundaries between physical gesture and digital mediation, seeking to create works where technology becomes an extension of human expression rather than a replacement for it.",
    aliasExplanation: "Populian is my creative identity — a name that bridges my work across electroacoustic composition, interactive media, and experimental sound design.",
  },
  contact: {
    email: "populianmusic@gmail.com",
    socialLinks: { instagram: "", soundcloud: "", youtube: "", github: "" },
    cvPdfUrl: "",
    shortBio: "Faming Qin, also known as Populian, is an electroacoustic composer, interactive media artist, and music technology researcher based in Xi'an, China.",
    longBio: "Faming Qin, also known as Populian, is an electroacoustic composer, interactive media artist, and music technology researcher based in Xi'an, China. His work focuses on electroacoustic composition, real-time interaction, algorithmic sound systems, and the expressive relationship between physical gesture and digital mediation.",
    pressPhotoUrl: "",
    displayName: "Populian Faming Qin",
    alias: "Faming Qin",
  },
};

export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const existingWorks = await db.select().from(works);
  if (existingWorks.length > 0) {
    return Response.json({ message: "Data already exists. Use force=true to overwrite.", seeded: false });
  }

  for (const w of SEED_WORKS) {
    await db.insert(works).values(w);
  }

  for (const [key, value] of Object.entries(SEED_SITE)) {
    await db.insert(siteConfig).values({
      configKey: key,
      configValue: JSON.stringify(value),
    });
  }

  return Response.json({ success: true, seeded: true, works: SEED_WORKS.length, configs: Object.keys(SEED_SITE).length });
};

export const config: Config = {
  path: "/api/seed",
};
