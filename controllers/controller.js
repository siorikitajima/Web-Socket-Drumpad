const fs = require('fs');
const path = require("path");
const QRCode = require('qrcode');

const drum_get = (req, res) => {
  const qrParam = req.query.qr;

  if (qrParam !== 'valid') {
    return res.redirect('/scantoenter');
  }
  
  res.render('drum');
};

const pedalsummit_get = (req, res) => {
    res.render('pedal-summit');
};

const thankyou_get = (req, res) => {
  res.render('thankyou');
};

const scantoenter_get = (req, res) => {
  res.render('scantoenter');
};

const reconnectlater_get = (req, res) => {
  res.render('reconnect-later');
}

// const video_get = (req, res) => {
//     const videoid = req.params.videoid;
//   const video = true;
//     res.render('video', { video: video, videoid: videoid });
//   };

  // const minting_put = (req, res, sockserver) => {
  //   // Create folder if it hasn't been created
  //   const uploadFolder = `${__dirname}/../public/uploads`;
  //   if (!fs.existsSync(uploadFolder)) {
  //     fs.mkdirSync(uploadFolder, { recursive: true });
  //   }
    
  //   const dateNow = Date.now();
  //   const newId = dateNow;
  //   const fileName = `${newId}.mp4`;
  //   const uploadFilename = fileName;
  //   const uploadPath = path.join(uploadFolder, uploadFilename);
  //   const uploadUrl = `https://drum.patternbased.com/video/${newId}`;
  
  //   // Generate QR Code
  //   QRCode.toDataURL(uploadUrl, { type: 'png' }, (err, png) => {
  //     if (err) {
  //       console.error(err);
  //       return res.status(500).end("Error generating QR Code");
  //     }
      
  //     const blob = png;
  //     console.log(uploadUrl);
  
  //     // Send Updated info to Clients connected to /png URL
  //     sockserver.clients.forEach(client => {
  //         let waiting = 'waiting:<p id="openmsg">QR CODE<br/>SHOWS HERE</p>';
  //         client.send(waiting);
  //         setTimeout(() => {
  //           let message = `png:<p id="newID">Video ID: <span>${newId}</span></p><div><img src="${blob}" alt="QR code"></div>`;
  //           client.send(message);
  //         }, 10000);
  //     });
  //   });
  
  //   // Create Write stream
  //   const writeStream = fs.createWriteStream(uploadPath);
  //   writeStream.on("error", (err) => {
  //     console.error(err); // For now, simply console log it.
  //     return res.status(500).end("Error writing video");
  //   });
  
  //   // Handle end event
  //   req.on("end", () => {
  //     return res.status(200).end(uploadPath);
  //   });
  
  //   // Start pipe
  //   req.pipe(writeStream);
  // };

module.exports = {
    drum_get,
    pedalsummit_get,
    thankyou_get,
    scantoenter_get,
    reconnectlater_get
    // video_get,
    // minting_put
}