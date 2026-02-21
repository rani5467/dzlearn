const express = require('express');
const router = express.Router();
const { getLeaderboard, getWilayaLeaderboard } = require('../controllers/leaderboardController');

router.get('/', getLeaderboard);
router.get('/wilayas', getWilayaLeaderboard);

module.exports = router;
