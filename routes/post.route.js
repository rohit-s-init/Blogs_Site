import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { listPosts, createPosts, deletePost, getPostForAnonymous, getPostForLoggedUser, reactToPost, keywordSearch, getComments, createComment, uploadFile, postSearch } from "../controllers/posts.controller.js";
import { loadFiles } from "../middleware/filehandle.middleware.js";
const router = express.Router();



router.post("/createComment", requireAuth, createComment)


// list all posts
router.get("/getposts/:offset", listPosts); // list posts for non logged user
router.get("/getposts/logged/:offset", requireAuth, listPosts); // list posts for logged user

// upload files
router.post("/upload", loadFiles, uploadFile);

// comments getting with id
router.get("/comments/:post_id", getComments)

// create post
router.post("/createpost", requireAuth, createPosts);

// delete post
router.delete("/:id", requireAuth, deletePost);

// react to post
router.post("/:id/react", requireAuth, reactToPost);

// search keyword matching post
router.get("/search/:keyword", keywordSearch);
router.get("/postsearch/:keyword", postSearch);

router.get("/getpost/:id",getPostForAnonymous);







export default router;