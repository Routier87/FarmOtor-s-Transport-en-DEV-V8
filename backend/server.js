const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const multer = require('multer');

const app = express();

app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true }));

const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

app.use('/uploads', express.static(UPLOADS_DIR));

function read(file) {
  const fullPath = path.join(DATA_DIR, file);
  if (!fs.existsSync(fullPath)) fs.writeFileSync(fullPath, '[]');
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function save(file, data) {
  const fullPath = path.join(DATA_DIR, file);
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2));
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + ext);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024
  }
});

/* =========================
   HEALTH
========================= */

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

/* =========================
   CONVOIS
========================= */

app.get('/convoys', (req, res) => {
  res.json(read('convoys.json'));
});

app.post('/convoys', upload.single('image'), async (req, res) => {
  const d = read('convoys.json');

  const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

  const c = {
    id: Date.now(),
    likes: 0,
    dislikes: 0,
    depart: req.body.depart || '',
    arrivee: req.body.arrivee || '',
    entrepriseDepart: req.body.entrepriseDepart || '',
    entrepriseArrivee: req.body.entrepriseArrivee || '',
    date: req.body.date || '',
    heure: req.body.heure || '',
    serveur: req.body.serveur || '',
    image: imageUrl
  };

  d.push(c);
  save('convoys.json', d);

  const webhook = process.env.DISCORD_WEBHOOK_URL;

  if (webhook) {
    try {
      await fetch(webhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: 'FarmOtor Convoys',
          content:
`🚛 **Nouveau convoi créé**
**${c.depart || '-'} ➜ ${c.arrivee || '-'}**

**Entreprise départ :** ${c.entrepriseDepart || '-'}
**Entreprise arrivée :** ${c.entrepriseArrivee || '-'}

📅 **Date :** ${c.date || '-'}
⏰ **Heure :** ${c.heure || '-'}
🖥️ **Serveur :** ${c.serveur || '-'}`
        })
      });
    } catch (e) {
      console.error('Erreur webhook Discord :', e);
    }
  }

  res.json(c);
});

app.put('/convoys/:id', (req, res) => {
  let d = read('convoys.json');

  d = d.map(x =>
    x.id == req.params.id
      ? { ...x, ...req.body }
      : x
  );

  save('convoys.json', d);
  res.json({ ok: true });
});

app.delete('/convoys/:id', (req, res) => {
  let d = read('convoys.json');

  const convoy = d.find(x => x.id == req.params.id);
  if (convoy && convoy.image) {
    const filename = convoy.image.replace('/uploads/', '');
    const fullImagePath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(fullImagePath)) {
      fs.unlinkSync(fullImagePath);
    }
  }

  d = d.filter(x => x.id != req.params.id);
  save('convoys.json', d);

  res.json({ ok: true });
});

app.post('/convoys/:id/like', (req, res) => {
  let d = read('convoys.json');

  d = d.map(x =>
    x.id == req.params.id
      ? { ...x, likes: (x.likes || 0) + 1 }
      : x
  );

  save('convoys.json', d);
  res.json({ ok: true });
});

app.post('/convoys/:id/dislike', (req, res) => {
  let d = read('convoys.json');

  d = d.map(x =>
    x.id == req.params.id
      ? { ...x, dislikes: (x.dislikes || 0) + 1 }
      : x
  );

  save('convoys.json', d);
  res.json({ ok: true });
});

/* =========================
   INSCRIPTIONS CONVOIS
========================= */

app.get('/registrations', (req, res) => {
  res.json(read('registrations.json'));
});

app.post('/registrations', (req, res) => {
  const d = read('registrations.json');

  const r = {
    id: Date.now(),
    convoyId: req.body.convoyId || '',
    username: req.body.username || ''
  };

  d.push(r);
  save('registrations.json', d);

  res.json(r);
});

/* =========================
   CANDIDATURES
========================= */

app.get('/applications', (req, res) => {
  res.json(read('apps.json'));
});

app.post('/applications', (req, res) => {
  const d = read('apps.json');

  const a = {
    id: Date.now(),
    status: 'attente',
    ...req.body
  };

  d.push(a);
  save('apps.json', d);

  res.json(a);
});

app.put('/applications/:id', (req, res) => {
  let d = read('apps.json');

  d = d.map(x =>
    x.id == req.params.id
      ? { ...x, status: req.body.status }
      : x
  );

  save('apps.json', d);
  res.json({ ok: true });
});

app.delete('/applications/:id', (req, res) => {
  let d = read('apps.json');

  d = d.filter(x => x.id != req.params.id);

  save('apps.json', d);
  res.json({ ok: true });
});

/* =========================
   MODS
========================= */

app.get('/mods', (req, res) => {
  res.json(read('mods.json'));
});

app.post('/mods', (req, res) => {
  const d = read('mods.json');

  const m = {
    id: Date.now(),
    ...req.body
  };

  d.push(m);
  save('mods.json', d);

  res.json(m);
});

app.delete('/mods/:id', (req, res) => {
  let d = read('mods.json');

  d = d.filter(x => x.id != req.params.id);

  save('mods.json', d);
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('Server running on ' + PORT);
});
