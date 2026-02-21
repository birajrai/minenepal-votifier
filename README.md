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

## Source & build

TypeScript source is in `src/index.ts`; build output is written to `dist/` and published from there.

## License

MIT

## Server frameworks

These short examples show how to use the package from server-side code. Never call this from browser/client code — the `token` is a secret and must stay on the server.

### Express (route example)

```js
const express = require('express');
const vote = require('minenepal-votifier');

const app = express();
app.use(express.json());

app.post('/api/vote', async (req, res) => {
    const { username, address } = req.body;
    const options = {
        host: process.env.VOTIFIER_HOST,
        port: Number(process.env.VOTIFIER_PORT),
        token: process.env.VOTIFIER_TOKEN,
        vote: {
            username,
            address,
            timestamp: Date.now(),
            serviceName: process.env.SERVICE_NAME || 'MineNepal',
        },
    };

    try {
        await vote(options);
        res.status(200).json({ ok: true });
    } catch (err) {
        res.status(502).json({ error: err.message });
    }
});

app.listen(3000);
```

### Next.js (API Route)

For Next.js pages/api route (Next 12/13):

```js
// pages/api/vote.js
import vote from 'minenepal-votifier';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    const { username, address } = req.body;

    const options = {
        host: process.env.VOTIFIER_HOST,
        port: Number(process.env.VOTIFIER_PORT),
        token: process.env.VOTIFIER_TOKEN,
        vote: { username, address, timestamp: Date.now(), serviceName: process.env.SERVICE_NAME },
    };

    try {
        await vote(options);
        res.status(200).json({ ok: true });
    } catch (err) {
        res.status(502).json({ error: err.message });
    }
}
```

If you're using the App Router or server components, the same server-side logic applies — ensure the code runs only on the server and environment variables are configured.

### Security & Deployment notes

- Keep `VOTIFIER_TOKEN` in server-side environment variables or a secrets manager.
- Do not log the token or full signed payload in production.
- Consider running your Votifier connection from a backend worker or queue if you expect high volume, to avoid delaying HTTP responses.
