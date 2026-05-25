import express from 'express';
import auth from "../../middleWare/authWare.js";
import { createGroup, updateGroup, getGroups, deleteGroup ,getGroupDetails} from './controller.js';

const router = express.Router();

router.post('/create', auth, createGroup);
router.put('/update', auth, updateGroup);
router.get('/get', auth,    getGroups);
router.delete('/delete/:groupId', auth, deleteGroup);
router.get('/details/:groupId', auth, getGroupDetails);

export default router;