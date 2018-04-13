const expect = require('expect.js');
const agent = require('superagent');

const PORT = 3001;
const HOST = `http://localhost:${PORT}`;

// Initiate Server
const www = require('../../bin/www');
// TODO: reset everytime
// 1. const MockDatabase = require('./MockDatabase');
// 2. www.locals.container.db = new MockDatabase();

suite('Join Community API', () => {
  test('test getUsers', (done) => {
    agent.get(`${HOST}/users?id=1`)
      .end((err, res) => {
        expect(err).to.be.equal(null);
        expect(res.statusCode).to.be.equal(200);
        expect(res.body.length).to.be.equal(8);
        done();
      });
  });

  test('test create user', (done) => {
    agent.post(`${HOST}/users`)
      .send({ username: 'testUser', password: 'testPassword', inputType: 1 })
      .end((err, res) => {
        expect(err).to.be.equal(null);
        expect(res.statusCode).to.be.equal(201);
        expect(res.body).to.be.eql({ id: 8, username: 'testUser', "privilege": 0, isNewUser: true });
        done();
      });
  });

  test('test create exist user', (done) => {
    agent.post(`${HOST}/users`)
      .send({ username: 'Yen', password: 'testPassword', inputType: 1 })
      .end((err, res) => {
        expect(res.statusCode).to.be.equal(403);
        expect(res.body).to.be.eql({});
        done();
      });
  });

  test('test create reserved username', (done) => {
    agent.post(`${HOST}/users`)
      .send({ username: 'www', password: 'testPassword', inputType: 1 })
      .end((err, res) => {
        expect(res.statusCode).to.be.equal(403);
        expect(err).not.to.be.equal(null);
        expect(res.body).to.be.eql({});
        done();
      });
  });

  test('test create reserved username', (done) => {
    agent.post(`${HOST}/users`)
      .send({ username: 'www', password: 'testPassword', inputType: 1 })
      .end((err, res) => {
        expect(res.statusCode).to.be.equal(403);
        expect(err).not.to.be.equal(null);
        expect(res.body).to.be.eql({});
        done();
      });
  });

  test('test login success', (done) => {
    agent.post(`${HOST}/users`)
      .send({ username: 'aaa', password: '74b87337454200d4d33f80c4663dc5e5', inputType: 0 })
      .end((err, res) => {
        expect(res.statusCode).to.be.equal(200);
        done();
      });
  });

  test('test login wrong password', (done) => {
    agent.post(`${HOST}/users`)
      .send({ username: 'aaa', password: 'QQQ', inputType: 0 })
      .end((err, res) => {
        expect(res.statusCode).to.be.equal(302);
        done();
      });
  });

  test('test login not exist', (done) => {
    agent.post(`${HOST}/users`)
      .send({ username: 'new', password: '123', inputType: 0 })
      .end((err, res) => {
        expect(res.statusCode).to.be.equal(202);
        done();
      });
  });

  test('test logout', (done) => {
    agent.post(`${HOST}/users`)
      .send({ username: 'new', password: '123', inputType: 2 })
      .end((err, res) => {
        expect(res.statusCode).to.be.equal(500);
        done();
      });
  });

  test('test createUser default', (done) => {
    agent.post(`${HOST}/users`)
      .send({ username: 'new', password: '123'})
      .end((err, res) => {
        expect(res.statusCode).to.be.equal(500);
        done();
      });
  });

  test('test get page not exist', (done) => {
    agent.post(`${HOST}/asdfghjklsdfghjk`)
      .end((err, res) => {
        expect(res.statusCode).to.be.equal(404);
        done();
      });
  });
});
