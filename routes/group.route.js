import { Router } from "express";
import * as groupController from "../controllers/group.controller.js"
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/posts/:groupId/:offset", groupController.getPosts)
router.get("/getgroup/:groupId", groupController.getGroup)
router.get("/getgroupauth/:groupId", requireAuth, groupController.getGroup)
router.get("/searchgroups/:keyword", groupController.searchGroup)
router.get("/searchgroupsauth/:keyword", requireAuth, groupController.searchGroup)
router.get("/searchgroups/", groupController.getGroups)
router.get("/searchgroupsauth/", requireAuth, groupController.getGroups)
router.post("/creategroup", requireAuth, groupController.createGroup)
router.post("/joingroup", requireAuth, groupController.joinGroup)


export default router;