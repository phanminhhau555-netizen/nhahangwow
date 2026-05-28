const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Public — ai cũng xem được
router.get('/categories', menuController.getCategories);
router.get('/', menuController.getAllItems);
router.get('/:id', menuController.getItemById);

// Admin mới được thêm/sửa/xóa
router.post('/categories', verifyToken, isAdmin, menuController.createCategory);
router.put('/categories/:id', verifyToken, isAdmin, menuController.updateCategory);
router.delete('/categories/:id', verifyToken, isAdmin, menuController.deleteCategory);
router.post('/', verifyToken, isAdmin, menuController.createItem);
router.put('/:id', verifyToken, isAdmin, menuController.updateItem);
router.delete('/:id', verifyToken, isAdmin, menuController.deleteItem);
router.patch('/:id/toggle', verifyToken, isAdmin, menuController.toggleVisibility);

module.exports = router;
