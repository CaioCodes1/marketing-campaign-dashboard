const express = require('express');
const campaignController = require('../controllers/campaign.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createSchema, updateSchema } = require('../validators/campaign.validator');

const router = express.Router();

router.use(authMiddleware);

router.get('/', campaignController.list);
router.post('/', validate(createSchema), campaignController.create);
router.get('/:id', campaignController.getById);
router.put('/:id', validate(updateSchema), campaignController.update);
router.delete('/:id', campaignController.remove);
router.get('/:id/history', campaignController.getHistory);
router.get('/:id/milestones', campaignController.getMilestones);
router.post('/:id/milestones', campaignController.createMilestone);

module.exports = router;
