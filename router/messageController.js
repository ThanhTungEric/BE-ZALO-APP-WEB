const Messages = require("../models/message");

module.exports.getMessages = async (req, res, next) => {
  try {
    const { from, to } = req.body;

    const messages = await Messages.find({
      users: {
        $all: [from, to],
      },
    }).sort({ updatedAt: 1 });

    const projectedMessages = messages.map((msg) => {
      return {
        fromSelf: msg.sender.toString() === from,
        message: msg.message.text,
        _id: msg._id, // Thêm trường _id vào kết quả trả về
      };
    });
    res.json(projectedMessages);
  } catch (ex) {
    next(ex);
  }
};

module.exports.addMessage = async (req, res, next) => {
  try {
    const { from, to, message } = req.body;
    const data = await Messages.create({
      message: { text: message },
      users: [from, to],
      sender: from,
    });

    if (data) return res.json({ msg: "Message added to the database" });
    else return res.json({ msg: "Failed to add message to the database" });
  } catch (ex) {
    next(ex);
  }
};
// tui tao them api xoa tin nhan o day nhe
module.exports.deleteMessageById = async (req, res, next) => {
  try {
    const messageId = req.params.id; // Lấy id của tin nhắn từ URL params

    // Thực hiện xóa tin nhắn từ cơ sở dữ liệu dựa trên id
    const result = await Messages.deleteOne({ _id: messageId });

    if (result.deletedCount > 0) {
      return res.json({ msg: "Message deleted successfully." });
    } else {
      return res.status(404).json({ msg: "Message not found." });
    }
  } catch (ex) {
    next(ex);
  }
};

module.exports.recallMessageById = async (req, res, next) => {
  try {
    const messageId = req.params.id; // Lấy id của tin nhắn từ URL params
    // Thực hiện cập nhật trạng thái của tin nhắn từ "đã gửi" sang "đã thu hồi"
    const result = await Messages.updateOne({ _id: messageId }, { $set: { recalled: true, 'message.text': '' } });

    if (result.modifiedCount > 0) {
      // Gửi sự kiện "msg-recall" về cho client thông qua socket.io
      // io.emit("msg-recall", { messageId });
      return res.json({ msg: "Message recalled successfully." });
    } else {
      return res.status(404).json({ msg: "Message not found or already recalled." });
    }
  } catch (ex) {
    next(ex);
  }
};





