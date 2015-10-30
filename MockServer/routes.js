var express = require('express');
var router = express.Router();
var _ = require('lodash');
var db = require('./db');

router.get('/people/:id', function (req, res, next) {
    var id = +req.params.id;
    res.send(_.find(db.people, {'id': id}));
});

router.post('/login', function (req, res) {
    console.log(req.headers.authorization);
    if (req.headers.authorization) {
        var authPairEncoded = req.headers.authorization.replace('Basic ', '');
        var authPair = new Buffer(authPairEncoded, 'base64').toString('ascii').split(':');
        if (authPair[0] === 'test' && authPair[1] === 'test') {
            req.session.username = authPair[0];
        }
        res.send({"message": "Login successful"});
        console.log('logged in successful');
        return;
    }
    res.status(401);
    res.json({
        "status": 401,
        "message": "Invalid credentials"
    });
    return;
});

router.post('/logout', function (req, res) {
    console.log('logging out: ' + req.session.username);
    req.session = null;
    res.send({'message': 'logged out successfully'});
});

router.post('/favourites', function (req, res) {
    console.log(req.session);
    if (req.session && req.session.username) {
        res.send({'message': 'success'});
    }
    else {
        res.status(401).send('Not authenticated');
    }
});

router.post('/upload', function (req, res) {
    console.log("upload req came");
    if (req.files && req.files.file && req.files.file.path) {
        res.send(req.files.file.path);
    }
    else {
        res.send({});
    }
});

router.post('/save-search', function (req, res) {
    var rows = db["savedsearches-blocks"][0].form.fields[0].fields[0].rows;
    var search = {
        "options": {
            "createAllowed": false,
            "deleteAllowed": true
        },
        "fields": [
            {
                "id": db["savedsearches-blocks"][0].form.fields[0].fields[0].rows.length + '',
                "type": "link",
                "label": req.body.title,
                "value": req.body.filters,
                "href": "/#/search?" + _.map(req.body.filters, function (val, key) {
                    return key + '=' + val;
                }).join('&'),
                "options": {
                    "state": "view"
                }
            }
        ]
    };
console.log(search);
    rows.push(search);
    console.log(req.body);
    res.send({
        notification: {
            type: 'balanced',
            message: 'Search has been saved successfully'
        }
    });
});

router.delete('/save-search/:id', function (req, res) {
    var rows = db["savedsearches-blocks"][0].form.fields[0].fields[0].rows;
    _.remove(rows, function (row) {
        return row.fields[0].id === req.params.id;
    });
    res.send({
        notification: {
            type: 'assertive',
            message: 'Search has been deleted successfully'
        }
    });
});

router.get('/root', function (req, res, next) {
    console.log('root');
    db.root.links.userMe.href = req.session.username ? 'http://127.0.0.1:3000/people/1857' : 'http://127.0.0.1:3000/people/0';
    res.send(db.root);
});

router.get('/:item', function (req, res, next) {
    if (db[req.params.item])
        res.send(db[req.params.item]);
    else
        res.status(404).send('Not found');
});

module.exports = router;
