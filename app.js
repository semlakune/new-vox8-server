if (process.env.NODE_ENV !== "production") {
  require('dotenv').config()
}

const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const {disconnect} = require("./config/redisClient");
const compression = require('compression')
const {errorHandlingMiddleware} = require("./services");
const app = express();
const port = process.env.PORT || 4001;

const corsOptions = {
  origin: process.env.ORIGIN_URL,
};

app.use(cors(corsOptions)); // cors(corsOptions)
app.use(compression());
app.use(express.json());
app.use('/', routes);

process.on('SIGINT', async () => {
  await disconnect();
  console.log('Redis client disconnected');
  process.exit(0);
});

app.use(errorHandlingMiddleware);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});