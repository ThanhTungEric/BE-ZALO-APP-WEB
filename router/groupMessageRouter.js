const express = require('express');
const router = express.Router();
const GroupMessage = require('../models/groupMessage');
const Group = require('../models/group');

/** POST Methods */
/**
 * @openapi
 * '/api/groupMessage/send-message/{groupId}':
 *  post:
 *     tags:
 *     - GROUP MESSAGE API
 *     summary: Send a message to a group
 *     parameters:
 *       - in: path
 *         name: groupId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the group to send message to
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - sender
 *              - message
 *            properties:
 *              sender:
 *               type: string
 *               description: Sender ID
 *              message:
 *                type: string
 *                description: Message content
 *     responses:
 *      200:
 *        description: Message added to the group chat
 *      400:
 *        description: Sender is not a member of the group or other errors
 *      500:
 *        description: Server Error
 */
router.post('/send-message/:groupId', async (req, res, next) => {
    try {
        const { sender, message } = req.body;
        const { groupId } = req.params;
        const groupInfo = await Group.findById(groupId);
        if (!groupInfo || !groupInfo.groupMembers.includes(sender)) {
            return res.status(400).json({ msg: "Sender is not a member of the group" });
        }

        const data = await GroupMessage.create({
            message: { text: message },
            users: groupInfo.groupMembers,
            sender: sender,
            group: groupId,  // Sử dụng groupId từ URL params
        });

        if (data) return res.json({ msg: "Message added to the group chat" });
        else return res.json({ msg: "Failed to add message to the group chat" });
    } catch (ex) {
        next(ex);
    }
});

//API get all messages in a group
/** GET Methods */
/**
 * @openapi
 * '/api/groupMessage/get-messages/{groupId}':
 *  get:
 *     tags:
 *     - GROUP MESSAGE API
 *     summary: Get all messages in a group
 *     parameters:
 *       - in: path
 *         name: groupId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the group to get messages from
 *     responses:
 *      200:
 *        description: Return all messages in the group
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                messages:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      _id:
 *                        type: string
 *                        description: Message ID
 *                      message:
 *                        type: object
 *                        properties:
 *                          text:
 *                            type: string
 *                            description: Message content
 *                      users:
 *                        type: array
 *                        items:
 *                          type: string
 *                          description: IDs of users in the group
 *                      sender:
 *                        type: string
 *                        description: Sender ID
 *                      group:
 *                        type: string
 *                        description: Group ID
 *                      createdAt:
 *                        type: string
 *                        format: date-time
 *                        description: Message creation date
 *                      updatedAt:
 *                        type: string
 *                        format: date-time
 *                        description: Message last update date
 *      404:
 *        description: No messages found in the group chat
 *      500:
 *        description: Server Error
 */
router.get('/get-messages/:groupId', async (req, res, next) => {
    try {
        const { groupId } = req.params; // Lấy groupId từ URL params

        const messages = await GroupMessage.find({ group: groupId })
            .sort({ createdAt: 1 })

        if (!messages || messages.length === 0) {
            return res.status(404).json({ msg: "No messages found in the group chat" });
        }

        return res.json({ messages: messages });
    } catch (ex) {
        next(ex);
    }
});

//API delete message
/** DELETE Methods */
/**
 * @openapi
 * '/api/groupMessage/delete-message/{messageId}':
 *  delete:
 *     tags:
 *     - GROUP MESSAGE API
 *     summary: Delete a message
 *     parameters:
 *       - in: path
 *         name: messageId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the message to delete
 *     responses:
 *      200:
 *        description: Message deleted successfully
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                msg:
 *                  type: string
 *                  description: Success message
 *      404:
 *        description: Message not found
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                msg:
 *                  type: string
 *                  description: Error message
 *      500:
 *        description: Server Error
 */
router.delete('/delete-message/:messageId', async (req, res, next) => {
    try {
        const { messageId } = req.params;
        const message = await GroupMessage.findById(messageId);
        if (!message) {
            return res.status(404).json({ msg: "Message not found" });
        }

        await message.deleteOne();
        return res.json({ msg: "Message deleted" });
    } catch (ex) {
        next(ex);
    }
}
);

//API recall message
/** PUT Methods */
/**
 * @openapi
 * '/api/groupMessage/recall-message/{messageId}':
 *  put:
 *     tags:
 *     - GROUP MESSAGE API
 *     summary: Recall a message
 *     parameters:
 *       - in: path
 *         name: messageId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the message to recall
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: object
 *                 properties:
 *                   text:
 *                     type: string
 *                     description: Text to set for recalled message
 *     responses:
 *      200:
 *        description: Message recalled successfully
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                msg:
 *                  type: string
 *                  description: Success message
 *      404:
 *        description: Message not found
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                msg:
 *                  type: string
 *                  description: Error message
 *      500:
 *        description: Server Error
 */
router.put('/recall-message/:messageId', async (req, res, next) => {
    try {
        const { messageId } = req.params;
        const message = await GroupMessage.updateOne({ _id: messageId }, { $set: { message: { text: "Tin nhắn đã được thu hồi" } } });
        if (!message) {
            return res.status(404).json({ msg: "Message not found" });
        }
        return res.json({ msg: "Message recalled" });
    } catch (ex) {
        next(ex);
    }
}
);

//API 

module.exports = router;