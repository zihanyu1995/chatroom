const expect = require('expect.js');
const agent = require('superagent');

const PORT = 3001;
const HOST = `http://localhost:${PORT}`;

// Initiate Server
const www = require('../../bin/www');

suite('add Friend API', () => {
  test('test add friend', (done) => {
    agent.post(`${HOST}/friends`)
      .send({ uid1: 1, uid2: 4, accept: 1 })
      .end((err, res) => {
        expect(err).to.be.equal(null);
        expect(res.statusCode).to.be.equal(200);
        done();
      });
  });

  test('test add friend with unexisted request', (done) => {
    agent.post(`${HOST}/friends`)
      .send({ uid1: 1, uid2: 3, accept: 1 })
      .end((err, res) => {
        expect(res.statusCode).to.be.equal(403);
        done();
      });
  });

  test('test refuse friend request', (done) => {
    agent.post(`${HOST}/friends`)
      .send({ uid1: 1, uid2: 4, accept: 0 })
      .end((err, res) => {
        expect(res.statusCode).to.be.equal(200);
        done();
      });
  });

  test('test send friend request', (done) => {
    agent.post(`${HOST}/friends/request`)
      .send({ fromuser: 1, touser: 3 })
      .end((err, res) => {
        expect(res.statusCode).to.be.equal(200);
        done();
      });
  });

  test('test get all friends status', (done) => {
    agent.get(`${HOST}/friends/moments/2`)
      .end((err, res) => {
        expect(res.body.length).to.be.equal(1);
        expect(res.statusCode).to.be.equal(200);
        done();
      });
  });

});
