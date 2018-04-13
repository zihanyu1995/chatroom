const expect = require('expect.js');
const agent = require('superagent');

const PORT = 3001;
const HOST = `http://localhost:${PORT}`;

// Initiate Server
const www = require('../../bin/www');
// TODO: reset everytime
// 1. const MockDatabase = require('./MockDatabase');
// 2. www.locals.container.db = new MockDatabase();

suite('Chat Test:', () => {
  test('test get messages', (done) => {
    agent.get(`${HOST}/messages`)
      .end((err, res) => {
        expect(err).to.be.equal(null);
        expect(res.statusCode).to.be.equal(200);
        expect(res.body.length).to.be.equal(10);
        done();
      });
  });

  test('test send messages to public', (done) => {
    agent.post(`${HOST}/messages`)
      .send({ fromUserID: 2, toUserID: 0, message: 'hello', status: 0 })
      .end((err, res) => {
        expect(err).to.be.equal(null);
        expect(res.statusCode).to.be.equal(201);
        done();
      });
  });
});
