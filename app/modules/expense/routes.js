import express from 'express';
import auth from "../../middleWare/authWare.js";
import { createExpense } from './controller.js';

const router = express.Router();
router.post('/create', createExpense);
// router.post('/login', loginUser);
// router.put('/update', auth, updateUser);
// router.post('/logout', auth, logoutUser);
// router.post('/google', googleLoginUser);
// router.get('/details', auth, getUserDetails);

export default router;