# MineNepal Votifier

This library supports network protocol.

## Installation

`npm install --save minenepal-votifier`

## Usage

```js
var vote = require('minenepal-votifier');

var options = {
    host: '127.0.0.1',
    port: 8192,
    token: 'MYTOKEN',
    vote: {
        username: 'Herobrine',
        address: '127.0.0.1',
        timestamp: new Date().getTime(),
        serviceName: 'MineNepal',
    },
};

vote(options, function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log('success');
    }
});
```
