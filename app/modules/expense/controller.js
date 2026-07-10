import { sendMultipleNotificationToUsers } from '../../utils/sendPush.js';
import { sendResponse } from '../../utils/sendResposeType.js';
import Expense from './model.js';
import User from '../user/model.js';
import Group from '../group/model.js';
import notificationModel from '../notifications/model.js';

// ✅ CREATE EXPENSE
export const createExpense = async (req, res) => {
  try {
    const { id, title, amount, date, category, paymentType, description, groupId, groupName, currency } = req.body || {};
    if (!id || !title || !amount || !date || !category || !paymentType) {
      return sendResponse(res, 400, false, "All fields are required");
    }
    // console.log("Creating expense with data:", { id, title, amount, date, category, paymentType, description, groupId, userId: req.user.id, groupName });
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
      groupName,
    });
    if (groupId) {
      const currentUser = await User.findById(req.user.id);

      const group = await Group.findById(groupId);

      if (group) {
        const memberUsers = await User.find({
          _id: {
            $in: group.members,
            $ne: req.user.id,
          },
        });

        const memberTokens = memberUsers
          .map((user) => user.deviceToken)
          .filter(Boolean);

        // console.log("Member Tokens:", memberTokens, group.isNotification);

        if (memberTokens.length > 0 && group.isNotification) {
          await sendMultipleNotificationToUsers(
            memberTokens,
            "💸 Expense Added",
            `${currentUser.name} added ${currency} ${amount} for ${title} in ${group.name}.`,
            {
              type: "new_expense",
              groupId: group._id.toString(),
              expenseId: newExpense._id.toString(),
            }
          );
        }
        // Save notification for each member
        for (const user of memberUsers) {
          await notificationModel.create({
            userId: user._id,
            title: "💸 New Expense Added",
            message: `${currentUser.name} added ${currency} ${amount} for ${title} in ${group.name}.`,
            type: "new_expense",
            groupId: group._id.toString(),
            expenseId: newExpense._id.toString(),
          });
        }
      }
    }
    return sendResponse(res, 200, true, "Expense created successfully", newExpense);
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, false, "Error creating expense", null, error.message);
  }
};

// ✅ UPDATE EXPENSE
export const updateExpense = async (req, res) => {
  try {
    const {
      id,
      title,
      amount,
      date,
      category,
      paymentType,
      description,
      groupId,
      groupName,
    } = req.body || {};

    if (!id || !title || !amount || !date || !category || !paymentType) {
      return sendResponse(res, 400, false, "All fields are required to update expense");
    }

    const updateData = {
      $set: {
        ...(title && { title }),
        ...(amount && { amount }),
        ...(date && { date }),
        ...(category && { category }),
        ...(paymentType && { paymentType }),
        ...(description !== undefined && { description }),
      },
      $unset: {},
    };

    // Handle groupId
    if (groupId === null) {
      updateData.$unset.groupId = "";
      updateData.$unset.groupName = "";
    } else if (groupId !== undefined) {
      updateData.$set.groupId = groupId;
       updateData.$set.groupName = groupName;
    }

    // Remove empty operators
    if (Object.keys(updateData.$unset).length === 0) {
      delete updateData.$unset;
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    const expenseData = {
      id: updatedExpense._id,
      title: updatedExpense.title,
      amount: updatedExpense.amount,
      date: updatedExpense.date,
      category: updatedExpense.category,
      paymentType: updatedExpense.paymentType,
      description: updatedExpense.description,
      groupId: updatedExpense.groupId,
      groupName: updatedExpense.groupName,
    };

    return sendResponse(
      res,
      200,
      true,
      "Expense updated successfully",
      expenseData
    );
  } catch (error) {
    console.error(error);
    return sendResponse(
      res,
      500,
      false,
      "Error updating expense",
      null,
      error.message
    );
  }
};

// ✅ DELETE EXPENSE
export const deleteExpense = async (req, res) => {
  try {
    // console.log("📥 Delete expense request received:", req.body || {});
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