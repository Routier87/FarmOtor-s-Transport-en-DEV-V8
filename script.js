const API = API_URL;

/* STAFF */

const STAFF_ACCOUNTS={
"Farm":"freddy123",
"oxiwanteed13":"1313",
"SuperCAT71":"FranceMulti_2026",
"Routier87":"200187"
};

function loginStaff(){

const u=prompt("Utilisateur");
const p=prompt("Mot de passe");

if(STAFF_ACCOUNTS[u] && STAFF_ACCOUNTS[u]===p){

localStorage.setItem("staff","true");
location.reload();

}else{

alert("Erreur connexion");

}

}

function logoutStaff(){

localStorage.removeItem("staff");
location.reload();

}

function isStaff(){

return localStorage.getItem("staff")==="true";

}

/* CHAUFFEURS */

function driverForm(){

const f=document.getElementById("driverForm");

if(!f)return;

f.addEventListener("submit",async(e)=>{

e.preventDefault();

const res=await fetch(API+"/drivers",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

name:driverName.value,
role:driverRole.value,
discord:driverDiscord.value,
since:driverSince.value

})

});

if(!res.ok){

alert("Erreur ajout chauffeur");
return;

}

alert("Chauffeur ajouté");

f.reset();

loadDrivers();

});

}

async function loadDrivers(){

const list=document.getElementById("driversList");
const admin=document.getElementById("adminDrivers");

const r=await fetch(API+"/drivers");

const data=await r.json();

if(list){

list.innerHTML=data.map(d=>`

<div class="card">

<h3>${d.name}</h3>

<p><b>Grade :</b> ${d.role}</p>
<p><b>Discord :</b> ${d.discord}</p>
<p><b>Depuis :</b> ${d.since}</p>

</div>

`).join("");

}

if(admin){

admin.innerHTML=data.map(d=>`

<div class="card">

<b>${d.name}</b>

<p>${d.role}</p>

<button onclick="deleteDriver(${d.id})">
Supprimer
</button>

</div>

`).join("");

}

}

async function deleteDriver(id){

await fetch(API+"/drivers/"+id,{
method:"DELETE"
});

loadDrivers();

}

document.addEventListener("DOMContentLoaded",()=>{

driverForm();
loadDrivers();

});
