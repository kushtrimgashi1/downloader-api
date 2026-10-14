const express = require('express');
const cors = require('cors');
const { default: YTDlpWrap } = require('yt-dlp-wrap');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
let ytDlpWrap;

(async () => {
  const binPath = path.join(__dirname, 'yt-dlp');
  try {
    if (!fs.existsSync(binPath)) {
      console.log('Duke shkarkuar yt-dlp...');
      await YTDlpWrap.downloadFromGithub(binPath);
    }
    ytDlpWrap = new YTDlpWrap(binPath);
    console.log('yt-dlp gati!');
  } catch(e){ console.error(e); }
})();

app.get('/', (req,res)=>{
  res.json({status:'OK', message:'API gati - Kushtrim', endpoints:['/download?url=LINKU']});
});

app.get('/download', async (req,res)=>{
  try {
    const url = req.query.url;
    if(!url) return res.status(400).json({error:'Mungon url'});

    const directUrl = await ytDlpWrap.execPromise([
      url,
      '-f', 'best',
      '-g'
    ]);

    const cleanUrl = directUrl.trim().split('\n')[0];
    res.json({ downloadUrl: cleanUrl });

  } catch(e){
    console.error(e);
    res.status(500).json({error: e.message});
  }
});

app.listen(PORT, ()=> console.log(`API running on ${PORT}`));
