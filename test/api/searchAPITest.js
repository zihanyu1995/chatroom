const expect = require('expect.js');
const agent = require('superagent');

const PORT = 3001;
const HOST = `http://localhost:${PORT}`;

// Initiate Server
const www = require('../../bin/www');
// TODO: reset everytime
// 1. const MockDatabase = require('./MockDatabase');
// 2. www.locals.container.db = new MockDatabase();

suite('Search API', () => {
  test('test search messages with no stop words', (done) => {
    agent.get(`${HOST}/messages/test?fromUserID=3&toUserID=4`)
      .end((err, res) => {
        expect(err).to.be.equal(null);
        expect(res.statusCode).to.be.equal(200);
        expect(res.body).to.be.eql([{fromUserName: 'Olivia', toUserName: 'Yen', sendtime: 1506759779479, message: 'test Search message', status: 1}]);
        done();
      });
  });

  test('test search messages with stop words', (done) => {
    agent.get(`${HOST}/messages/stop?fromUserID=3&toUserID=4`)
      .end((err, res) => {
        expect(err).to.be.equal(null);
        expect(res.statusCode).to.be.equal(200);
        expect(res.body.length).to.be.equal(0);
        done();
      });
  });

  test('test search messages that not exist', (done) => {
    agent.get(`${HOST}/messages/hhh?fromUserID=3&toUserID=4`)
      .end((err, res) => {
        expect(err).to.be.equal(null);
        expect(res.statusCode).to.be.equal(200);
        expect(res.body.length).to.be.equal(0);
        done();
      });
  });
});
