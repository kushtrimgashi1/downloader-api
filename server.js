const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use((req,res,next)=>{
  res.header('Access-Control-Allow-Origin','*');
  res.header('Access-Control-Allow-Methods','*');
  res.header('Access-Control-Allow-Headers','*');
  next();
});

app.get('/', (req,res)=> res.json({status:'ONLINE', version:'V9.1-FIXED'}));

app.get('/download', async (req,res)=>{
  let url = req.query.url || '';
  if(!url) return res.json({error:'no url'});

  try{
    // 1. Zgjerro vm.tiktok dhe fb.watch
    if(url.includes('vm.tiktok') || url.includes('vt.tiktok') || url.includes('fb.watch') || url.includes('facebook.com/share')){
      try{
        const r = await fetch(url, {redirect:'follow', headers:{'User-Agent':'Mozilla/5.0'}});
        url = r.url || url;
      }catch(e){}
    }

    // 2. TIKTOK - TikWM HD
    if(url.includes('tiktok.com')){
      try{
        const body = `url=${encodeURIComponent(url)}&count=12&cursor=0&web=1&hd=1`;
        const data = await fetch('https://www.tikwm.com/api/', {
          method:'POST',
          headers:{'Content-Type':'application/x-www-form-urlencoded','User-Agent':'Mozilla/5.0'},
          body
        }).then(r=>r.json());
        if(data?.data?.play){
          return res.json({
            downloadUrl: data.data.hdplay || data.data.play,
            downloadUrlHD: data.data.hdplay || data.data.play,
            downloadUrlSD: data.data.play,
            cover: data.data.cover
          });
        }
      }catch(e){}

      // Backup TikTok - TikMate
      try{
        const tm = await fetch(`https://api.tikmate.app/api/look?url=${encodeURIComponent(url)}`).then(r=>r.json());
        if(tm?.token){
          const dl = `https://tikmate.app/download/${tm.token}/${tm.id}.mp4?hd=1`;
          return res.json({downloadUrl: dl, downloadUrlHD: dl, downloadUrlSD: dl});
        }
      }catch(e){}
    }

    // 3. FACEBOOK & INSTAGRAM - Cobalt API (instance qe punon ne Render)
    const cobaltEndpoints = ['https://api.cobalt.tools/api/json','https://co.wuk.sh/api/json'];
    for(const ep of cobaltEndpoints){
      try{
        const c = await fetch(ep, {
          method:'POST',
          headers:{'Content-Type':'application/json','Accept':'application/json'},
          body: JSON.stringify({url: url, vQuality:'1080', filenamePattern:'basic'})
        }).then(r=>r.json());
        if(c?.url){
          return res.json({downloadUrl: c.url, downloadUrlHD: c.url, downloadUrlSD: c.url});
        }
      }catch(e){}
    }

    // 4. Fallback Insta/FB - SaveInsta API
    try{
      const fd = await fetch('https://v3.saveinsta.app/api/ajaxSearch', {
        method:'POST',
        headers:{'Content-Type':'application/x-www-form-urlencoded','User-Agent':'Mozilla/5.0'},
        body: `q=${encodeURIComponent(url)}&t=media&v=v2&cftoken=`
      }).then(r=>r.json());
      if(fd?.data){
        const m = fd.data.match(/href="([^"]+)"/);
        if(m) return res.json({downloadUrl: m[1], downloadUrlHD: m[1], downloadUrlSD: m[1]});
      }
    }catch(e){}

    res.json({error:'Video nuk u gjet, provo link tjeter - sigurohu qe videoja eshte publike'});

  }catch(e){
    res.json({error:'Video nuk u gjet, provo link tjeter', detail:e.message});
  }
});

app.listen(PORT, ()=> console.log('V9.1 ONLINE'));
