const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use((req,res,next)=>{
  res.header('Access-Control-Allow-Origin','*');
  res.header('Access-Control-Allow-Methods','*');
  res.header('Access-Control-Allow-Headers','*');
  if(req.method==='OPTIONS') return res.sendStatus(200);
  next();
});

app.get('/', (req,res)=> res.json({status:'ONLINE', v:'V8-PUBLIC-HD'}));

app.get('/download', async (req,res)=>{
  let url = req.query.url || '';
  const hd = req.query.hd !== '0';
  try{
    if(url.includes('vm.tiktok') || url.includes('vt.tiktok')){
      try{ const r=await fetch(url,{redirect:'follow'}); url=r.url; }catch(e){}
    }

    // TikTok - TikWM HD
    if(url.includes('tiktok.com')){
      const body = `url=${encodeURIComponent(url)}&count=12&cursor=0&web=1&hd=1`;
      const data = await fetch('https://www.tikwm.com/api/', {
        method:'POST',
        headers:{'Content-Type':'application/x-www-form-urlencoded','User-Agent':'Mozilla/5.0'},
        body
      }).then(r=>r.json()).catch(()=>null);
      
      if(data?.data){
        return res.json({
          downloadUrl: hd ? (data.data.hdplay || data.data.play) : data.data.play,
          downloadUrlHD: data.data.hdplay || data.data.play,
          downloadUrlSD: data.data.play,
          cover: data.data.cover,
          author: data.data.author?.unique_id
        });
      }
    }

    // Instagram & Facebook - Cobalt API (HD)
    const cobalt = await fetch('https://api.cobalt.tools/api/json', {
      method:'POST',
      headers:{'Content-Type':'application/json','Accept':'application/json'},
      body: JSON.stringify({url: url, vQuality:'1080', filenamePattern:'basic'})
    }).then(r=>r.json()).catch(()=>null);

    if(cobalt?.url){
      return res.json({
        downloadUrl: cobalt.url,
        downloadUrlHD: cobalt.url,
        downloadUrlSD: cobalt.url,
        picker: cobalt.picker
      });
    }

    res.json({error:'Nuk u gjet video'});
  }catch(e){ res.json({error:e.message}); }
});

app.listen(PORT);
