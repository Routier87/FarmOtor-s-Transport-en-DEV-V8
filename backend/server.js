const express=require('express');const fs=require('fs');const cors=require('cors');const app=express();
app.use(express.json({limit:'20mb'}));app.use(cors());
function read(file){if(!fs.existsSync(file)) fs.writeFileSync(file,'[]');return JSON.parse(fs.readFileSync(file));}
function save(file,data){fs.writeFileSync(file,JSON.stringify(data,null,2));}
app.get('/convoys',(req,res)=>res.json(read('data/convoys.json')));
app.post('/convoys',async(req,res)=>{const d=read('data/convoys.json');const c={id:Date.now(),...req.body};d.push(c);save('data/convoys.json',d);const webhook=process.env.DISCORD_WEBHOOK_URL;if(webhook){try{await fetch(webhook,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'FarmOtor Convoys',content:`🚛 **Nouveau convoi créé**\n**${c.depart} ➜ ${c.arrivee}**\nEntreprise: ${c.entrepriseDepart||'-'} ➜ ${c.entrepriseArrivee||'-'}\nDate: ${c.date||'-'} | Heure: ${c.heure||'-'} | Serveur: ${c.serveur||'-'}`})});}catch(e){}}res.json(c);});
app.put('/convoys/:id',(req,res)=>{let d=read('data/convoys.json');d=d.map(x=>x.id==req.params.id?{...x,...req.body}:x);save('data/convoys.json',d);res.json({ok:true});});
app.delete('/convoys/:id',(req,res)=>{let d=read('data/convoys.json');d=d.filter(x=>x.id!=req.params.id);save('data/convoys.json',d);res.json({ok:true});});
app.get('/applications',(req,res)=>res.json(read('data/apps.json')));
app.post('/applications',(req,res)=>{const d=read('data/apps.json');const a={id:Date.now(),status:'attente',...req.body};d.push(a);save('data/apps.json',d);res.json(a);});
app.put('/applications/:id',(req,res)=>{let d=read('data/apps.json');d=d.map(x=>x.id==req.params.id?{...x,status:req.body.status}:x);save('data/apps.json',d);res.json({ok:true});});
app.delete('/applications/:id',(req,res)=>{let d=read('data/apps.json');d=d.filter(x=>x.id!=req.params.id);save('data/apps.json',d);res.json({ok:true});});
app.get('/mods',(req,res)=>res.json(read('data/mods.json')));
app.post('/mods',(req,res)=>{const d=read('data/mods.json');const m={id:Date.now(),...req.body};d.push(m);save('data/mods.json',d);res.json(m);});
app.delete('/mods/:id',(req,res)=>{let d=read('data/mods.json');d=d.filter(x=>x.id!=req.params.id);save('data/mods.json',d);res.json({ok:true});});
app.listen(3000,()=>console.log('Server running on 3000'));