
import Group from "./model.js";
import { sendResponse } from "../../utils/sendResposeType.js";
import e from "express";
import Expense from "../expense/model.js";
import User from "../user/model.js";
import { sendMultipleNotificationToUsers } from "../../utils/sendPush.js";
import notificationModel from "../notifications/model.js";


// ✅ CREATE GROUP
export const createGroup = async (req, res) => {
    try {
        console.log("📥 Create group request received:");
       
        let { name, description, members, profileUrl, isPrivate, isNotification } = req.body;

        if (!name || members === undefined || !Array.isArray(members)) {
            return sendResponse(res, 400, false, "Error creating group: 'name' and 'members' (array) are required");
        }
        const currentUser = await User.findById(req.user.id);
        const newGroup = await Group.create({
            name,
            description,
            members: [req.user.id, ...members],
            profileUrl,
            isPrivate,
            isNotification,
            updatedAt: Date.now(),
        });

        const populatedGroup = await newGroup.populate('members', 'name email profileUrl');
        //send Push Notification For seleced members
        const memberUsers = await User.find({ _id: { $in: members } });
        const memberTokens = memberUsers.map(user => user.deviceToken).filter(token => token);
        if (memberTokens.length > 0) {
            console.log("Sending push notification to tokens:", memberTokens);
            sendMultipleNotificationToUsers(
                memberTokens,
                "New Group Created",
                `You have been added to the group ${name} by ${currentUser.name}`,
                {
                    type: "group_created",
                    groupId: newGroup._id.toString()
                }
            );
        }
        /// create a notification for the members
        for (const user of memberUsers) {
             await notificationModel.create({
                userId: user._id,
                title: "New Group Created",
                message: `You have been added to the group ${name} by ${currentUser.name}`,
                type: "group_created",
            });
        }
        return sendResponse(res, 200, true, "Group created successfully", populatedGroup);
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, false, "Error creating group", null, error.message);
    }
};

export const updateGroup = async (req, res) => {
    try {
        console.log("📥 Update group request received:", req.body || {});
        const { groupId, name, description, members, profileUrl, isPrivate, isNotification } = req.body;

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
        if (profileUrl) group.profileUrl = profileUrl;
        if (isPrivate !== undefined) group.isPrivate = isPrivate;
        if (isNotification !== undefined) group.isNotification = isNotification;
        if (members && Array.isArray(members)) {
            // Ensure the current user remains a member
            group.members = Array.from(new Set([req.user.id, ...members]));
        }
        group.updatedAt = Date.now();

        await group.save();
        const populatedGroup = await group.populate('members', 'name email profileUrl');
        return sendResponse(res, 200, true, "Group updated successfully", populatedGroup);
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, false, "Error updating group", null, error.message);
    }
};

export const getGroups = async (req, res) => {
    try {
        console.log("📥 Get groups request received for user:", req.user.id);

        const groups = await Group.find({ members: req.user.id }).populate('members', 'name email profileUrl');
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

        const expenses = await Expense.find({
            groupId: group._id,
        }).populate("userId", "name email profileUrl");

        const populatedGroup = await group.populate(
            "members",
            "name email profileUrl"
        );

        // Calculate total spent by each member
        const members = group.members.map((member) => {
            const totalSpent = expenses
                .filter(
                    (expense) =>
                        expense.userId?._id?.toString() === member._id.toString()
                )
                .reduce((sum, expense) => sum + expense.amount, 0);

            return {
                id: member._id,
                name: member.name,
                email: member.email,
                profileUrl: member.profileUrl,
                totalSpent,
            };
        }).sort((a, b) => b.totalSpent - a.totalSpent);;

        const responseData = {
            ...populatedGroup.toObject(),
            expenses,
            members,
        };

        return sendResponse(
            res,
            200,
            true,
            "Group details fetched successfully",
            responseData
        );
    } catch (error) {
        console.error(error);
        return sendResponse(
            res,
            500,
            false,
            "Error fetching group details",
            null,
            error.message
        );
    }
};

export const setNotificationValue = async (req, res) => {
    try {
        console.log("📥 Set notification value request received:", req.body || {});
        const { groupId, isNotification } = req.body;
        if (!groupId || isNotification === undefined) {
            return sendResponse(res, 400, false, "Error updating notification setting: 'groupId' and 'isNotification' are required");
        }
        const group = await Group.findById(groupId);
        if (!group) {
            return sendResponse(res, 404, false, "Group not found");
        }
        // Check if the user is a member of the group
        if (!group.members.includes(req.user.id)) {
            return sendResponse(res, 403, false, "You are not authorized to update this group");
        }
        group.isNotification = isNotification;
        await group.save();
        return sendResponse(res, 200, true, "Notification setting updated successfully", { groupId, isNotification });
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, false, "Error updating notification setting", null, error.message);
    }
};

export const setPrivateValue = async (req, res) => {
    try {
        console.log("📥 Set private value request received:", req.body || {});
        const { groupId, isPrivate } = req.body;
        if (!groupId || isPrivate === undefined) {
            return sendResponse(res, 400, false, "Error updating private setting: 'groupId' and 'isPrivate' are required");
        }
        const group = await Group.findById(groupId);
        if (!group) {
            return sendResponse(res, 404, false, "Group not found");
        }
        // Check if the user is a member of the group
        if (!group.members.includes(req.user.id)) {
            return sendResponse(res, 403, false, "You are not authorized to update this group");
        }
        group.isPrivate = isPrivate;
        await group.save();
        return sendResponse(res, 200, true, "Private setting updated successfully", { groupId, isPrivate });
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, false, "Error updating private setting", null, error.message);
    }
};

// ✅ ADD MEMBER TO GROUP
export const addMember = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);
        console.log("📥 Add member request received:", req.body || {});
        const { groupId, memberIds } = req.body;
        if (!groupId || !Array.isArray(memberIds)) {
            return sendResponse(res, 400, false, "Error adding member: 'groupId' and 'memberIds' are required");
        }
        const group = await Group.findById(groupId);
        if (!group) {
            return sendResponse(res, 404, false, "Group not found");
        }
        // Check if the user is a member of the group
        if (!group.members.includes(req.user.id)) {
            return sendResponse(res, 403, false, "You are not authorized to update this group");
        }
        // Check if each member is already a member of the group
        for (const memberId of memberIds) {
            if (group.members.includes(memberId)) {
                return sendResponse(res, 400, false, `Error adding member: User with ID ${memberId} is already a member of the group`);
            }
        }
       //send push notification to the new members
        const memberUsers = await User.find({ _id: { $in: memberIds } });
        const memberTokens = memberUsers.map(user => user.deviceToken).filter(token => token);
        if (memberTokens.length > 0) {
            console.log("Sending push notification to tokens:", memberTokens);
            sendMultipleNotificationToUsers(
                memberTokens,
                "Added to Group",
                `You have been added to the group ${group.name} by ${currentUser.name}`,
                {
                    type: "added_to_group",
                    groupId: group._id.toString()
                }
            );
        }
        // create a notification for the new members
        for (const user of memberUsers) {
             await notificationModel.create({
                userId: user._id,
                title: "Added to Group",
                message: `You have been added to the group ${group.name} by ${req.user.name}`,
                type: "added_to_group",
            });
        }
            
        group.members.push(...memberIds);
        await group.save();
        const populatedGroup = await group.populate('members', 'name email profileUrl');
        return sendResponse(res, 200, true, "Member added successfully", populatedGroup);
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, false, "Error adding member", null, error.message);
    }
}

// ✅ EXIT GROUP MEMBER
export const exitGroupMember = async (req, res) => {
    try {
        console.log("📥 Exit group request received:", req.body || {});
        const { groupId, userId } = req.body;
        if (!groupId) {
            return sendResponse(res, 400, false, "Error exiting group: 'groupId' is required");
        }
        const group = await Group.findById(groupId);
        if (!group) {
            return sendResponse(res, 404, false, "Group not found");
        }
        // Check if the user is a member of the group
        if (!group.members.includes(req.user.id)) {
            return sendResponse(res, 403, false, "You are not authorized to exit this group");
        }
        group.members = group.members.filter(memberId => memberId.toString() !== (userId || req.user.id).toString());
        await group.save();
        // check if user is last in group then delete group
        if (group.members.length === 0) {
            await Group.findByIdAndDelete(groupId);
        }
        const populatedGroup = await group.populate('members', 'name email profileUrl');
        return sendResponse(res, 200, true, "Exited group successfully", populatedGroup);
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, false, "Error exiting group", null, error.message);
    }
};