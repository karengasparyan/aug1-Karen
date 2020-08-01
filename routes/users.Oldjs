const express = require('express');
const router = express.Router();

router.get('/:age', (req, res, next) => {
  try {
    const { age } = req.params;
    const { name, lName } = req.query;

    hello();

    res.json({
      status: 'ok',
      age,
      name,
      lName
    });
  } catch (e) {
    next(e);
  }
});

router.get('/users', (req, res, next) => {
  try {
    const users = [
      'Poxos', 'Petros'
    ]
    res.json({
      status: 'ok',
      users
    });
  } catch (e) {
    next(e);
  }
});

router.post('/users', (req, res, next) => {
  try {
    const { name, lName } = req.body;

    const users = [
      'Poxos', 'Petros'
    ]
    res.json({
      status: 'ok',
      type: "POST",
      users,
      name
    });
  } catch (e) {
    next(e);
  }
});


module.exports = router;
