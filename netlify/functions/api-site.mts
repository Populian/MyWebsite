import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { siteConfig } from "../../db/schema.js";
import { eq } from "drizzle-orm";

const DEFAULTS: Record<string, unknown> = {
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
  if (req.method === "GET") {
    const rows = await db.select().from(siteConfig);
    const config: Record<string, unknown> = { ...DEFAULTS };
    for (const row of rows) {
      try {
        config[row.configKey] = JSON.parse(row.configValue || "{}");
      } catch {
        config[row.configKey] = row.configValue;
      }
    }
    return Response.json(config);
  }

  if (req.method === "POST") {
    const body = await req.json();
    const results: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(body)) {
      const jsonValue = JSON.stringify(value);
      const existing = await db.select().from(siteConfig).where(eq(siteConfig.configKey, key));
      if (existing.length > 0) {
        await db.update(siteConfig).set({ configValue: jsonValue, updatedAt: new Date() }).where(eq(siteConfig.configKey, key));
      } else {
        await db.insert(siteConfig).values({ configKey: key, configValue: jsonValue });
      }
      results[key] = value;
    }
    return Response.json({ success: true, updated: results });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: "/api/site",
};
