const express = require('express');
const Users = require('../models/Users');

const users = new Users();
const router = express.Router();

function login(req, res) {
  users.loginAttempt(req, (status, data) => {
    res.status(status).send(data);
  });
}

function register(req, res) {
  users.createUser(req, (status, data) => {
    res.status(status).send(data);
  });
}

function logout(req, res) {
  users.logout(req, () => {
    res.redirect('/');
  });
}

function getUserList(req, res) {
  // REST API: "GET /users"
  // use database retrive all user
  users.getUserList(req, (status, data) => {
    res.status(status).send(data);
  });
}

function createUser(req, res, next) {
  // REST API: "POST /users"
  switch (parseInt(req.body.inputType, 10)) {
    case 0:
      login(req, res, next);
      break;
    case 1:
      register(req, res, next);
      break;
    case 2:
      logout(req, res, next);
      break;
    default:
      console.log(req.body.inputType);
      console.log('Error inputType');
      res.status(500).send();
      break;
  }
}

router.get('/', getUserList);
router.post('/', createUser);

module.exports = router;
