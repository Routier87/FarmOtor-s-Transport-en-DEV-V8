const API = API_URL;

const STAFF_ACCOUNTS = {
  "Farm": "freddy123",
  "oxiwanteed13": "1313",
  "SuperCAT71": "FranceMulti_2026",
  "Routier87": "200187"
};

function loginStaff() {
  const username = prompt("Utilisateur staff");
  const password = prompt("Mot de passe");

  if (STAFF_ACCOUNTS[username] && STAFF_ACCOUNTS[username] === password) {
    localStorage.setItem("staff", "true");
    localStorage.setItem("staffUser", username);
    alert("Connexion staff réussie");
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

document.addEventListener("DOMContentLoaded", () => {

  protectStaff();

  const loginBtn = document.getElementById("staffLoginBtn");
  const logoutBtn = document.getElementById("staffLogoutBtn");

  if (loginBtn) loginBtn.onclick = loginStaff;
  if (logoutBtn) logoutBtn.onclick = logoutStaff;

});
