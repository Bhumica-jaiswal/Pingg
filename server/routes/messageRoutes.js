import express from "express";
import { getUsersForSidebar,getMessages,markMessagesAsSeen } from "../controllers/messageController.js";
import { protectRoute } from "../middleware/auth.js";   

const router=express.Router()

router.get("/users",protectRoute,getUsersForSidebar)
router.get("/:id",protectRoute,getMessages)
router.put("/mark/:id",protectRoute,markMessagesAsSeen)

export default router
