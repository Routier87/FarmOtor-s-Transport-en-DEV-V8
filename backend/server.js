const express = require("express")
const fs = require("fs")
const path = require("path")
const cors = require("cors")

const app = express()

app.use(cors())
app.use(express.json())

const DATA = "./data"

function read(file) {
if (!fs.existsSync(`${DATA}/${file}`)) fs.writeFileSync(`${DATA}/${file}`, "[]")
return JSON.parse(fs.readFileSync(`${DATA}/${file}`))
}

function save(file,data) {
fs.writeFileSync(`${DATA}/${file}`,JSON.stringify(data,null,2))
}

app.get("/convoys",(req,res)=>{
res.json(read("convoys.json"))
})

app.post("/convoys",(req,res)=>{
let data=read("convoys.json")

const convoy={
id:Date.now(),
depart:req.body.depart,
arrivee:req.body.arrivee,
date:req.body.date,
heure:req.body.heure
}

data.push(convoy)

save("convoys.json",data)

res.json(convoy)
})

app.get("/applications",(req,res)=>{
res.json(read("apps.json"))
})

app.post("/applications",(req,res)=>{
let data=read("apps.json")

const appData={
id:Date.now(),
pseudo:req.body.pseudo,
age:req.body.age,
heures:req.body.heures,
motivation:req.body.motivation,
status:"attente"
}

data.push(appData)

save("apps.json",data)

res.json(appData)
})

app.get("/drivers",(req,res)=>{
res.json(read("drivers.json"))
})

app.post("/drivers",(req,res)=>{
let data=read("drivers.json")

const driver={
id:Date.now(),
name:req.body.name,
role:req.body.role,
discord:req.body.discord,
since:req.body.since
}

data.push(driver)

save("drivers.json",data)

res.json(driver)
})

const PORT=process.env.PORT||3000

app.listen(PORT,()=>{
console.log("Server running on "+PORT)
})
