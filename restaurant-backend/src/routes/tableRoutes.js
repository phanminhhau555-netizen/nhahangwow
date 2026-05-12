const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Bàn
router.get('/', verifyToken, tableController.getAllTables);
router.get('/:id', verifyToken, tableController.getTableById);
router.post('/', verifyToken, isAdmin, tableController.createTable);
router.put('/:id', verifyToken, isAdmin, tableController.updateTable);
router.delete('/:id', verifyToken, isAdmin, tableController.deleteTable);
router.patch('/:id/status', verifyToken, tableController.updateStatus);

// Đặt bàn
router.get('/reservations/all', verifyToken, tableController.getAllReservations);
router.post('/reservations', verifyToken, tableController.createReservation);

module.exports = router;