const expect = require('expect.js');
const agent = require('superagent');

const PORT = 3001;
const HOST = `http://localhost:${PORT}`;

// Initiate Server
const www = require('../../bin/www');
// TODO: reset everytime
// 1. const MockDatabase = require('./MockDatabase');
// 2. www.locals.container.db = new MockDatabase();

suite('Vote Test:', () => {
  test('test upvote messages', (done) => {
    agent.get(`${HOST}/vote/?user=3&message=1&choice=1`)
      .end((err, res) => {
        // expect(err).to.be.equal(null);
        console.log(res.statusCode);
        expect(res.statusCode).to.be.equal(200);
        done();
      });
  });

  test('test downvote messages', (done) => {
    agent.get(`${HOST}/vote/?user=3&message=1&choice=-1`)
      .end((err, res) => {
        // expect(err).to.be.equal(null);
        console.log(res.statusCode);
        expect(res.statusCode).to.be.equal(200);
        done();
      });
  });
  test('test unvote messages', (done) => {
    agent.get(`${HOST}/vote/?user=3&message=1&choice=0`)
      .end((err, res) => {
        // expect(err).to.be.equal(null);
        console.log(res.statusCode);
        expect(res.statusCode).to.be.equal(200);
        done();
      });
  });

  test('test filter messages', (done) => {
    agent.get(`${HOST}/vote/filter?user=3&type=0&threshold=0`)
      .end((err, res) => {
        // expect(err).to.be.equal(null);
        console.log(res.statusCode);
        expect(res.statusCode).to.be.equal(200);
        done();
      });
  });

  test('test get vote list', (done) => {
    agent.get(`${HOST}/vote/voteList?user=1`)
      .end((err, res) => {
        // expect(err).to.be.equal(null);
        console.log(res.statusCode);
        expect(res.statusCode).to.be.equal(200);
        done();
      });
  });

});
