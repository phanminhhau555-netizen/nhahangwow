const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Public — ai cũng xem được
router.get('/', menuController.getAllItems);
router.get('/:id', menuController.getItemById);

// Admin mới được thêm/sửa/xóa
router.post('/', verifyToken, isAdmin, menuController.createItem);
router.put('/:id', verifyToken, isAdmin, menuController.updateItem);
router.delete('/:id', verifyToken, isAdmin, menuController.deleteItem);
router.patch('/:id/toggle', verifyToken, isAdmin, menuController.toggleVisibility);

module.exports = router;