import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
     
    userId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    feedback: {
        type: String,
        required: true,
    },
}, {
    versionKey: false,
});

const FeedbackModel = mongoose.model('Feedback', feedbackSchema);

export default FeedbackModel;
