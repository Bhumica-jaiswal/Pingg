import express from "express";
import { signup,login,checkAuth,updateProfile } from "../controllers/userController.js";
import { protectRoute } from "../middleware/auth.js";

const userRouter = express.Router();

// signup route
userRouter.post("/signup", signup);
// login route
userRouter.post("/login", login);
// check authentication route
userRouter.get("/check", protectRoute, checkAuth); 
// update profile route
userRouter.put("/update-profile",protectRoute, updateProfile);  

export default userRouter;