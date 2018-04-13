const expect = require('expect.js');
const Notifications = require('../../models/Notifications');
const Container = require('../../models/container');

const notifications = new Notifications();
let req;
suite('Model notifications Test:', () => {
  setup(() => {
    req = { app: { locals: { container: new Container() } }, session: {} };
  });

  test('get friends status change', (done) => {
    req.params = { id: 2 };
    notifications.getAllFriendsStatusChange(req, (status, result) => {
      expect(result.length).to.be.equal(1);
      expect(status).to.be.equal(200);
      done();
    });
  });

  test('add status change', (done) => {
    req.params = { id: 2 };
    req.body = { status: 3 };
    notifications.addStatusChange(req, (status, result) => {
      expect(status).to.be.equal(200);
      done();
    });
  });

  test('add unneeded status change', (done) => {
    req.params = { id: 1 };
    req.body = { status: 1 };
    notifications.addStatusChange(req, (status, result) => {
      expect(status).to.be.equal(403);
      done();
    });
  });

  test('add unexisted user status change', (done) => {
    req.params = { id: 111 };
    req.body = { status: 2 };
    notifications.addStatusChange(req, (status, result) => {
      expect(status).to.be.equal(400);
      done();
    });
  });

});
