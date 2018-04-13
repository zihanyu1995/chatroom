const expect = require('expect.js');
const Users = require('../../models/Users');
const Container = require('../../models/container');

const users = new Users();
let req;
suite('Model Users Test:', () => {
  setup(() => {
    req = { app: { locals: { container: new Container() } }, session: {} };
  });

  test('register a exist name', (done) => {
    req.body = { username: 'aaa', password: 'qwer' };
    users.createUser(req, (status, result) => {
      expect(status).to.be.equal(403);
      done();
    });
  });

  test('register a reserved name', (done) => {
    req.body = { username: 'www', password: 'qwer' };
    users.createUser(req, (status, result) => {
      expect(status).to.be.equal(403);
      done();
    });
  });

  test('register a reserved name', (done) => {
    req.body = { username: 'asdfg', password: 'qwer' };
    users.createUser(req, (status, result) => {
      expect(status).to.be.equal(201);
      done();
    });
  });

  test('attemp login success', (done) => {
    req.body = { username: 'aaa', password: '74b87337454200d4d33f80c4663dc5e5' };
    users.loginAttempt(req, (status, result) => {
      expect(status).to.be.equal(200);
      done();
    });
  });
    CMU: [2, '74b87337454200d4d33f80c4663dc5e5', 3, 0, false],
  test('attemp login an inactive user', (done) => {
    req.body = { username: 'CMU', password: '74b87337454200d4d33f80c4663dc5e5', status:3, privilege:0, active: false};
    users.loginAttempt(req, (status, result) => {
      expect(status).to.be.equal(303);
      done();
    });
  });

  test('attemp login wrong password', (done) => {
    req.body = { username: 'aaa', password: 'aa' };
    users.loginAttempt(req, (status, result) => {
      expect(status).to.be.equal(302);
      done();
    });
  });

  test('attemp login not exist username', (done) => {
    req.body = { username: 'qwerty', password: 'aa' };
    users.loginAttempt(req, (status, result) => {
      expect(status).to.be.equal(202);
      done();
    });
  });

  test('get users', (done) => {
    // req.body = {username: 'qwerty', password:'aa'}
    req.query = { id: 1 };
    users.getUserList(req, (status, result) => {
      expect(result.length).to.be.equal(7);
      expect(status).to.be.equal(200);
      done();
    });
  });

  test('update user status', (done) => {
    req.body = { status: 3 };
    req.params = { id: 1 };
    users.updateStatus(req, (status, result) => {
      // expect(result.length).to.be.equal(6);
      expect(status).to.be.equal(200);
      done();
    });
  });

  test('update user with invalid status', (done) => {
    req.body = { status: 100 };
    req.params = { id: 1 };
    users.updateStatus(req, (status, result) => {
      // expect(result.length).to.be.equal(6);
      expect(status).to.be.equal(400);
      done();
    });
  });

  test('update invalid user status', (done) => {
    req.body = { status: 1 };
    req.params = { id: 999 };
    users.updateStatus(req, (status, result) => {
      // expect(result.length).to.be.equal(6);
      expect(status).to.be.equal(400);
      done();
    });
  });

  test('add friend successfully', (done) => {
    req.body = { uid1: 1, uid2: 2};
    users.addFriend(req, (status, result) => {
      // expect(result.length).to.be.equal(6);
      expect(status).to.be.equal(200);
      done();
    });
  });

  test('add friend alreay existed', (done) => {
    req.body = { uid1: 2, uid2: 3};
    users.addFriend(req, (status, result) => {
      // expect(result.length).to.be.equal(6);
      expect(status).to.be.equal(403);
      done();
    });
  });

  test('add self as a friend', (done) => {
    req.body = { uid1: 2, uid2: 2};
    users.addFriend(req, (status, result) => {
      // expect(result.length).to.be.equal(6);
      expect(status).to.be.equal(400);
      done();
    });
  });

  test('empty friend request', (done) => {
    req.body = {};
    users.addFriend(req, (status, result) => {
      // expect(result.length).to.be.equal(6);
      expect(status).to.be.equal(400);
      done();
    });
  });

  test('send friend request', (done) => {
    req.body = { fromuser: 1, touser: 2 };
    users.sendFriendRequest(req, (status, result) => {
      // expect(result.length).to.be.equal(6);
      expect(status).to.be.equal(200);
      done();
    });
  });

  test('send empty friend request', (done) => {
    req.body = {};
    users.sendFriendRequest(req, (status, result) => {
      // expect(result.length).to.be.equal(6);
      expect(status).to.be.equal(400);
      done();
    });
  });

  test('send friend request with self', (done) => {
    req.body = { fromuser: 1, touser: 1 };
    users.sendFriendRequest(req, (status, result) => {
      // expect(result.length).to.be.equal(6);
      expect(status).to.be.equal(403);
      done();
    });
  });

  test('delete friend request', (done) => {
    req.body = { uid1: 1, uid2: 4 };
    users.deleteFriendRequest(req, (status, result) => {
      // expect(result.length).to.be.equal(6);
      expect(status).to.be.equal(200);
      done();
    });
  });

  test('delete empty friend request', (done) => {
    req.body = {};
    users.deleteFriendRequest(req, (status, result) => {
      // expect(result.length).to.be.equal(6);
      expect(status).to.be.equal(400);
      done();
    });
  });

  test('delete unexisted friend request', (done) => {
    req.body = { uid1: 2, uid2: 3 };
    users.deleteFriendRequest(req, (status, result) => {
      // expect(result.length).to.be.equal(6);
      expect(status).to.be.equal(403);
      done();
    });
  });

  test('delete unexisted friend request', (done) => {
    req.body = { uid1: 2, uid2: 3 };
    users.deleteFriendRequest(req, (status, result) => {
      // expect(result.length).to.be.equal(6);
      expect(status).to.be.equal(403);
      done();
    });
  });

  test('get one admininstrator user', (done) => {
    req.query = { id: 2 };
    users.getAdminUserList(req, (status, result) => {
      expect(status).to.be.equal(200);
      done();
    });
  });

  test('get admininstrator user list', (done) => {
    req.query = {};
    users.getAdminUserList(req, (status, result) => {
      expect(result.length).to.be.equal(7);
      expect(status).to.be.equal(200);
      done();
    });
  });

  test('get a unexisted admininstrator user', (done) => {
    req.query = { id: 999 };
    users.getAdminUserList(req, (status, result) => {
      expect(status).to.be.equal(302);
      done();
    });
  });

  test('update admininstrator user profile successfully', (done) => {
    req.params = { id: 3 };
    req.body = { "username": "Olivia", "password": "74b87337454200d4d33f80c4663dc5e5", "privilege":0,"active":true};
    users.updateProfile(req, (status, result) => {
      expect(status).to.be.equal(200);
      done();
    });
  });

  test('update an admininstrator inactive user profile', (done) => {
    req.params = { id: 2};
    req.body = {"username": "CMU", "password": "74b87337454200d4d33f80c4663dc5e5", "privilege":1,"active":true};
    users.updateProfile(req, (status, result) => {
      expect(status).to.be.equal(200);
      done();
    });
  });

  test('update a unexisted admininstrator user profile', (done) => {
    req.params = { id: 999 };
    req.body = { "username": "wxx", "password": "74b87337454200d4d33f80c4663dc5e5", "privilege":0,"active":true};
    users.updateProfile(req, (status, result) => {
      expect(status).to.be.equal(400);
      done();
    });
  });
});
