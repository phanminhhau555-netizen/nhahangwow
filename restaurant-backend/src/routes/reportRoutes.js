const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.get('/revenue/day', verifyToken, isAdmin, reportController.revenueByDay);
router.get('/revenue/week', verifyToken, isAdmin, reportController.revenueByWeek);
router.get('/revenue/month', verifyToken, isAdmin, reportController.revenueByMonth);
router.get('/top-items', verifyToken, isAdmin, reportController.topSellingItems);
router.get('/inventory', verifyToken, isAdmin, reportController.inventoryReport);

module.exports = router;