const express = require('express');
const authRoutes = require('./auth.routes');
const campaignRoutes = require('./campaign.routes');
const clientRoutes = require('./client.routes');
const dashboardRoutes = require('./dashboard.routes');
const userRoutes = require('./user.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/campaigns', campaignRoutes);
router.use('/clients', clientRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/users', userRoutes);

module.exports = router;
