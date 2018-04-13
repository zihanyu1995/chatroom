const expect = require('expect.js');
const agent = require('superagent');

const PORT = 3001;
const HOST = `http://localhost:${PORT}`;

// Initiate Server
const www = require('../../bin/www');

suite('Post Announcement API', () => {
  test('Get Announcements success', (done) => {
    agent.get(`${HOST}/announcements`)
      .end((err, res) => {
        expect(err).to.be.equal(null);
        expect(res.statusCode).to.be.equal(200);
        expect(res.body.length).to.be.equal(5);
        done();
      });
  });

  test('Post Announcements success', (done) => {
    agent.post(`${HOST}/announcements`)
      .send({ userid: 1, username: 'aaa', announcement: 'Test Announcement' })
      .end((err, res) => {
        expect(err).to.be.equal(null);
        expect(res.statusCode).to.be.equal(201);
        done();
      });
  });
});
