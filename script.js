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
    alert("Identifiants incorrects");
  }
}

function logoutStaff() {
  localStorage.removeItem("staff");
  localStorage.removeItem("staffUser");
  alert("Déconnexion réussie");
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
  document.querySelectorAll("[data-staff-only='true']").forEach((el) => {
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
   CONVOIS
========================= */

function adminConvoyForm() {
  const form = document.getElementById("adminConvoyForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const entrepriseDepart = document.getElementById("entrepriseDepart")?.value?.trim() || "";
    const depart = document.getElementById("depart")?.value?.trim() || "";
    const entrepriseArrivee = document.getElementById("entrepriseArrivee")?.value?.trim() || "";
    const arrivee = document.getElementById("arrivee")?.value?.trim() || "";
    const date = document.getElementById("date")?.value || "";
    const heure = document.getElementById("heure")?.value || "";
    const serveur = document.getElementById("serveur")?.value || "";
    const imageFile = document.getElementById("convoyImage")?.files?.[0] || null;

    if (!entrepriseDepart || !depart || !entrepriseArrivee || !arrivee || !date || !heure || !serveur) {
      alert("Remplis tous les champs du convoi");
      return;
    }

    const formData = new FormData();
    formData.append("entrepriseDepart", entrepriseDepart);
    formData.append("depart", depart);
    formData.append("entrepriseArrivee", entrepriseArrivee);
    formData.append("arrivee", arrivee);
    formData.append("date", date);
    formData.append("heure", heure);
    formData.append("serveur", serveur);

    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      const res = await fetch(API + "/convoys", {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        alert("Erreur création convoi");
        return;
      }

      alert("Convoi créé ✅");
      form.reset();
      await loadConvoys();
    } catch (err) {
      console.error(err);
      alert("Erreur serveur création convoi");
    }
  });
}

async function loadConvoys() {
  const box = document.getElementById("convoys");
  const adminBox = document.getElementById("adminConvoys");

  if (!box && !adminBox) return;

  try {
    const res = await fetch(API + "/convoys");
    if (!res.ok) {
      if (box) box.innerHTML = `<div class="card">Erreur chargement convois.</div>`;
      if (adminBox) adminBox.innerHTML = `<div class="card">Erreur chargement convois.</div>`;
      return;
    }

    const data = await res.json();

    if (box) {
      box.innerHTML = data.length
        ? data.map(c => `
          <div class="card">
            ${c.image ? `<img class="convoy-image" src="${API + c.image}" alt="Image convoi">` : ""}

            <h3>🚛 ${c.depart || "-"} ➜ ${c.arrivee || "-"}</h3>
            <p><strong>🏢 Entreprise départ :</strong> ${c.entrepriseDepart || "-"}</p>
            <p><strong>🏢 Entreprise arrivée :</strong> ${c.entrepriseArrivee || "-"}</p>
            <p><strong>📅 Date :</strong> ${c.date || "-"}</p>
            <p><strong>⏰ Heure :</strong> ${c.heure || "-"}</p>
            <p><strong>🖥️ Serveur :</strong> ${c.serveur || "-"}</p>
          </div>
        `).join("")
        : `<div class="card">Aucun convoi pour le moment.</div>`;
    }

    if (adminBox) {
      adminBox.innerHTML = data.length
        ? data.map(c => `
          <div class="card">
            ${c.image ? `<img class="convoy-image" src="${API + c.image}" alt="Image convoi">` : ""}

            <strong>${c.depart || "-"} ➜ ${c.arrivee || "-"}</strong><br>
            <span><strong>Entreprise départ :</strong> ${c.entrepriseDepart || "-"}</span><br>
            <span><strong>Entreprise arrivée :</strong> ${c.entrepriseArrivee || "-"}</span><br>
            <span><strong>Date :</strong> ${c.date || "-"}</span><br>
            <span><strong>Heure :</strong> ${c.heure || "-"}</span><br>
            <span><strong>Serveur :</strong> ${c.serveur || "-"}</span><br>

            <div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;">
              <button class="btn btn-red" onclick="deleteConvoy(${c.id})">Supprimer</button>
            </div>
          </div>
        `).join("")
        : `<div class="card">Aucun convoi créé.</div>`;
    }
  } catch (err) {
    console.error(err);
    if (box) box.innerHTML = `<div class="card">Erreur chargement convois.</div>`;
    if (adminBox) adminBox.innerHTML = `<div class="card">Erreur chargement convois.</div>`;
  }
}

async function deleteConvoy(id) {
  try {
    const res = await fetch(API + "/convoys/" + id, {
      method: "DELETE"
    });

    if (!res.ok) {
      alert("Erreur suppression convoi");
      return;
    }

    await loadConvoys();
  } catch (err) {
    console.error(err);
    alert("Erreur serveur suppression convoi");
  }
}

/* =========================
   CHAUFFEURS
========================= */

function driverForm() {
  const form = document.getElementById("driverForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const body = {
      name: document.getElementById("driverName")?.value?.trim() || "",
      role: document.getElementById("driverRole")?.value || "",
      discord: document.getElementById("driverDiscord")?.value?.trim() || "",
      since: document.getElementById("driverSince")?.value?.trim() || ""
    };

    if (!body.name || !body.role || !body.discord || !body.since) {
      alert("Remplis tous les champs chauffeur");
      return;
    }

    try {
      const res = await fetch(API + "/drivers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        alert("Erreur ajout chauffeur");
        return;
      }

      alert("Chauffeur ajouté ✅");
      form.reset();
      await loadDrivers();
    } catch (err) {
      console.error(err);
      alert("Erreur serveur ajout chauffeur");
    }
  });
}

async function loadDrivers() {
  const list = document.getElementById("driversList");
  const admin = document.getElementById("adminDrivers");

  if (!list && !admin) return;

  try {
    const res = await fetch(API + "/drivers");
    if (!res.ok) {
      if (list) list.innerHTML = `<div class="card">Erreur chargement chauffeurs.</div>`;
      if (admin) admin.innerHTML = `<div class="card">Erreur chargement chauffeurs.</div>`;
      return;
    }

    const data = await res.json();

    if (list) {
      list.innerHTML = data.length
        ? data.map(d => `
          <div class="card">
            <h3>🚚 ${d.name || "-"}</h3>
            <p><strong>Grade :</strong> ${d.role || "-"}</p>
            <p><strong>Discord :</strong> ${d.discord || "-"}</p>
            <p><strong>Depuis :</strong> ${d.since || "-"}</p>
          </div>
        `).join("")
        : `<div class="card">Aucun chauffeur pour le moment.</div>`;
    }

    if (admin) {
      admin.innerHTML = data.length
        ? data.map(d => `
          <div class="card">
            <strong>${d.name || "-"}</strong><br>
            <span><strong>Grade :</strong> ${d.role || "-"}</span><br>
            <span><strong>Discord :</strong> ${d.discord || "-"}</span><br>
            <span><strong>Depuis :</strong> ${d.since || "-"}</span><br>

            <div style="margin-top:10px;">
              <button class="btn btn-red" onclick="deleteDriver(${d.id})">Supprimer</button>
            </div>
          </div>
        `).join("")
        : `<div class="card">Aucun chauffeur ajouté.</div>`;
    }
  } catch (err) {
    console.error(err);
    if (list) list.innerHTML = `<div class="card">Erreur chargement chauffeurs.</div>`;
    if (admin) admin.innerHTML = `<div class="card">Erreur chargement chauffeurs.</div>`;
  }
}

async function deleteDriver(id) {
  try {
    const res = await fetch(API + "/drivers/" + id, {
      method: "DELETE"
    });

    if (!res.ok) {
      alert("Erreur suppression chauffeur");
      return;
    }

    await loadDrivers();
  } catch (err) {
    console.error(err);
    alert("Erreur serveur suppression chauffeur");
  }
}

/* =========================
   CANDIDATURES
========================= */

async function loadAdminApps() {
  const a = document.getElementById("adminApps");
  if (!a) return;

  try {
    const r = await fetch(API + "/applications");
    if (!r.ok) {
      a.innerHTML = `<div class="card">Erreur chargement candidatures.</div>`;
      return;
    }

    const d = await r.json();

    a.innerHTML = d.length
      ? d.map(x => `
        <div class="card">
          <strong>${x.pseudo || "-"}</strong><br>
          <span><strong>Âge :</strong> ${x.age || "-"} ans</span><br>
          <span><strong>Heures ETS2 :</strong> ${x.heures || "-"} h</span><br>
          <span><strong>Plateforme :</strong> ${x.plateforme || "-"}</span><br>
          <span><strong>Statut :</strong> ${x.status || "attente"}</span>
          <p style="margin-top:10px;">${x.motivation || ""}</p>
        </div>
      `).join("")
      : `<div class="card">Aucune candidature.</div>`;
  } catch (err) {
    console.error(err);
    a.innerHTML = `<div class="card">Erreur chargement candidatures.</div>`;
  }
}

/* =========================
   INIT
========================= */

document.addEventListener("DOMContentLoaded", () => {
  protectStaff();
  toggleStaffLinks();

  const loginBtn = document.getElementById("staffLoginBtn");
  const logoutBtn = document.getElementById("staffLogoutBtn");

  if (loginBtn) loginBtn.onclick = loginStaff;
  if (logoutBtn) logoutBtn.onclick = logoutStaff;

  adminConvoyForm();
  loadConvoys();

  driverForm();
  loadDrivers();

  loadAdminApps();
});
