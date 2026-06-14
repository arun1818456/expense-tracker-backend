import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
     _id: {
      type: String,
      required: true,
    },
    userId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    paymentType: {
        type: String,
        enum: ['cash', 'card', 'online'],
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
    },
    description: {
        type: String,
    }, 
}, {
    versionKey: false,
});

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;
