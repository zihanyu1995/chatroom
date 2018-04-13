const express = require('express');
const Users = require('../models/Users');
const Notifications = require('../models/Notifications');

const router = express.Router();
const users = new Users();
const notifications = new Notifications();

function updateStatus(req, res) {
  if (req.body.status != null) {
    users.updateStatus(req, (status) => {
      if (status === 200) {
        if (req.body.status == 2 || req.body.status == 3) {
          notifications.addStatusChange(req, (changeStatus) => {
            res.status(changeStatus).send();
          });
        } else {
          res.status(status).send();
        }
      } else {
        res.status(status).send();
      }
    });
  } else {
    res.status(400).send();
  }
}

router.post('/:id', updateStatus);

module.exports = router;
