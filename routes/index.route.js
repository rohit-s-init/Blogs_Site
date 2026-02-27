import { Router } from "express";
import authRouter from "./auth.route.js"
import postRouter from "./post.route.js" 
import userRouter from "./user.route.js"
import groupRouter from "./group.route.js"

const router = Router();

router.use("/auth",authRouter);
router.use("/posts",postRouter);
router.use("/user",userRouter);
router.use("/group",groupRouter);


export default router;
