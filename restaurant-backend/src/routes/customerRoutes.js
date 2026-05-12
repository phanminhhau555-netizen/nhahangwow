const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.get('/', verifyToken, customerController.getAllCustomers);
router.get('/search', verifyToken, customerController.searchCustomer);
router.get('/:id', verifyToken, customerController.getCustomerById);
router.post('/', verifyToken, customerController.createCustomer);
router.put('/:id', verifyToken, customerController.updateCustomer);
router.delete('/:id', verifyToken, isAdmin, customerController.deleteCustomer);
router.post('/:id/add-points', verifyToken, customerController.addPoints);
router.post('/:id/redeem-points', verifyToken, customerController.redeemPoints);

module.exports = router;