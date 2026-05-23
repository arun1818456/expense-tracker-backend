import User from '../modules/user/model.js';
import Expense from '../modules/expense/model.js';

export const addExpenseWithoutLogging = async (userId, expenses) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            console.error(`User with ID ${userId} not found`);
            return;
        }
       // check if expense data is same as old data not save if same data is there then do not save
        const existingExpenses = await Expense.find({ user: userId });
        const existingExpenseMap = new Map();
        existingExpenses.forEach(expense => {
            existingExpenseMap.set(expense._id.toString(), expense);
        });

        const newExpenses = expenses.filter(expense => !existingExpenseMap.has(expense._id?.toString()));
        if (newExpenses.length === 0) {
            console.log(`No new expenses to add for user ${userId}`);
            return;
        }

        await Expense.insertMany(newExpenses.map(expense => ({ ...expense, user: userId })));
    } catch (error) {
        console.error(`Error adding expenses for user ${userId}:`, error);
    }   
}