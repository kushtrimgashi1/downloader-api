const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use((req,res,next)=>{
  res.header('Access-Control-Allow-Origin','*');
  res.header('Access-Control-Allow-Methods','*');
  res.header('Access-Control-Allow-Headers','*');
  next();
});

app.get('/', (req,res)=> res.json({status:'ONLINE', version:'V7-ULTRA'}));

app.get('/download', async (req,res)=>{
  let url = req.query.url || '';
  try{
    // 1. Zgjerom vm.tiktok.com
    if(url.includes('vm.tiktok.com') || url.includes('vt.tiktok.com')){
      try{
        const r = await fetch(url, {redirect:'follow'});
        url = r.url;
      }catch(e){}
    }
    // 2. Perdorim API qe PUNON nga Render - SSSTik
    // Metoda e re - pa JSON, me HTML
    const apiUrl = `https://ssstik.io/abc?url=dl`;
    const form = new URLSearchParams();
    form.append('id', url);
    form.append('locale', 'en');
    form.append('tt', 'dW5kX3Rva2Vu');

    const resp = await fetch(apiUrl, {
      method:'POST',
      headers:{
        'Content-Type':'application/x-www-form-urlencoded',
        'User-Agent':'Mozilla/5.0',
        'Origin':'https://ssstik.io',
        'Referer':'https://ssstik.io/en'
      },
      body: form.toString()
    });
    const html = await resp.text();

    // Nxirr linkun nga HTML
    const match = html.match(/href="([^"]+)"[^>]*>Without watermark/);
    if(match && match[1]){
      return res.json({downloadUrl: match[1]});
    }

    // Fallback 2 - provojm TikWM prap por me header te ri
    const tikwmBody = `url=${encodeURIComponent(url)}&count=12&cursor=0&web=1&hd=1`;
    const tikwmResp = await fetch('https://www.tikwm.com/api/', {
      method:'POST',
      headers:{'Content-Type':'application/x-www-form-urlencoded','User-Agent':'Mozilla/5.0'},
      body: tikwmBody
    });
    const tikwmText = await tikwmResp.text();
    try{
      const j = JSON.parse(tikwmText);
      if(j?.data?.play) return res.json({downloadUrl:j.data.play});
    }catch(e){}

    return res.json({error:'Smujta me nxjerr linkun', debug: html.slice(0,300)});
  }catch(e){
    res.json({error:e.message});
  }
});

app.listen(PORT);
