const express = require('express');
const Messages = require('../models/Messages');

const router = express.Router();
const messages = new Messages();

function getHistoryMessages(req, res) {
  // REST API: "GET messages/"
  messages.getHistoryMessages(req, (status, data) => {
    res.status(status).json(data);
  });
}

function postMessage(req, res) {
  // REST API: "POST messages/"
  // insert message into databases
  messages.addMessage(req, (status) => {
    res.status(status).send();
  });
}

function searchMessages(req, res) {
  // REST API: " GET messages/:words"
  messages.searchMessages(req, (status, data) => {
    res.status(status).send(data);
  });
}

router.post('/', postMessage);
router.get('/', getHistoryMessages);
router.get('/:words', searchMessages);

module.exports = router;
