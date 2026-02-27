import { Router } from "express"
import { requireAuth } from "../middleware/auth.middleware.js";
import * as userController from "../controllers/user.controller.js"
import { userSearch } from "../controllers/user.controller.js";
const router = Router();


router.get("/me", requireAuth, userController.getMe)

router.get("/my_posts", requireAuth, userController.getMyPosts)
router.get("/my_posts/:id", requireAuth, userController.getMyPostsById)
router.get("/stats", requireAuth, userController.getUserStats);

// get user
router.get("/profile/:userId",userController.getUserProfile);
router.get("/user_recent_posts/:userId/:offset",userController.getRecentPosts)
router.get("/user_recent_comments/:userId/:offset",userController.getRecentComment)
router.get("/isfollowing/:follower/:following",userController.getIsFollowing)
router.get("/user_recent_upvoted_posts/:userId/:offset",userController.getRecentUpvotes)
router.get("/user_recent_downvoted_posts/:userId/:offset",userController.getRecentDownvotes)
router.get("/usersearch/:keyword", userSearch);
router.get("/usersearch/", userController.getAllUsers);


export default router;