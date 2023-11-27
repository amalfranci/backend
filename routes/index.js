import express from "express";
import authRoute from "./authRoutes.js";
import userRoute from "./userRoutes.js";
import postRoute from "./postRoute.js";
import adminRout from "./adminRoute.js";

const router = express.Router();
router.use(`/admin`, adminRout);
router.use(`/auth`, authRoute);
router.use(`/users`, userRoute);
router.use(`/posts`, postRoute);

export default router;
