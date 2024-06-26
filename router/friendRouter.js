const express = require('express');
const router = express.Router();
const friendModel = require('../models/friend');
const UserModel = require('../models/UserModel');

router.get('/get-friend/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
        const friends = await friendModel.find({
            $or: [{ idUser1: userId }, { idUser2: userId }],
            status: 2
        });
        const friendDetails = [];

        for (const friend of friends) {
            const user1 = await UserModel.findById(friend.idUser1);
            const user2 = await UserModel.findById(friend.idUser2);
            const friendInfo = userId === friend.idUser1 ? user2 : user1;
            friendDetails.push({
                friendInfo,
                friend
            });
        }
        res.json(friendDetails);
    } catch (err) {
        console.error("Error fetching friends:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Gui loi moi ket ban
router.post('/add-friend', async (req, res) => {
    const { idUser1, idUser2 } = req.body;
    try {
        const friend = await friendModel.findOne({
            $or: [
                { idUser1: idUser1, idUser2: idUser2 },
                { idUser1: idUser2, idUser2: idUser1 }
            ]
        });
        if (friend) {
            res.status(400).json({ message: "Friend request already sent" });
            return;
        }
        const newFriend = new friendModel({
            idUser1,
            idUser2,
            status: 1,
            actionUserId: idUser1
        });
        await newFriend.save();
        res.json({ message: "Friend request sent" });
    } catch (err) {
        console.error("Error adding friend:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Chap nhan loi moi ket ban
router.post('/accept-friend', async (req, res) => {
    const { idUser1, idUser2 } = req.body;
    try {
        const friend = await friendModel.findOne({
            $or: [
                { idUser1: idUser1, idUser2: idUser2 },
                { idUser1: idUser2, idUser2: idUser1 }
            ],
            status: 1
        });
        if (!friend) {
            res.status(404).json({ message: "Friend request not found" });
            return;
        }
        friend.status = 2;
        await friend.save();
        res.json({ message: "Friend request accepted" });
    } catch (err) {
        console.error("Error accepting friend:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Unfriend
router.post('/unfriend-friend', async (req, res) => {
    const { idUser1, idUser2 } = req.body;
    try {
        const friend = await friendModel.findOneAndDelete({
            $or: [
                { idUser1: idUser1, idUser2: idUser2 },
                { idUser1: idUser2, idUser2: idUser1 }
            ],
            status: 2
        });
        if (!friend) {
            res.status(404).json({ message: "UnFriend request not found" });
            return;
        }
        res.json({ message: "UnFriend request accepted" });
    } catch (err) {
        console.error("Error unfriend:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

//Tu choi loi moi ket ban
router.post('/reject-friend', async (req, res) => {
    const { idUser1, idUser2 } = req.body;
    try {
        const friend = await friendModel.findOne({
            $or: [
                { idUser1: idUser1, idUser2: idUser2 },
                { idUser1: idUser2, idUser2: idUser1 }
            ],
            status: 1
        });
        if (!friend) {
            res.status(404).json({ message: "Friend request not found" });
            return;
        }
        // Use deleteOne() to remove the document
        await friendModel.deleteOne({
            $or: [
                { idUser1: idUser1, idUser2: idUser2 },
                { idUser1: idUser2, idUser2: idUser1 }
            ],
            status: 1
        });
        res.json({ message: "Friend request rejected" });
    } catch (err) {
        console.error("Error rejecting friend:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});


//Lay danh sach nhung nguoi da gui loi moi ket ban
router.get('/get-add-friend/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
        const friends = await friendModel.find({
            $or: [{ idUser1: userId }, { idUser2: userId }],
            status: 1
        });
        const friendDetails = [];

        for (const friend of friends) {
            const user1 = await UserModel.findById(friend.idUser1);
            const user2 = await UserModel.findById(friend.idUser2);
            const friendInfo = userId === friend.idUser1 ? user2 : user1;
            friendDetails.push({
                friendInfo,
                friend
            });
        }
        res.json(friendDetails);
    } catch (err) {
        console.error("Error get list addfriend:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;