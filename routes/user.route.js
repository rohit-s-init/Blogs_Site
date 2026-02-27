import { Router } from "express"
import { requireAuth } from "../middleware/auth.middleware.js";
import * as userController from "../controllers/user.controller.js"
import { userSearch } from "../controllers/user.controller.js";
const router = Router();


router.get("/me", requireAuth, userController.getMe) //checked

router.get("/my_posts", requireAuth, userController.getMyPosts) //checked
router.get("/my_posts/:id", requireAuth, userController.getMyPostsById) //haltes
router.get("/stats", requireAuth, userController.getUserStats); //checked

// get user
router.get("/profile/:userId",userController.getUserProfile); //checked
router.get("/user_recent_posts/:userId/:offset",userController.getRecentPosts) //checked
router.get("/user_recent_comments/:userId/:offset",userController.getRecentComment) //checked
router.get("/isfollowing/:follower/:following",userController.getIsFollowing) //checked
router.get("/user_recent_upvoted_posts/:userId/:offset",userController.getRecentUpvotes) //checked
router.get("/user_recent_downvoted_posts/:userId/:offset",userController.getRecentDownvotes) //checked
router.get("/usersearch/:keyword", userSearch); //checked
router.get("/usersearch/", userController.getAllUsers); //checked


export default router;