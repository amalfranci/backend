import express from "express"
import { getUsers,blockUser,getPosts, blockPost,getReportedPosts, getUserCount} from "../controllers/adminController.js"

const router = express.Router()

router.get("/userslist", getUsers)
router.get("/userspost", getPosts)
router.get("/reportedpost", getReportedPosts)
router.get("/user-count",getUserCount)

router.post('/users/:userId/block', blockUser);
router.post('/posts/:postId/block',blockPost)




export default router
