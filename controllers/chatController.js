import Chat from "../models/chatModel.js";
import Users from "../models/userModel.js";

export const accessChat = async (req, res) => {
  try {
    const { userIde } = req.body;
    const { userId } = req.body.user;

    if (!userId) {
      return res.status(404).json({
        status: "Failed",
        message: "User ID not found",
      });
    }

    const isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: userId } } },
        { users: { $elemMatch: { $eq: userIde } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");

    const isChatWithSender = await Users.populate(isChat, {
      path: "latestMessage.sender",
      select: "firstName profileUrl email",
    });

    if (isChatWithSender.length > 0) {
      res.send(isChatWithSender[0]);
    } else {
      const chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [userId, userIde],
      };

      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).json(fullChat);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
};

export const fetchChats = async (req, res) => {
  try {
    const userId = req.body.user.userId;

    // Find chats where the user is a participant
    const chats = await Chat.find({ users: { $elemMatch: { $eq: userId } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .exec();

    // Populate the sender information for the latest message
    const populatedChats = await Users.populate(chats, {
      path: "latestMessage.sender",
      select: "firstName profileUrl email",
    });
console.log("polu",populatedChats)
    res.status(200).json(populatedChats);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching user data" });
  }
};

export const createGroupChat = async (req, res) => {
  try {
    if (!req.body.users || !req.body.name) {
      return res.status(400).send({ message: "please fill all the fields" });
    }
    var users = JSON.parse(req.body.users);
    if (users.length < 2) {
      return res
        .status(400)
        .send("More than Users are required to form a group chat");
    }
    users.push(req.body.user.userId);

    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.body.user.userId,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
};

// rename group

export const renameGroup = async (req, res) => {
  try {
    const { chatId, chatName } = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        chatName: chatName,
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedChat) {
      res.status(400).json({ error: "Chat Not Found" });
    }

    res.status(200).json(updatedChat);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the groupname" });
  }
};

// remove user form chatGroup

export const removeFromGroup = async (req, res) => {
  try {
    const { chatId, userId } = req.body;
    const removed = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { users: userId },
      },
      {
        new: true,
      }
    ).populate("users", "-password");
    if (!removed) {
      return res.status(400).send("user not found");
    }
    res.status(200).json(removed);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while deleting users" });
  }
};

// add user to group

export const addToGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  try {
    // check if the requester is admin

    const added = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: { users: userId },
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!added) {
      res.status(404).json({ error: "Chat Not Found" });
    } else {
      res.json(added);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
