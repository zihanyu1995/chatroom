const reserveJson = require('../data/reservedUserName.json');

const reserve = new Set(reserveJson);

module.exports = class Users {
  changeUserOnline(c, id, action) {
    if (action === 'login') {
      c.onlineUserList.add(id);
    } else if (action === 'logout') {
      c.onlineUserList.delete(id);
    }
  }

  loginAttempt(req, cb) {
    // Try to find whether user exists in the database. If exists, check password.
    const c = req.app.locals.container;
    c.db.findUser(req.body.username, (user) => {
      if (user.id != null) {
        // User exists, authorize password
        if (user.active && user.password === req.body.password) {
          // Add online/offline user list
          this.changeUserOnline(c, user.id, 'login');
          // Add session
          const sessionUser = {
            id: user.id, username: req.body.username, isNewUser: false, status: user.status, privilege: user.privilege
          };
          req.session.user = sessionUser;
          // boardcast login
          c.io.emit('registerUser', { registerUserId: user.id });
          cb(200, sessionUser);
        } else if (!user.active) {
          cb(303, '');
        } else {
          // Wrong password
          cb(302, '');
        }
      } else {
        // User does not exist, ask if want to create an account
        cb(202, '');
      }
    });
  }

  createUser(req, cb) {
    const c = req.app.locals.container;
    let id;
    // Check username is reserved
    if (reserve.has(req.body.username)) {
      cb(403, 'reserved');
    } else {
      c.db.createUser(req.body.username, req.body.password, (result) => {
        if (result === -1) {
          cb(403, 'exist');
        } else {
          id = result;
          // Create new user
          // Boardcast to all online user to update user list
          c.io.sockets.emit('registerUser', { registerUserId: id });
          // Add online/offline user list
          this.changeUserOnline(c, id, 'login');
          // Add session
          const sessionUser = { id: id, username: req.body.username, isNewUser: true, privilege: 0 };
          req.session.user = sessionUser;
          cb(201, sessionUser);
        }
      });
    }
  }

  searchUsers(req, cb) {
    const c = req.app.locals.container;
    let userName = req.params.userName;
    const status = req.params.status;
    userName = userName == 'all' ? '' : userName;
    if (status == 0) {
      c.db.searchUsersByUserName(userName, (result) => {
        // TODO refactor : add online attr has appeared in three methods
        for (let i = 0; i < result.length; i++) {
          result[i].online = c.onlineUserList.has(result[i].id) ? 0 : 1;
          result.sort((a, b) => { return a.userName < b.userName ? -1 : 1; });
        }
        cb(200, result);
      });
    } else {
      c.db.searchUsers(userName, status, (result) => {
        for (let i = 0; i < result.length; i++) {
          result[i].online = c.onlineUserList.has(result[i].id) ? 0 : 1;
          result.sort((a, b) => { return a.userName < b.userName ? -1 : 1; });
        }
        cb(200, result);
      });
    }
  }

  logout(req, cb) {
    const c = req.app.locals.container;
    this.changeUserOnline(req.app.locals.container, req.session.user.id, 'logout');
    c.io.sockets.emit('logout', { id: req.session.user.id });
    req.session.destroy(cb);
  }

  searchFriendByID(userId, container, cb) {
    //const container = req.app.locals.container
    container.db.searchFriendsByID(userId, (friends) => {
      cb(friends);
    });
  }

  searchFriendRequestByToUserId(touser, container, cb) {
    //const container = req.app.locals.container
    container.db.searchFriendRequestByToUserId(touser, (requests) => {
      cb(requests);
    });
  }

  getUserList(req, cb) {
    const container = req.app.locals.container;
    this.searchFriendByID(req.query.id, container, (friends) => {
      this.searchFriendRequestByToUserId(req.query.id, container, (fr_requests) => {
        container.db.getUsers((retrivedList) => {
          // TODO refactor
          // compare check whether a user is online or not
          // by check whether he/she's in container.onlineUserList
          const result = [];
          for (let i = 0; i < retrivedList.length; i += 1) {
            if (container.onlineUserList.has(retrivedList[i].id)) {
              retrivedList[i].online = 0;
            } else {
              retrivedList[i].online = 1;
            }
            if (friends.includes(retrivedList[i].id)) {
              retrivedList[i].friend = 1;
            } else {
              retrivedList[i].friend = 0;
            }
            if (fr_requests.includes(retrivedList[i].id)) {
              retrivedList[i].friendReq = 1;
            } else {
              retrivedList[i].friendReq = 0;
            }

            result.push(retrivedList[i]);
          }
          result.sort((a, b) => { return a.userName < b.userName ? -1 : 1; });
          cb(200, result);
        });
      });
    });
  }

  updateStatus(req, cb) {
    const container = req.app.locals.container;
    if (req.body.status < 1 || req.body.status > 4) {
      cb(400);
    } else {
      this.searchFriendByID(req.params.id, container, (friends) => {
        container.db.updateUserStatus(req.params.id, req.body.status, (result) => {
          if (result === 0) {
            container.io.sockets.emit('status', {
              id: req.params.id,
              status: req.body.status,
            });
            for (let i = 0; i < friends.length; i += 1) {
              container.io.to(container.socketMap.get(parseInt(friends[i]))).emit('friendStatus', {
                id: req.params.id,
                status: req.body.status,
              });
            }
            cb(200);
          } else {
            cb(400);
          }
        });
      });
    }
  }

  addFriend(req, cb) {
    const container = req.app.locals.container;
    if (req.body.uid1 != null && req.body.uid2 != null) {
      container.db.searchFriend(req.body.uid1, req.body.uid2, (result) => {
        if (result == 1) {
          container.db.addFriend(req.body.uid1, req.body.uid2, (result) => {
            if (result == 0) {
              cb(200);
            } else {
              cb(400);
            }
          });
        } else {
          cb(403);
        }
      });
    } else {
      cb(400);
    }
  }

  sendFriendRequest(req, cb) {
    const container = req.app.locals.container;
    if (req.body.touser != null) {
      container.db.addFriendRequest(req.body.fromuser, req.body.touser, (result) => {
        if (result == 0) {
          const message = {
            fromUserID: req.body.fromuser,
          };
          container.io.to(container.socketMap.get(parseInt(req.body.touser))).emit('request', message);
          cb(200);
        } else {
          cb(403);
        }
      });
    } else {
      cb(400);
    }
  }

  deleteFriendRequest(req, cb) {
    const container = req.app.locals.container;
    if (req.body.uid1 != null && req.body.uid2 != null) {
      container.db.deleteFriendRequest(req.body.uid2, req.body.uid1, (result) => {
        if (result === 0) {
          cb(200);
        } else {
          cb(403);
        }
      });
    } else {
      cb(400);
    }
  }

  getAdminUserList(req, cb) {
    const container = req.app.locals.container;
    container.db.getAdminUserList((retrivedList) => {
      if (req.query.id === undefined) {
        cb(200, retrivedList);
      } else {
        const intId = parseInt(req.query.id, 10);
        for (let i = 0; i < retrivedList.length; i += 1) {
          if (retrivedList[i].id === intId) {
            cb(200, retrivedList[i]);
            return;
          }
        }
        cb(302, {});
      }
    });
  }
  updateProfile(req, cb) {
    const container = req.app.locals.container;
    const parameters = {};
    parameters.id = req.params.id;
    parameters.username = req.body.username;
    parameters.password = req.body.password;
    parameters.privilege = req.body.privilege;

    if (req.body.active === 'true' || req.body.active === 'false') {
      parameters.active = req.body.active === 'true';
    }
    if (parameters.active === false) {
      container.io.sockets.emit('inactive', { id: req.params.id });
    }
    container.db.updateProfile(parameters, (result) => {
      if (result === 0) {
        cb(200);
      } else {
        cb(400);
      }
    });
  }
};
