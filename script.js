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
   CONVOIS
========================= */

function fileToBase64(file) {
  return new Promise((resolve) => {
    if (!file) return resolve("");
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

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

    alert("Convoi créé avec succès ✅");
    f.reset();
    window.location.href = "convois.html";
  });
}

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
          <div style="margin-top:10px;">
            <button onclick="deleteConvoy(${c.id})">Supprimer</button>
          </div>
        </div>
      `).join("")
      : `<div class="card">Aucun convoi pour le moment.</div>`;
  }
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
   INIT
========================= */

document.addEventListener("DOMContentLoaded", () => {
  protectStaff();
  toggleStaffLinks();

  convoyForm();
  loadConvoys();

  const loginBtn = document.getElementById("staffLoginBtn");
  if (loginBtn) loginBtn.onclick = loginStaff;

  const logoutBtn = document.getElementById("staffLogoutBtn");
  if (logoutBtn) logoutBtn.onclick = logoutStaff;
});
