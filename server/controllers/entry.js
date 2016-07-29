var _ = require('underscore');
var Uuid = require('node-uuid');
var fs = require('fs');
var mysql = require('mysql');
var dir = './data/';

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'mydatabase'
});

connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }

  console.log('connected as id ' + connection.threadId);
});

function myError (code, msg) {
    return {code: code, msg: msg};
}

function getAllEntries (cb) {

    connection.query('SELECT * from mydata', function(err, rows, fields) {
        cb(err, rows);

    });
}

exports.getAllEntriesApi = function getAllEntriesApi (req, res) {
    getAllEntries(function (err, data) {
        if (err) {
            res.status(err.code).send(err.msg);
        } else {
            res.header('Content-Type', 'application/json');
            res.send(JSON.stringify(data));
        }
    });
}

function getEntryById (EntryId, cb) {
    connection.query('SELECT * from mydata WHERE EntryId = ?', EntryId , function(err, rows, fields) {
        cb(err, rows);
        console.log(rows);
    });
}

exports.getEntryByIdApi = function getEntryByIdApi (req, res) {
    getEntryById(req.params.EntryId, function (err, data) {
        if (err) {
            res.status(err.code).send(err.msg);
        } else {
            res.header('Content-Type', 'application/json');
            res.send(JSON.stringify(data));
        }
    });
}

function addEntry (body, cb) {
    if (!body.Author) {
        return cb(myError(409, 'Author is mandatory'));
    }
    if (!body.Title) {
        return cb(myError(409, 'Title is mandatory'));
    }
    if (!body.Text) {
        return cb(myError(409, 'Text is mandatory'));
    }

    var EntryId = 'EntryId_' + Uuid.v4();

    var Entry = {
        EntryId: EntryId,
        Author: body.Author,
        Title: body.Title,
        Text: body.Text,
        DateCreated: Date.now(),
        DateModified: Date.now()
    };

    connection.query('INSERT INTO mydata SET ?', Entry, function(err, rows, fields) {
        cb(err, rows);
    });
}

exports.addEntryApi = function addEntryApi (req, res) {
    addEntry(req.body, function (err, data) {
        if (err) {
            res.status(err.code).send(err.msg);
        } else {
            res.send(data)
        }
    });
}

function updateEntry (body, cb) {
    if (!body.EntryId) {
        return cb(myError(409, 'EntryId is mandatory'));
    }
    if (!body.Author) {
        return cb(myError(409, 'Author is mandatory'));
    }
    if (!body.Title) {
        return cb(myError(409, 'Title is mandatory'));
    }
    if (!body.Text) {
        return cb(myError(409, 'Text is mandatory'));
    }

    var Entry = {};

    getEntryById(body.EntryId, function (err, data) {
        if (err) {
            return cb(err);
        }

        // Entry = JSON.parse(data);
        Entry = data;

        Entry.Author = body.Author;
        Entry.Title = body.Title;
        Entry.Text = body.Text;
        Entry.DateModified =  Date.now();

        //Entry = JSON.stringify(Entry);

        // fs.writeFile(dir + body.EntryId + '.json', Entry, function (err) {
        //     if (err) {
        //         return cb(myError(401, 'Failed to update entry'))
        //     }
        //
        //     cb(null, 'Entry ' + body.Title + ' was successfully updated');
        // });
        console.log(Entry);
        connection.query('UPDATE mydata SET Author = ?, Title = ?, Text = ?, DateModified = ?  WHERE EntryId = ?', [body.Author, body.Title, body.Text, Date.now(), body.EntryId], function(err, rows, fields) {
            cb(null, rows);
            console.log(rows);
        });
    });

}

exports.updateEntryApi = function updateEntryApi (req, res) {
    updateEntry(req.body, function (err, data) {
        if (err) {
            res.status(err.code).send(err.msg);
        } else {
            res.send(data)
        }
    });
}

function deleteEntry (body, cb) {
    if (!body.EntryId) {
        return cb(myError(409, 'EntryId is mandatory'));
    }

    connection.query('DELETE FROM mydata WHERE EntryId = ?', body.EntryId , function(err) {
        cb(null, 'Entry with id ' + body.EntryId + ' was successfully deleted');
    });

}

exports.deleteEntryApi = function deleteEntryApi (req, res) {
    deleteEntry(req.body, function (err, data) {
        if (err) {
            res.status(err.code).send(err.msg);
        } else {
            res.send(data);
        }
    });
}
