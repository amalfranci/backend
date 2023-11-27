import Chat from "../models/chatModel.js";
import Users from "../models/userModel.js";
import Message from "../models/messageModel.js";

//  get all messages
export const allMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "firstName profileUrl email")
      .populate("chat");
    res.status(200).json(messages);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// create New message

export const sendMessage = async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: req.body.user.userId,
    content: content,
    chat: chatId,
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "firstName profileUrl");
    message = await message.populate("chat");
    message = await Users.populate(message, {
      path: "chat.users",
      select: "firstName profileUrl email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
