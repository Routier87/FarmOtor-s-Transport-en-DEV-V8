const API = API_URL;

/* =========================
   STAFF
========================= */

const STAFF_ACCOUNTS = {
  "Farm": "freddy123",
  "oxiwanteed13": "1313",
  "SuperCAT71": "FranceMulti_2026",
  "Routier87": "200187"
};

function loginStaff() {
  const username = prompt("Utilisateur staff");
  if (!username) return;

  const password = prompt("Mot de passe");
  if (!password) return;

  if (STAFF_ACCOUNTS[username] && STAFF_ACCOUNTS[username] === password) {
    localStorage.setItem("staff", "true");
    localStorage.setItem("staffUser", username);
    alert("Connexion staff réussie ✅");
    location.reload();
  } else {
    alert("Utilisateur ou mot de passe incorrect");
  }
}

function logoutStaff() {
  localStorage.removeItem("staff");
  localStorage.removeItem("staffUser");
  alert("Déconnexion staff OK");
  location.reload();
}

function isStaff() {
  return localStorage.getItem("staff") === "true";
}

function protectStaff() {
  if (document.body.dataset.staff === "true" && !isStaff()) {
    alert("Accès réservé au staff");
    window.location.href = "index.html";
  }
}

function toggleStaffLinks() {
  document.querySelectorAll("[data-staff-only='true']").forEach(el => {
    if (isStaff()) {
      el.classList.remove("hidden");
    } else {
      el.classList.add("hidden");
    }
  });

  const badge = document.getElementById("staffBadge");
  if (badge) {
    badge.innerHTML = isStaff()
      ? `<span class="badge">Connecté staff : ${localStorage.getItem("staffUser") || "staff"}</span>`
      : `<span class="badge">Non connecté staff</span>`;
  }
}

/* =========================
   UTILS
========================= */

function fileToBase64(file) {
  return new Promise((resolve) => {
    if (!file) return resolve("");
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

/* =========================
   CONVOI FORM
========================= */

function convoyForm() {
  const f = document.getElementById("convoyForm");
  if (!f) return;

  f.addEventListener("submit", async (e) => {
    e.preventDefault();

    const img = await fileToBase64(document.getElementById("image")?.files?.[0]);

    const body = {
      depart: document.getElementById("depart").value,
      arrivee: document.getElementById("arrivee").value,
      entrepriseDepart: document.getElementById("entrepriseDepart").value,
      entrepriseArrivee: document.getElementById("entrepriseArrivee").value,
      date: document.getElementById("date").value,
      heure: document.getElementById("heure").value,
      serveur: document.getElementById("serveur").value,
      image: img
    };

    const res = await fetch(API + "/convoys", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      alert("Erreur lors de la création du convoi");
      return;
    }

    alert("Convoi envoyé avec succès ✅");
    f.reset();
    window.location.href = "convois.html";
  });
}

/* =========================
   CONVOIS HTML
========================= */

async function loadConvoys() {
  const box = document.getElementById("convoys");
  const adminBox = document.getElementById("adminConvoys");

  if (!box && !adminBox) return;

  const r = await fetch(API + "/convoys");
  const data = await r.json();

  if (box) {
    box.innerHTML = data.length
      ? data.map(c => `
        <div class="card">
          ${c.image ? `<img src="${c.image}" alt="Image convoi">` : ""}

          <h3>🚛 ${c.depart || "-"} ➜ ${c.arrivee || "-"}</h3>

          <p><strong>📅 Date :</strong> ${c.date || "-"}</p>
          <p><strong>⏰ Heure :</strong> ${c.heure || "-"}</p>
          <p><strong>🖥️ Serveur :</strong> ${c.serveur || "-"}</p>
          <p><strong>🏢 Entreprise départ :</strong> ${c.entrepriseDepart || "-"}</p>
          <p><strong>🏢 Entreprise arrivée :</strong> ${c.entrepriseArrivee || "-"}</p>
          <p><strong>🌍 Ville départ :</strong> ${c.depart || "-"}</p>
          <p><strong>🌍 Ville arrivée :</strong> ${c.arrivee || "-"}</p>

          <div style="margin-top:15px; display:flex; gap:10px; flex-wrap:wrap;">
            <button onclick="likeConvoy(${c.id})">👍</button>
            <button onclick="dislikeConvoy(${c.id})">👎</button>
            <button onclick="registerConvoy(${c.id})">S'inscrire</button>
          </div>

          <p style="margin-top:10px;">
            👍 ${c.likes || 0} | 👎 ${c.dislikes || 0}
          </p>
        </div>
      `).join("")
      : `<div class="card">Aucun convoi pour le moment.</div>`;
  }

  if (adminBox) {
    adminBox.innerHTML = data.length
      ? data.map(c => `
        <div class="card">
          <strong>${c.depart || "-"} ➜ ${c.arrivee || "-"}</strong><br>
          <span>${c.date || "-"} | ${c.heure || "-"} | ${c.serveur || "-"}</span>
          <div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;">
            <button onclick="deleteConvoy(${c.id})">Supprimer</button>
          </div>
        </div>
      `).join("")
      : `<div class="card">Aucun convoi pour le moment.</div>`;
  }
}

async function likeConvoy(id) {
  const res = await fetch(API + "/convoys/" + id + "/like", {
    method: "POST"
  });

  if (!res.ok) {
    alert("Erreur like");
    return;
  }

  loadConvoys();
}

async function dislikeConvoy(id) {
  const res = await fetch(API + "/convoys/" + id + "/dislike", {
    method: "POST"
  });

  if (!res.ok) {
    alert("Erreur dislike");
    return;
  }

  loadConvoys();
}

async function registerConvoy(convoyId) {
  const username = prompt("Ton pseudo / nom pour l'inscription");
  if (!username) return;

  const res = await fetch(API + "/registrations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      convoyId,
      username
    })
  });

  if (!res.ok) {
    alert("Erreur inscription");
    return;
  }

  alert("Inscription envoyée ✅");
}

async function deleteConvoy(id) {
  const res = await fetch(API + "/convoys/" + id, {
    method: "DELETE"
  });

  if (!res.ok) {
    alert("Erreur suppression convoi");
    return;
  }

  loadConvoys();
}

/* =========================
   ADMIN REGISTRATIONS
========================= */

async function loadRegistrations() {
  const box = document.getElementById("adminRegistrations");
  if (!box) return;

  const r = await fetch(API + "/registrations");
  const data = await r.json();

  box.innerHTML = data.length
    ? data.map(x => `
      <div class="card">
        <strong>${x.username || "-"}</strong><br>
        <span>Convoi ID : ${x.convoyId || "-"}</span>
      </div>
    `).join("")
    : `<div class="card">Aucune inscription.</div>`;
}

/* =========================
   CANDIDATURES
========================= */

function appForm() {
  const f = document.getElementById("appForm");
  if (!f) return;

  f.addEventListener("submit", async (e) => {
    e.preventDefault();

    const res = await fetch(API + "/applications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        pseudo: document.getElementById("pseudo").value,
        age: document.getElementById("age").value,
        plateforme: document.getElementById("plateforme").value,
        motivation: document.getElementById("motivation").value
      })
    });

    if (!res.ok) {
      alert("Erreur envoi candidature");
      return;
    }

    alert("Candidature envoyée ✅");
    f.reset();
  });
}

async function loadAdminApps() {
  const a = document.getElementById("adminApps");
  if (!a) return;

  const r = await fetch(API + "/applications");
  const d = await r.json();

  a.innerHTML = d.length
    ? d.map(x => `
      <div class="card">
        <strong>${x.pseudo || "-"}</strong><br>
        <span>${x.plateforme || "-"} | ${x.age || "-"} ans | Statut : ${x.status || "attente"}</span>
        <p>${x.motivation || ""}</p>
        <div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;">
          <button onclick="updateApp(${x.id}, 'accepte')">Accepter</button>
          <button onclick="updateApp(${x.id}, 'refuse')">Refuser</button>
          <button onclick="deleteApp(${x.id})">Supprimer</button>
        </div>
      </div>
    `).join("")
    : `<div class="card">Aucune candidature.</div>`;
}

async function updateApp(id, status) {
  const res = await fetch(API + "/applications/" + id, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ status })
  });

  if (!res.ok) {
    alert("Erreur modification candidature");
    return;
  }

  loadAdminApps();
}

async function deleteApp(id) {
  const res = await fetch(API + "/applications/" + id, {
    method: "DELETE"
  });

  if (!res.ok) {
    alert("Erreur suppression candidature");
    return;
  }

  loadAdminApps();
}

/* =========================
   MODS
========================= */

function modForm() {
  const f = document.getElementById("modForm");
  if (!f) return;

  f.addEventListener("submit", async (e) => {
    e.preventDefault();

    const res = await fetch(API + "/mods", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: document.getElementById("modName").value,
        url: document.getElementById("modUrl").value
      })
    });

    if (!res.ok) {
      alert("Erreur ajout mod");
      return;
    }

    alert("Mod ajouté ✅");
    f.reset();
    loadMods();
  });
}

async function loadMods() {
  const list = document.getElementById("modsList");
  const admin = document.getElementById("adminMods");

  if (!list && !admin) return;

  const r = await fetch(API + "/mods");
  const data = await r.json();

  if (list) {
    list.innerHTML = data.length
      ? data.map(m => `
        <a class="mod-link" href="${m.url}" target="_blank">${m.name}</a>
      `).join("")
      : `<div class="card">Aucun mod disponible.</div>`;
  }

  if (admin) {
    admin.innerHTML = data.length
      ? data.map(m => `
        <div class="card">
          <strong>${m.name}</strong><br>
          <span>${m.url}</span>
          <div style="margin-top:10px;">
            <button onclick="deleteMod(${m.id})">Supprimer mod</button>
          </div>
        </div>
      `).join("")
      : `<div class="card">Aucun mod.</div>`;
  }
}

async function deleteMod(id) {
  const res = await fetch(API + "/mods/" + id, {
    method: "DELETE"
  });

  if (!res.ok) {
    alert("Erreur suppression mod");
    return;
  }

  loadMods();
}

/* =========================
   INIT
========================= */

document.addEventListener("DOMContentLoaded", () => {
  protectStaff();
  toggleStaffLinks();

  convoyForm();
  loadConvoys();

  appForm();
  loadAdminApps();

  modForm();
  loadMods();

  loadRegistrations();

  const loginBtn = document.getElementById("staffLoginBtn");
  if (loginBtn) loginBtn.onclick = loginStaff;

  const logoutBtn = document.getElementById("staffLogoutBtn");
  if (logoutBtn) logoutBtn.onclick = logoutStaff;
});
