const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const multer = require("multer");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const DATA = path.join(__dirname, "data");
const UPLOADS = path.join(__dirname, "uploads");

if (!fs.existsSync(DATA)) fs.mkdirSync(DATA, { recursive: true });
if (!fs.existsSync(UPLOADS)) fs.mkdirSync(UPLOADS, { recursive: true });

app.use("/uploads", express.static(UPLOADS));

function read(file) {
  const fullPath = path.join(DATA, file);
  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, "[]", "utf8");
  }
  return JSON.parse(fs.readFileSync(fullPath, "utf8"));
}

function save(file, data) {
  const fullPath = path.join(DATA, file);
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), "utf8");
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + ext);
  }
});

const upload = multer({ storage });

/* =========================
   CONVOIS
========================= */

app.get("/convoys", (req, res) => {
  res.json(read("convoys.json"));
});

app.post("/convoys", upload.single("image"), (req, res) => {
  const data = read("convoys.json");

  const convoy = {
    id: Date.now(),
    depart: req.body.depart || "",
    arrivee: req.body.arrivee || "",
    entrepriseDepart: req.body.entrepriseDepart || "",
    entrepriseArrivee: req.body.entrepriseArrivee || "",
    date: req.body.date || "",
    heure: req.body.heure || "",
    serveur: req.body.serveur || "",
    image: req.file ? `/uploads/${req.file.filename}` : ""
  };

  data.push(convoy);
  save("convoys.json", data);

  res.json(convoy);
});

app.delete("/convoys/:id", (req, res) => {
  let data = read("convoys.json");

  const convoy = data.find((x) => String(x.id) === String(req.params.id));
  if (convoy && convoy.image) {
    const fileName = convoy.image.replace("/uploads/", "");
    const fullPath = path.join(UPLOADS, fileName);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }

  data = data.filter((x) => String(x.id) !== String(req.params.id));
  save("convoys.json", data);

  res.json({ ok: true });
});

/* =========================
   CHAUFFEURS
========================= */

app.get("/drivers", (req, res) => {
  res.json(read("drivers.json"));
});

app.post("/drivers", (req, res) => {
  const data = read("drivers.json");

  const driver = {
    id: Date.now(),
    name: req.body.name || "",
    role: req.body.role || "",
    discord: req.body.discord || "",
    since: req.body.since || ""
  };

  data.push(driver);
  save("drivers.json", data);

  res.json(driver);
});

app.delete("/drivers/:id", (req, res) => {
  let data = read("drivers.json");
  data = data.filter((x) => String(x.id) !== String(req.params.id));
  save("drivers.json", data);
  res.json({ ok: true });
});

/* =========================
   CANDIDATURES
========================= */

app.get("/applications", (req, res) => {
  res.json(read("apps.json"));
});

/* =========================
   START
========================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on " + PORT);
});
