import FeedbackModel from "./model.js";
import mongoose from "mongoose";


export const createFeedback = async (req, res) => {
    try {
        const { feedback } = req.body;
        const userId = req.user.id; 
        const newFeedback = await FeedbackModel.create({ userId, feedback });
        res.status(201).json({ success: true, message: "Feedback created successfully" });
    } catch (error) {
        console.error("Error creating feedback:", error);
        res.status(500).json({ success: false, message: "Failed to create feedback" });
    }
};