let expect = require('expect.js');
let app = require('../../bin/www');
let Announcements = require('../../models/Announcements');
let announcement = new Announcements();
let Container = require('../../models/container');
var req;
suite('Post Announcement Tests', function () {
  setup(function() {
    let container = new Container();
    req = {"query":{}, "app": {"locals":{container}}};
  });

  test('Get all announcements success', function (done) {
    announcement.getHistoryAnnouncements(req, (code, result) => {
      expect(code).to.be.equal(200);
      expect(result.length).to.be.equal(5);
      done();
    });
  });

  test('Get all announcements fail', function (done) {
    req.query = {"timeStart": 2, "timeEnd": 1};
    announcement.getHistoryAnnouncements(req, (code, result) => {
      expect(code).to.be.equal(210);
      expect(result.length).to.be.equal(0);
      done();
    });
  });

  test('Add an announcement success', function (done) {
    req.body = {"userid": 1, "username" : "aaa", "announcement":"Unit Test Announcement"};
    announcement.addAnnouncement(req, (code) => {
      expect(code).to.be.equal(201);
      done();
    })
  });

  test('Add an empty announcement fails', function (done) {
    req.body = {"userid": 1, "username" : "aaa"};
    announcement.addAnnouncement(req, (code) => {
      expect(code).to.be.equal(400);
      done();
    })
  });
})
