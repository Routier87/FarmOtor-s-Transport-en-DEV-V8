const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const DATA = path.join(__dirname, "data");

if (!fs.existsSync(DATA)) {
  fs.mkdirSync(DATA, { recursive: true });
}

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

/* =========================
   CONVOIS
========================= */

app.get("/convoys", (req, res) => {
  res.json(read("convoys.json"));
});

app.post("/convoys", (req, res) => {
  const data = read("convoys.json");

  const convoy = {
    id: Date.now(),
    depart: req.body.depart || "",
    arrivee: req.body.arrivee || "",
    date: req.body.date || "",
    heure: req.body.heure || ""
  };

  data.push(convoy);
  save("convoys.json", data);

  res.json(convoy);
});

/* =========================
   CANDIDATURES
========================= */

app.get("/applications", (req, res) => {
  res.json(read("apps.json"));
});

app.post("/applications", (req, res) => {
  const data = read("apps.json");

  const appData = {
    id: Date.now(),
    pseudo: req.body.pseudo || "",
    age: req.body.age || "",
    heures: req.body.heures || "",
    motivation: req.body.motivation || "",
    status: "attente"
  };

  data.push(appData);
  save("apps.json", data);

  res.json(appData);
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
   START
========================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on " + PORT);
});
