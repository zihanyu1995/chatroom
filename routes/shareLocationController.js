const express = require('express');
const Locations = require('../models/Locations');

const router = express.Router();
const locations = new Locations();

function postLocation(req, res) {
  // REST API: "POST locations/"
  locations.insertLocation(req, (status) => {
    res.status(status).send();
  });
}

function getLocations(req, res) {
  // REST API: "GET locations/"
  locations.getLocations(req, (status, data) => {
    res.status(status).json(data);
  });
}

router.post('/', postLocation);
router.get('/', getLocations);

module.exports = router;
