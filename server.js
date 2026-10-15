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

app.get('/', (req,res)=> res.json({status:'ONLINE', version:'3'}));

app.get('/download', async (req,res)=>{
  const url = req.query.url;
  if(!url) return res.status(400).json({error:'url missing'});
  try{
    if(url.includes('tiktok.com')){
      const api = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`;
      const data = await fetch(api).then(r=>r.json());
      if(data?.data?.play) return res.json({downloadUrl: data.data.play, type:'tiktok'});
    }
    return res.json({downloadUrl: url});
  }catch(e){ res.json({error:e.message}); }
});

// KY E BEN SHKARKIMIN REAL
app.get('/proxy', async (req,res)=>{
  try{
    const videoUrl = req.query.url;
    if(!videoUrl) return res.status(400).send('missing url');
    const response = await fetch(videoUrl);
    const buffer = await response.arrayBuffer();
    res.header('Content-Disposition', 'attachment; filename="video.mp4"');
    res.header('Content-Type', 'video/mp4');
    res.send(Buffer.from(buffer));
  }catch(e){ res.status(500).send(e.message); }
});

app.listen(PORT, ()=> console.log('V3 ONLINE'));
