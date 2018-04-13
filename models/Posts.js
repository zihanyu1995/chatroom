const Helper = require('./helper');

const helper = new Helper();
module.exports = class Posts {
  constructor() {
  }

  initGetHistoryPostsParameters(req) {
    const timeStart = parseInt(req.query.timeStart) || -1;
    const timeEnd = parseInt(req.query.timeEnd) || -1;
    return { timeStart, timeEnd };
  }

  getHistoryPosts(req, cb) {
    const container = req.app.locals.container;
    const params = this.initGetHistoryPostsParameters(req);
    container.db.getPosts(params.timeStart, params.timeEnd, (db_result) => {
      if (db_result.length != 0) {
        cb(200, db_result);
      } else {
        cb(210, db_result);
      }
    });
  }

  addPost(req, cb) {
    const container = req.app.locals.container;
    const nowTime = Date.now();
    const post_data = req.body;
    container.db.addPost(post_data.userid, nowTime, post_data.title, post_data.post, post_data.topic, (db_result) => {
      if (db_result == 0) {
        container.io.emit('post', {
          username: post_data.username,
          time: nowTime,
          title: post_data.title,
          post: post_data.post,
          topic: post_data.topic,
        });
        cb(201);
      } else {
        cb(400);
      }
    });
  }

  searchPosts(req, cb) {
    const container = req.app.locals.container;
    let words = req.params.words;
    console.log(words);
    words = words.split(',');
    container.db.searchPosts(words, (data) => {
      cb(200, data);
    });
  }

};
