module.exports = class MockDatabase {
  constructor() {
    this.userName = {};
    this.messages = [];
    this.announcements = [];
    this.locations = [];
    this.friends = [];
    this.requests = [];
    this.statusChanges = [];
    this.posts = [];

    // TODO: put this in testing fixture
    // username: id, password, status, privilege, active
    this.userName = {
      'Public Channel': [0, 'password', 4, 0, true],
      aaa: [1, '74b87337454200d4d33f80c4663dc5e5', 4, 0, true],
      CMU: [2, '74b87337454200d4d33f80c4663dc5e5', 3, 0, false],
      Olivia: [3, '74b87337454200d4d33f80c4663dc5e5', 3, 0, true],
      Yen: [4, '74b87337454200d4d33f80c4663dc5e5', 2, 0, true],
      yoyo: [5, '74b87337454200d4d33f80c4663dc5e5', 2, 0, true],
      ESNAdmin: [6, 'admin', 1, 2, true],
    };
    this.messages = this.messages.concat([
      [1506759774439, 'Hello', 1, 0, 1],
      [1506759774449, 'This is a book', 4, 0, 1],
      [1506759774459, 'QQQQQQ', 3, 0, 1],
      [1506759774469, 'fse fse fse', 1, 2, 1],
      [1506759774469, '123 123 123', 1, 2, 1],
      [1506759776489, 'lll kkk kkk', 2, 1, 1],
      [1506759778469, 'wow wow wow', 2, 0, 1],
      [1506759779479, 'qaa qaa qaa', 1, 1, 1],
      [1506759779499, 'zzs sfq jjj', 2, 1, 1],
      [1506759779479, 'test Search message', 3, 4, 1],
    ]);
    this.announcements = this.announcements.concat([
      [1, 1508358111093, 'Hello~'],
      [2, 1508358111093, 'Welcome~'],
      [4, 1508358111093, 'To~'],
      [5, 1508358111093, 'ESN~'],
      [1, 1508358111093, '~~~~'],
    ]);

    this.locations = this.locations.concat([
      [1, 1, 'Shelter with beds & comforters', 'come', '11/15/2017', '11/15/2027', 0, '1508358111500', 100, 100],
    ]);
    this.friends = this.friends.concat([
      [2, 3],
    ]);
    this.requests = this.requests.concat([
      [4, 1],
    ]);
    this.statusChanges = this.statusChanges.concat([
      [2, 2, 1506759774439],
    ]);
    this.posts = this.posts.concat([
      [5, 1508358111099,'How to survive in earthquake','run run run run run run',1],
      [4, 1508358111199,'How to survive in house fire','go go go go go go go go',2],
      [3, 1508358111199,'How to survive in gas leaking','jump jump jump jump jump',3],
    ]);
  }

  getMessages(fromUserID, toUserID, timeStart, timeEnd, cb) {
    let fromAny = false,
      toAny = false;
    if (fromUserID == -1) { fromAny = true; }
    if (toUserID == -1) { toAny = true; }
    if (timeStart == -1) { timeStart = 0; }
    if (timeEnd == -1) { timeEnd = Date.now(); }

    const ret = [];
    for (let i = 0; i < this.messages.length; i++) {
      if (fromAny || this.messages[i][2] == fromUserID) {
        if (toAny || this.messages[i][3] == toUserID) {
          if (this.messages[i][0] >= timeStart && this.messages[i][0] <= timeEnd) {
            ret.push(this.messages[i]);
          }
        }
      }
    }
    cb(ret);
  }

  getMutualMessage(FirstID, SecondID, timeStart, timeEnd, cb) {
    let ret1;
    this.getMessages(FirstID, SecondID, timeStart, timeEnd, (data) => {
      ret1 = data;
    });
    let ret2;
    this.getMessages(SecondID, FirstID, timeStart, timeEnd, (data) => {
      ret2 = data;
    });
    const ret = (ret1.concat(ret2)).sort((a, b) => a[0] - b[0]);
    cb(ret);
  }

  insertMessage(fromUserID, toUserID, message, time, status, cb) {
    if (fromUserID > 100) {
      cb(-1);
    } else {
      this.messages.push([time, message, fromUserID, toUserID]);
      cb(0);
    }
  }

  createUser(inputName, password, cb) {
    if (inputName in this.userName) {
      cb(-1);
    } else {
      const id = Object.keys(this.userName).length;
      this.userName[inputName] = [id, password];
      cb(id);
    }
  }

  getUsers(cb) {
    const ret = [];
    for (const u in this.userName) {
      // Name, ID
      ret.push({ userName: u, id: this.userName[u][0], status: this.userName[u][2] });
    }
    cb(ret);
  }

  getAdminUserList(cb){
    const ret = [];
    for(const u in this.userName) {
       ret.push({ id: this.userName[u][0], userName: u, password: this.userName[u][1], privilege: this.userName[u][3], active: this.userName[u][4]})
    }
    cb(ret);
  }

  updateProfile(parameters, cb){
    var findID = false;
    for(var u in this.userName) {
      if(this.userName[u][0] == parameters.id){
        findID = true;
        this.userName[u][1] = parameters.password;
        this.userName[u][3] = parameters.privilege;
        this.userName[u][4] = parameters.active;
        this.userName.u = parameters.username;
        cb(0);
        return;
      }
    }
    if(findID == false){
      cb(-1);
    }
  }

  searchFriend(uid1, uid2, cb) {
    if (uid1 == 2 && uid2 == 3) {
      cb(0);
    } else {
      cb(1);
    }
  }

  addFriend(uid1, uid2, cb) {
    if (uid1 == uid2) {
      cb(-1);
    } else {
      this.friends.push([uid1, uid2]);
      cb(0);
    }
  }

  searchFriendsByID(userId, cb) {
    cb([2,3]);
  }

  searchFriendRequestByToUserId(userId, cb) {
    cb([4]);
  }

  addFriendRequest(fromuser, touser, cb) {
    if (fromuser == touser)
      cb(-1);
    else {
      this.requests.push([fromuser, touser]);
      cb(0);
    }
  }

  deleteFriendRequest(fromuser, touser, cb) {
    if (fromuser != 4 || touser != 1)
      cb(-1);
    else {
      cb(0);
    }
  }

  getAllFriendsStatusChange(id, cb) {
    cb(this.statusChanges);
  }

  addStatusChange(id, status, sendtime, cb) {
    if (id == 111)
      cb(-1);
    else
      cb(0);
  }

  findUser(userName, cb) {
    if (userName in this.userName) {
      const tmp = this.userName[userName];
      cb({ id: tmp[0], password: tmp[1], status: tmp[2], privilege: tmp[3], active: tmp[4] });
    } else {
      cb({ id: null, password: null });
    }
  }
  updateUserStatus(userID, status, cb) {
    for (const u in this.userName) {
      // Name, ID
      if (this.userName[u][0] == userID) {
        this.userName[u][2] = status;
        cb(0);
        return;
      }
    }
    cb(-1);
  }

  getAnnouncements(timeStart, timeEnd, cb) {
    if (timeStart == -1) { timeStart = 0; }
    if (timeEnd == -1) { timeEnd = Date.now(); }

    if (timeStart > timeEnd) {
      cb([]);
      return;
    }
    const ret = [];
    for (let i = 0; i < this.announcements.length; i++) {
      if (this.announcements[i][1] >= timeStart && this.announcements[i][1] <= timeEnd) {
        let retUserName;
        for (const user in this.userName) {
          if (this.userName[user][0] == this.announcements[i][0]) {
            retUserName = user;
          }
        }
        ret.push({ username: retUserName, sendtime: this.announcements[i][1], content: this.announcements[i][2] });
      }
    }
    cb(ret);
  }

  insertAnnouncement(userid, sendtime, announcement, cb) {
    if (announcement == null) { cb(-1); } else {
      this.announcements.push([userid, sendtime, announcement]);
      cb(0);
    }
  }

  searchUsersByUserName(userName, cb) {
    const ret = [];
    for (const user in this.userName) {
      if (user.indexOf(userName) >= 0) {
        ret.push({ userName: user, id: this.userName[user][0], status: this.userName[user][2] });
      }
    }
    cb(ret);
  }

  searchUsers(userName, status, cb) {
    const ret = [];
    for (const user in this.userName) {
      if (this.userName[user][2] == status) {
        if (userName == '') {
          ret.push({ userName: user, id: this.userName[user][0], status: this.userName[user][2] });
        } else if (user.indexOf(userName) >= 0) {
          ret.push({ userName: user, id: this.userName[user][0], status: this.userName[user][2] });
        }
      }
    }
    cb(ret);
  }

  searchAnnouncements(words, cb) {
    const ret = [];
    const userName = this.userName;
    this.announcements.forEach((announcement) => {
      let matchAnnouncement = true;
      words.forEach((word) => {
        if (announcement[2].indexOf(word) < 0) {
          matchAnnouncement = false;
        }
      });
      if (matchAnnouncement) {
        for (const user in userName) {
          if (userName[user][0] == announcement[0]) {
            ret.push({ username: user, sendtime: announcement[1], content: announcement[2] });
          }
        }
      }
    });
    cb(ret);
  }

  searchMessages(fromUserID, toUserID, words, cb) {
    const ret = [];
    const userName = this.userName;
    this.messages.forEach((message) => {
      let match = true;
      words.forEach((word) => {
        if (message[1].indexOf(word) < 0) {
          match = false;
        }
      });
      if (match) {
        for (const user in userName) {
          if ((fromUserID == message[2] && toUserID == message[3]) || (fromUserID == message[3] && toUserID == message[2])) {
            for (const user2 in userName) {
              if (userName[user2][0] == message[3] && user == message[2]) {
                toname = user2;
              }
            }
            if (userName[user][0] == message[2]) {
              ret.push({
                fromUserName: user, toUserName: 'Yen', sendtime: message[0], message: message[1], status: message[4],
              });
            }
          }
        }
      }
    });
    cb(ret);
  }

  insertLocation(userID, title, content, startTime, endTime, role, currentTime, longitude, latitude, cb) {
    let id = Object.keys(this.locations).length + 1;
    this.locations.push([id, userID, title, content, startTime, endTime, role, currentTime, longitude, latitude]);
    cb(id);
  }

  getLocations(cb) {
    const ret = [];
    for (let i = 0; i < this.locations.length; i++) {
      ret.push({
        id: this.locations[i][0],
        userID: this.locations[i][1],
        title: this.locations[i][2],
        content: this.locations[i][3],
        startTime: this.locations[i][4],
        endTime: this.locations[i][5],
        role: this.locations[i][6],
        currentTime: this.locations[i][7],
        longitude: this.locations[i][8],
        latitude: this.locations[i][9]
      })
    }
    cb(ret);
  }

  addPost(userid, sendtime, title, post, topic, cb) {
    if (title == null && post == null) { cb(-1); } else {
      this.posts.push([userid, sendtime, title, post, title]);
      cb(0);
    }
  }

  getPosts(timeStart, timeEnd, cb) {
    if (timeStart == -1) { timeStart = 0; }
    if (timeEnd == -1) { timeEnd = Date.now(); }

    if (timeStart > timeEnd) {
      cb([]);
      return;
    }
    const ret = [];
    for (let i = 0; i < this.posts.length; i++) {
      if (this.posts[i][1] >= timeStart && this.posts[i][1] <= timeEnd) {
        let retUserName;
        for (const user in this.userName) {
          if (this.userName[user][0] == this.posts[i][0]) {
            retUserName = user;
          }
        }
        ret.push({ username: retUserName, sendtime: this.posts[i][1], title: this.posts[i][2],
          post: this.posts[i][3], topic : this.posts[i][4]});
      }
    }
    cb(ret);
  }

 searchPosts(words, cb) {
      const ret = [];
      const userName = this.userName;
      this.posts.forEach((posts) => {
        let matchPosts = true;
        words.forEach((word) => {
          if ((posts[2].indexOf(word) + posts[2].indexOf(word))< 0) {
            matchPosts = false;
          }
        });
        if (matchPosts) {
          for (const user in userName) {
            if (userName[user][0] == posts[0]) {
              ret.push({ username: user, sendtime: posts[1], title: posts[2], post: posts[3], topic: posts[4]});
            }
          }
        }
      });
      cb(ret);
  }

  recordVote(userID, message, choice, cb) {
    if (message === 99) {
      cb('fail');
      return;
    }
    cb(0);
  }
  countVote(messageID, cb) {
    cb(10);
  }
  updateVote(messageID, vote, cb) {
    if (messageID === 99) {
      cb(-1);
      return;
    }
    cb(0);
  }

  getVoteList(userID, cb) {
    cb([]);
  }
  filterMessage(user, type, threshold, cb) {
    cb([]);
  }
};
