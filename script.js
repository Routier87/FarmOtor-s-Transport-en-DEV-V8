const API = API_URL;

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

    const img = await fileToBase64(document.getElementById("image").files[0]);

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
  if (!box) return;

  const r = await fetch(API + "/convoys");
  const data = await r.json();

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

document.addEventListener("DOMContentLoaded", () => {
  convoyForm();
  loadConvoys();
});
