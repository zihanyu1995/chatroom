const Helper = require('./helper');

const helper = new Helper();
// TODO: add validate

module.exports = class Messages {
  // Entity Classes

  completeMessage(query) {
    // completing Message query obj by setting default values if not provided
    // TODO: should only be able to get associate messages
    query.fromUserID = parseInt(query.fromUserID || -1, 10);
    query.toUserID = parseInt(query.toUserID || -1, 10);
    query.timeStart = parseInt(query.timeStart, 10) || -1;
    query.timeEnd = parseInt(query.timeEnd, 10) || -1;
    return query;
  }

  getHistoryMessages(req, cb) {
    const container = req.app.locals.container;
    const query = this.completeMessage(req.query);
    helper.validUsers(container.userSet, [query.fromUserID, query.toUserID]);
    const mode = query.mode || '1';
    // depend on mode, call different method
    if (mode === '1') {
      container.db.getMessages(query.fromUserID, query.toUserID, query.timeStart, query.timeEnd, (dbResult) => {
        cb(200, dbResult);
      });
    } else if (mode == '2') {
      container.db.getMutualMessage(query.fromUserID, query.toUserID, query.timeStart, query.timeEnd, (dbResult) => {
        cb(200, dbResult);
      });
    } else {
      cb(403, '');
    }
  }

  addMessage(req, cb) {
    // TODO: should only be able to insert associate messages
    const container = req.app.locals.container;
    const message = {
      fromUserID: req.body.fromUserID,
      toUserID: req.body.toUserID,
      message: req.body.message,
      time: Date.now(),
      status: parseInt(req.body.status),
    };

    container.db.insertMessage(parseInt(message.fromUserID), parseInt(message.toUserID), message.message, message.time, message.status, (dbResult) => {
      // if talk to public
      if (dbResult >= 0) {
        if (message.toUserID == '0') {
          message['id'] = dbResult;
          message['vote'] = 0;
          container.io.emit('message', message);
        } else {
          // send to myself
          container.io.to(container.socketMap.get(parseInt(message.fromUserID))).emit('message', message);
          // send to counter part
          if (container.socketMap.has(parseInt(message.toUserID))) {
            container.io.to(container.socketMap.get(parseInt(message.toUserID))).emit('message', message);
          } else {
            // TODO:what if not online?
          }
        }
        cb(201);
      } else {
        cb(400); // TODO: is this error code correct
      }
    });
  }

  searchMessages(req, cb) {
    let words = req.params.words;
    const container = req.app.locals.container;
    const query = req.query;
    const fromUserID = query.fromUserID;
    const toUserID = query.toUserID;
    words = words.split(',');
    container.db.searchMessages(fromUserID, toUserID, words, (data) => {
      cb(200, data);
    });
  }

  voteMessage(req, cb) {
    const container = req.app.locals.container;
    const user = req.query.user;
    const choice = req.query.choice;
    const messageID = req.query.message;
    container.db.recordVote(user, messageID, choice, (data) => {
      if (data !== 'fail') {
        const vote = Math.min(100, Math.max(-100, data));
        container.db.updateVote(messageID, vote, (dbResult) => {
          if (dbResult === 0) {
            cb(200, vote);
          } else {
            cb(400, 0);
          }
        });
      } else {
        cb(400, 0);
      }
    });
  }

  filterMessage(req, cb) {
    const container = req.app.locals.container;
    const type = parseInt(req.query.type, 10);
    const user = parseInt(req.query.user, 10);
    const threshold = parseInt(req.query.threshold, 10);
    // 0: All
    // 1: Not vote yet
    // 2: My up
    // 3: My down
    container.db.filterMessage(user, type, threshold, (data) => {
      cb(200, data);
    });
  }

  getVoteList(req, cb) {
    const container = req.app.locals.container;
    const user = parseInt(req.query.user, 10);
    container.db.getVoteList(user, (data) => {
      cb(200, data);
    });
  }
};
