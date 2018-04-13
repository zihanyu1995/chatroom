let expect = require('expect.js');
let app = require('../../bin/www');
let Announcements = require('../../models/Announcements');
let announcement = new Announcements();
let Users = require('../../models/Users');
let users = new Users();
let Container = require('../../models/container');
var req;
suite('Search Information Tests', function () {
  setup(function() {
    let container = new Container();
    req = {"query":{}, "app": {"locals":{container}}};
  });

  test('search users with username', function(done){
    req.params = {userName: 'a', status: 0};
    users.searchUsers(req, (status, result)=>{
      expect(status).to.be.equal(200);
      done();
    });
  });

  test('search users with status', function(done){
    req.params = {userName: '', status: 3};
    users.searchUsers(req, (status, result)=>{
      expect(status).to.be.equal(200);
      done();
    });
  });

  test('Search announcements with words', function (done) {
    req.params = {words: 'll,o'};
    announcement.searchAnnouncements(req, (code) => {
      expect(code).to.be.equal(200);
      done();
    })
  });


})
