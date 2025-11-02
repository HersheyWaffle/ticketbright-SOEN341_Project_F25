import {
  listOrganizationsSvc,
  createOrganizationSvc,
  updateOrganizationSvc,
  setOrganizationStatusSvc,
  listMembersSvc,
  addMemberSvc,
  updateMemberRoleSvc,
  removeMemberSvc
} from "../services/organizations.service.js";

export async function listOrganizations(req, res) {
  const { status } = req.query;
  const out = await listOrganizationsSvc(status);
  return res.status(200).json(out);
}

export async function createOrganization(req, res) {
  const out = await createOrganizationSvc(req.body || {});
  if (out.bad) return res.status(400).json({ message: out.bad });
  return res.status(201).json(out.org);
}

export async function updateOrganization(req, res) {
  const out = await updateOrganizationSvc(req.params.id, req.body || {});
  if (out.notFound) return res.status(404).json({ message: "Organization not found" });
  return res.status(200).json(out.org);
}

export async function activateOrganization(req, res) {
  const out = await setOrganizationStatusSvc(req.params.id, "active");
  if (out.bad) return res.status(400).json({ message: out.bad });
  if (out.notFound) return res.status(404).json({ message: "Organization not found" });
  return res.status(200).json(out.org);
}

export async function deactivateOrganization(req, res) {
  const out = await setOrganizationStatusSvc(req.params.id, "deactivated");
  if (out.bad) return res.status(400).json({ message: out.bad });
  if (out.notFound) return res.status(404).json({ message: "Organization not found" });
  return res.status(200).json(out.org);
}

export async function listMembers(req, res) {
  const out = await listMembersSvc(req.params.id);
  if (out.notFound) return res.status(404).json({ message: "Organization not found" });
  return res.status(200).json(out.members);
}

export async function addMember(req, res) {
  const out = await addMemberSvc(req.params.id, req.body || {});
  if (out.bad) return res.status(400).json({ message: out.bad });
  if (out.notFound) return res.status(404).json({ message: "Organization not found" });
  if (out.conflict) return res.status(409).json({ message: "Member already exists" });
  return res.status(201).json(out.members);
}

export async function updateMemberRole(req, res) {
  const out = await updateMemberRoleSvc(req.params.id, req.params.userId, req.body || {});
  if (out.bad) return res.status(400).json({ message: out.bad });
  if (out.notFound) return res.status(404).json({ message: "Organization not found" });
  if (out.memberNotFound) return res.status(404).json({ message: "Member not found" });
  return res.status(200).json(out.members);
}

export async function removeMember(req, res) {
  const out = await removeMemberSvc(req.params.id, req.params.userId);
  if (out.notFound) return res.status(404).json({ message: "Organization not found" });
  if (out.memberNotFound) return res.status(404).json({ message: "Member not found" });
  return res.status(204).send();
}
