import express from 'express';
import auth from "../../middleWare/authWare.js";
import { createGroup, updateGroup, getGroups, deleteGroup } from './controller.js';

const router = express.Router();

router.post('/create', auth, createGroup);
router.put('/update', auth, updateGroup);
router.get('/get', auth,    getGroups);
router.delete('/delete/:groupId', auth, deleteGroup);

export default router;