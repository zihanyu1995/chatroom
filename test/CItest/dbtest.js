const expect = require('expect.js');
const postDBConfig = require('../../data/dbConfig.json');
const PostgreDatabase = require('../../models/db');

const dbQuery = {
testReset:
`TRUNCATE users, messages, announcements, votes, friends, statusChangeHistory, requests, posts RESTART IDENTITY;
INSERT INTO users(id, username, password, status) VALUES (0, 'Public Channel', 'password', 4);
INSERT INTO users(username, password, status) VALUES ('AAA', 'passwordAAA', 3);
INSERT INTO users(username, password, status) VALUES ('BBB', 'passwordBBB', 1);
INSERT INTO friends(id, uid1, uid2) VALUES (0, 2, 1);
INSERT INTO requests(fromuser, touser) VALUES (1, 0);
INSERT INTO messages(sendtime, message, fromuser, touser, status) VALUES (123, 'yoyoyo', 1, 0, 3);
INSERT INTO messages(sendtime, message, fromuser, touser, status) VALUES (123, 'hihihi', 1, 2, 3);
INSERT INTO announcements(userid, sendtime, announcement) VALUES (1, '1509416537573', 'hey!');
INSERT INTO votes(userid, messageid, choice) VALUES (3, 3, 1);
INSERT INTO votes(userid, messageid, choice) VALUES (3, 4, 1);
INSERT INTO votes(userid, messageid, choice) VALUES (3, 5, -1);
INSERT INTO posts(userid, sendtime, title, post, topic) VALUES (1, '1509416537573', 'How to deal with earthquake','run run run',0);`,
initDB:
`TRUNCATE users, messages, announcements, votes, friends, statusChangeHistory, requests RESTART IDENTITY;
INSERT INTO users(id, username, password, status, privilege) VALUES (0, 'Public Channel', 'password', 4, 0);
INSERT INTO users(username, password, status, privilege) VALUES ('ESNAdmin', '21232f297a57a5a743894a0e4a801fc3', 1, 2);
INSERT INTO users(username, password, status, privilege) VALUES ('aaa', '74b87337454200d4d33f80c4663dc5e5', 1, 2);
INSERT INTO users(username, password, status, privilege) VALUES ('demo1', 'e368b9938746fa090d6afd3628355133', 1, 2);
INSERT INTO users(username, password, status, privilege) VALUES ('bbb', '74b87337454200d4d33f80c4663dc5e5', 3, 2);
INSERT INTO users(username, password, status, privilege) VALUES ('demo2', 'e368b9938746fa090d6afd3628355133', 1, 2);
INSERT INTO messages(sendtime, message, fromuser, touser, status, vote) VALUES (1511994300000,'Hi, everyone!',1,0,1,100);
INSERT INTO messages(sendtime, message, fromuser, touser, status, vote) VALUES (1511994300001,'This is a SPAMMMMM!',2,0,2,-100);
INSERT INTO messages(sendtime, message, fromuser, touser, status, vote) VALUES (1511994300002,'Hello from bbb~',4,0,1,10);
INSERT INTO messages(sendtime, message, fromuser, touser, status, vote) VALUES (1511994300003,'What a great app!',4,0,3,0);
INSERT INTO messages(sendtime, message, fromuser, touser, status, vote) VALUES (1511994300004,'Upvote me!',2,0,4,0);
INSERT INTO messages(sendtime, message, fromuser, touser, status, vote) VALUES (1511994300005,'Downvote me!',2,0,1,0);
INSERT INTO votes(userid, messageid, choice) VALUES (3, 1, 1);
INSERT INTO votes(userid, messageid, choice) VALUES (3, 2, -1);
INSERT INTO friends(id, uid1, uid2) VALUES (1, 3, 1);
INSERT INTO requests(fromuser, touser) VALUES (5, 3);
INSERT INTO statuschangehistory(id, userid, status, sendtime) VALUES (1, 1, 3, 1511994300000);
`
};

let db;
if (process.env.DATABASE_URL) {
  db = new PostgreDatabase({ connectionString: process.env.DATABASE_URL });
} else {
  db = new PostgreDatabase(postDBConfig);
}


function resetDB(cb, query) {
  db.pool.connect((err, client, done) => {
    if (err) {
      throw err;
    }
    client.query(query, (errq) => {
      if (errq) {
        console.error(errq);
      }
      done();
      cb();
    });
  });
}

suite('Model db Test:', () => {
  setup((done) => {
    resetDB(done, dbQuery.testReset);
    console.error = () => {}; // don't print out error message during testing
  });

  suiteTeardown((done) => {

    console.log('All test done, reseting db...');
    resetDB(done, dbQuery.initDB);
    console.log('Reset db done');
  });

  test('get userlist', (done) => {
    db.getUsers((data) => {
      expect(data).to.be.eql([{ userName: 'AAA', id: 1, status: 3 },
        { userName: 'BBB', id: 2, status: 1 }]);
      done();
    });
  });

  test('find userlist', (done) => {
    db.findUser('AAA', (data) => {
      expect(data).to.be.eql({
        id: 1, password: 'passwordAAA', status: 3, privilege: 0, active: true,
      });

      done();
    });
  });

  test('find not exist userlist', (done) => {
    db.findUser('CCC', (data) => {
      expect(data).to.be.eql({ id: null, password: null, status: null });
      // console.log(data);
      done();
    });
  });

  test('insert user', (done) => {
    db.createUser('CCC', 'passwordCCC', (data) => {
      expect(data).to.be.eql(3);
      done();
    });
  });

  test('insert exist user', (done) => {
    db.createUser('AAA', 'passwordXXX', (data) => {
      expect(data).to.be.eql(-1);
      done();
    });
  });

  test('insert message', (done) => {
    db.insertMessage(1, 0, 'hello', 123, 3, (data) => {
      expect(data).to.be.eql(3);
      done();
    });
  });

  test('get message', (done) => {
    db.getMessages(1, 0, -1, -1, (data) => {
      expect(data).to.be.eql([{ id: 1, sendtime: '123', message: 'yoyoyo', fromuser: 1, touser: 0, status: 3, vote: 0 } ]);
      done();
    });
  });

  test('get empty message', (done) => {
    db.getMessages(999, 0, -1, -1, (data) => {
      expect(data).to.be.eql([]);
      done();
    });
  });

  test('get mutual message', (done) => {
    db.getMutualMessage(1, 0, -1, -1, (data) => {
      expect(data).to.be.eql([{
        sendtime: '123', message: 'yoyoyo', fromuser: '1', touser: '0', status: 3,
      }]);
      done();
    });
  });

  test('get empty mutual message', (done) => {
    db.getMutualMessage(999, 0, -1, -1, (data) => {
      expect(data).to.be.eql([]);
      done();
    });
  });

  test('update user status', (done) => {
    db.updateUserStatus(1, 1, (data) => {
      expect(data).to.be.eql(0);
      done();
    });
  });

  test('insert announcement', (done) => {
    db.insertAnnouncement(1, 456, 'test announcement', (data) => {
      expect(data).to.be.eql(0);
      done();
    });
  });

  test('get announcements', (done) => {
    db.getAnnouncements(-1, -1, (data) => {
      expect(data).to.be.eql([{ username: 'AAA', sendtime: '1509416537573', content: 'hey!' }]);
      done();
    });
  });

  test('get announcements', (done) => {
    db.getAnnouncements(0, 1, (data) => {
      expect(data).to.be.eql([]);
      done();
    });
  });

  test('search messages', (done) => {
    db.searchMessages(1, 0, 'yo', (data) => {
      expect(data).to.be.eql([{
        fromUsername: 'AAA',
        toUsername: 'Public Channel',
        sendtime: '123',
        message: 'yoyoyo',
        status: 3,
      }]);
      done();
    });
  });

  test('search messages not to public', (done) => {
    db.searchMessages(1, 2, 'hi', (data) => {
      expect(data).to.be.eql([{
        fromUsername: 'AAA',
        toUsername: 'BBB',
        sendtime: '123',
        message: 'hihihi',
        status: 3,
      }]);
      done();
    });
  });

  test('record a Vote', (done) => {
    db.recordVote(3, 11, 1, (data) => {
      expect(data).to.be.eql(1);
      done();
    });
  });


  test('update a message\'s vote', (done) => {
    db.updateVote(1, 10, (data) => {
      expect(data).to.be.eql(0);
      done();
    });
  });

  test('update a user\'s voting history', (done) => {
    db.getVoteList(3, (data) => {
      expect(data).to.be.eql([[3, 1], [4, 1], [5, -1]]);
      done();
    });
  });

  test('update a not exist user\'s voting history', (done) => {
    db.getVoteList(9999, (data) => {
      expect(data).to.be.eql([]);
      done();
    });
  });

  test('filter type 0', (done) => {
    db.filterMessage(3, 0, 0, (data) => {
      expect(data.length).to.be.eql(1);
      done();
    });
  });

  test('filter type 1', (done) => {
    db.filterMessage(3, 1, 0, (data) => {
      expect(data.length).to.be.eql(2);
      done();
    });
  });

  test('filter type 2', (done) => {
    db.filterMessage(3, 2, 0, (data) => {
      expect(data.length).to.be.eql(0);
      done();
    });
  });

  test('filter type 3', (done) => {
    db.filterMessage(3, 3, 0, (data) => {
      expect(data.length).to.be.eql(0);
      done();
    });
  });

  test('filter type error', (done) => {
    db.filterMessage(3, 4, 0, (data) => {
      expect(data.length).to.be.eql(0);
      done();
    });
  });

  test('add friend request', (done) => {
    db.addFriendRequest(2, 1, (data) => {
      expect(data).to.be.equal(0);
      done();
    });
  });

  test('add friend', (done) => {
    db.addFriend(1, 2, (data) => {
      expect(data).to.be.equal(0);
      done();
    });
  });

  test('add status change', (done) => {
    db.addStatusChange(1, 3, '1509416537573', (data) => {
      expect(data).to.be.equal(0);
      done();
    });
  });

  test('get friends status change', (done) => {
    db.getAllFriendsStatusChange(2, (data) => {
      expect(data.length).to.be.equal(0);
      done();
    });
  });

  test('search friend', (done) => {
    db.searchFriend(1, 2, (data) => {
      expect(data).to.be.equal(0);
      done();
    });
  });

  test('search friend by id', (done) => {
    db.searchFriendsByID(1, (data) => {
      expect(data.length).to.be.equal(1);
      done();
    });
  });

  test('delete friend request', (done) => {
    db.deleteFriendRequest(1, 0, (data) => {
      expect(data).to.be.equal(0);
      done();
    });
  });

  test('search friend request by touser', (done) => {
    db.searchFriendRequestByToUserId(0, (data) => {
      expect(data.length).to.be.equal(1);
      done();
    });
  });

  test('get posts successfully', (done) => {
    db.getPosts(-1, -1, (data) => {
      expect(data).to.be.eql([{ username: 'AAA', sendtime: '1509416537573',
      title: 'How to deal with earthquake', post: 'run run run' , topic:0}]);
      done();
    });
  });

  test('insert a post', (done) => {
    db.addPost(2, 456, 'how to test post', 'test test dbtest',4,(data) => {
      expect(data).to.be.equal(0);
      done();
    });
  });

  test('get announcements wrong', (done) => {
    db.getAnnouncements(0, 1, (data) => {
      expect(data).to.be.eql([]);
      done();
    });
  });

  test('search posts', (done) => {
    db.searchPosts('earthquake', (data) => {
      expect(data).to.be.eql([{
        username: 'AAA',
        sendtime: '1509416537573',
        title: 'How to deal with earthquake',
        post: 'run run run',
        topic: 0
      }]);
      done();
    });
  });
});
