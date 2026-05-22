import express from 'express';
import auth from "../../middleWare/authWare.js";
import { RegisterUser, loginUser, logoutUser, updateUser, googleLoginUser , getUserDetails ,forgotPassword} from './controller.js';

const router = express.Router();
router.post('/create', RegisterUser);
router.post('/login', loginUser);
router.put('/update', auth, updateUser);
router.post('/logout', auth, logoutUser);
router.post('/google', googleLoginUser);
router.get('/details', auth, getUserDetails);
router.post('/forgot-password', forgotPassword);

export default router;