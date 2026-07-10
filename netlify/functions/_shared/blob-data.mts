import { getStore } from "@netlify/blobs";
import { readFile } from "node:fs/promises";

type JsonRecord = Record<string, any>;

export type PortfolioData = {
  works: JsonRecord[];
  site: JsonRecord;
  schedule: JsonRecord[];
  media: JsonRecord[];
};

const STORE_NAME = "site-data";
const DATA_KEY = "portfolio-data.json";
const BACKUP_PREFIX = "backups/";

const DEFAULT_SITE: JsonRecord = {
  hero: {
    displayName: "Populian",
    alias: "Faming Qin",
    subtitle: "Electroacoustic Composer - Interactive Media Artist - Music Technology Researcher",
    statement: "Faming Qin, also known as Populian, is an electroacoustic composer, interactive media artist, and music technology researcher based in Xi'an, China.",
    heroImage: "",
    portraitImage: "",
    featuredWorkIds: [],
  },
  about: {
    biography: "",
    education: [],
    skills: [],
    awards: [],
    researchInterests: [],
    artisticStatement: "",
    aliasExplanation: "",
  },
  contact: {
    email: "populianmusic@gmail.com",
    socialLinks: { instagram: "", soundcloud: "", youtube: "", github: "", bilibili: "" },
    cvPdfUrl: "",
    shortBio: "",
    longBio: "",
    pressPhotoUrl: "",
    displayName: "Populian Faming Qin",
    alias: "Faming Qin",
  },
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function dataStore() {
  return getStore({ name: STORE_NAME, consistency: "strong" });
}

function parseJson(value: unknown, fallback: any) {
  if (Array.isArray(value) || (value && typeof value === "object")) return value;
  if (typeof value !== "string" || value.trim() === "") return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function normalizeImageUrl(url: unknown) {
  if (!url || typeof url !== "string") return "";
  const stripped = url.replace(/^https?:\/\/localhost:\d+\/uploads\//, "/uploads/");
  if (stripped && !["http://", "https://", "/"].some((prefix) => stripped.startsWith(prefix))) {
    return "/uploads/" + stripped;
  }
  return stripped;
}

function normalizeWork(work: JsonRecord): JsonRecord {
  const next: JsonRecord = { ...work };
  const aliases: [string, string][] = [
    ["programNote", "program_note"],
    ["premiereInfo", "premiere_info"],
    ["festivalSelections", "festival_selections"],
    ["youtubeUrl", "youtube_url"],
    ["soundcloudUrl", "soundcloud_url"],
    ["audioUrl", "audio_url"],
    ["scorePdfUrl", "score_pdf_url"],
    ["coverImage", "cover_image"],
    ["galleryImages", "gallery_images"],
    ["sortOrder", "sort_order"],
  ];

  for (const [camel, snake] of aliases) {
    if (next[camel] == null && next[snake] != null) next[camel] = next[snake];
    if (next[snake] == null && next[camel] != null) next[snake] = next[camel];
  }

  if (next.id != null && next.id !== "") next.id = Number(next.id);
  if (next.year != null && next.year !== "") next.year = Number.parseInt(String(next.year), 10);
  else next.year = null;

  next.tags = parseJson(next.tags, []);
  if (!Array.isArray(next.tags)) next.tags = [];
  next.galleryImages = parseJson(next.galleryImages, parseJson(next.gallery_images, []));
  if (!Array.isArray(next.galleryImages)) next.galleryImages = [];
  next.gallery_images = JSON.stringify(next.galleryImages);
  next.coverImage = normalizeImageUrl(next.coverImage);
  next.cover_image = normalizeImageUrl(next.cover_image || next.coverImage);
  next.featured = Boolean(next.featured);
  next.sortOrder = Number(next.sortOrder ?? next.sort_order ?? 0);
  next.sort_order = next.sortOrder;
  return next;
}

function normalizeScheduleEvent(event: JsonRecord): JsonRecord {
  const next: JsonRecord = { ...event };
  if (next.id != null && next.id !== "") next.id = Number(next.id);
  if (next.eventDate == null && next.event_date != null) next.eventDate = next.event_date;
  if (next.event_date == null && next.eventDate != null) next.event_date = next.eventDate;
  if (next.cityCountry == null && next.city_country != null) next.cityCountry = next.city_country;
  if (next.city_country == null && next.cityCountry != null) next.city_country = next.cityCountry;
  if (next.workPerformed == null && next.work_performed != null) next.workPerformed = next.work_performed;
  if (next.work_performed == null && next.workPerformed != null) next.work_performed = next.workPerformed;
  return next;
}

function normalizeSite(site: JsonRecord): JsonRecord {
  const next = {
    hero: { ...clone(DEFAULT_SITE.hero), ...(site?.hero || {}) },
    about: { ...clone(DEFAULT_SITE.about), ...(site?.about || {}) },
    contact: { ...clone(DEFAULT_SITE.contact), ...(site?.contact || {}) },
  };
  next.hero.heroImage = normalizeImageUrl(next.hero.heroImage || next.hero.hero_image);
  next.hero.hero_image = next.hero.heroImage;
  next.hero.portraitImage = normalizeImageUrl(next.hero.portraitImage || next.hero.portrait_image);
  next.hero.portrait_image = next.hero.portraitImage;
  next.contact.pressPhotoUrl = normalizeImageUrl(next.contact.pressPhotoUrl);
  return next;
}

export function normalizeData(data: Partial<PortfolioData> | JsonRecord | null | undefined): PortfolioData {
  const source = data && typeof data === "object" ? data : {};
  return {
    works: Array.isArray(source.works) ? source.works.map(normalizeWork) : [],
    site: normalizeSite(source.site || {}),
    schedule: Array.isArray(source.schedule) ? source.schedule.map(normalizeScheduleEvent) : [],
    media: Array.isArray(source.media) ? source.media : [],
  };
}

function hasUsefulData(data: Partial<PortfolioData> | null | undefined) {
  return Boolean(
    data &&
      ((Array.isArray(data.works) && data.works.length > 0) ||
        (Array.isArray(data.schedule) && data.schedule.length > 0) ||
        (data.site && Object.keys(data.site).length > 0))
  );
}

export async function loadSeedData(): Promise<PortfolioData> {
  try {
    const raw = await readFile(new URL("../../../data.json", import.meta.url), "utf8");
    return normalizeData(JSON.parse(raw));
  } catch (error) {
    console.error("Failed to load data.json seed", error);
    return normalizeData({});
  }
}

async function loadDatabaseData(): Promise<PortfolioData | null> {
  try {
    const [{ db }, schema] = await Promise.all([
      import("../../../db/index.js"),
      import("../../../db/schema.js"),
    ]);
    const { scheduleEvents, siteConfig, works } = schema;
    const [workRows, siteRows, scheduleRows] = await Promise.all([
      db.select().from(works),
      db.select().from(siteConfig),
      db.select().from(scheduleEvents),
    ]);
    const site: JsonRecord = {};
    for (const row of siteRows as JsonRecord[]) {
      site[row.configKey] = parseJson(row.configValue, {});
    }
    const data = normalizeData({
      works: workRows as JsonRecord[],
      site,
      schedule: scheduleRows as JsonRecord[],
      media: [],
    });
    return hasUsefulData(data) ? data : null;
  } catch (error) {
    console.error("Netlify Database seed read failed", error);
    return null;
  }
}

async function seedInitialData(): Promise<PortfolioData> {
  const fromDatabase = await loadDatabaseData();
  if (fromDatabase) return fromDatabase;
  return loadSeedData();
}

export async function loadPortfolioData(options: { forWrite?: boolean } = {}): Promise<PortfolioData> {
  const store = dataStore();
  try {
    const blobData = (await store.get(DATA_KEY, { type: "json" })) as Partial<PortfolioData> | null;
    if (blobData) return normalizeData(blobData);
  } catch (error) {
    console.error("Blob data read failed", error);
    if (options.forWrite) {
      throw new Error("Persistent Blob data is unavailable; refusing to write fallback data.");
    }
    return seedInitialData();
  }

  const seeded = await seedInitialData();
  try {
    await store.setJSON(DATA_KEY, seeded);
  } catch (error) {
    console.error("Initial Blob seed write failed", error);
    if (options.forWrite) throw error;
  }
  return seeded;
}

export async function savePortfolioData(data: PortfolioData): Promise<PortfolioData> {
  const store = dataStore();
  const normalized = normalizeData(data);
  const previous = await store.get(DATA_KEY);
  if (previous) {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    await store.set(`${BACKUP_PREFIX}${stamp}.json`, previous);
  }
  await store.setJSON(DATA_KEY, normalized);
  return normalized;
}

export function sortWorks(items: JsonRecord[]) {
  return [...items].sort((a, b) => {
    if (Boolean(b.featured) !== Boolean(a.featured)) return b.featured ? 1 : -1;
    const sortOrder = Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
    if (sortOrder !== 0) return sortOrder;
    return Number(b.year || 0) - Number(a.year || 0);
  });
}

export function sortSchedule(items: JsonRecord[]) {
  return [...items].sort((a, b) => String(a.eventDate || "").localeCompare(String(b.eventDate || "")));
}

export function nextId(items: JsonRecord[]) {
  return items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
}

export function buildWorkFromBody(body: JsonRecord, id: number): JsonRecord {
  return normalizeWork({
    id,
    title: body.title || "",
    year: body.year !== undefined && body.year !== "" ? body.year : null,
    category: body.category || "",
    medium: body.medium || "",
    description: body.description || "",
    programNote: body.programNote || "",
    premiereInfo: body.premiereInfo || "",
    festivalSelections: body.festivalSelections || "",
    youtubeUrl: body.youtubeUrl || "",
    soundcloudUrl: body.soundcloudUrl || "",
    audioUrl: body.audioUrl || "",
    scorePdfUrl: body.scorePdfUrl || "",
    coverImage: body.coverImage || "",
    galleryImages: Array.isArray(body.galleryImages) ? body.galleryImages : [],
    tags: Array.isArray(body.tags) ? body.tags : [],
    featured: Boolean(body.featured),
    sortOrder: body.sortOrder != null ? Number(body.sortOrder) : 0,
  });
}

export function buildScheduleFromBody(body: JsonRecord, id: number): JsonRecord {
  return normalizeScheduleEvent({
    id,
    eventDate: body.eventDate,
    title: body.title || "",
    venue: body.venue || "",
    cityCountry: body.cityCountry || "",
    workPerformed: body.workPerformed || "",
    link: body.link || "",
  });
}
