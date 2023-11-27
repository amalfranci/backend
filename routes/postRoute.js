import express from "express";
import userAuth from "../middleware/authMiddleware.js";
import {
  createPost,

  getPosts,
  getUserPost,
  deletePost,
  getComments,
  likePost,
  likePostComment,
  commentPost,
  replyPostComment,
  updatePost,
  reportPost,
  deleteComment,
} from "../controllers/postController.js";

const router = express.Router();

// create post
router.post("/create-post", userAuth, createPost);

// get post
router.post("/", userAuth, getPosts);


router.post("/get-user-post/:id", userAuth, getUserPost);
// get post comments
router.get("/comments/:postId", getComments);

router.put("/update-post/:id",updatePost);

// like and comments on posts
router.post("/like/:id", userAuth, likePost);
router.post("/like-comment/:id/:rid?",  likePostComment);

router.post("/comment/:id", userAuth, commentPost);
router.post("/reply-comment/:id", userAuth, replyPostComment);

// report posts
router.post('/reportPost/:postId', reportPost);

// delete a post
router.delete("/:id", userAuth, deletePost);

// 
router.delete('/comment/:commentId',userAuth,deleteComment)
export default router;
