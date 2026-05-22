import express from 'express';
import auth from "../../middleWare/authWare.js";
import { createExpense ,updateExpense ,deleteExpense,getAllExpenses} from './controller.js';

const router = express.Router();
router.post('/add', auth, createExpense);
router.put('/update', auth, updateExpense);
router.delete('/delete/:expenseId', auth, deleteExpense);
router.get('/all', auth, getAllExpenses);
export default router;