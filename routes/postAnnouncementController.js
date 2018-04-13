const express = require('express');
const Announcements = require('../models/Announcements');

const router = express.Router();
const announcements = new Announcements();

function getHistoryAnnouncements(req, res) {
  // REST API: "GET announcements/"
  announcements.getHistoryAnnouncements(req, (status, data) => {
    res.status(status).json(data);
  });
}

function postAnnouncements(req, res) {
  // REST API: "POST announcement/"
  // insert announcement into databases
  announcements.addAnnouncement(req, (status) => {
    res.status(status).send();
  });
}

router.post('/', postAnnouncements);
router.get('/', getHistoryAnnouncements);

module.exports = router;
