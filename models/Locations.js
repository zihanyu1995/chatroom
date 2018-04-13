module.exports = class Locations {
  // Entity Classes
  constructor() {
  }

  insertLocation(req, cb) {
    let container = req.app.locals.container;
    let location = {
      userID: req.body.userID,
      title: req.body.title,
      content: req.body.content,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      role: parseInt(req.body.role),
      currentTime: Date.now(),
      longitude: parseFloat(req.body.longitude),
      latitude: parseFloat(req.body.latitude),
    };

    container.db.insertLocation(location.userID, location.title, location.content, location.startTime, location.endTime, location.role, location.currentTime, location.longitude, location.latitude, (db_result) => {
      cb(200);
    });
  }

  getLocations(req, cb) {
    let container = req.app.locals.container;
    let currentDate = new Date(Date.now()).yyyymmdd();
    container.db.getLocations((db_result) => {
      let ret = [];
      for(let i=0; i<db_result.length; i+=1) {
        let startDate = parseInt(db_result[i].startTime.slice(6, 10)) * 10000 + parseInt(db_result[i].startTime.slice(0, 2)) * 100 + parseInt(db_result[i].startTime.slice(3, 5));
        let endDate = parseInt(db_result[i].endTime.slice(6, 10)) * 10000 + parseInt(db_result[i].endTime.slice(0, 2)) * 100 + parseInt(db_result[i].endTime.slice(3, 5));
        if(startDate <= currentDate && (endDate >= currentDate)) {
          ret.push(db_result[i]);
        }
      }
      cb(200, ret);
    });
  }

};

Date.prototype.yyyymmdd = function() {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();

  return [this.getFullYear(),
          (mm>9 ? '' : '0') + mm,
          (dd>9 ? '' : '0') + dd
         ].join('');
};
