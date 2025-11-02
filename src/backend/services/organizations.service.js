import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "../data/misc");
const orgsPath = path.join(dataDir, "organizations.json");

async function readOrgs() {
  const raw = await fs.readFile(orgsPath, "utf-8");
  return JSON.parse(raw);
}
async function writeOrgs(data) {
  await fs.writeFile(orgsPath, JSON.stringify(data, null, 2), "utf-8");
}

export async function listOrganizationsSvc(status) {
  const orgs = await readOrgs();
  return status ? orgs.filter(o => o.status === status) : orgs;
}

export async function createOrganizationSvc({ name, description }) {
  if (!name) return { bad: "name required" };
  const orgs = await readOrgs();
  const nextId = orgs.length ? Math.max(...orgs.map(o => o.id)) + 1 : 1;
  const org = { id: nextId, name, description: description || "", status: "active", members: [] };
  orgs.push(org);
  await writeOrgs(orgs);
  return { org };
}

export async function updateOrganizationSvc(id, { name, description }) {
  const orgs = await readOrgs();
  const idx = orgs.findIndex(o => o.id === Number(id));
  if (idx === -1) return { notFound: true };
  if (name !== undefined) orgs[idx].name = name;
  if (description !== undefined) orgs[idx].description = description;
  await writeOrgs(orgs);
  return { org: orgs[idx] };
}

export async function setOrganizationStatusSvc(id, status) {
  if (!["active", "deactivated"].includes(status)) return { bad: "invalid status" };
  const orgs = await readOrgs();
  const idx = orgs.findIndex(o => o.id === Number(id));
  if (idx === -1) return { notFound: true };
  orgs[idx].status = status;
  await writeOrgs(orgs);
  return { org: orgs[idx] };
}

export async function listMembersSvc(orgId) {
  const orgs = await readOrgs();
  const org = orgs.find(o => o.id === Number(orgId));
  if (!org) return { notFound: true };
  return { members: org.members };
}

export async function addMemberSvc(orgId, { userId, role }) {
  const valid = new Set(["owner", "manager", "member"]);
  if (!userId || !valid.has(role)) return { bad: "userId and valid role required" };
  const orgs = await readOrgs();
  const org = orgs.find(o => o.id === Number(orgId));
  if (!org) return { notFound: true };
  if (org.members.some(m => m.userId === Number(userId))) return { conflict: true };
  org.members.push({ userId: Number(userId), role });
  await writeOrgs(orgs);
  return { members: org.members };
}

export async function updateMemberRoleSvc(orgId, memberUserId, { role }) {
  const valid = new Set(["owner", "manager", "member"]);
  if (!valid.has(role)) return { bad: "invalid role" };
  const orgs = await readOrgs();
  const org = orgs.find(o => o.id === Number(orgId));
  if (!org) return { notFound: true };
  const mem = org.members.find(m => m.userId === Number(memberUserId));
  if (!mem) return { memberNotFound: true };
  mem.role = role;
  await writeOrgs(orgs);
  return { members: org.members };
}

export async function removeMemberSvc(orgId, memberUserId) {
  const orgs = await readOrgs();
  const org = orgs.find(o => o.id === Number(orgId));
  if (!org) return { notFound: true };
  const before = org.members.length;
  org.members = org.members.filter(m => m.userId !== Number(memberUserId));
  if (org.members.length === before) return { memberNotFound: true };
  await writeOrgs(orgs);
  return { members: org.members };
}
