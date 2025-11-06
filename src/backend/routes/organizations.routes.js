import express from "express";
import requireAdmin from "../middleware/requireAdmin.js";
import {
  listOrganizations,
  createOrganization,
  updateOrganization,
  activateOrganization,
  deactivateOrganization,
  listMembers,
  addMember,
  updateMemberRole,
  removeMember
} from "../controllers/organizations.controller.js";

const router = express.Router();

// Admin-only
router.use(requireAdmin);

// Organizations
router.get("/", listOrganizations);                 // ?status=active|deactivated
router.post("/", createOrganization);
router.patch("/:id", updateOrganization);
router.post("/:id/activate", activateOrganization);
router.post("/:id/deactivate", deactivateOrganization);

// Members
router.get("/:id/members", listMembers);
router.post("/:id/members", addMember);                     // { userId, role }
router.patch("/:id/members/:userId", updateMemberRole);     // { role }
router.delete("/:id/members/:userId", removeMember);

export default router;
