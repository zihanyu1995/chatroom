const expect = require('expect.js');
const agent = require('superagent');

const PORT = 3001;
const HOST = `http://localhost:${PORT}`;

// Initiate Server
const www = require('../../bin/www');
// TODO: reset everytime
// 1. const MockDatabase = require('./MockDatabase');
// 2. www.locals.container.db = new MockDatabase();

suite('Share Status API', () => {
  test('Update status to help/emergency success', (done) => {
    agent.post(`${HOST}/users/1`)
      .send({ status: 2 })
      .end((err, res) => {
        // console.error(err);
        expect(err).to.be.equal(null);
        expect(res.statusCode).to.be.equal(200);
        done();
      });
  });

  test('Update status to undefined/ok success', (done) => {
    agent.post(`${HOST}/users/1`)
      .send({ status: 1 })
      .end((err, res) => {
        // console.error(err);
        expect(err).to.be.equal(null);
        expect(res.statusCode).to.be.equal(200);
        done();
      });
  });

  test('Update unexisted user status', (done) => {
    agent.post(`${HOST}/users/999`)
      .send({ status: 2 })
      .end((err, res) => {
        expect(err).to.not.be.equal(null);
        expect(res.statusCode).to.be.equal(400);
        done();
      });
  });

  test('Update unexisted status', (done) => {
    agent.post(`${HOST}/users/1`)
      .send({ status: 999 })
      .end((err, res) => {
        expect(err).to.not.be.equal(null);
        expect(res.statusCode).to.be.equal(400);
        done();
      });
  });

  test('Update empty status', (done) => {
    agent.post(`${HOST}/users/1`)
      .send({})
      .end((err, res) => {
        expect(err).to.not.be.equal(null);
        expect(res.statusCode).to.be.equal(400);
        done();
      });
  });
});
