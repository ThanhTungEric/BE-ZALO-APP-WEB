const express = require('express');
const router = express.Router();
const GroupMessage = require('../models/groupMessage');

//API get message by group
router.get('/api/groupMessage/:id', async (req, res, next) => {
    try {
        const groupId = req.params.groupId; // Lấy groupId từ URL params
        const messages = await GroupMessage.find({ group: groupId })
            .sort({ updatedAt: 1 })
            .populate('sender', 'username'); // Lấy thông tin người gửi (chỉ username)

        if (!messages || messages.length === 0) {
            return res.status(404).json({ msg: 'No messages found for this group.' });
        }
        const projectedMessages = messages.map((msg) => {
            return {
                fromSelf: msg.sender.toString() === req.user._id.toString(), // Kiểm tra xem người gửi có phải là người dùng hiện tại hay không
                message: msg.message.text,
                sender: msg.sender.username, // Lấy username của người gửi
                _id: msg._id, // Thêm trường _id vào kết quả trả về
            };
        });

        res.json(projectedMessages);

    } catch (ex) {
        next(ex);
    }
}
);
//API send message to group
router.post('/api/sendMessage/:id', async (req, res, next) => {
    try {
        const groupId = req.params.groupId; // Lấy groupId từ URL params
        const newMessage = new GroupMessage({
            group: groupId,
            sender: req.user._id,
            message: {
                text: req.body.message,
            },
        });
        const savedMessage = await newMessage.save();
        res.json(savedMessage);
    } catch (ex) {
        next(ex);
    }
}
);

module.exports = router;