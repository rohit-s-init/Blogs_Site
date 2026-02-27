import { Router } from "express";
import * as groupController from "../controllers/group.controller.js"
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/posts/:groupId/:offset", groupController.getPosts) //checked
router.get("/getgroup/:groupId", groupController.getGroup) //checked
router.get("/getgroupauth/:groupId", requireAuth, groupController.getGroup) //checked
router.get("/searchgroups/:keyword", groupController.searchGroup) //checked
router.get("/searchgroupsauth/:keyword", requireAuth, groupController.searchGroup) //checked
router.get("/searchgroups/", groupController.getGroups) //checked
router.get("/searchgroupsauth/", requireAuth, groupController.getGroups) //checked
router.post("/creategroup", requireAuth, groupController.createGroup) //checked
router.post("/joingroup", requireAuth, groupController.joinGroup) //checked


export default router;