const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/summary', dashboardController.summary);
router.get('/charts', dashboardController.charts);
router.get('/financial', dashboardController.financial);

module.exports = router;
