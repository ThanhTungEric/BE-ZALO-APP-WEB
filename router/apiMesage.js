const { addMessage, getMessages, deleteMessageById, recallMessageById } = require("../router/messageController");
const router = require("express").Router();

router.post("/addmsg/", addMessage);
router.post("/getmsg/", getMessages);
router.delete("/deletemsg/:id", deleteMessageById);
router.post("/recallmsg/:id", recallMessageById);

module.exports = router;
