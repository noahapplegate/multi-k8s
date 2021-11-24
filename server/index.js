const keys = require('./keys');

// Express App Setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();      // Create express app, handles requests to and from react-app
app.use(cors());            // Cors - 
app.use(bodyParser.json()); // Bodyparser - 


// Postgres Client setup
const { Pool } = require('pg');
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort
});

pgClient.on("connect", (client) => {
    client
      .query("CREATE TABLE IF NOT EXISTS values (number INT)")
      .catch((err) => console.error(err));
  });

  // Redis Client setup
  const redis = require('redis');
  const redisClient = redis.createClient({
      host: keys.redisHost,
      port: keys.redisPort,
      retry_strategy: () => 1000
  });
  const redisPublisher = redisClient.duplicate();

  // Express route handlers
app.get('/', (req, res) => {
    res.send('Hi');
});

// This request is made when the frontend is loaded to display all values previously entered
// This makes a query to the postgres database
app.get('/values/all', async (req, res) => {
    const values = await pgClient.query('SELECT * from values');

    res.send(values.rows);
});

// This request is made when the frontend is loaded to display all (key, value) pairs previously calculated
// This makes a get request to the redis database
app.get('/values/current', async (req, res) => {
    redisClient.hgetall('values', (err, values) => {
        res.send(values);
    });
});

// This request is made when the user submits a number on the front end
// Upon receiving this POST request, the express server will
// create a default key/value pair on the redis client and publish the submitted number on the 'insert' channel
// a separate redis client in /worker/index.js is subscribed to this channel to calculate fib(index)
//
// the express server will also insert the submitted value into the postgres database
app.post('/values', async (req, res) => {
    const index = req.body.index;

    if (parseInt(index) > 40) {
        return res.status(422).send('Index too high');
    }

    redisClient.hset('values', index, 'Nothing yet!');
    redisPublisher.publish('insert', index);
    pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);

    res.send({ working: true });
});

app.listen(5000, err => {
    console.log('Listening');
});
