// FIX per vm.tiktok.com - perdor POST
app.get('/download', async (req,res)=>{
  let url = req.query.url;
  try{
    const form = `url=${encodeURIComponent(url)}&count=12&cursor=0&web=1&hd=1`;
    const data = await fetch('https://www.tikwm.com/api/', {
      method:'POST',
      headers:{'Content-Type':'application/x-www-form-urlencoded'},
      body: form
    }).then(r=>r.json());
    
    if(data.data && data.data.play){
      return res.json({downloadUrl: data.data.play, cover: data.data.cover});
    }
    res.json({error:'Nuk u gjet'});
  }catch(e){ res.json({error:e.message}); }
});
