import Posts from "../models/postModel.js";
import Users from "../models/userModel.js";
import Comments from "../models/commentModel.js";

export const createPost = async (req, res, next) => {
  try {
    const { userId } = req.body.user;
    const { description, images } = req.body; 

    const post = await Posts.create({
      userId,
      description,
      image: images, 
    });

    res.status(200).json({
      success: true,
      message: "Post created successfully",
      data: post,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// all users posts

export const getPosts = async (req, res, next) => {
  try {
    const { userId } = req.body.user;
    const { search } = req.body;

    const user = await Users.findById(userId);
    const friends = user?.friends?.toString().split(",") ?? [];
    friends.push(userId);

    let searchQuery;

    if (search) {
      searchQuery = {
        $or: [
          {
            description: { $regex: search, $options: "i" },
          },
          {
            userId: {
              $in: await Users.find({
                firstName: { $regex: search, $options: "i" },
              }).distinct("_id"),
            },
          },
        ],
        status: { $ne: "blocked" },
      };
    } else {
      searchQuery = { status: { $ne: "blocked" } };
    }

    const posts = await Posts.find(searchQuery)
      .populate({
        path: "userId",
        select: "firstName lastName location profileUrl friends account visibility -password", // Include the visibility field
      })
      .sort({ _id: -1 });

    const friendsPosts = posts?.filter((post) => {
    
      
      return friends.includes(post?.userId?._id.toString()) && post?.userId.account === 'private';
    });
    

    const publicPosts = posts?.filter(
      (post) => post?.userId.account === 'public' 
    );

 

    let postsRes = null;

   if (friendsPosts?.length > 0) {
  postsRes = search ? friendsPosts : [...friendsPosts, ...publicPosts];
} else {
  postsRes = search ? publicPosts : [];
}
 
  
    res.status(200).json({
      success: true,
      message: "successfully",
      data: postsRes,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};



// //  individual users post
// export const getPost = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const post = await Posts.findById(id)
//       .populate({
//         path: "userId",
//         select: "firstName lastName location profileUrl account -password",
//       });

//     // Check if the post is private and the requester is not the owner
//     if (post.userId.account === 'private' && post.userId._id.toString() !== req.body.user.userId) {
//       return res.status(403).json({
//         success: false,
//         message: "Unauthorized access to private post",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "successfully",
//       data: post,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(404).json({
//       message: error.message,
//     });
//   }
// };

export const getUserPost = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await Users.findById(id);
    const friends = user?.friends?.toString().split(",") ?? [];
  
console.log("this searching ",friends)
    let searchQuery = { userId: id };
    console.log("searching userId",searchQuery)

    if (user.account === 'private') {
      // If the user account is private, only include posts from friends
      searchQuery.userId = { $in: friends };
    }

    const posts = await Posts.find(searchQuery)
      .populate({
        path: "userId",
        select: "firstName lastName location profileUrl account -password",
      })
      .sort({ _id: -1 });

    // Modify the posts based on visibility and friends logic
    let postsRes = null;

    if (user.account === 'private') {
      const friendsPosts = posts?.filter(post => friends.includes(post?.userId?._id.toString()));
      postsRes = searchQuery.userId ? friendsPosts : [];
    } else {
      postsRes = posts;
    }

    res.status(200).json({
      success: true,
      message: "successfully",
      data: postsRes,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    await Posts.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const getComments = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const postComments = await Comments.find({ postId })
      .populate({
        path: "userId",
        select: "firstName lastName location profileUrl -password",
      })
      .populate({
        path: "replies.userId",
        select: "firstName lastName location profileUrl -password",
      })
      .sort({ _id: -1 });

    res.status(200).json({
      sucess: true,
      message: "successfully",
      data: postComments,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const likePost = async (req, res, next) => {
  try {
    const { userId } = req.body.user;
    const { id } = req.params;

    const post = await Posts.findById(id);

    const index = post.likes.findIndex((pid) => pid === String(userId));

    if (index === -1) {
      post.likes.push(userId);
    } else {
      post.likes = post.likes.filter((pid) => pid !== String(userId));
    }

    const newPost = await Posts.findByIdAndUpdate(id, post, {
      new: true,
    });

    res.status(200).json({
      sucess: true,
      message: "successfully",
      data: newPost,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};
export const likePostComment = async (req, res, next) => {
  const { userId } = req.body;
  const { id, rid } = req.params;

  try {
    if (rid === undefined || rid === null || rid === `false`) {
      const comment = await Comments.findById(id);

      const index = comment.likes.findIndex((el) => el === String(userId));

      if (index === -1) {
        comment.likes.push(userId);
      } else {
        comment.likes = comment.likes.filter((i) => i !== String(userId));
      }

      const updated = await Comments.findByIdAndUpdate(id, comment, {
        new: true,
      });

      res.status(201).json(updated);
    } else {
      const replyComments = await Comments.findOne(
        { _id: id },
        {
          replies: {
            $elemMatch: {
              _id: rid,
            },
          },
        }
      );

      const index = replyComments?.replies[0]?.likes.findIndex(
        (i) => i === String(userId)
      );

      if (index === -1) {
        replyComments.replies[0].likes.push(userId);
      } else {
        replyComments.replies[0].likes = replyComments.replies[0]?.likes.filter(
          (i) => i !== String(userId)
        );
      }

      const query = { _id: id, "replies._id": rid };

      const updated = {
        $set: {
          "replies.$.likes": replyComments.replies[0].likes,
        },
      };

      const result = await Comments.updateOne(query, updated, { new: true });

      res.status(201).json(result);
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const commentPost = async (req, res, next) => {
  try {
    const { comment, from } = req.body;
    const { userId } = req.body.user;
    const { id } = req.params;

    if (!comment || !comment.trim()) {
      return res.status(404).json({ message: "Comment is required" });
    }

    const newComment = new Comments({ comment, from, userId, postId: id });
    await newComment.save();

    const post = await Posts.findById(id);
    post.comments.push(newComment._id);
    const updatedPost = await Posts.findByIdAndUpdate(id, post, {
      new: true,
    });

    res.status(201).json({ newComment });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};


export const replyPostComment = async (req, res, next) => {
  const { userId } = req.body.user;
  const { comment, replyAt, from } = req.body;
  const { id } = req.params;

  if (comment === null) {
    return res.status(404).json({ message: "comment is required" });
  }
  try {
    const commentInfo = await Comments.findById(id);
    commentInfo.replies.push({
      comment,
      replyAt,
      from,
      userId,
      created_At: Date.now(),
    });
    commentInfo.save();

    res.status(200).json(commentInfo);
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const updatePost = async (req, res,next) => {
  try {
    const { description, image } = req.body;
    const postId = req.params.id;
    

    if (!description ) {
      return res
        .status(400)
        .json({ message: "Please provide data to update the post." });
    }

    const existingPost = await Posts.findById(postId);

    if (!existingPost) {
      return res.status(404).json({ message: "Post not found." });
    }

    if (description) {
      existingPost.description = description;
    }

    // if (image) {
    //   existingPost.image = image;
    // }

    const updatedPost = await existingPost.save();

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      post: updatedPost,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred while updating the post.",
    });
  }
};

export const reportPost = async (req, res) => {
  const { postId } = req.params;

  try {
 
    const post = await Posts.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    post.status = "pending";

    await post.save();

    res.status(200).json({ message: "Post reported successfully." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while reporting the post." });
  }
};

// delete post comment 
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    
    const deletedComment = await Comments.findByIdAndDelete(commentId);

    if (!deletedComment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    res.status(200).json({ message: "Comment deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while deleting the comment." });
  }
};

