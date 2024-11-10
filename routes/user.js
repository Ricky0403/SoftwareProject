const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Account details
router.get('/account/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  res.render('account.html', { user });
});

module.exports = router;
