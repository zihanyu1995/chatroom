const expect = require('expect.js');
const agent = require('superagent');

const PORT = 3001;
const HOST = `http://localhost:${PORT}`;

// Initiate Server
const www = require('../../bin/www');

suite('Post Location API', () => {
  test('Post Location success', (done) => {
    agent.post(`${HOST}/locations`)
      .send({ userID: 1, title: 'Provide food', content: 'Pizza', startTime: '11/17/2017', endTime: '11/27/2027', currentTime: '1510770599179', role: 0, longitude: 100, latitude: 100 })
      .end((err, res) => {
        expect(err).to.be.equal(null);
        expect(res.statusCode).to.be.equal(200);
        done();
      });
  });

  test('Get Locations success', (done) => {
    agent.get(`${HOST}/locations`)
      .end((err, res) => {
        expect(err).to.be.equal(null);
        expect(res.statusCode).to.be.equal(200);
        expect(res.body.length).to.be.equal(2);
        done();
      });
  });
});
