# MineNepal Votifier

# MineNepal Votifier

Lightweight Votifier v2 client helper used by MineNepal to send signed vote messages to a Votifier v2 server.

## Installation

Install from npm:

```bash
npm install --save minenepal-votifier
```

## Usage

The module exports a function `vote(options, cb)` and also supports a Promise-based call when the callback is omitted.

Example (callback):

```js
const vote = require('minenepal-votifier');

const options = {
    host: '127.0.0.1',
    port: 8192,
    token: 'MYTOKEN',
    vote: {
        username: 'Herobrine',
        address: '127.0.0.1',
        timestamp: Date.now(),
        serviceName: 'MineNepal',
    },
};

vote(options, err => {
    if (err) return console.error('Vote failed:', err);
    console.log('Vote delivered');
});
```

Example (Promise):

```js
const vote = require('minenepal-votifier');

(async () => {
    try {
        await vote(options);
        console.log('Vote delivered');
    } catch (err) {
        console.error('Vote failed:', err);
    }
})();
```

## Options

- `host` (string) - Votifier server host
- `port` (number) - Votifier server port
- `token` (string) - Shared secret/token for HMAC signing
- `vote` (object) - Vote payload containing `username`, `address`, `timestamp`, `serviceName`
- `timeout` (number, optional) - Socket timeout in milliseconds (default 2000)

## Behavior & Errors

- Throws or rejects on invalid arguments.
- Calls back with an Error or resolves the Promise on failure.
- Returns successfully (callback with null / resolved Promise) when the server accepts the vote.

## Example file

See `example.js` for a concrete runnable example.

## License

MIT
