import express from "express";
import { signup } from "../controllers/userController.js";

const router = express.Router();

// signup route
router.post("/signup", signup);

export default router;