const express = require('express');
const Users = require('../models/Users');
const Notifications = require('../models/Notifications');

const router = express.Router();
const users = new Users();
const notifications = new Notifications();

function updateProfile(req, res) {
  // POST /admin/users/:id
  users.updateProfile(req, (status) => {
    res.status(status).send();
  });
}

function getAdminUserList(req, res) {
  // REST API: "GET /admin/users"
  // use database retrive all user with
  users.getAdminUserList(req, (status, data) => {
    res.status(status).send(data);
  });
}

router.get('/users', getAdminUserList);
router.post('/users/:id', updateProfile);

module.exports = router;
