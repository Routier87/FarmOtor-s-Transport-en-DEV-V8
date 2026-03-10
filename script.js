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
      alert("Erreur serveur lors de l'ajout chauffeur");
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
        ? data.map((d) => `
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
        ? data.map((d) => `
          <div class="card">
            <strong>${d.name || "-"}</strong><br>
            <span><strong>Grade :</strong> ${d.role || "-"}</span><br>
            <span><strong>Discord :</strong> ${d.discord || "-"}</span><br>
            <span><strong>Depuis :</strong> ${d.since || "-"}</span>
            <div style="margin-top:10px;">
              <button onclick="deleteDriver(${d.id})">Supprimer</button>
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
   INIT
========================= */

document.addEventListener("DOMContentLoaded", () => {
  protectStaff();
  toggleStaffLinks();

  const loginBtn = document.getElementById("staffLoginBtn");
  const logoutBtn = document.getElementById("staffLogoutBtn");

  if (loginBtn) loginBtn.onclick = loginStaff;
  if (logoutBtn) logoutBtn.onclick = logoutStaff;

  driverForm();
  loadDrivers();
});
