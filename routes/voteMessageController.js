const express = require('express');
const Messages = require('../models/Messages');

const router = express.Router();
const messages = new Messages();

function voteMessage(req, res) {
  // REST API: " GET vote/:messageid"
  messages.voteMessage(req, (status, data) => {
    res.status(status).send(data.toString());
  });
}

function filterMessage(req, res) {
  // REST API: " GET vote/filter?type=1&user=1&threshold=1"
  messages.filterMessage(req, (status, data) => {
    res.status(status).send(data);
  });
}

function getVoteList(req, res) {
  // REST API: " GET vote/filter?type=1&user=1&threshold=1"
  messages.getVoteList(req, (status, data) => {
    res.status(status).send(data);
  });
}

router.get('/', voteMessage);
router.get('/filter', filterMessage);
router.get('/voteList', getVoteList);
// 0
// 1 up
// -1 down
// else: gg

module.exports = router;
