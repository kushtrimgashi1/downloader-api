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

app.get('/', (req,res)=> res.json({status:'ONLINE', fix:'V5-POST'}));

app.get('/download', async (req,res)=>{
  let tiktokUrl = req.query.url;
  if(!tiktokUrl) return res.json({error:'no url'});
  try{
    const body = `url=${encodeURIComponent(tiktokUrl)}&count=12&cursor=0&web=1&hd=1`;
    const data = await fetch('https://www.tikwm.com/api/', {
      method:'POST',
      headers:{'Content-Type':'application/x-www-form-urlencoded','User-Agent':'Mozilla/5.0'},
      body: body
    }).then(r=>r.json());
    
    if(data && data.data && data.data.play){
      return res.json({downloadUrl: data.data.play, cover: data.data.cover, author: data.data.author?.unique_id});
    }
    return res.json({error:'TikTok nuk ktheu video', raw:data});
  }catch(e){
    res.json({error:e.message});
  }
});

app.listen(PORT, ()=> console.log('V5 FIXED'));
