const express = require('express');
const router = express.Router();
const groupModel = require('../models/group');
const userModel = require('../models/UserModel');
/** POST Methods */
/**
 * @openapi
 * '/api/group/create-group':
 *  post:
 *     tags:
 *     - GROUP API
 *     summary: Create a new group
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - groupName
 *              - groupMembers
 *              - groupAdmin
 *            properties:
 *              groupName:
 *               type: string
 *               default: CONG NGHE MOI
 *              groupMembers:
 *                type: array
 *                default: [60f3b1b3b3b3b3b3b3b3b3b3, 60f3b1b3b3b3b3b3b3b3b4]
 *              groupAdmin:
 *                type: string
 *                default: 60f3b1b3b3b3b3b3b3b3b3b3
 *     responses:
 *      200:
 *        description: Created group
 *      500:
 *        description: Server Error
 */
router.post('/create-group', async (req, res) => {
    const { groupName, groupMembers, groupAdmin } = req.body;
    try {
        const newGroup = new groupModel({
            groupName,
            groupMembers,
            groupAdmin,
            groupDeputy: [],
            createdAt: new Date(),
            avatar: 'https://www.w3schools.com/howto/img_avatar.png',
            link: '',
        });
        const group = await newGroup.save();
        res.json(group);
    } catch (err) {
        console.error("Error creating group:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

/** POST Methods */
/**
 * @openapi
 * '/api/group/add-member':
 *  post:
 *     tags:
 *     - GROUP API
 *     summary: Add member to group
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - groupId
 *              - memberId
 *            properties:
 *              groupId:
 *                type: string
 *                default: 60f3b1b3b3b3b3b3b3b3b3b3
 *              memberId:
 *                type: string
 *                default: 60f3b1b3b3b3b3b3b3b3b3b3
 *     responses:
 *       200: 
 *         description: Member added to the group successfully.
 *       401:
 *         description: Member already in the group.
 *       404:
 *         description: Group not found.
 *       500:
 *         description: Internal server error.
 */
router.post('/add-member', async (req, res) => {
    const { groupId, memberId } = req.body;
    try {
        const group = await groupModel.findById(groupId);
        if (!group) {
            res.status(404).json({ message: "Group not found" });
            return;
        } else if (group.groupMembers.indexOf(memberId) !== -1) {
            res.status(401).json({ message: "Member already in group" });
            return;
        }
        group.groupMembers.push(memberId);
        const groupData = await group.save();
        res.json(groupData);
    } catch (err) {
        console.error("Error adding member:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});
// remove member from group
/**
 * @openapi
 * '/api/group/remove-member':
 *  post:
 *     tags:
 *     - GROUP API
 *     summary: Remove member from group
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - groupId
 *              - memberId
 *            properties:
 *              groupId:
 *                type: string
 *                default: 60f3b1b3b3b3b3b3b3b3b3b3
 *              memberId:
 *                type: string
 *                default: 60f3b1b3b3b3b3b3b3b3b3b3
 *     responses:
 *       200: 
 *         description: Member removed from the group successfully.
 *       401:
 *         description: Admin cannot be removed.
 *       402:
 *         description: Member not found in group.
 *       403:
 *         description: Only the admin or deputy can remove a member.
 *       404:
 *         description: Group not found.
 *       500:
 *         description: Internal server error.
 */
router.post('/remove-member', async (req, res) => {
    const { groupId, memberId } = req.body;
    try {
        const group = await groupModel.findById(groupId);
        if (!group) {
            res.status(404).json({ message: "Group not found" });
            return;
        }
        const memberIndex = group.groupMembers.indexOf(memberId);
        if (memberIndex === -1) {
            res.status(402).json({ message: "Member not found in group" });
            return;
        } else if (group.groupAdmin === memberId) {
            res.status(401).json({ message: "Admin cannot be removed" });
            return;
        }
        group.groupMembers.splice(memberIndex, 1);
        const groupData = await group.save();
        res.json(groupData);

    } catch (err) {
        console.error("Error removing member:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});
// set deputy for group
/**
 * @openapi
 * '/api/group/set-deputy':
 *  post:
 *     tags:
 *     - GROUP API
 *     summary: Set deputy for group
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - groupId
 *              - deputyId
 *              - adminId
 *            properties:
 *              groupId:
 *                type: string
 *                default: 60f3b1b3b3b3b3b3b3b3b3b3
 *              deputyId:
 *                type: string
 *                default: 60f3b1b3b3b3b3b3b3b3b3b3
 *              adminId:
 *                type: string
 *                default: 60f3b1b3b3b3b3b3b3b3b3b3
 *     responses:
 *       200: 
 *         description: Deputy set successfully.
 *       400:
 *         description: Deputy already in group.
 *       401:
 *         description: Deputy cannot be the admin.
 *       403:
 *         description: Only the admin can set a deputy.
 *       404:
 *         description: Group not found.
 *       500:
 *         description: Internal server error.
 */

router.post('/set-deputy', async (req, res) => {
    const { groupId, deputyId, adminId } = req.body;
    try {
        const group = await groupModel.findById(groupId);
        if (!group) {
            res.status(404).json({ message: "Group not found" });
            return;
        } else if (group.groupDeputy.indexOf(deputyId) !== -1) {
            res.status(400).json({ message: "Deputy already in group" });
            return;
        } else if (deputyId === group.groupAdmin) {
            res.status(401).json({ message: "Deputy cannot be the admin" });
            return;
        } else if (group.groupAdmin !== adminId) {
            res.status(403).json({ message: "Only the admin can set a deputy" });
            return;
        }
        group.groupDeputy.push(deputyId);
        const groupData = await group.save();
        res.json(groupData);
    } catch (err) {
        console.error("Error setting deputy:", err);
        res.status(500).json({ message: "Internal server error" });
    }
}
);

// remove deputy from deputy
/**
 * @openapi
 * '/api/group/remove-deputy':
 *  post:
 *     tags:
 *     - GROUP API
 *     summary: Remove deputy from group
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - groupId
 *              - memberId
 *              - adminId
 *            properties:
 *              groupId:
 *                type: string
 *                default: 60f3b1b3b3b3b3b3b3b3b3b3
 *              memberId:
 *                type: string
 *                default: 60f3b1b3b3b3b3b3b3b3b3b3
 *              adminId:
 *                type: string
 *                default: 60f3b1b3b3b3b3b3b3b3b3b3
 *     responses:
 *       200: 
 *         description: Deputy removed successfully.
 *       401:
 *         description: Deputy not found in group.
 *       403:
 *         description: Only the admin can remove a deputy.
 *       404:
 *         description: Group not found.
 *       500:
 *         description: Internal server error.
 */

router.post('/remove-deputy', async (req, res) => {
    const { groupId, memberId, adminId } = req.body;
    try {
        const group = await groupModel.findById(groupId);
        if (!group) {
            res.status(404).json({ message: "Group not found" });
            return;
        } else if (group.groupAdmin !== adminId) {
            res.status(403).json({ message: "Only the admin can remove a deputy" });
            return;
        }
        const memberIndex = group.groupDeputy.indexOf(memberId);
        if (memberIndex === -1) {
            res.status(401).json({ message: "Deputy not found in group" });
            return;
        }
        group.groupDeputy.splice(memberIndex, 1);
        const groupData = await group.save();
        res.json(groupData);
    } catch (err) {
        console.error("Error removing deputy:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// change addmin for group
/**
 * @openapi
 * '/api/group/change-admin':
 *  post:
 *     tags:
 *     - GROUP API
 *     summary: Change admin of group
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - groupId
 *              - adminId
 *              - newAdminId
 *            properties:
 *              groupId:
 *                type: string
 *                default: 60f3b1b3b3b3b3b3b3b3b3b3
 *              adminId:
 *                type: string
 *                default: 60f3b1b3b3b3b3b3b3b3b3b3
 *              newAdminId:
 *                type: string
 *                default: 60f3b1b3b3b3b3b3b3b3b3b3
 *     responses:
 *       200: 
 *         description: Admin changed successfully.
 *       401:
 *         description: ew admin not found in group.
 *       403:
 *         description: You are not the admin.
 *       404:
 *         description: Group not found or new admin not found in group.
 *       500:
 *         description: Internal server error.
 */

router.post('/change-admin', async (req, res) => {
    const { groupId, adminId, newAdminId } = req.body;
    try {
        const group = await groupModel.findById(groupId);
        if (!group) {
            res.status(404).json({ message: "Group not found" });
            return;
        }
        if (group.groupAdmin !== adminId) {
            res.status(403).json({ message: "You are not the admin of this group" });
            return;
        } else if (group.groupMembers.indexOf(newAdminId) === -1) {
            res.status(401).json({ message: "New admin not found in group" });
            return;
        }
        group.groupAdmin = newAdminId;
        const groupData = await group.save();
        res.json(groupData);
    } catch (err) {
        console.error("Error changing admin:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// rename group
/**
 * @openapi
 * '/api/group/change-admin':
 *  post:
 *     tags:
 *     - GROUP API
 *     summary: Change admin of group
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - groupId
 *              - adminId
 *              - newAdminId
 *            properties:
 *              groupId:
 *                type: string
 *                default: 60f3b1b3b3b3b3b3b3b3b3b3
 *              adminId:
 *                type: string
 *                default: 60f3b1b3b3b3b3b3b3b3b3b3
 *              newName:
 *                type: string
 *                default: NEW NAME
 *     responses:
 *       200: 
 *         description: Admin changed successfully.
 *       401:
 *         description: New name is the same as the old name.
 *       403:
 *         description: You are not the admin of this group.
 *       404:
 *         description: Group not found.
 *       500:
 *         description: Internal server error.
 */
router.post('/rename-group', async (req, res) => {
    const { groupId, idMember, newName } = req.body;
    try {
        const group = await groupModel.findById(groupId);
        if (!group) {
            res.status(404).json({ message: "Group not found" });
            return;
        } else if (group.groupMembers.indexOf(idMember) === -1) {
            res.status(403).json({ message: "You are not a member of this group" });
            return;
        } else if (group.groupName === newName) {
            res.status(401).json({ message: "New name is the same as the old name" });
            return;
        }
        group.groupName = newName;
        const groupData = await group.save();
        res.json(groupData);
    } catch (err) {
        console.error("Error renaming group:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});
// delete group
/**
 * @openapi
 * '/api/group/delete-group':
 *  delete:
 *     tags:
 *     - GROUP API
 *     summary: Delete group
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - groupId
 *              - memberId
 *            properties:
 *              groupId:
 *                type: string
 *                default: 60f3b1b3b3b3b3b3b3b3b3b3
 *              memberId:
 *                type: string
 *                default: 60f3b1b3b3b3b3b3b3b3b3b3
 *     responses:
 *       200: 
 *         description: Group deleted successfully.
 *       403:
 *         description: You are not the admin of this group.
 *       404:
 *         description: Group not found.
 *       500:
 *         description: Internal server error.
 */

router.delete('/delete-group', async (req, res) => {
    const { groupId, memberId } = req.body;
    try {
        const group = await groupModel.findById(groupId);
        if (!group) {
            res.status(404).json({ message: "Group not found" });
            return;
        }
        if (group.groupAdmin !== memberId) {
            res.status(403).json({ message: "You are not the admin of this group" });
            return;
        }
        await groupModel.findByIdAndDelete(groupId);
        res.json({ message: "Group deleted" });
    } catch (err) {
        console.error("Error deleting group:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// leave group
/**
 * @openapi
 * '/api/group/leave-group':
 *  post:
 *     tags:
 *     - GROUP API
 *     summary: Leave group
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - groupId
 *              - memberId
 *            properties:
 *              groupId:
 *                type: string
 *                default: 60f3b1b3b3b3b3b3b3b3b3b3
 *              memberId:
 *                type: string
 *                default: 60f3b1b3b3b3b3b3b3b3b3b3
 *     responses:
 *       200: 
 *         description: Member removed successfully.
 *       401:
 *         description: Member not found in group.
 *       403:
 *         description: Admin cannot leave group.
 *       404:
 *         description: Group not found.
 *       500:
 *         description: Internal server error.
 */

router.post('/leave-group', async (req, res) => {
    const { groupId, memberId } = req.body;
    try {
        const group = await groupModel.findById(groupId);
        if (!group) {
            res.status(404).json({ message: "Group not found" });
            return;
        }
        const memberIndex = group.groupMembers.indexOf(memberId);
        if (memberIndex === -1) {
            res.status(401).json({ message: "Member not found in group" });
            return;
        } else if (group.groupAdmin === memberId) {
            res.status(403).json({ message: "Admin cannot leave group" });
            return;
        }
        group.groupMembers.splice(memberIndex, 1);
        await group.save();
        res.json({ message: "Member removed" });
    } catch (err) {
        console.error("Error leaving group:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// get group by id
/**
 * @openapi
 * '/api/group/id/{id}':
 *  get:
 *     tags:
 *     - GROUP API
 *     summary: Get group by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the group to get
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Group not found.
 *       500:
 *         description: Internal server error.
 */
router.get('/id/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const group = await groupModel.findById(id);
        res.status(200).json(group);
    } catch (err) {
        console.error("Error getting group:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});
// get all group by member id  
/**
 * @openapi
 * '/api/group/member/{id}':
 *  get:
 *     tags:
 *     - GROUP API
 *     summary: Get all group by member ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the member to get all group
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Group not found.
 *       500:
 *         description: Internal server error.
 */
router.get('/member/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const group = await groupModel.find({ groupMembers: id });
        res.status(200).json(group);
    } catch (err) {
        console.error("Error getting group:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});
//get all group
/**
 * @openapi
 * '/api/group/all':
 *  get:
 *     tags:
 *     - GROUP API
 *     summary: Get all group
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Group not found.
 *       500:
 *         description: Internal server error.
 */
router.get('/all', async (req, res) => {
    try {
        const group = await groupModel.find();
        res.status(200).json(group);
    } catch (err) {
        console.error("Error getting group:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// get infor user by id-group
/**
 * @openapi
 * '/api/group/get-member/{groupId}':
 *  get:
 *     tags:
 *     - GROUP API
 *     summary: Get all member by group ID
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         description: ID of the group to get all member
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Group not found.
 *       500:
 *         description: Internal server error.
 */
router.get('/get-member/:groupId', async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const groupInfo = await groupModel.findById(groupId);
        if (!groupInfo) {
            return res.status(404).json({ msg: "Group not found" });
        }
        try {
            // get list user info 
            const users = await userModel.find({ _id: { $in: groupInfo.groupMembers } });
            return res.json(users);
        }
        catch (err) {
            console.error("Error getting user info:", err);
            return res.status(500).json({ msg: "Internal server error" });
        }
    } catch (ex) {
        next(ex);
    }
});
module.exports = router;