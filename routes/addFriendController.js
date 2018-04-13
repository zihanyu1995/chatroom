const express = require('express');
const Users = require('../models/Users');
const Notifications = require('../models/Notifications');

const users = new Users();
const notifications = new Notifications();
const router = express.Router();

function addFriend(req, res) {
  // REST API: "POST friends/"
  users.deleteFriendRequest(req, (status) => {
    if (status == 200) {
      const container = req.app.locals.container;
      if (req.body.accept == 1) {
        users.addFriend(req, (afstatus) => {
          container.io.to(container.socketMap.get(parseInt(req.body.uid2))).emit('accept', {
            id: req.body.uid1
          });
          res.status(afstatus).send();
        });
      } else {
        container.io.to(container.socketMap.get(parseInt(req.body.uid2))).emit('refuse', {
          id: req.body.uid1
        });
        res.status(status).send();
      }
    } else {
      res.status(status).send();
    }
  });
}

function sendFriendRequest(req, res) {
  users.sendFriendRequest(req, (status) => {
    res.status(status).send();
  });
}

function getAllFriendsStatusChange(req, res) {
  notifications.getAllFriendsStatusChange(req, (status, data) => {
    res.status(status).send(data);
  });
}

router.post('/', addFriend);
router.post('/request', sendFriendRequest);
router.get('/moments/:id', getAllFriendsStatusChange);

module.exports = router;
