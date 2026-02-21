const assert = require('assert');
const net = require('net');
const crypto = require('crypto');
const vote = require('../index');

function timeout(ms) {
    return new Promise(r => setTimeout(r, ms));
}

async function testSendSignedVote() {
    const server = net.createServer();
    await new Promise(res => server.listen(0, '127.0.0.1', res));
    const port = server.address().port;
    const token = 'MYTOKEN';

    server.on('connection', socket => {
        socket.write('VOTIFIER 2 challenge\n');
        let buf = Buffer.alloc(0);
        socket.on('data', data => {
            buf = Buffer.concat([buf, data]);
            if (buf.length >= 4) {
                const magic = buf.readUInt16BE(0);
                assert.strictEqual(magic, 0x733a);
                const len = buf.readUInt16BE(2);
                if (buf.length >= 4 + len) {
                    const msg = buf.slice(4, 4 + len).toString('utf8');
                    const obj = JSON.parse(msg);
                    assert.ok(obj.payload);
                    assert.ok(obj.signature);
                    const payload = JSON.parse(obj.payload);
                    const expected = crypto
                        .createHmac('sha256', token)
                        .update(JSON.stringify(payload))
                        .digest('base64');
                    assert.strictEqual(obj.signature, expected);
                    socket.write(JSON.stringify({ status: 'ok' }));
                    socket.end();
                    server.close();
                }
            }
        });
    });

    const options = {
        host: '127.0.0.1',
        port,
        token,
        vote: {
            username: 'tester',
            address: '127.0.0.1',
            timestamp: Date.now(),
            serviceName: 'MineNepal',
        },
        timeout: 2000,
    };

    await vote(options);
}

async function testInvalidOptions() {
    try {
        await vote(null);
        throw new Error('expected rejection');
    } catch (err) {
        assert.ok(err instanceof Error);
    }
}

function testCallbackAPI() {
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.listen(0, '127.0.0.1', () => {
            const port = server.address().port;
            const token = 'MYTOKEN';

            server.on('connection', socket => {
                socket.write('VOTIFIER 2 c\n');
                let buf = Buffer.alloc(0);
                socket.on('data', data => {
                    buf = Buffer.concat([buf, data]);
                    if (buf.length >= 4) {
                        const len = buf.readUInt16BE(2);
                        if (buf.length >= 4 + len) {
                            socket.write(JSON.stringify({ status: 'ok' }));
                            socket.end();
                            server.close();
                        }
                    }
                });
            });

            const options = {
                host: '127.0.0.1',
                port,
                token,
                vote: {
                    username: 'cbuser',
                    address: '127.0.0.1',
                    timestamp: Date.now(),
                    serviceName: 'MineNepal',
                },
            };

            vote(options, function (err) {
                if (err) return reject(err);
                resolve();
            });
        });
    });
}

async function run() {
    const tests = [
        { name: 'sends a signed vote (Promise API)', fn: testSendSignedVote },
        { name: 'rejects when options are invalid', fn: testInvalidOptions },
        { name: 'works with callback API', fn: testCallbackAPI },
    ];

    for (const t of tests) {
        try {
            await t.fn();
            console.log('✔', t.name);
        } catch (err) {
            console.error('✖', t.name);
            console.error(err && err.stack ? err.stack : err);
            process.exitCode = 1;
            return;
        }
        // small pause to let sockets close cleanly
        await timeout(20);
    }
    console.log('\nAll tests passed');
}

if (require.main === module) {
    run().catch(e => {
        console.error(e);
        process.exit(1);
    });
}

module.exports = { testSendSignedVote, testInvalidOptions, testCallbackAPI };
