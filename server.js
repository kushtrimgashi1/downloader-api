const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use((req,res,next)=>{
  res.header('Access-Control-Allow-Origin','*');
  res.header('Access-Control-Allow-Methods','*');
  res.header('Access-Control-Allow-Headers','*');
  if(req.method==='OPTIONS') return res.sendStatus(200);
  next();
});

app.get('/', (req,res)=> res.json({status:'ONLINE', v:'4-final'}));

app.get('/download', async (req,res)=>{
  let url = req.query.url;
  if(!url) return res.json({error:'no url'});
  try{
    // Zgjerom vm.tiktok.com ne link te plote
    if(url.includes('vm.tiktok.com') || url.includes('vt.tiktok.com')){
      const r = await fetch(url, {redirect:'follow'});
      url = r.url;
    }
    // Provo 3 API per TikTok
    const apis = [
      `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`,
      `https://tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`
    ];
    for(const api of apis){
      try{
        const d = await fetch(api, {headers:{'User-Agent':'Mozilla/5.0'}}).then(x=>x.json());
        if(d?.data?.play) return res.json({downloadUrl:d.data.play, cover:d.data.cover});
      }catch(e){}
    }
    return res.json({downloadUrl:null, error:'API bllokuar perkohesisht, provo prap'});
  }catch(e){ res.json({error:e.message}); }
});

app.get('/proxy', async (req,res)=>{
  try{
    const u = req.query.url;
    const r = await fetch(u, {headers:{'User-Agent':'Mozilla/5.0'}});
    const b = await r.arrayBuffer();
    res.header('Content-Disposition','attachment; filename="tiktok.mp4"');
    res.header('Content-Type','video/mp4');
    res.send(Buffer.from(b));
  }catch(e){ res.status(500).send(e.message); }
});

app.listen(PORT, ()=> console.log('V4 LIVE'));
