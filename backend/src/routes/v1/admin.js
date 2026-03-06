const express = require('express');
const router = express.Router();
const {
  getAllUsers, getUser, updateUser, deleteUser, getDashboardStats,
} = require('../../controllers/adminController');
const { protect, restrictTo } = require('../../middleware/auth');

router.use(protect, restrictTo('admin'));

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only endpoints
 */

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Get dashboard statistics (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats
 *       403:
 *         description: Forbidden
 */
router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/users/:id', getUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

module.exports = router;
