
module.exports = class Announcements {
  constructor() {
  }

  initGetHistoryAnnouncementsParameters(req) {
    const timeStart = parseInt(req.query.timeStart) || -1;
    const timeEnd = parseInt(req.query.timeEnd) || -1;
    return { timeStart, timeEnd };
  }

  getHistoryAnnouncements(req, cb) {
    const container = req.app.locals.container;
    const params = this.initGetHistoryAnnouncementsParameters(req);
    container.db.getAnnouncements(params.timeStart, params.timeEnd, (db_result) => {
      if (db_result.length != 0) {
        cb(200, db_result);
      } else {
        cb(210, db_result);
      }
    });
  }

  addAnnouncement(req, cb) {
    const container = req.app.locals.container;
    const nowTime = Date.now();
    const post_data = req.body;
    container.db.insertAnnouncement(post_data.userid, nowTime, post_data.announcement, (db_result) => {
      if (db_result == 0) {
        container.io.emit('announcement', {
          username: post_data.username,
          time: nowTime,
          announcement: post_data.announcement,
        });
        console.log("announcement.js announcement"+ post_data.announcement);
        cb(201);
      } else {
        cb(400);
      }
    });
  }

  searchAnnouncements(req, cb) {
    const container = req.app.locals.container;
    let words = req.params.words;
    words = words.split(',');
    container.db.searchAnnouncements(words, (data) => {
      cb(200, data);
    });
  }
};
