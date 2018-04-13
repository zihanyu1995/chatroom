const expect = require('expect.js');
const Messages = require('../../models/Messages');
const Container = require('../../models/container');

const message = new Messages();
let req;
suite('Model Messages Test:', () => {
  setup(() => {
    req = { app: { locals: { container: new Container() } } };
  });

  test('test get messages', (done) => {
    let query = {};
    query = message.completeMessage(query);
    expect(query.fromUserID).to.be.equal(-1);
    expect(query.toUserID).to.be.equal(-1);
    expect(query.timeStart).to.be.equal(-1);
    expect(query.timeEnd).to.be.equal(-1);
    done();
  });

  test('get every messages', (done) => {
    req.query = {
      fromUserID: '-1', toUserID: '-1', timeStart: -1, timeEnd: -1,
    };
    message.getHistoryMessages(req, (status, result) => {
      expect(status).to.be.equal(200);
      expect(result.length).to.be.equal(10);
      done();
    });
  });

  test('get messages with incorrect mode', (done) => {
    req.query = { mode: 999 };
    message.getHistoryMessages(req, (status) => {
      expect(status).to.be.equal(403);
      done();
    });
  });

  test('get messages about not exist user', (done) => {
    req.query = {
      fromUserID: -1, toUserID: 999, timeStart: -1, timeEnd: -1,
    };
    message.getHistoryMessages(req, (status) => {
      expect(status).to.be.equal(200);
      done();
    });
  });

  // test('get messages about not exist user', function(done){
  //   req.query = {fromUserID:"-1",toUserID:'999',timeStart:-1,timeEnd:-1};
  //   message.getHistoryMessages(req,(status, result)=>{
  //     expect(status).to.be.equal(403);
  //     done();
  //   });
  // });

  test('get mutual message', (done) => {
    req.query = {
      fromUserID: '1', toUserID: '2', timeStart: -1, timeEnd: -1,
    };
    req.query.mode = '2';
    message.getHistoryMessages(req, (status, result) => {
      expect(status).to.be.equal(200);
      expect(result.length).to.be.equal(4);
      done();
    });
  });

  test('insert message', (done) => {
    req.body = { fromUserID: '1', toUserID: '2', message: 'hello' };
    message.addMessage(req, (status, result) => {
      expect(status).to.be.equal(201);
      done();
    });
  });

  test('insert message fail', (done) => {
    req.body = { fromUserID: '999', toUserID: '2', message: 'hello' };
    message.addMessage(req, (status, result) => {
      expect(status).to.be.equal(400);
      done();
    });
  });

  test('test upvote message ', (done) => {
    req.query = { user:1, choice:1, message:1};
    message.voteMessage(req, (status, result) => {
      expect(status).to.be.equal(200);
      done();
    });
  });

  test('test upvote invalid message!!', (done) => {
    req.query = { user: 1, choice: 1, message: 99};
    message.voteMessage(req, (status, result) => {
      expect(status).to.be.equal(400);
      done();
    });
  });

  test('test downvote message ', (done) => {
    req.query = { user:1, choice:-1, message:1};
    message.voteMessage(req, (status, result) => {
      expect(status).to.be.equal(200);
      done();
    });
  });

  test('test unvote message ', (done) => {
    req.query = { user:1, choice:0, message:1};
    message.voteMessage(req, (status, result) => {
      expect(status).to.be.equal(200);
      done();
    });
  });

  test('test filter message ', (done) => {
    req.query = { type:1, user:0, threshold:1};
    message.filterMessage(req, (status, result) => {
      expect(status).to.be.equal(200);
      done();
    });
  });

  test('test get vote list ', (done) => {
    req.query = { user:1,};
    message.getVoteList(req, (status, result) => {
      expect(result).to.be.eql([]);
      expect(status).to.be.equal(200);
      done();
    });
  });


  // test('insert message to not exist user', function(done){
  //   req.body = {fromUserID:"1", toUserID:'999',message:'hello'};
  //   message.addMessage(req,(status, result)=>{
  //     expect(status).to.be.equal(403);
  //     done();
  //   });
  // });
});
