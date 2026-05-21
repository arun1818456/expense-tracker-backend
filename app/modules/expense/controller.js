

export const createExpense = async (req, res) => {
  try {
    const { title, amount, date, category } = req.body || {};
    if (!title || !amount || !date || !category) {
      return sendResponse(res, 400, false, "All fields are required");
    }
    const newExpense = await Expense.create({
        title,
        amount,
        date, 
        category,
    });
    return sendResponse(res, 200, true, "Expense created successfully", newExpense);
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, false, "Error creating expense", null, error.message);
  } 
};