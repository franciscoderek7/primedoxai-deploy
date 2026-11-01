require('dotenv').config();

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const agentsRoute = require('./routes/agents');

const logsRoute = require('./routes/logs');

const commandsRoute = require('./commands/router');

const statusRoute = require('./routes/status');

const controlRoute=require('./routes/control');

const tasksRoute=require('./routes/tasks');

const app = express();

// The business API lives in a sibling project (primedoxai-system) that is
// not part of this repository. Resolve it before requiring it: when it is
// absent Phoenix Core must still start, but when it is present and broken
// the real error must surface instead of being masked as "unavailable".
let businessRoute = null;
let businessUnavailableReason = null;
try {
  require.resolve('../primedoxai-system/api/business');
} catch (e) {
  businessUnavailableReason =
    'primedoxai-system/api/business is not present in this deployment';
}
if (!businessUnavailableReason) {
  businessRoute = require('../primedoxai-system/api/business');
}

const dashboardLiveRoute=require('./routes/dashboard-live');

const commandCenterRoute = require('./routes/command-center');

const loadModules=require('./core/module-loader');

app.use(cors());
app.use(express.json());

// productsRoute disabled - route not created yet
// products route disabled
app.use(express.json());

const routerRoute=require('./routes/router');

app.use(agentsRoute);
app.use(routerRoute);
app.use(express.json());
app.use(tasksRoute);
app.use(controlRoute);
app.use(statusRoute);
app.use(commandsRoute);
app.use(logsRoute);

app.use(express.json());

const servicesRoute = require('./routes/services');
const systemRoute = require('./routes/system');
const dashboardRoute = require('./routes/dashboard');

app.use(servicesRoute);
app.use(systemRoute);
app.use(dashboardRoute);
app.use(commandCenterRoute);

const PORT = process.env.PORT || 3000;
const VIGILAX_URL = process.env.VIGILAX_URL || "http://localhost:3002";

app.get('/health', (req, res) => {
  res.json({
    status: "online",
    service: "Phoenix Core",
    connected_nodes: [
      "Vigilax Sentinel"
    ]
  });
});

app.get('/api/vigilax/status', async (req, res) => {
  try {
    const response = await axios.get(`${VIGILAX_URL}/health`);

    res.json({
      phoenix_core: "online",
      vigilax: response.data
    });

  } catch (error) {
    res.status(503).json({
      phoenix_core: "online",
      vigilax: "offline",
      error: error.message
    });
  }
});

loadModules(app);

app.use(dashboardLiveRoute);

if (businessRoute) {
  app.use('/api/business', businessRoute);
} else {
  // Reports why the endpoint is unavailable rather than 404-ing as if the
  // route had never existed. No stub implementation is provided: nothing
  // here answers a business request.
  app.use('/api/business', (req, res) => {
    res.status(503).json({
      status: 'unavailable',
      service: 'business',
      reason: businessUnavailableReason
    });
  });
}

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════╗
║ PHOENIX CORE ONLINE          ║
║ Port: ${PORT}                 ║
║ Node: Vigilax Connected      ║
╚══════════════════════════════╝
`);
});
