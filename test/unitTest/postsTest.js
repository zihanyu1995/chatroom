let expect = require('expect.js');
let app = require('../../bin/www');
let Posts = require('../../models/Posts');
let post = new Posts();
let Container = require('../../models/container');
var req;
suite('Help Forum Tests', function () {
  setup(function() {
    let container = new Container();
    req = {"query":{}, "app": {"locals":{container}}};
  });

  test('Get all posts success', function (done) {
    post.getHistoryPosts(req, (code, result) => {
      expect(code).to.be.equal(200);
      expect(result.length).to.be.equal(3);
      done();
    });
  });

  test('Get all posts fail', function (done) {
    req.query = {"timeStart": 2, "timeEnd": 1};
    post.getHistoryPosts(req, (code, result) => {
      expect(code).to.be.equal(210);
      expect(result.length).to.be.equal(0);
      done();
    });
  });

  test('Add a post success', function (done) {
    req.body = {"userid": 1, "username" : "aaa", "title": "How to survive in flood","post": "swim swim swim swim swim"};
    post.addPost(req, (code) => {
      expect(code).to.be.equal(201);
      done();
    })
  });

  test('Add an empty post fails', function (done) {
    req.body = {"userid": 1, "username" : "aaa"};
    post.addPost(req, (code) => {
      expect(code).to.be.equal(400);
      done();
    })
  });
})
