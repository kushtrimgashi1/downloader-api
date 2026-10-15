const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use((req,res,next)=>{
  res.header('Access-Control-Allow-Origin','*');
  res.header('Access-Control-Allow-Methods','*');
  res.header('Access-Control-Allow-Headers','*');
  next();
});

app.get('/', (req,res)=> res.json({status:'ONLINE', version:'V9.2-FINAL'}));

app.get('/download', async (req,res)=>{
  let url = req.query.url || '';
  if(!url) return res.json({error:'no url'});

  try{
    // --- TIKTOK: Mos e zgjero vm.tiktok - dergo direkt ne TikWM ---
    // TikWM punon direkt me vm.tiktok.com ✅
    if(url.includes('tiktok.com') || url.includes('vm.tiktok') || url.includes('vt.tiktok')){
      try{
        const body = `url=${encodeURIComponent(url)}&count=12&cursor=0&web=1&hd=1`;
        const r = await fetch('https://www.tikwm.com/api/', {
          method:'POST',
          headers:{
            'Content-Type':'application/x-www-form-urlencoded',
            'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          body
        });
        const data = await r.json();
        if(data?.data?.play){
          return res.json({
            downloadUrl: data.data.hdplay || data.data.play,
            downloadUrlHD: data.data.hdplay || data.data.play,
            downloadUrlSD: data.data.play,
            cover: data.data.cover,
            author: data.data.author?.unique_id
          });
        }
      }catch(e){ console.log('tikwm fail', e.message); }
    }

    // --- FACEBOOK share/r + INSTAGRAM + TIKTOK fallback ---
    // 1. Co.wuk.sh (Cobalt instance me i mire per FB share/r)
    const cobaltList = [
      'https://co.wuk.sh/api/json',
      'https://api.cobalt.tools/api/json'
    ];

    for(const endpoint of cobaltList){
      try{
        const c = await fetch(endpoint, {
          method:'POST',
          headers:{
            'Content-Type':'application/json',
            'Accept':'application/json',
            'User-Agent':'Mozilla/5.0'
          },
          body: JSON.stringify({
            url: url,
            vQuality: '1080',
            filenamePattern: 'basic'
          })
        });
        const j = await c.json();
        if(j?.url){
          return res.json({
            downloadUrl: j.url,
            downloadUrlHD: j.url,
            downloadUrlSD: j.url
          });
        }
      }catch(e){}
    }

    // 2. Backup per FB share/r - fdownloader
    try{
      const fd = await fetch('https://v3.saveinsta.app/api/ajaxSearch', {
        method:'POST',
        headers:{
          'Content-Type':'application/x-www-form-urlencoded',
          'User-Agent':'Mozilla/5.0'
        },
        body: `q=${encodeURIComponent(url)}`
      });
      const fdJson = await fd.json();
      if(fdJson?.data){
        const m = fdJson.data.match(/href="([^"]+\.mp4[^"]*)"/);
        if(m){
          return res.json({downloadUrl: m[1], downloadUrlHD: m[1], downloadUrlSD: m[1]});
        }
      }
    }catch(e){}

    return res.json({error:'Video nuk u gjet, provo link tjeter - sigurohu qe eshte publike'});

  }catch(e){
    res.json({error:'Video nuk u gjet', detail: e.message});
  }
});

app.listen(PORT, ()=> console.log('V9.2 ONLINE'));
