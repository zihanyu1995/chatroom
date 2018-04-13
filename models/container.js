const MockDatabase = require('../test/MockDatabase.js');
const PostgreDatabase = require('./db');
const socketIO = require('socket.io')();

module.exports = class Container {
  // a container for server, store every global usable resourse
  constructor() {
    let dbConfig;
    if (process.env.NODE_ENV === 'test') { // switch db base on environ given
      this.db = new MockDatabase();
    } else {
      if (process.env.DATABASE_URL) { // detect whether on Heroku
        console.warn('Using heroku db', process.env.DATABASE_URL);
        dbConfig = { connectionString: process.env.DATABASE_URL, ssl: true };
      } else { // on local machine
        console.warn('Using local db');
        dbConfig = require('../data/dbConfig.json');
      }
      this.db = new PostgreDatabase(dbConfig);
    }

    this.refresh(); // refresh server side user list
    this.setUpSocket(); // setup the socket io part
    // TODO: make sure updated when login, logout, timeout
    this.onlineUserList = new Set([]); // store who is online
    this.socketMap = new Map(); // store socket name
  }

  refresh() {
    // TODO: make sure this is called when create user
    this.db.getUsers((data) => {
      this.userSet = new Set([]); // store who is online
      for (let i = 0; i < data.length; i += 1) {
        this.userSet.add(data[i].id);
      }
    });
  }

  setUpSocket() {
    // server side Socket.io
    this.io = socketIO;
    this.io.on('connection', (socket) => {
      socket.emit('authToken', { sockID: socket.id });
    });
  }
};
