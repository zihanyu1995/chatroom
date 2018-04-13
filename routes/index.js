const express = require('express');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  if (req.session.user) {
    req.app.locals.container.onlineUserList.add(req.session.user.id);
    res.render('community', { title: 'ESN Home', userName: req.session.user.username });
  } else {
    res.render('login', { title: 'Join Community' });
  }
});

router.post('/auth', (req, res) => {
  const container = req.app.locals.container;
  container.socketMap.set(req.session.user.id, req.body.sockID);
  res.status(200).send();
});

module.exports = router;
