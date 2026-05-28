const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Nguyên liệu
router.get('/', verifyToken, inventoryController.getAllIngredients);
router.get('/low-stock', verifyToken, inventoryController.getLowStock);
router.post('/', verifyToken, isAdmin, inventoryController.createIngredient);
router.put('/:id', verifyToken, isAdmin, inventoryController.updateIngredient);
router.delete('/:id', verifyToken, isAdmin, inventoryController.deleteIngredient);

// Nhập / Xuất kho
router.post('/import', verifyToken, inventoryController.importStock);
router.post('/export', verifyToken, inventoryController.exportStock);
router.get('/logs', verifyToken, inventoryController.getInventoryLogs);

// Công thức món ăn
router.get('/recipes', verifyToken, inventoryController.getRecipes);
router.post('/recipes', verifyToken, isAdmin, inventoryController.createRecipe);
router.put('/recipes/:menuItemId', verifyToken, isAdmin, inventoryController.updateMenuItemRecipes);

module.exports = router;
