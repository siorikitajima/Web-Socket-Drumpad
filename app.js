const http = require("http");
const { render } = require('ejs');
const express = require("express");
const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');

const serverPort = 3130;
const WebSocket = require('ws');
const server = http.createServer(app);

let keepAliveId = null;

let OG = {
  "a-1": 0.0, "a-2": 1.0, "a-3": 0.0, "a-4": 1.0, "a-5": 0.0, "a-6": 1.0, "a-7": 0.0, "a-8": 1.0, 
  "b-1": 0.0, "b-2": 1.0, "b-3": 0.0, "b-4": 1.0, "b-5": 0.0, "b-6": 1.0, "b-7": 0.0, "b-8": 1.0,
  "c-1": 1.0, "c-2": 0.0, "c-3": 0.0, "c-4": 0.0, "c-5": 1.0, "c-6": 0.0, "c-7": 0.0, "c-8": 0.0,
  "d-1": 0.0, "d-2": 0.0, "d-3": 0.0, "d-4": 1.0, "d-5": 0.0, "d-6": 0.0, "d-7": 0.0, "d-8": 1.0
};

let pattern = { ...OG };
let lastPattern = { ...OG };

const wss = new WebSocket.Server({ server });
const sockserver = wss; // Make sockserver globally accessible
server.listen(serverPort, () => console.log(`Server listening on ${serverPort}`));

const intRoutes = require('./routes/intRoutes')(sockserver);

const clientsInfo = new Map(); // To store connection times

wss.on("connection", function (ws, req) {
  
  const currentTime = new Date();
  const url = require('url');
  const query = url.parse(req.url, true).query;
  const isTouchDesigner = query.client === 'touchdesigner'; // Check if TouchDesigner client

  clientsInfo.set(ws, { connectedAt: currentTime, isTouchDesigner }); // Store connection time and client type

  console.log("Connection Opened", isTouchDesigner ? "TouchDesigner" : "Web Client");
  console.log("Client size:", wss.clients.size);

  const nonTouchClients = Array.from(wss.clients).filter(client => !clientsInfo.get(client).isTouchDesigner);

  // If client count exceeds 5
  if (nonTouchClients.length > 5) { // Only count non-TouchDesigner clients
    const oldestClient = nonTouchClients[0]; // Get the oldest non-TouchDesigner client
    const oldestClientTime = clientsInfo.get(oldestClient).connectedAt;
    const timeElapsed = (currentTime - oldestClientTime) / 1000 / 60; // Time in minutes

    console.log("Time elapsed:", timeElapsed);
    if (timeElapsed >= 10) {
      // If the oldest client has been connected for 10 minutes or more, disconnect them
      oldestClient.send(JSON.stringify({ message: 'disconnect', redirectUrl: '/thankyou' }));
      oldestClient.close(); // Close the connection
      clientsInfo.delete(oldestClient); // Remove from tracking
    } else {
      // New user gets redirected because the oldest client has been connected for less than 10 minutes
      ws.send(JSON.stringify({ message: 'reconnectLater', redirectUrl: '/reconnect-later' }));
      ws.close(); // Close the connection for the new user
      clientsInfo.delete(ws); // Remove from tracking
    }
  }

  if (!keepAliveId) {
    keepServerAlive();
  }

  ws.on("message", (data) => {
    try {
      const received = JSON.parse(data);
      lastPattern = { ...lastPattern, ...received };
      pattern = { ...lastPattern };
      console.log("Updated pattern:", pattern);
      broadcast(ws, JSON.stringify(pattern), false);
    } catch (e) {
      const stringifiedData = data.toString();
      if (stringifiedData === 'pong') {
        console.log('keepAlive');
        return;
      } else if (stringifiedData === 'request') {
        console.log('Requested');
        broadcast(ws, JSON.stringify(pattern), true);
        return;
      } else {
        console.log("Non-JSON message received:", stringifiedData);
        broadcast(ws, stringifiedData, false);
        return;
      }
    }
  });

  ws.on("close", (data) => {
    console.log("Closing connection");
    clientsInfo.delete(ws); // Remove client on close
    if (wss.clients.size === 0) {
      console.log("Last client disconnected, stopping keepAlive interval");
      clearInterval(keepAliveId);
      keepAliveId = null;
    }
  });
});

const broadcast = (ws, message, includeSelf) => {
  wss.clients.forEach((client) => {
    if (includeSelf || client !== ws) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  });
};

const keepServerAlive = () => {
  keepAliveId = setInterval(() => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send('ping');
      }
    });
  }, 50000);
};

app.get('/', (req, res) => {
    res.send('Hello World!');
});

// app.get('/png', (req, res) => {
//   res.render('png');
// });

app.use(intRoutes);
