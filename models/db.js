/* DB setup Connection */
const pg = require('pg');

function resolver(source, originField, outputField) {
  const tmp = {};
  for (let i = 0; i < originField.length; i += 1) {
    tmp[outputField[i]] = source[originField[i]];
  }
  return tmp;
}

module.exports = class PostgreDatabase {
  constructor(dbConfig) {
    this.pool = new pg.Pool(dbConfig);
    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
    });
  }

  getUsers(cb) {
    this.pool.connect().then((client) => {
      return client.query('Select * FROM users WHERE active = \'t\' ORDER by id ')
        .then((res) => {
          client.release();
          const msg = [];
          for (let i = 1; i < res.rows.length; i += 1) { // skip public user
            msg.push({ userName: res.rows[i].username, id: res.rows[i].id, status: res.rows[i].status });
          }
          cb(msg);
        })
        .catch((e) => {
          console.warn(e.stack);
          cb([]);
        });
    });
  }

  getAdminUserList(cb) {
    this.pool.connect().then((client) => {
      return client.query('Select id, username, password, privilege, active FROM users ORDER by id')
        .then((res) => {
          client.release();
          const msg = [];
          for (let i = 1; i < res.rows.length; i += 1) { // skip public user
            msg.push({
              id: res.rows[i].id,
              username: res.rows[i].username,
              password: res.rows[i].password,
              privilege: res.rows[i].privilege,
              active: res.rows[i].active,
            });
          }
          cb(msg);
        })
        .catch((e) => {
          console.warn(e.stack);
          cb([]);
        });
    });
  }

  findUser(userName, cb) {
    this.pool.connect()
      .then((client) => {
        return client.query('Select * FROM users WHERE username = $1', [userName])
          .then((res) => {
            client.release();
            if (res.rows[0] && res.rows[0].username === userName) {
              console.log('Find User Success');
              cb({
                id: res.rows[0].id,
                password: res.rows[0].password,
                status: res.rows[0].status,
                privilege: res.rows[0].privilege,
                active: res.rows[0].active,
              });
            } else {
              console.log('Didn\'t find User');
              cb({ id: null, password: null, status: null });
            }
          })
          .catch((e) => {
            client.release();
            console.error(e.stack);
            cb({ id: null, password: null });
          });
      });
  }

  createUser(userName, password, cb) {
    this.pool.connect().then((client) => {
      return client.query('INSERT INTO users(username, password) VALUES($1::text, $2::text) RETURNING id', [userName, password])
        .then((res) => {
          console.log('Create User Success');
          const newlyCreatedUserId = res.rows[0].id;
          client.release();
          cb(newlyCreatedUserId);
        })
        .catch((e) => {
          console.error(e.stack);
          client.release();
          cb(-1);
        });
    });
  }


  insertMessage(fromUserName, toUserName, message, time, status, cb) {
    this.pool.connect().then((client) => {
      return client.query('INSERT INTO messages(sendtime, message, fromuser, touser, status) VALUES($1::text, $2::text, $3::integer, $4::integer, $5::integer) RETURNING id', [time, message, fromUserName, toUserName, status])
        .then((res) => {
          console.log('Insert Message Success');
          client.release();
          cb(res.rows[0].id);
        })
        .catch((e) => {
          client.release();
          console.error('connection', e.stack);
          cb(-1);
        });
    });
  }

  getMessages(fromUserName, toUserName, timeStart, timeEnd, cb) {
    this.pool.connect().then((client) => {
      if (timeStart === -1) {
        timeStart = 0;
      }
      if (timeEnd === -1) {
        timeEnd = Date.now();
      }
      let userContent = '';
      if (fromUserName !== -1) {
        userContent += `fromuser = ${fromUserName} and`;
      }
      if (toUserName !== -1) {
        userContent += ` touser=${toUserName} and`;
      }
      return client.query(`Select * FROM messages WHERE ${userContent} sendtime>=$1 and sendtime<=$2 ORDER BY sendtime`, [timeStart, timeEnd])
        .then((res) => {
          client.release();
          if (res.rows[0]) {
            console.log('Get Message Success');
            const msg = [];
            const field = ['id', 'sendtime', 'message', 'fromuser', 'touser', 'status', 'vote'];
            for (let i = 0; i < res.rows.length; i += 1) {
              msg.push(resolver(res.rows[i], field, field));
            }
            cb(msg);
          } else {
            cb([]);
          }
        })
        .catch((e) => {
          client.release();
          console.error(e.stack);
          cb([]);
        });
    });
  }

  getMutualMessage(FirstID, SecondID, timeStart, timeEnd, cb) {
    // get message from FirstID->SecondID or SecondID->FirstID
    // within the time range.
    // e.g: every message between Yen and CMU: getMutualMessage('Yen', 'CMU', -1, -1)
    if (timeStart === -1) {
      timeStart = 0;
    }
    if (timeEnd === -1) {
      timeEnd = Date.now();
    }
    const userContent = ['((fromuser =', FirstID, ' and ', ' touser=', SecondID, ') or (fromuser =', SecondID, ' and ', ' touser=', FirstID, ')) and '].join('');

    this.pool.connect().then((client) => {
      const query = `Select * FROM messages WHERE ${userContent} sendtime>=$1 and sendtime<=$2 ORDER BY sendtime`;
      return client.query(query, [timeStart, timeEnd])
        .then((res) => {
          client.release();
          if (res.rows[0]) {
            console.log('get Mutual Message Success');
            const msg = [];
            const field = ['sendtime', 'message', 'fromuser', 'touser', 'status'];
            for (let i = 0; i < res.rows.length; i += 1) {
              msg.push(resolver(res.rows[i], field, field));
            }
            cb(msg);
          } else {
            cb([]);
          }
        });
    });
  }

  updateUserStatus(id, status, cb) {
    this.pool.connect().then((client) => {
      const query = 'UPDATE users SET status = $1 WHERE id = $2';
      return client.query(query, [status, id])
        .then(() => {
          client.release();
          console.log('Update Status Success');
          cb(0);
        })
        .catch((e) => {
          client.release();
          console.log(e.stack);
          cb(-1);
        });
    });
  }

  updateProfile(parameters, cb) {
    const queryList = [];
    const fieldList = ['username', 'password', 'privilege', 'active'];
    for (let i = 0; i < fieldList.length; i += 1) {
      if (parameters[fieldList[i]] !== undefined) {
        if (i < 2) {
          queryList.push(`UPDATE users SET ${fieldList[i]} = '${parameters[fieldList[i]]}' WHERE id = ${parameters.id}`);
        } else {
          queryList.push(`UPDATE users SET ${fieldList[i]} = ${parameters[fieldList[i]]} WHERE id = ${parameters.id}`);
        }
      }
    }
    queryList.push(';');
    this.pool.connect().then((client) => {
      const query = queryList.join(';');
      return client.query(query)
        .then((res) => {
          if (res.rowCount !== 0) {
            client.release();
            cb(0);
          } else {
            cb(-1);
          }
        })
        .catch((e) => {
          console.log('catch user profile fail');
          client.release();
          console.log(e.stack);
          cb(-1);
        });
    });
  }


  addStatusChange(id, status, sendtime, cb) {
    this.pool.connect().then((client) => {
      let sql = `INSERT INTO statusChangeHistory (userid, status, sendtime) VALUES (${id}, ${status}, ${sendtime});`;
      return client.query(sql)
        .then(() => {
          client.release();
          console.log('Insert Status Change Success');
          cb(0);
        })
        .catch((e) => {
          client.release();
          console.log(e.stack);
          cb(-1);
        });
    });
  }

  getAllFriendsStatusChange(userId, cb) {
    this.pool.connect()
      .then((client) => {
        let sql = 'SELECT * FROM statusChangeHistory h '
                + 'WHERE h.userid IN ';
        sql += `(SELECT (uid1+uid2-${userId}) as friend FROM friends WHERE uid1=${userId} or uid2=${userId}) `;
        sql += 'ORDER BY sendtime desc;';
        return client.query(sql)
          .then((res) => {
            client.release();
            const changes = [];
            for (let i = 0; i < res.rows.length; i += 1) { // skip public user
              changes.push({ userid: res.rows[i].userid, status: res.rows[i].status, sendtime: res.rows[i].sendtime });
            }
            cb(changes);
          })
          .catch((e) => {
            console.error(e.stack);
            client.release();
            cb([]);
          });
      });
  }

  insertAnnouncement(userid, sendtime, announcement, cb) {
    this.pool.connect().then((client) => {
      return client.query('INSERT INTO announcements(userid, sendtime, announcement) VALUES($1::integer, $2::text, $3::text)', [userid, sendtime, announcement])
        .then(() => {
          console.log('Insert Message Success');
          client.release();
          cb(0);
        })
        .catch((e) => {
          console.error(e.stack);
          client.release();
          cb(-1);
        });
    });
  }

  getAnnouncements(timeStart, timeEnd, cb) {
    this.pool.connect().then((client) => {
      if (timeStart === -1) {
        timeStart = 0;
      }
      if (timeEnd === -1) {
        timeEnd = Date.now();
      }

      return client.query('Select * FROM announcements join users on announcements.userid = users.id WHERE sendtime>=$1 and sendtime<=$2 ORDER BY sendtime DESC', [timeStart, timeEnd])
        .then((res) => {
          if (res.rows[0]) {
            console.log('Get Announcement Success');
            const ann = [];
            for (let i = 0; i < res.rows.length; i += 1) {
              ann.push({
                username: res.rows[i].username,
                sendtime: res.rows[i].sendtime,
                content: res.rows[i].announcement,
              });
            }
            client.release();
            cb(ann);
          } else {
            client.release();
            cb([]);
          }
        })
        .catch((e) => {
          client.release();
          console.error(e.stack);
          cb([]);
        });
    });
  }


  searchMessages(fromUserID, toUserID, words, cb) {
    this.pool.connect()
      .then((client) => {
        let sqlcontent = '';
        if (toUserID !== 0) {
          sqlcontent = ' u1.id as fromid,';
        }
        let sql = 'Select messages.status as status, u1.username as fromname,'+ sqlcontent +' u2.username as toname, u2.id as toid, sendtime, message '
                  + 'from messages join users u1 on u1.id = messages.fromuser '
                  + 'join users u2 on u2.id = messages.touser ';
        sql += ` where message like '%${words[0]}%'`;
        for (let i = 1; i < words.length; i += 1) {
          sql += ` and message like '%${words[i]}%'`;
        }
        if (toUserID === 0) {
          sql += ' and u2.id = 0 ORDER BY sendtime DESC;';
        } else {
          sql += ` and (u1.id = ${fromUserID} and u2.id = ${toUserID})or(u1.id = ${toUserID} and u2.id = ${fromUserID}) ORDER BY sendtime DESC;`;
        }
        return client.query(sql)
          .then((res) => {
            console.log('Search Messages Success');
            const msg = [];
            for (let i = 0; i < res.rows.length; i += 1) {
              msg.push({
                fromUsername: res.rows[i].fromname, toUsername: res.rows[i].toname, sendtime: res.rows[i].sendtime, message: res.rows[i].message, status: res.rows[i].status,
              });
            }
            client.release();
            cb(msg);
          })
          .catch((e) => {
            client.release();
            console.error(e.stack);
            cb([]);
          });
      });
  }

  addFriend(uid1, uid2, cb) {
    this.pool.connect()
      .then((client) => {
        const sql = `INSERT INTO friends(uid1, uid2) VALUES (${uid1}, ${uid2});`;
        return client.query(sql)
          .then(() => {
            console.log('Insert Friend Success');
            client.release();
            cb(0);
          })
          .catch((e) => {
            console.error(e.stack);
            client.release();
            cb(-1);
          });
      });
  }

  searchFriend(uid1, uid2, cb) {
    this.pool.connect()
      .then((client) => {
        const sql = `SELECT * FROM friends WHERE (uid1=${uid1} and uid2=${uid2}) or (uid1=${uid2} and uid2=${uid1});`;
        return client.query(sql)
          .then((res) => {
            client.release();
            if (res.rows[0]) {
              console.log('Find Friend Success');
              cb(0);
            } else {
              console.log('Do not find friends');
              cb(1);
            }
          })
          .catch((e) => {
            console.error(e.stack);
            client.release();
            cb(-1);
          });
      });
  }

  searchFriendsByID(userId, cb) {
    this.pool.connect()
      .then((client) => {
        const sql = `SELECT (uid1+uid2-${userId}) as friend FROM friends WHERE uid1=${userId} or uid2=${userId};`;
        return client.query(sql)
          .then((res) => {
            client.release();
            if (res.rows[0]) {
              console.log('Find Friends Success');
              const friends = [];
              for (let i = 0; i < res.rows.length; i += 1) {
                // if (res.rows[i].uid1 == userId)
                //   friends.push(res.rows[i].uid2);
                // else
                friends.push(res.rows[i].friend);
              }
              cb(friends);
            } else {
              console.log('Do not find friends');
              cb([]);
            }
          })
          .catch((e) => {
            console.error(e.stack);
            client.release();
            cb([]);
          });
      });
  }

  addFriendRequest(fromuser, touser, cb) {
    this.pool.connect()
      .then((client) => {
        const sql = `INSERT INTO requests(fromuser, touser) VALUES (${fromuser}, ${touser});`;
        return client.query(sql)
          .then(() => {
            console.log('Insert Request Success');
            client.release();
            cb(0);
          })
          .catch((e) => {
            console.error(e.stack);
            client.release();
            cb(-1);
          });
      });
  }

  deleteFriendRequest(fromuser, touser, cb) {
    this.pool.connect()
      .then((client) => {
        const sql = `DELETE FROM requests where fromuser=${fromuser} and touser=${touser};`;
        return client.query(sql)
          .then(() => {
            console.log('Delete Request Success');
            client.release();
            cb(0);
          })
          .catch((e) => {
            console.error(e.stack);
            client.release();
            cb(-1);
          });
      });
  }

  searchFriendRequestByToUserId(touser, cb) {
    this.pool.connect()
      .then((client) => {
        const sql = `SELECT * FROM requests WHERE touser=${touser};`;
        return client.query(sql)
          .then((res) => {
            client.release();
            if (res.rows[0]) {
              console.log('Find Requests Success');
              const requests = [];
              for (let i = 0; i < res.rows.length; i += 1) {
                if (res.rows[i].touser === touser) {
                  requests.push(res.rows[i].fromuser);
                } else {
                  requests.push(res.rows[i].fromuser);
                }
              }
              cb(requests);
            } else {
              console.log('Do not find requests');
              cb([]);
            }
          })
          .catch((e) => {
            console.error(e.stack);
            client.release();
            cb([]);
          });
      });
  }

  addPost(userid, sendtime, title, post, topic, cb) {
    this.pool.connect().then((client) => {
      return client.query('INSERT INTO posts(userid, sendtime, title, post, topic) VALUES($1::integer, $2::text, $3::text, $4::text, $5::integer)', [userid, sendtime, title, post,topic])
        .then(() => {
          client.release();
          cb(0);
        })
        .catch((e) => {
          console.error(e.stack);
          client.release();
          cb(-1);
        });
    });
  }


  insertLocation(userID, title, content, startTime, endTime, role, currentTime, longitude, latitude, cb) {
    this.pool.connect().then((client) => {
      return client.query('INSERT INTO locations(userid, title, content, starttime, endtime, role, posttime, longitude, latitude) VALUES($1::integer, $2::text, $3::text, $4::text, $5::text, $6::integer, $7::text, $8::real, $9::real)',
        [userID, title, content, startTime, endTime, role, currentTime, longitude, latitude])
        .then(() => {
          console.log('Insert Location Success');
          cb(0);
          client.release();
        })
        .catch((e) => {
          client.release();
          console.error(e.stack);
        });
    });
  }

  getLocations(cb) {
    this.pool.connect().then((client) => {
      return client.query('Select * FROM locations')
        .then((res) => {
          console.log('Get Locations Success');
          let location = [];
          let originField = ['id', 'userid', 'title', 'content', 'starttime', 'endtime', 'role', 'posttime', 'longitude', 'latitude'];
          let outputField = ['id', 'userID', 'title', 'content', 'startTime', 'endTime', 'role', 'postTime', 'longitude', 'latitude'];
          for (let i = 0; i < res.rows.length; i += 1) {
            location.push(resolver(res.rows[i], originField, outputField));
          }
          cb(location);
          client.release();
        });
    });
  }

  getPosts(timeStart, timeEnd, cb) {
    this.pool.connect().then((client) => {
      if (timeStart === -1) {
        timeStart = 0;
      }
      if (timeEnd === -1) {
        timeEnd = Date.now();
      }
      return client.query('Select * FROM posts join users on posts.userid = users.id WHERE sendtime>=$1 and sendtime<=$2 ORDER BY sendtime DESC', [timeStart, timeEnd])
        .then((res) => {
          if (res.rows[0]) {
            console.log('Get posts Success');
            const post = [];
            for (let i = 0; i < res.rows.length; i += 1) {
              post.push({
                username: res.rows[i].username,
                sendtime: res.rows[i].sendtime,
                title: res.rows[i].title,
                post: res.rows[i].post,
                topic: res.rows[i].topic,
              });
            }
            client.release();
            cb(post);
          } else {
            client.release();
            cb([]);
          }
        })
        .catch((e) => {
          client.release();
          console.error(e.stack);
          cb([]);
        });
    });
  }

  searchPosts(words, cb) {
    this.pool.connect()
      .then((client) => {
        let sql = 'Select * from posts join users on posts.userid = users.id ';
        sql += ` where post like '%${words[0]}%' or title like '%${words[0]}%'`;
        for (let i = 1; i < words.length; i += 1) {
          sql += ` or post like '%${words[i]}%'`;
          sql += ` or title like '%${words[i]}%'`;
        }
        return client.query(sql)
          .then((res) => {
            console.log('Search Posts Success');
            const post = [];
            for (let i = 0; i < res.rows.length; i += 1) {
              post.push({
                username: res.rows[i].username, sendtime: res.rows[i].sendtime, title: res.rows[i].title, post: res.rows[i].post, topic: res.rows[i].topic,
              });
            }
            client.release();
            console.log(post);
            cb(post);
          })
          .catch((e) => {
            client.release();
            console.error(e.stack);
            cb([]);
          });
      });
  }

  recordVote(userID, message, choice, cb) {
    this.pool.connect().then((client) => {
      let query = 'UPDATE votes SET choice = $1 WHERE userid = $2 AND messageid = $3';
      return client.query(query, [choice, userID, message])
        .then((res) => {
          client.release();
          if (res.rowCount !== 1) {
            query = 'INSERT INTO votes(userid, messageid, choice) VALUES($1::INTEGER, $2::INTEGER, $3::INTEGER) RETURNING id';
            client.query(query, [userID, message, choice]).then(() => {
              this.countVote(message, cb);
            });
          } else {
            this.countVote(message, cb);
          }
        })
        .catch((e) => {
          client.release();
          console.log(e.stack);
          cb(-1);
        });
    });
  }

  countVote(messageID, cb) {
    this.pool.connect().then((client) => {
      const query = 'SELECT sum(choice) FROM votes WHERE messageid = $1';
      return client.query(query, [messageID])
        .then((res) => {
          client.release();
          cb(res.rows[0].sum);
        })
        .catch((e) => {
          client.release();
          console.log(e.stack);
          cb('fail');
        });
    });
  }

  updateVote(messageID, vote, cb) {
    this.pool.connect().then((client) => {
      const query = 'UPDATE messages SET vote = $1 WHERE id = $2';
      return client.query(query, [vote, messageID])
        .then(() => {
          client.release();
          cb(0);
        })
        .catch((e) => {
          client.release();
          console.log(e.stack);
          cb(-1);
        });
    });
  }

  getVoteList(userID, cb) {
    this.pool.connect().then((client) => {
      const query = 'SELECT messageid, choice from votes WHERE userid = $1 and choice != 0 ORDER BY messageid';
      return client.query(query, [userID])
        .then((res) => {
          client.release();
          const voteList = [];
          if (res.rows[0]) {
            for (let i = 0; i < res.rows.length; i += 1) {
              voteList.push([res.rows[i].messageid, res.rows[i].choice]);
            }
            cb(voteList);
          } else {
            cb([]);
          }
        })
        .catch((e) => {
          client.release();
          console.log(e.stack);
          cb([]);
        });
    });
  }

  filterMessage(user, type, threshold, cb) {
    let query;
    // 0: All
    // 1: Not vote yet
    // 2: My up
    // 3: My down
    let params = [threshold, user];
    if (type === 0) {
      query = 'SELECT * FROM messages WHERE vote >= $1 AND touser = 0 ORDER BY id';
      params = [threshold];
    } else if (type === 1) {
      query = 'SELECT DISTINCT messages.* FROM messages LEFT JOIN votes ON votes.messageid = messages.id WHERE messages.vote >= $1 AND ((votes.messageid IS NULL) OR (votes.userid = $2 AND votes.choice =  0)) ORDER BY messages.id';
    } else if (type === 2) {
      query = 'SELECT messages.* FROM votes INNER JOIN messages ON votes.messageid = messages.id WHERE votes.userid = $2 AND votes.choice >= 1 AND messages.vote >= $1 AND messages.touser = 0 ORDER BY votes.messageid';
    } else if (type === 3) {
      query = 'SELECT messages.* FROM votes INNER JOIN messages ON votes.messageid = messages.id WHERE votes.userid = $2 AND votes.choice <= -1 AND messages.vote >= $1 AND messages.touser = 0 ORDER BY votes.messageid';
    } else {
      cb([]);
      return;
    }

    this.pool.connect().then((client) => {
      return client.query(query, params)
        .then((res) => {
          client.release();
          const msg = [];
          const field = ['id', 'sendtime', 'message', 'fromuser', 'touser', 'status', 'vote'];
          for (let i = 0; i < res.rows.length; i += 1) {
            msg.push(resolver(res.rows[i], field, field));
          }
          cb(msg);
        })
        .catch((e) => {
          console.log(e);
          client.release();
          cb([]);
        });
    });
  }
};
