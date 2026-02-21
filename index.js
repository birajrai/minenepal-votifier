'use strict';

const crypto = require('crypto');
const net = require('net');

function createMessage(header, vote, options) {
    const data = header.trim().split(/\s+/);

    if (data.length < 3) {
        throw new Error('Not a Votifier v2 protocol server');
    }

    // data[2] is the challenge token (may include newline)
    vote.challenge = data[2].replace(/\r?\n$/, '');
    const voteAsJson = JSON.stringify(vote);
    const digest = crypto.createHmac('sha256', options.token);
    digest.update(voteAsJson);
    const sig = digest.digest('base64');

    const message = JSON.stringify({ payload: voteAsJson, signature: sig });
    const messageLength = Buffer.byteLength(message, 'utf8');
    const messageBuffer = Buffer.alloc(4 + messageLength);
    messageBuffer.writeUInt16BE(0x733a, 0);
    messageBuffer.writeUInt16BE(messageLength, 2);
    messageBuffer.write(message, 4, 'utf8');
    return messageBuffer;
}

function _vote(options, cb) {
    if (!options || typeof options !== 'object') return cb(new Error('options must be an object'));
    if (!options.host || !options.port || !options.token || !options.vote) {
        return cb(new Error("missing host, port, token, or vote in 'options'"));
    }

    const vote = options.vote;
    if (!vote.username || !vote.address || !vote.timestamp || !vote.serviceName) {
        return cb(new Error("missing username, address, timestamp, or serviceName in 'vote'"));
    }

    const timeoutMs = typeof options.timeout === 'number' ? options.timeout : 2000;

    const socket = net.createConnection({ port: options.port, host: options.host });
    let finished = false;

    function done(err) {
        if (finished) return;
        finished = true;
        try {
            socket.setTimeout(0);
        } catch (e) {}
        try {
            socket.removeAllListeners();
        } catch (e) {}
        try {
            socket.end();
        } catch (e) {}
        cb(err || null);
    }

    socket.setTimeout(timeoutMs, function () {
        done(new Error('Socket timeout'));
    });

    socket.on('error', function (err) {
        done(new Error('Socket error: ' + (err && err.message ? err.message : err)));
    });

    socket.once('data', function (buf) {
        try {
            const message = createMessage(buf.toString('utf8'), vote, options);
            socket.write(message);
        } catch (e) {
            return done(e);
        }

        socket.once('data', function (respBuf) {
            try {
                const respText = respBuf.toString('utf8');
                const resp = JSON.parse(respText);
                if (resp && resp.status === 'error') {
                    const cause = resp.cause || 'error';
                    const msg = resp.errorMessage || resp.message || 'unknown';
                    return done(new Error(cause + ': ' + msg));
                }
                return done(null);
            } catch (e) {
                return done(e);
            }
        });
    });

    socket.on('end', function () {
        if (!finished) done(new Error('Socket ended unexpectedly'));
    });
}

module.exports = function vote(options, cb) {
    if (typeof cb !== 'function') {
        return new Promise(function (resolve, reject) {
            _vote(options, function (err) {
                if (err) return reject(err);
                resolve();
            });
        });
    }
    return _vote(options, cb);
};
