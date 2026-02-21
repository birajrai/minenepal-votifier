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

````js
const vote = require('minenepal-votifier');

# MineNepal Votifier

Lightweight Votifier v2 client helper for sending signed vote messages to a Votifier v2 server.

Install

```bash
npm install --save minenepal-votifier
````

Quick usage (Promise):

```js
const vote = require('minenepal-votifier');

const options = {
    host: process.env.VOTIFIER_HOST || '127.0.0.1',
    port: Number(process.env.VOTIFIER_PORT) || 8192,
    token: process.env.VOTIFIER_TOKEN || 'MYTOKEN',
    vote: { username: 'Herobrine', address: '127.0.0.1', timestamp: Date.now(), serviceName: 'MineNepal' },
};

(async () => {
    try {
        await vote(options);
        console.log('Vote delivered');
    } catch (err) {
        console.error('Vote failed:', err);
    }
})();
```

Options

- `host` (string) - Votifier server host
- `port` (number) - Votifier server port
- `token` (string) - Shared secret/token for HMAC signing
- `vote` (object) - `{ username, address, timestamp, serviceName }`
- `timeout` (number, optional) - socket timeout in ms (default 2000)

Server frameworks

- Express: Compatible with **Express 5.2.1**

    Minimal route example:

    ```js
    const express = require('express');
    const vote = require('minenepal-votifier');
    const app = express();
    app.use(express.json());

    app.post('/api/vote', async (req, res) => {
        try {
            await vote({
                host: process.env.VOTIFIER_HOST,
                port: Number(process.env.VOTIFIER_PORT),
                token: process.env.VOTIFIER_TOKEN,
                vote: { ...req.body, timestamp: Date.now(), serviceName: process.env.SERVICE_NAME },
            });
            res.status(200).json({ ok: true });
        } catch (err) {
            res.status(502).json({ error: err.message });
        }
    });
    ```

- Next.js: Compatible with **Next.js 16.1.6**

    Minimal Pages API example (`pages/api/vote.js`):

    ```js
    import vote from 'minenepal-votifier';

    export default async function handler(req, res) {
        if (req.method !== 'POST') return res.status(405).end();
        try {
            await vote({
                host: process.env.VOTIFIER_HOST,
                port: Number(process.env.VOTIFIER_PORT),
                token: process.env.VOTIFIER_TOKEN,
                vote: { ...req.body, timestamp: Date.now(), serviceName: process.env.SERVICE_NAME },
            });
            res.status(200).json({ ok: true });
        } catch (err) {
            res.status(502).json({ error: err.message });
        }
    }
    ```

Links

- npm: https://www.npmjs.com/package/minenepal-votifier
- GitHub: https://github.com/birajrai/minenepal-votifier

Security

- Never expose the `token` to client-side code. Keep it in server environment variables or a secrets manager.

License

- MIT — see [LICENSE](LICENSE)

App Router example (`app/api/vote/route.js`) — Next.js 13+ / 16.x:

```js
import vote from 'minenepal-votifier';

export async function POST(request) {
    const body = await request.json();
    try {
        await vote({
            host: process.env.VOTIFIER_HOST,
            port: Number(process.env.VOTIFIER_PORT),
            token: process.env.VOTIFIER_TOKEN,
            vote: { ...body, timestamp: Date.now(), serviceName: process.env.SERVICE_NAME },
        });
        return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 502,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
```
