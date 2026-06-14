import Expense from './model.js';
import { sendResponse } from '../../utils/sendResposeType.js';

// ✅ CREATE EXPENSE
export const createExpense = async (req, res) => {
  try {
    const { id, title, amount, date, category, paymentType, description, groupId, groupName } = req.body || {};
    if (!id || !title || !amount || !date || !category || !paymentType) {
      return sendResponse(res, 400, false, "All fields are required");
    }
    console.log("Creating expense with data:", { id, title, amount, date, category, paymentType, description, groupId, userId: req.user.id, groupName });
    const newExpense = await Expense.create({
      _id: id,
      userId: req.user.id,
      title,
      amount,
      date,
      category,
      paymentType,
      description,
      groupId,
      groupName
    });
    return sendResponse(res, 200, true, "Expense created successfully", newExpense);
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, false, "Error creating expense", null, error.message);
  }
};

// ✅ UPDATE EXPENSE
export const updateExpense = async (req, res) => {
  try {
    console.log("📥 Update expense request received:", req.body || {});
    const { id, title, amount, date, category, paymentType, description, groupId } = req.body || {};

    if (!id || !title || !amount || !date || !category || !paymentType) {
      return sendResponse(res, 400, false, "all fields are required to update expense");
    }


    const updateExpense = {
      ...(title && { title }),
      ...(amount && { amount }),
      ...(date && { date }),
      ...(category && { category }),
      ...(paymentType && { paymentType }),
      ...(description && { description }),
      ...(groupId && { groupId }),
    };

    const updatedExpense = await Expense.findByIdAndUpdate(id, updateExpense, { new: true });

    const expenseData = {
      id: updatedExpense._id,
      title: updatedExpense.title,
      amount: updatedExpense.amount,
      date: updatedExpense.date,
      category: updatedExpense.category,
      paymentType: updatedExpense.paymentType,
      description: updatedExpense.description,
      groupId: updatedExpense.groupId,
    };

    return sendResponse(res, 200, true, "Expense updated successfully", expenseData);
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, false, "Error updating expense", null, error.message);

  };
};

// ✅ DELETE EXPENSE
export const deleteExpense = async (req, res) => {
  try {
    console.log("📥 Delete expense request received:", req.body || {});
    const { expenseId } = req.params || {};

    if (!expenseId) {
      return sendResponse(res, 400, false, "Expense ID is required to delete");
    }

    await Expense.findByIdAndDelete(expenseId);

    return sendResponse(res, 200, true, "Expense deleted successfully");
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, false, "Error deleting expense", null, error.message);
  };
}

export const getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user.id }).sort({ date: -1 });
    return sendResponse(res, 200, true, "Expenses retrieved successfully", expenses);
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, false, "Error retrieving expenses", null, error.message);
  }
};