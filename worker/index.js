const keys = require('./keys'); // File holding redis hostname and port
const redis = require('redis'); // File for creating a redis client

// Create a redis client
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisClient,
    retry_strategy: () => 1000
});
const sub = redisClient.duplicate();    // Make a duplicate of the redis client

function fib(index) {
    // On purpose slow recursive solution
    if (index < 2) return 1;
    return fib(index - 1) + fib(index - 2);
}

// Have the redis client 'sub' subscribe to the 'insert' channel.
// The messages published to the insert channel will be numbers entered by the user on the front end site (see /server/index.js)
//
// When a message is published on this channel, the redis client 'redisClient' will insert the key/value
// pair of (message, fib(message))
sub.on('message', (channel, message) => {
    redisClient.hset('values', message, fib(parseInt(message)));
});
sub.subscribe('insert');
