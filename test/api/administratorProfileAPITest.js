const expect = require('expect.js');
const agent = require('superagent');

const PORT = 3001;
const HOST = `http://localhost:${PORT}`;

// Initiate Server
const www = require('../../bin/www');

suite('Administratrate user profile API', ()=>{
 test('Get user list', (done)=>{
     agent.get(`${HOST}/admin/users`)
     .end((err, res) => {
       expect(err).to.be.equal(null);
       expect(res.statusCode).to.be.equal(200);
       expect(res.body.length).to.be.equal(7);
       done();
     });
 });

test('Edit user profile', (done) => {
  agent.post(`${HOST}/admin/users/2`)
    .send({username: "wxx", password :"21232f297a57a5a743894a0e4a801fc3", privilege:2, active:true})
    .end((err, res) => {
        // console.error(err);
      expect(err).to.be.equal(null);
      expect(res.statusCode).to.be.equal(200);
      done();
    });
  });
});
