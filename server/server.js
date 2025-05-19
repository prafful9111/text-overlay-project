const express = require('express');
const cors = require('cors');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post('/api/generate-video', (req, res) => {
  const { name, email, number, sms, wapp } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Name and Email are required" });
  }

  const templateVideo = path.join(__dirname, 'videos', 'template.mp4');
  const outputVideo = path.join(__dirname, `output.mp4`);

  // Check if template video exists
  if (!fs.existsSync(templateVideo)) {
    return res.status(404).json({ error: 'Template video not found' });
  }

  // FFmpeg command to generate video
  const ffmpegProcess = ffmpeg(templateVideo)
    .videoFilter(
      `drawtext=fontfile='fonts/arial.ttf':text='${name}':fontcolor=black:fontsize=45:` +
      `enable='between(t,4.5,11.2)':x=880:y=200:` +
      `alpha='if(gte(t,4.5), if(lte(t,5.5), (t-4.5)/1, 1), 0)',` +
      `drawtext=fontfile='fonts/arial.ttf':text='${email}':fontcolor=black:fontsize=44:` +
      `enable='between(t,89,107.3)':x=790:y=222:` +
      `alpha='if(gte(t,89), if(lte(t,90), (t-89)/1, 1), 0)',` +
      `drawtext=fontfile='fonts/arial.ttf':text='${number}':fontcolor=black:fontsize=44:` +
      `enable='between(t,102,107.3)':x=1010:y=655:` +
      `alpha='if(gte(t,89), if(lte(t,90), (t-89)/1, 1), 0)',` +
      `drawtext=fontfile='fonts/arial.ttf':text='${sms}':fontcolor=black:fontsize=44:` +
      `enable='between(t,104,107.3)':x=1010:y=800:` +
      `alpha='if(gte(t,89), if(lte(t,90), (t-89)/1, 1), 0)',` +
      `drawtext=fontfile='fonts/arial.ttf':text='${wapp}':fontcolor=black:fontsize=44:` +
      `enable='between(t,106,107.3)':x=1010:y=940:` +
      `alpha='if(gte(t,89), if(lte(t,90), (t-89)/1, 1), 0)'`
    )
    .on('start', (commandLine) => {
      console.log('FFmpeg command:', commandLine);
    })
    .on('end', () => {
      console.log('Video generated successfully');
      // Only send the response once the video generation is complete
      res.status(200).json({ videoPath: `http://localhost:5000/api/videos/output.mp4` });
    })
    .on('error', (err) => {
      console.error('Error generating video:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error generating video', details: err.message });
      }
    })
    .save(outputVideo);
});

// Route to stream video
app.get('/api/videos/output.mp4', (req, res) => {
  const videoPath = path.join(__dirname, 'output.mp4');
  
  if (fs.existsSync(videoPath)) {
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");  
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = (end - start) + 1;
      const file = fs.createReadStream(videoPath, { start, end });

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": "video/mp4",
      });

      file.pipe(res);
    } else {
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": "video/mp4",
      });
      fs.createReadStream(videoPath).pipe(res);
    }
  } else {
    res.status(404).json({ error: "Video not found" });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
