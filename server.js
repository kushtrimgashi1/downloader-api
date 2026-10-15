const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use((req,res,next)=>{
  res.header('Access-Control-Allow-Origin','*');
  res.header('Access-Control-Allow-Methods','GET');
  res.header('Access-Control-Allow-Headers','*');
  next();
});

app.get('/', (req,res)=> res.json({status:'ONLINE', version:'V9.3-FINAL'}));

app.get('/download', async (req,res)=>{
  let url = req.query.url || '';
  if(!url) return res.json({error:'no url'});

  console.log('REQ:', url);

  try{
    // ===== TIKTOK =====
    if(url.includes('tiktok.com') || url.includes('vm.tiktok') || url.includes('vt.tiktok')){
      // 1. TikWM direkt - punon me vm.tiktok
      try{
        const form = `url=${encodeURIComponent(url)}&count=12&cursor=0&web=1&hd=1`;
        const r = await fetch('https://www.tikwm.com/api/', {
          method:'POST',
          headers:{
            'Content-Type':'application/x-www-form-urlencoded',
            'User-Agent':'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
            'Referer':'https://www.tikwm.com/'
          },
          body: form
        });
        const j = await r.json();
        console.log('TikWM:', JSON.stringify(j).slice(0,200));
        if(j?.data?.play){
          return res.json({
            downloadUrl: j.data.hdplay || j.data.play,
            downloadUrl
