import User from '../modules/user/model.js';
import Expense from '../modules/expense/model.js';

export const addExpenseWithoutLogging = async (userId, expenses = []) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            console.error(`User with ID ${userId} not found`);
            return;
        }

        if (!expenses.length) {
            console.log("No expenses received");
            return;
        }

        // get old expenses of user
        const existingExpenses = await Expense.find({ userId });

        // create unique key map for existing expenses
        const existingExpenseMap = new Map();

        existingExpenses.forEach((expense) => {
            const key = `${expense.title}-${expense.amount}-${new Date(expense.date).toISOString()}-${expense.category}-${expense.paymentType}`;

            existingExpenseMap.set(key, true);
        });

        // filter only new expenses
        const newExpenses = expenses.filter((expense) => {

            const key = `${expense.title}-${expense.amount}-${new Date(expense.date).toISOString()}-${expense.category}-${expense.paymentType}`;

            return !existingExpenseMap.has(key);
        });

        if (!newExpenses.length) {
            console.log(`No new expenses to add for user ${userId}`);
            return;
        }

        // format expenses before insert
        const formattedExpenses = newExpenses.map((expense) => ({
            _id: expense.id,
            title: expense.title,
            amount: expense.amount,
            date: expense.date,
            category: expense.category,
            paymentType: expense.paymentType,
            description: expense.description || "",
            groupId: expense.groupId || null,
            userId,
        }));

        await Expense.insertMany(formattedExpenses);

        console.log(`${formattedExpenses.length} expenses added successfully`);

    } catch (error) {
        console.error(`Error adding expenses for user ${userId}:`, error);
    }
};