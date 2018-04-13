const reserveJson = require('../data/reservedUserName.json');

const reserve = new Set(reserveJson);

module.exports = class Notifications {
  getAllFriendsStatusChange(req, cb) {
    const container = req.app.locals.container;
    let id = req.params.id;
    container.db.getAllFriendsStatusChange(id, (changeList) => {
      cb(200, changeList);
    });
  }

  addStatusChange(req, cb) {
    const container = req.app.locals.container;
    const nowTime = Date.now();
    if (req.body.status != 2 && req.body.status != 3) {
      cb(403);
    } else {
      container.db.addStatusChange(req.params.id, req.body.status, nowTime, (result) => {
        if (result === 0) {
          cb(200);
        } else {
          cb(400);
        }
      });
    }
  }

}
