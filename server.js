const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({origin:'*'}));
app.use(express.json());

app.get('/', (req,res)=> res.json({status:'ONLINE', version:'V9-HD-UNIVERSAL', fb:'ok', tiktok:'ok'}));

app.get('/download', async (req,res)=>{
  let url = req.query.url || '';
  if(!url) return res.json({error:'no url'});

  try{
    // 1. ZGJERO krejt short linket
    if(url.includes('vm.tiktok') || url.includes('vt.tiktok') || url.includes('facebook.com/share') || url.includes('fb.watch')){
      try{
        const r = await fetch(url, {
          redirect:'follow',
          headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36','Accept':'text/html'}
        });
        // Per FB share, provo me marr final URL nga HTML
        const html = await r.text().catch(()=> '');
        const match = html.match(/https:\/\/www\.facebook\.com\/reel\/\d+/) || html.match(/https:\/\/www\.facebook\.com\/watch\/\?v=\d+/);
        if(match) url = match[0];
        else url = r.url || url;
      }catch(e){}
    }

    // 2. TikTok me TikWM HD (me i shpejti)
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
    }

    // 3. UNIVERSAL YT-DLP per FB, Insta, TikTok (HD)
    const ytDlp = (await import('yt-dlp-exec')).default;
    const result = await ytDlp(url, {
      dumpSingleJson: true,
      noWarnings: true,
      noCheckCertificate: true,
      preferFreeFormats: true,
      addHeader: ['referer:facebook.com']
    });

    if(result?.url || result?.requested_downloads?.[0]?.url || result?.formats){
      let bestUrl = result.url || result.requested_downloads?.[0]?.url;
      if(!bestUrl && result.formats){
        // merr formatin me te mire HD
        const best = result.formats.filter(f=>f.vcodec!=='none').sort((a,b)=>(b.height||0)-(a.height||0))[0];
        bestUrl = best?.url;
      }
      if(bestUrl){
        return res.json({
          downloadUrl: bestUrl,
          downloadUrlHD: bestUrl,
          downloadUrlSD: bestUrl,
          cover: result.thumbnail,
          title: result.title
        });
      }
    }

    res.json({error:'Video nuk u gjet, provo link tjeter - sigurohu qe videoja eshte publike'});

  }catch(e){
    console.error(e);
    res.json({error:'Video nuk u gjet, provo link tjeter', detail:e.message.slice(0,100)});
  }
});

app.listen(PORT, ()=> console.log('V9 UNIVERSAL ONLINE'));
