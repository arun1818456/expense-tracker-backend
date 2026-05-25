
import Group from "./model.js";
import { sendResponse } from "../../utils/sendResposeType.js";
import e from "express";
import Expense from "../expense/model.js";
// ✅ CREATE GROUP
export const createGroup = async (req, res) => {
    try {
        console.log("📥 Create group request received:", req.body || {});
        console.log("user id is", req.user.id);
        let { name, description, members, profilePic,isPrivate, isNotification } = req.body;

        if (!name || members === undefined || !Array.isArray(members)) {
            return sendResponse(res, 400, false, "Error creating group: 'name' and 'members' (array) are required");
        }
        const newGroup = await Group.create({
            name,
            description,
            members: [req.user.id, ...members],
            profilePic,
            isPrivate,
            isNotification,
            updatedAt: Date.now(),
        });

        return sendResponse(res, 200, true, "Group created successfully", newGroup);
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, false, "Error creating group", null, error.message);
    }
};

export const updateGroup = async (req, res) => {
    try {
        console.log("📥 Update group request received:", req.body || {});
        const { groupId, name, description, members, profilePic, isPrivate, isNotification } = req.body;

        if (!groupId) {
            return sendResponse(res, 400, false, "Error updating group: 'groupId' is required");
        }
        const group = await Group.findById(groupId);
        if (!group) {
            return sendResponse(res, 404, false, "Group not found");
        }

        // Check if the user is a member of the group
        if (!group.members.includes(req.user.id)) {
            return sendResponse(res, 403, false, "You are not authorized to update this group");
        }

        // Update fields if provided
        if (name) group.name = name;
        if (description) group.description = description;
        if (profilePic) group.profilePic = profilePic;
        if (isPrivate !== undefined) group.isPrivate = isPrivate;
        if (isNotification !== undefined) group.isNotification = isNotification;
        if (members && Array.isArray(members)) {
            // Ensure the current user remains a member
            group.members = Array.from(new Set([req.user.id, ...members]));
        }
        group.updatedAt = Date.now();

        await group.save();
        return sendResponse(res, 200, true, "Group updated successfully", group);
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, false, "Error updating group", null, error.message);
    }
};

export const getGroups = async (req, res) => {
    try {
        console.log("📥 Get groups request received for user:", req.user.id);

        const groups = await Group.find({ members: req.user.id }).populate('members', 'name email profilePic');
        // add key for my expense Spend on this group
        for (const group of groups) {
            const expenses = await Expense.find({ groupId: group._id, userId: req.user.id });
            const myExpenseSpend = expenses.reduce((total, expense) => total + expense.amount, 0);
            group._doc.myExpenseSpend = myExpenseSpend; // add myExpenseSpend to the group object
        }
        return sendResponse(res, 200, true, "Groups fetched successfully", groups);
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, false, "Error fetching groups", null, error.message);
    }
};

export const deleteGroup = async (req, res) => {
    try {
        console.log("📥 Delete group request received:", req.params || {});
        const { groupId } = req.params;

        if (!groupId) {
            return sendResponse(res, 400, false, "Error deleting group: 'groupId' is required");
        }
        const group = await Group.findById(groupId);
        if (!group) {
            return sendResponse(res, 404, false, "Group not found");
        }

        // Check if the user is a member of the group
        if (!group.members.includes(req.user.id)) {
            return sendResponse(res, 403, false, "You are not authorized to delete this group");
        }

        await Group.findByIdAndDelete(groupId);
        return sendResponse(res, 200, true, "Group deleted successfully");
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, false, "Error deleting group", null, error.message);
    }
};

export const getGroupDetails = async (req, res) => {
    try {
        console.log("📥 Get group details request received:", req.params || {});
        const { groupId } = req.params;

        if (!groupId) {
            return sendResponse(res, 400, false, "Error fetching group details: 'groupId' is required");
        }
        const group = await Group.findById(groupId);
        if (!group) {
            return sendResponse(res, 404, false, "Group not found");
        }

        // Check if the user is a member of the group
        if (!group.members.includes(req.user.id)) {
            return sendResponse(res, 403, false, "You are not authorized to view this group");
        }
        const expenses = await Expense.find({ groupId: group._id }).populate('userId', 'name email profileUrl');
        group._doc.expenses = expenses;
        const populatedGroup = await group.populate('members', 'name email profileUrl');
        return sendResponse(res, 200, true, "Group details fetched successfully", populatedGroup);

    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, false, "Error fetching group details", null, error.message);
    }
};