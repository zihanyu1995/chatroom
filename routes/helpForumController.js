const express = require('express');
const Posts = require('../models/Posts');

const router = express.Router();
const posts = new Posts();

function getHistoryPosts(req, res) {
  // REST API: "GET posts/"
  posts.getHistoryPosts(req, (status, data) => {
    res.status(status).json(data);
  });
}

function addPost(req, res) {
  // REST API: "/posts"
  // insert post into databases
  posts.addPost(req, (status) => {
    res.status(status).send();
  });
}

function searchPosts(req, res) {
  posts.searchPosts(req, (status, data) => {
    res.status(status).json(data);
  });
}
router.post('/', addPost);
router.get('/', getHistoryPosts);
router.get('/:words', searchPosts);

module.exports = router;
