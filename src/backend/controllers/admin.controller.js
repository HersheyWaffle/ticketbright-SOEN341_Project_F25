import {
  listPendingOrganizersSvc,
  approveOrganizerSvc,
  rejectOrganizerSvc,
  listPendingEventsSvc,
  moderateEventSvc,
  assignRoleSvc,
} from "../services/admin.service.js";

// GET /api/admin/organizers/pending
export const listPendingOrganizers = async (_req, res) => {
  const list = await listPendingOrganizersSvc();
  return res.status(200).json(list);
};

// POST /api/admin/organizers/:id/approve
export const approveOrganizer = async (req, res) => {
  const { id } = req.params;
  const out = await approveOrganizerSvc(id);
  if (!out) return res.status(404).json({ message: "Organizer not found" });
  if (out.conflict) return res.status(409).json({ message: "Organizer not pending" });
  return res.status(200).json(out.user);
};

// POST /api/admin/organizers/:id/reject
export const rejectOrganizer = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body || {};
  const out = await rejectOrganizerSvc(id, reason);
  if (!out) return res.status(404).json({ message: "Organizer not found" });
  if (out.conflict) return res.status(409).json({ message: "Organizer not pending" });
  return res.status(200).json(out.user);
};

// GET /api/admin/events/pending
export const listPendingEvents = async (_req, res) => {
  const list = await listPendingEventsSvc();
  return res.status(200).json(list);
};

// POST /api/admin/events/:id/moderate
export const moderateEvent = async (req, res) => {
  const { id } = req.params;
  const { action, reason } = req.body || {};
  const out = await moderateEventSvc(id, action, reason);
  if (out?.notFound) return res.status(404).json({ message: "Event not found" });
  if (out?.badAction) return res.status(400).json({ message: "Invalid action" });
  if (out?.deleted) return res.status(204).send();
  return res.status(200).json(out.event);
};

// POST /api/admin/roles/assign
export const assignRole = async (req, res) => {
  const { userId, role } = req.body || {};
  if (!userId || !role) return res.status(400).json({ message: "userId and role required" });
  const out = await assignRoleSvc(userId, role);
  if (out?.invalidRole) return res.status(400).json({ message: "Invalid role" });
  if (out?.notFound) return res.status(404).json({ message: "User not found" });
  return res.status(200).json(out.user);
};
