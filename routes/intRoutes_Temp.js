const express = require('express');
const router = express.Router();
const controller = require('../controllers/controller');

// Middleware for basic authentication
const basicauth = (req, res, next) => {
    const auth = { login: 'pedal-summit', password: 'ilovepedals' };
  
    // Parse login and password from the headers
    const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');
  
    // Verify login and password
    if (login && password && login === auth.login && password === auth.password) {
      return next();
    }
  
    // Access denied, send 401 response
    res.set('WWW-Authenticate', 'Basic realm="401"');
    res.status(401).send('Authentication required.');
  };

  const createRoutes = (sockserver) => {
    router.get('/drum', controller.drum_get);

    router.get("/video/:videoid", controller.video_get);

    router.get("/pedal-summit", controller.pedalsummit_get);

    router.put("/minting", (req, res) => {
      controller.minting_put(req, res, sockserver);
    });

    return router;
  };

module.exports = createRoutes;