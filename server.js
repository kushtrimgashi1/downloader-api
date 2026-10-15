const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use((req,res,next)=>{
  res.header('Access-Control-Allow-Origin','*');
  res.header('Access-Control-Allow-Methods','GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers','*');
  if(req.method==='OPTIONS') return res.sendStatus(200);
  next();
});

app.get('/', (req,res)=> res.json({status:'ONLINE', api:'downloader-api-czu3'}));

app.get('/download', async (req,res)=>{
  const url = req.query.url;
  if(!url) return res.json({error:'Mungon url'});
  try{
    // Fallback i shpejte pa yt-dlp per TikTok/Insta - kthen url direkt per test
    // Nese yt-dlp s'punon, perdorim TikWM per TikTok
    if(url.includes('tiktok.com')){
      const api = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`;
      const r = await fetch(api).then(x=>x.json());
      if(r.data && r.data.play) return res.json({downloadUrl: r.data.play});
    }
    // Per Insta/FB - provojme yt-dlp nese eshte gati
    const { default: YT } = await import('yt-dlp-wrap').then(m=>m).catch(()=>({}));
    res.json({downloadUrl: url, message:'fallback - provo TikTok per testim'});
  }catch(e){
    res.json({error:e.message, downloadUrl: url});
  }
});

app.listen(PORT, ()=> console.log('ONLINE '+PORT));
