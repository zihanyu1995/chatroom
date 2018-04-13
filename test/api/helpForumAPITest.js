const expect = require('expect.js');
const agent = require('superagent');

const PORT = 3001;
const HOST = `http://localhost:${PORT}`;

// Initiate Server
const www = require('../../bin/www');
// TODO: reset everytime
// 1. const MockDatabase = require('./MockDatabase');
// 2. www.locals.container.db = new MockDatabase();
suite('Help Forum API', () => {
  test('Get Posts success', (done) => {
    agent.get(`${HOST}/posts`)
      .end((err, res) => {
        expect(err).to.be.equal(null);
        expect(res.statusCode).to.be.equal(200);
        expect(res.body.length).to.be.equal(3);
        done();
      });
  });

  test('Add Post success', (done) => {
    agent.post(`${HOST}/posts`)
      .send({ userid: 1, username: 'aaa', title: 'How to survive in hws', post:'write write write write' })
      .end((err, res) => {
        expect(err).to.be.equal(null);
        expect(res.statusCode).to.be.equal(201);
        done();
      });
  });

test('test search posts with no stop words', (done) => {
  agent.get(`${HOST}/posts/fire`)
    .end((err, res) => {
      expect(err).to.be.equal(null);
      expect(res.statusCode).to.be.equal(200);
      expect(res.body).to.be.eql([{username: 'Yen', sendtime: 1508358111199,
      title: 'How to survive in house fire',post: 'go go go go go go go go', topic: 2 }]);
      done();
    });
});

test('test search posts with stop words', (done) => {
  agent.get(`${HOST}/posts/stop`)
    .end((err, res) => {
      expect(err).to.be.equal(null);
      expect(res.statusCode).to.be.equal(200);
      expect(res.body.length).to.be.equal(0);
      done();
    });
});

test('test search posts that not exist', (done) => {
  agent.get(`${HOST}/messages/hhh`)
    .end((err, res) => {
      expect(err).to.be.equal(null);
      expect(res.statusCode).to.be.equal(200);
      expect(res.body.length).to.be.equal(0);
      done();
    });
 });
});
