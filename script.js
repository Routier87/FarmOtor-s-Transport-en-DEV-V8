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
    if (isStaff()) {
      badge.innerHTML = `<span class="badge">Connecté staff : ${localStorage.getItem("staffUser") || "staff"}</span>`;
    } else {
      badge.innerHTML = `<span class="badge">Non connecté staff</span>`;
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  protectStaff();
  toggleStaffLinks();

  const loginBtn = document.getElementById("staffLoginBtn");
  if (loginBtn) loginBtn.onclick = loginStaff;

  const logoutBtn = document.getElementById("staffLogoutBtn");
  if (logoutBtn) logoutBtn.onclick = logoutStaff;
});
