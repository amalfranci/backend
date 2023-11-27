import express from "express"
import { login, register } from "../controllers/authController.js"

import { adminLogin } from "../controllers/adminController.js";

const router = express.Router()

router.post("/register", register)
router.post("/login", login)
router.post("/adminlogin",adminLogin)

export default router