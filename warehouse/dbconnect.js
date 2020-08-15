// const mongoose = require("mongoose");
// mongoose.Promise = require("bluebird");

// const url = "mongodb://localhost:27017/chat";

// const connect = mongoose.connect(url, { useNewUrlParser: true });

// module.exports = connect;

var knex = require('knex')({
    client: 'sqlite3',
    connection: {
        filename: "./db/dev.sqlite3"
    },
    useNullAsDefault: false
});

var toDoknex = require('knex')({
    client: 'mysql',
    connection: {
        host: '127.0.0.1', //192.168.0.176
        //socketPath: '/var/run/mysqld/mysqld.sock',
        user: 'root',
        password: 'Deepu@143',
        database: 'todo'
    },
    pool: { min: 0, max: 7 },
    acquireConnectionTimeout: 10000,
    migrations: {
        tableName: 'migrations'
    }
});

var chatknex = require('knex')({
    client: 'mysql',
    connection: {
        host: '127.0.0.1', //192.168.0.176
        //socketPath: '/var/run/mysqld/mysqld.sock',
        user: 'root',
        password: 'Deepu@143',
        database: 'chat'
    },
    pool: { min: 0, max: 7 },
    acquireConnectionTimeout: 10000,
    migrations: {
        tableName: 'migrations'
    }
});
module.exports = {
    ToDo: toDoknex,
    Chat: chatknex
};

