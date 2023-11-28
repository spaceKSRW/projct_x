const express = require('express');
const router = express.Router();
const authController = require('../controllers/authControllers')
const { requireAuth } = require('../middleware/authMiddleware');
router.get('/login',authController.login_get)

router.post('/login',authController.login_post)

router.get('/signup',authController.signup_get)

router.post('/signup',authController.signup_post)

router.get('/homepage', requireAuth,authController.homepage)

router.get('/employees',requireAuth,authController.employeeDetails)

router.get('/logout',requireAuth,authController.logout);

router.get('/editinfo', requireAuth, authController.geteditInfo);

router.get('/employeeUpdate',requireAuth,authController.editEmployeeUpdate);
router.put('/putEditEmployeeUpdate',requireAuth,authController.putEditEmployeeUpdate);

router.get('/managerUpdate',authController.editManagerUpdate);

router.get('/adminUpdate',authController.editAdminUpdate);
//router.post('/editManagerInfo',requireAuth,authController.editManagerInfo)

module.exports = router;
