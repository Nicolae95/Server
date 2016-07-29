var express = require('express');

var app = express();
var bodyParser = require('body-parser');


app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
});

app.use(bodyParser.json());

app.use(function logJsonParseError(err, req, res, next) {
    if (err.status === 400 && err.name === 'SyntaxError' && err.body) {
        console.log('JSON body parser error!');
        console.log('send valid JSON');
        res.send('send valid JSON');
    } else {
        next();
    }
});

app.get('/', function (req, res) {
    res.send('dadada');
});

var entry = require('./controllers/entry');
app.get('/entry', entry.getAllEntriesApi);
app.get('/entry/:EntryId', entry.getEntryByIdApi);
app.post('/entry', entry.addEntryApi);
app.put('/entry', entry.updateEntryApi);
app.delete('/entry', entry.deleteEntryApi);

app.listen(3333, function () {
    console.log('localhost:3333');
});
