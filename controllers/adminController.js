import dotenv from "dotenv";

import { generateAdminToken } from "../utils/index.js";
import Users from "../models/userModel.js";
import Posts from "../models/postModel.js";

dotenv.config();

const adminLogin = (req, res) => {
  try {
    const { username, password } = req.body;

    if (
      username === process.env.adminUserName &&
      password === process.env.adminPassword
    ) {
      const token = generateAdminToken(username);

      res.status(201).json({
        message: "login successful",
        success: true,
        adminUserName: username,
        token: token,
      });
      console.log(req.body);
    } else {
      res.status(400).json({ error: "invalid username or password" });
    }
  } catch (error) {
    console.log(error);
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await Users.find();

    res.status(200).json({ users });
  } catch (err) {
    console.error(err.message);
  }
};

const getPosts = async (req, res) => {
  try {
    const posts = await Posts.find()
      .populate({
        path: "userId",
        select: "firstName lastName", // Select the fields you need (firstName and lastName)
      })
      .exec();

    res.status(200).json({ posts });
  } catch (err) {
    console.error(err.message);
  }
};

const getUserCount = async (req, res) => {
  try {
    // Get count of all documents
    const totalCount = await Users.countDocuments();

    // Aggregation to get count of users per month
    const usersPerMonth = await Users.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" }, // Group by month
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({ totalCount, usersPerMonth }); // Send both counts as JSON response
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "An error occurred" }); // Send an error response with a 500 status code
  }
};


const getReportedPosts = async (req, res) => {
  try {
    const reportedPosts = await Posts.find({ status: "pending" })
      .populate({
        path: "userId",
        select: "firstName lastName", // Select the fields you need (firstName and lastName)
      })
      .exec();
    res.status(200).json({ success: true, data: reportedPosts });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

const blockPost = async (req, res) => {
  const { postId } = req.params;
  const { action } = req.body;
  try {
    const post = await Posts.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "post not found" });
    }
    if (action === "block") {
      post.status = "blocked";
    } else if (action === "active") {
      post.status = "active";
    }
    await post.save();
    res.status(200).json({ message: `Post ${action}ed successfully`, post });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// block user

const blockUser = async (req, res) => {
  const { userId } = req.params;
  const { action } = req.body;

  try {
    const user = await Users.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (action === "block") {
      user.status = "blocked";
    } else if (action === "unblock") {
      user.status = "unblocked";
    }

    await user.save();

    res.status(200).json({ message: `User ${action}ed successfully`, user });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};



  


export {
  adminLogin,
  getUsers,
  blockUser,
  getPosts,
  blockPost,
  getReportedPosts,
  getUserCount,

};
