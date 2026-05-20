const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const dataFile = path.join(__dirname, 'data.json');

const DEFAULT_SITE = {
  hero: {
    displayName: 'Populian',
    alias: 'Populian',
    subtitle:
      'Electroacoustic Composer · Interactive Media Artist · Music Technology Researcher',
    statement:
      "Faming Qin, also known as Populian, is an electroacoustic composer, interactive media artist, and music technology researcher based in Xi'an, China.",
    heroImage: '',
    portraitImage: '',
    featuredWorkIds: [],
  },
  about: {
    biography: '',
    education: [],
    skills: [],
    awards: [],
    researchInterests: [],
    artisticStatement: '',
    aliasExplanation: '',
  },
  contact: {
    email: 'populianmusic@gmail.com',
    socialLinks: { instagram: '', soundcloud: '', youtube: '', github: '', bilibili: '' },
    cvPdfUrl: '',
    shortBio: '',
    longBio: '',
    pressPhotoUrl: '',
    displayName: 'Populian Faming Qin',
    alias: 'Faming Qin',
  },
};

const SEED_WORKS = [
  {
    title: '1/2',
    year: 2025,
    category: 'Interactive Systems',
    medium: 'Interactive music for MediaPipe and Max/MSP',
    description:
      'An interactive electronic performance work situated between physical presence and digital mediation.',
    festivalSelections: 'NYCEMF 2026; selected for SEAMUS 2026',
    featured: true,
    sortOrder: 1,
  },
  {
    title: 'A Voice Intolerable to Heaven and Earth',
    year: 2025,
    category: 'Electroacoustic',
    medium: 'Fixed media electroacoustic composition',
    description:
      'A multi-section electroacoustic composition exploring electrostatics, imbalance, and sonic reconstruction.',
    festivalSelections:
      'University of Oregon premiere; CCMC Kyoto; ICMC Hamburg 2026; NYCEMF 2026; selected for SEAMUS 2026',
    featured: true,
    sortOrder: 2,
  },
  {
    title: 'Sensitive Bounce',
    year: 2024,
    category: 'Interactive Systems',
    medium: 'Interactive electroacoustics and modern dance',
    description: 'Interactive electroacoustic work combining audio reactivity and modern dance.',
    festivalSelections: "Xi'an Conservatory of Music; CCF China Computer Art Conference 2025",
    featured: false,
    sortOrder: 3,
  },
];

const SEED_SCHEDULE = [
  {
    eventDate: '2026-06-15',
    title: 'NYCEMF 2026 — Electroacoustic Music Festival',
    venue: 'New York City Electroacoustic Music Festival',
    cityCountry: 'New York, USA',
    workPerformed: 'A Voice Intolerable to Heaven and Earth',
    link: '',
  },
  {
    eventDate: '2026-07-22',
    title: 'ICMC 2026 — International Computer Music Conference',
    venue: 'Hamburg University of Music and Theatre',
    cityCountry: 'Hamburg, Germany',
    workPerformed: 'A Voice Intolerable to Heaven and Earth',
    link: '',
  },
  {
    eventDate: '2026-09-10',
    title: 'SEAMUS 2026 National Conference',
    venue: 'Virginia Tech',
    cityCountry: 'Blacksburg, VA, USA',
    workPerformed: '1/2',
    link: '',
  },
  {
    eventDate: '2026-05-01',
    title: 'CCMC Futura — Computer Music Conference',
    venue: 'Kyoto University',
    cityCountry: 'Kyoto, Japan',
    workPerformed: 'A Voice Intolerable to Heaven and Earth',
    link: '',
  },
];

const SEED_SITE = {
  hero: DEFAULT_SITE.hero,
  about: {
    biography: DEFAULT_SITE.hero.statement,
    education: [
      {
        institution: "Xi'an Conservatory of Music",
        degree: 'Bachelor of Music in Electroacoustic Composition',
        years: '2023–Present',
      },
      {
        institution: 'University of Oregon – Future Music Oregon Summer Academy',
        degree: 'Kyma System Coursework',
        years: '',
      },
    ],
    skills: [
      'Max/MSP',
      'Ableton Live',
      'Kyma',
      'Logic Pro',
      'Pro Tools',
      'VCV Rack',
      'Python',
      'Interactive Media',
      'AI + Music Systems',
      'Sound Design',
    ],
    awards: [
      'ICMC 2026 Selection',
      'SEAMUS 2026 Selection',
      'CCMC Futura Award',
      'China Collegiate Computing Competition Third Prize',
    ],
    researchInterests: [
      'Neural-driven audio systems',
      'Real-time music interaction',
      'Network music performance',
    ],
    artisticStatement:
      'My artistic practice explores the boundaries between physical gesture and digital mediation.',
    aliasExplanation:
      'Populian is my creative identity — a name that bridges my work across electroacoustic composition, interactive media, and experimental sound design.',
  },
  contact: DEFAULT_SITE.contact,
};

function normalizeImageUrl(url) {
  if (!url || typeof url !== 'string') return '';
  // Strip legacy localhost base URLs
  const stripped = url.replace(/^https?:\/\/localhost:\d+\/uploads\//, '/uploads/');
  // Ensure it starts with /uploads/ or is a relative path
  if (stripped && !startsWithAny(stripped, ['http://', 'https://', '/'])) {
    return '/uploads/' + stripped;
  }
  return stripped;
}

function startsWithAny(str, prefixes) {
  return prefixes.some(p => str.startsWith(p));
}

function normalizeImageUrlsInSite(site) {
  if (!site) return site;
  if (site.hero) {
    site.hero.heroImage = normalizeImageUrl(site.hero.heroImage);
    site.hero.hero_image = normalizeImageUrl(site.hero.hero_image);
    site.hero.portraitImage = normalizeImageUrl(site.hero.portraitImage);
    site.hero.portrait_image = normalizeImageUrl(site.hero.portrait_image);
  }
  if (site.contact) {
    site.contact.pressPhotoUrl = normalizeImageUrl(site.contact.pressPhotoUrl);
  }
  return site;
}

function normalizeImageUrlsInWorks(works) {
  for (const w of works) {
    w.coverImage = normalizeImageUrl(w.coverImage);
    w.cover_image = normalizeImageUrl(w.cover_image);
  }
  return works;
}

function readData() {
  try {
    const raw = fs.readFileSync(dataFile, 'utf8');
    const data = JSON.parse(raw);
    return normalizeData(data);
  } catch {
    return normalizeData({});
  }
}

function normalizeData(data) {
  if (!data || typeof data !== 'object') data = {};
  if (!Array.isArray(data.works)) data.works = [];
  if (!data.site || typeof data.site !== 'object') data.site = {};
  data.site = {
    hero: { ...DEFAULT_SITE.hero, ...(data.site.hero || {}) },
    about: { ...DEFAULT_SITE.about, ...(data.site.about || {}) },
    contact: { ...DEFAULT_SITE.contact, ...(data.site.contact || {}) },
  };
  if (!Array.isArray(data.schedule)) data.schedule = [];
  if (!Array.isArray(data.media)) data.media = [];
  return data;
}

function writeData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

/** Assign numeric ids and map legacy JSON fields to the shape the admin + Netlify use. */
function migrateWorksInPlace(works) {
  let migrated = false;
  let maxId = works.reduce((m, w) => Math.max(m, Number(w.id) || 0), 0);
  for (const w of works) {
    if (w.id == null || w.id === '') {
      maxId += 1;
      w.id = maxId;
      migrated = true;
    } else {
      w.id = Number(w.id);
    }
    const pairs = [
      ['programNote', 'program_note'],
      ['premiereInfo', 'premiere_info'],
      ['festivalSelections', 'festival_selections'],
      ['youtubeUrl', 'youtube_url'],
      ['soundcloudUrl', 'soundcloud_url'],
      ['audioUrl', 'audio_url'],
      ['scorePdfUrl', 'score_pdf_url'],
      ['coverImage', 'cover_image'],
    ];
    for (const [camel, snake] of pairs) {
      if (w[camel] == null && w[snake] != null) {
        w[camel] = w[snake];
        migrated = true;
      }
    }
    if (w.year != null && w.year !== '') w.year = parseInt(String(w.year), 10);
    else if (w.year === '') w.year = null;
    if (typeof w.tags === 'string') {
      try {
        w.tags = JSON.parse(w.tags || '[]');
      } catch {
        w.tags = [];
      }
    }
    if (!Array.isArray(w.tags)) w.tags = [];
    if (w.featured == null) w.featured = false;
    if (w.sortOrder == null) w.sortOrder = 0;
  }
  return migrated;
}

function migrateScheduleInPlace(schedule) {
  let migrated = false;
  let maxId = schedule.reduce((m, ev) => Math.max(m, Number(ev.id) || 0), 0);
  for (const ev of schedule) {
    if (ev.id == null || ev.id === '') {
      maxId += 1;
      ev.id = maxId;
      migrated = true;
    } else {
      ev.id = Number(ev.id);
    }
    if (ev.eventDate == null && ev.event_date != null) {
      ev.eventDate = ev.event_date;
      migrated = true;
    }
    if (ev.cityCountry == null && ev.city_country != null) {
      ev.cityCountry = ev.city_country;
      migrated = true;
    }
    if (ev.workPerformed == null && ev.work_performed != null) {
      ev.workPerformed = ev.work_performed;
      migrated = true;
    }
  }
  return migrated;
}

function readDataAndPersistMigrations() {
  const data = readData();
  let dirty = false;
  if (migrateWorksInPlace(data.works)) dirty = true;
  if (migrateScheduleInPlace(data.schedule)) dirty = true;
  // Always normalize image URLs (idempotent)
  normalizeImageUrlsInSite(data.site);
  normalizeImageUrlsInWorks(data.works);
  if (dirty) writeData(data);
  return data;
}

function buildWorkFromBody(body, id) {
  return {
    id,
    title: body.title || '',
    year: body.year !== undefined && body.year !== '' ? parseInt(String(body.year), 10) : null,
    category: body.category || '',
    medium: body.medium || '',
    description: body.description || '',
    programNote: body.programNote || '',
    premiereInfo: body.premiereInfo || '',
    festivalSelections: body.festivalSelections || '',
    youtubeUrl: body.youtubeUrl || '',
    soundcloudUrl: body.soundcloudUrl || '',
    audioUrl: body.audioUrl || '',
    scorePdfUrl: body.scorePdfUrl || '',
    coverImage: normalizeImageUrl(body.coverImage || ''),
    tags: Array.isArray(body.tags) ? body.tags : [],
    featured: Boolean(body.featured),
    sortOrder: body.sortOrder != null ? Number(body.sortOrder) : 0,
  };
}

function sortWorks(works) {
  return [...works].sort((a, b) => {
    if (Boolean(b.featured) !== Boolean(a.featured)) return b.featured ? 1 : -1;
    const so = (a.sortOrder || 0) - (b.sortOrder || 0);
    if (so !== 0) return so;
    return (b.year || 0) - (a.year || 0);
  });
}

const app = express();
const uploadDir = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, unique + ext);
  },
});
const upload = multer({ storage });

app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(uploadDir));

app.get('/api/works', (req, res) => {
  const data = readDataAndPersistMigrations();
  res.json(sortWorks(data.works));
});

app.post('/api/works', (req, res) => {
  const body = req.body;
  if (!body.title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  const data = readDataAndPersistMigrations();
  const nextId = data.works.reduce((m, w) => Math.max(m, Number(w.id) || 0), 0) + 1;
  const newWork = buildWorkFromBody(body, nextId);
  data.works.push(newWork);
  writeData(data);
  res.status(201).json(newWork);
});

app.put('/api/works/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
  const data = readDataAndPersistMigrations();
  const idx = data.works.findIndex((w) => Number(w.id) === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const prev = data.works[idx];
  const merged = buildWorkFromBody({ ...prev, ...req.body }, id);
  data.works[idx] = merged;
  writeData(data);
  res.json(merged);
});

app.delete('/api/works/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
  const data = readDataAndPersistMigrations();
  const idx = data.works.findIndex((w) => Number(w.id) === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  data.works.splice(idx, 1);
  writeData(data);
  res.json({ success: true });
});

app.get('/api/site', (req, res) => {
  const data = readDataAndPersistMigrations();
  res.json(data.site);
});

app.post('/api/site', (req, res) => {
  const data = readDataAndPersistMigrations();
  for (const [key, value] of Object.entries(req.body)) {
    if (data.site[key] && typeof data.site[key] === 'object' && typeof value === 'object' && !Array.isArray(value)) {
      data.site[key] = { ...data.site[key], ...value };
    } else {
      data.site[key] = value;
    }
  }
  writeData(data);
  res.json({ success: true, updated: req.body });
});

app.get('/api/schedule', (req, res) => {
  const data = readDataAndPersistMigrations();
  res.json(
    [...data.schedule].sort((a, b) => String(a.eventDate || '').localeCompare(String(b.eventDate || '')))
  );
});

app.post('/api/schedule', (req, res) => {
  const body = req.body;
  if (!body.title || !body.eventDate) {
    return res.status(400).json({ error: 'Title and date are required' });
  }
  const data = readDataAndPersistMigrations();
  const nextId = data.schedule.reduce((m, ev) => Math.max(m, Number(ev.id) || 0), 0) + 1;
  const created = {
    id: nextId,
    eventDate: body.eventDate,
    title: body.title,
    venue: body.venue || '',
    cityCountry: body.cityCountry || '',
    workPerformed: body.workPerformed || '',
    link: body.link || '',
  };
  data.schedule.push(created);
  writeData(data);
  res.status(201).json(created);
});

app.put('/api/schedule/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
  const data = readDataAndPersistMigrations();
  const idx = data.schedule.findIndex((ev) => Number(ev.id) === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const ev = data.schedule[idx];
  for (const f of ['eventDate', 'title', 'venue', 'cityCountry', 'workPerformed', 'link']) {
    if (req.body[f] !== undefined) ev[f] = req.body[f];
  }
  writeData(data);
  res.json(ev);
});

app.delete('/api/schedule/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
  const data = readDataAndPersistMigrations();
  const idx = data.schedule.findIndex((ev) => Number(ev.id) === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  data.schedule.splice(idx, 1);
  writeData(data);
  res.json({ success: true });
});

app.get('/api/media', (req, res) => {
  const data = readDataAndPersistMigrations();
  res.json(data.media);
});

app.delete('/api/media', (req, res) => {
  const key = req.query.key;
  if (!key) return res.status(400).json({ error: 'Key is required' });
  const data = readDataAndPersistMigrations();
  const safeKey = path.basename(String(key));
  const filePath = path.join(uploadDir, safeKey);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  data.media = data.media.filter((m) => m.key !== safeKey);
  writeData(data);
  res.json({ success: true });
});

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const category = (req.body && req.body.category) || 'general';
  const key = req.file.filename;
  const entry = {
    key,
    url: `/uploads/${key}`,
    originalName: req.file.originalname,
    contentType: req.file.mimetype || 'image/jpeg',
    category,
    uploadedAt: new Date().toISOString(),
  };
  const data = readDataAndPersistMigrations();
  data.media.push(entry);
  writeData(data);
  res.json({
    success: true,
    path: entry.url,
    filename: key,
    originalName: entry.originalName,
    category,
  });
});

app.post('/api/seed', (req, res) => {
  let data = readDataAndPersistMigrations();
  const force = req.query.force === 'true';
  if (data.works.length > 0 && !force) {
    return res.json({ message: 'Data already exists. Use force=true to overwrite.', seeded: false });
  }
  if (force) {
    data.works = [];
    data.schedule = [];
  }
  let maxId = 0;
  for (const w of SEED_WORKS) {
    maxId += 1;
    data.works.push(buildWorkFromBody(w, maxId));
  }
  if (data.schedule.length === 0) {
    let maxId = 0;
    for (const ev of SEED_SCHEDULE) {
      maxId += 1;
      data.schedule.push({ id: maxId, ...ev });
    }
  }
  data.site = { ...data.site, ...JSON.parse(JSON.stringify(SEED_SITE)) };
  writeData(data);
  res.json({
    success: true,
    seeded: true,
    works: SEED_WORKS.length,
    schedule: data.schedule.length,
    configs: Object.keys(SEED_SITE).length,
  });
});

app.get('/gallery', (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).json({ error: 'Failed to list images' });
    res.json(files.map((file) => `/uploads/${file}`));
  });
});

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ path: `/uploads/${req.file.filename}` });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
