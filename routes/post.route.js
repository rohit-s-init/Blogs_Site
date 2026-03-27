import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { listPosts, createPosts, deletePost, getPostForAnonymous, getPostForLoggedUser, reactToPost, keywordSearch, getComments, createComment, uploadFile, postSearch, getPostForAuthUser } from "../controllers/posts.controller.js";
import { loadFiles } from "../middleware/filehandle.middleware.js";
const router = express.Router();



router.post("/createComment", requireAuth, createComment)


// list all posts
router.get("/getposts/:offset", listPosts); // list posts for non logged user checked
router.get("/getposts/logged/:offset", requireAuth, listPosts); // list posts for logged user checked

// upload files
router.post("/upload", loadFiles, uploadFile); // checked

// comments getting with id
router.get("/comments/:post_id", getComments) // checked

// create post
router.post("/createpost", requireAuth, createPosts); // checked

// delete post
// router.delete("/:id", requireAuth, deletePost);

// react to post
router.post("/reacttopost/:postId", requireAuth, reactToPost);

// search keyword matching post
// router.get("/search/:keyword", keywordSearch);
router.get("/postsearch/:keyword", postSearch); // checked
router.get("/postsearch/", listPosts); // checked

router.get("/postsearchauth/:keyword", requireAuth, postSearch); // checked
router.get("/postsearchauth", requireAuth, listPosts); // checked

router.get("/getpost/:id", getPostForAnonymous); // checked
router.get("/getpostauth/:id",requireAuth, getPostForAuthUser); // checked







export default router;