/* ===========================================================
   MINDSET CAREER — Backend API (Express + JSON file storage)

   Single-file Express server backing the static portal frontend.
   Per Annexure I, §2.8: REST endpoints, file-based JSON
   persistence, health check.

   Routes:
     GET    /api/health
     POST   /api/auth/login
     POST   /api/auth/logout
     POST   /api/auth/change-password
     POST   /api/auth/reset-password               (admin only)
     GET    /api/bootstrap                         (initial portal load)
     GET    /api/employers
     POST   /api/employers
     POST   /api/employers/bulk
     PUT    /api/employers/:id
     PATCH  /api/employers/:id/remark
     POST   /api/employers/:id/followups
     PATCH  /api/employers/:id/archive             (admin only)
     DELETE /api/employers/:id                     (admin only)
     GET    /api/employees
     POST   /api/employees
     POST   /api/employees/bulk
     PUT    /api/employees/:id
     PATCH  /api/employees/:id/remark
     POST   /api/employees/:id/followups
     PATCH  /api/employees/:id/archive             (admin only)
     DELETE /api/employees/:id                     (admin only)
   =========================================================== */

import cors from "cors";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 4000);
const DB_PATH = path.join(__dirname, "data", "db.json");

/* ---------- Seed data (drawn from the approved demo) ---------- */
const SEED_EMPLOYERS = [
  { company: "Brahmaputra Logistics Pvt. Ltd.", person: "Bhaskar Jyoti Saikia", designation: "HR Manager", phone: "+91 98640 12398", state: "Assam", district: "Kamrup Metro", town: "Guwahati", remark: "Looking for 5 drivers and 2 accountants." },
  { company: "Luit Textiles & Weaves", person: "Nabanita Hazarika", designation: "Director", phone: "+91 97070 45512", state: "Assam", district: "Jorhat", town: "Jorhat", remark: "Hiring loom operators on contract basis." },
  { company: "Dihing Tea Estate", person: "Pranab Gogoi", designation: "Estate Manager", phone: "+91 98540 77231", state: "Assam", district: "Dibrugarh", town: "Tinsukia", remark: "Seasonal hiring — plucking & field supervisors." },
  { company: "Kaziranga Hospitality Group", person: "Rituparna Baruah", designation: "GM – People Ops", phone: "+91 96780 33109", state: "Assam", district: "Golaghat", town: "Kaziranga", remark: "Front desk, chefs, housekeeping urgently required." },
  { company: "North-East Pharma Distributors", person: "Arup Kumar Das", designation: "Branch Head", phone: "+91 94355 00981", state: "Assam", district: "Kamrup Metro", town: "Guwahati", remark: "Field sales executives, 10 positions open." },
];

const SEED_EMPLOYEES = [
  { name: "Rituraj Borgohain", dept: "Accounts & Finance", designation: "Accountant", phone: "+91 98642 00127", state: "Assam", district: "Kamrup Metro", town: "Guwahati", remark: "Completed B.Com, 2 yrs exp.", txn: "UPI8239KD019", amountPaid: 300, paymentDate: "2026-05-01" },
  { name: "Anjalika Sonowal", dept: "Human Resources", designation: "HR Executive", phone: "+91 97079 33211", state: "Assam", district: "Jorhat", town: "Jorhat", remark: "MBA fresher; shortlisted by Brahmaputra Logistics.", txn: "PGW39012KK", amountPaid: 300, paymentDate: "2026-05-03" },
  { name: "Bhargav Jyoti Das", dept: "Hospitality", designation: "Front Desk Executive", phone: "+91 94350 71106", state: "Assam", district: "Golaghat", town: "Kaziranga", remark: "Hotel management diploma.", txn: "UPI12KK9910", amountPaid: 300, paymentDate: "2026-05-04" },
];

// Five seed users per Client's spec on 2 Jun 2026.
// Three roles:
//   admin         — full access
//   admin_viewer  — read-only across the portal (no mutations at all)
//   po            — placement officer; can create records + add notes /
//                   follow-ups, cannot edit existing records, cannot
//                   archive, cannot delete. (Tightened from the pilot
//                   spec at Client's request on 2 Jun.)
//
// Every user lands on the same default password and is expected to
// change it on first login via Settings.
const DEFAULT_PASSWORD = "mindset2026";
const SEED_USERS = {
  atikur: { username: "atikur", password: DEFAULT_PASSWORD, role: "admin",        name: "Atikur" },
  ravi:   { username: "ravi",   password: DEFAULT_PASSWORD, role: "admin_viewer", name: "Ravi" },
  po1:    { username: "po1",    password: DEFAULT_PASSWORD, role: "po",           name: "Placement Officer 1" },
  po2:    { username: "po2",    password: DEFAULT_PASSWORD, role: "po",           name: "Placement Officer 2" },
  po3:    { username: "po3",    password: DEFAULT_PASSWORD, role: "po",           name: "Placement Officer 3" },
};

// Role -> action capabilities. Used by requirePerm() middleware.
// Action names map 1:1 to what the frontend's userCan() also checks.
const ROLE_PERMS = {
  admin:        { view: true, create: true, edit: true,  notes: true,  archive: true,  delete: true,  resetPasswords: true },
  admin_viewer: { view: true, create: false, edit: false, notes: false, archive: false, delete: false, resetPasswords: false },
  po:           { view: true, create: true, edit: false, notes: true,  archive: false, delete: false, resetPasswords: false },
};

/* ---------- Helpers ---------- */
const makeId = (prefix) =>
  prefix + (Date.now().toString(36)).slice(-6).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();

const readDb = () => JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
const writeDb = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");

const sanitizeUser = (user) => ({ username: user.username, role: user.role, name: user.name });

const isPhoneValid = (phone) => {
  // Accept any string with at least 10 digits (we keep formatting like "+91 98640 12398")
  const digits = String(phone || "").replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
};

const createSeedDb = () => ({
  users: SEED_USERS,
  employers: SEED_EMPLOYERS.map((e, i) => ({
    id: "EMP-" + (1001 + i),
    ...e,
    status: "active",
    followUps: [],
    createdAt: Date.now() - i * 86400000,
  })),
  employees: SEED_EMPLOYEES.map((e, i) => ({
    id: "CAN-" + (5001 + i),
    ...e,
    status: "paid",
    receiptNumber: "RCPT-2026-" + (2001 + i),
    followUps: [],
    createdAt: Date.now() - i * 43200000,
  })),
  activityLog: [
    { t: Date.now(), user: "System", action: "Database initialised with seed records.", target: "" },
  ],
});

const ensureDb = () => {
  const dbDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
  if (!fs.existsSync(DB_PATH)) writeDb(createSeedDb());
};

const addLog = (db, who, action, target = "") => {
  db.activityLog = [
    { t: Date.now(), user: who, action, target },
    ...(db.activityLog || []),
  ].slice(0, 150);
};

/* ---------- Validators / Builders (shared by single + bulk endpoints) ---------- */
const REQUIRED_EMPLOYER_FIELDS = ["company", "person", "phone", "state"];
const REQUIRED_EMPLOYEE_FIELDS = ["name", "dept", "designation", "phone", "state"];

const buildEmployerRecord = (payload, existing) => {
  for (const field of REQUIRED_EMPLOYER_FIELDS) {
    if (!String(payload[field] || "").trim()) {
      return { ok: false, error: `Missing required field: ${field}.` };
    }
  }
  const phone = String(payload.phone || "").trim();
  if (!isPhoneValid(phone)) {
    return { ok: false, error: "Phone number must contain at least 10 digits." };
  }
  const company = String(payload.company).trim();
  const duplicate = existing.some(
    (item) => item.phone === phone &&
              String(item.company || "").toLowerCase() === company.toLowerCase()
  );
  if (duplicate) {
    return { ok: false, error: `Duplicate employer (${company} / ${phone}).` };
  }
  return {
    ok: true,
    record: {
      id: "EMP-" + (1001 + existing.length),
      company,
      person: String(payload.person).trim(),
      designation: String(payload.designation || "").trim(),
      phone,
      state: String(payload.state).trim(),
      district: String(payload.district || "").trim(),
      town: String(payload.town || "").trim(),
      remark: String(payload.remark || "").trim(),
      status: "active",
      followUps: [],
      createdAt: Date.now(),
    },
  };
};

const buildEmployeeRecord = (payload, existing) => {
  for (const field of REQUIRED_EMPLOYEE_FIELDS) {
    if (!String(payload[field] || "").trim()) {
      return { ok: false, error: `Missing required field: ${field}.` };
    }
  }
  const phone = String(payload.phone || "").trim();
  if (!isPhoneValid(phone)) {
    return { ok: false, error: "Phone number must contain at least 10 digits." };
  }
  const name = String(payload.name).trim();
  const duplicate = existing.some(
    (item) => item.phone === phone &&
              String(item.name || "").toLowerCase() === name.toLowerCase()
  );
  if (duplicate) {
    return { ok: false, error: `Duplicate candidate (${name} / ${phone}).` };
  }
  const sn = existing.length + 1;
  const amountPaid = Number(payload.amountPaid);
  return {
    ok: true,
    record: {
      id: "CAN-" + (5001 + existing.length),
      name,
      dept: String(payload.dept).trim(),
      designation: String(payload.designation).trim(),
      phone,
      state: String(payload.state).trim(),
      district: String(payload.district || "").trim(),
      town: String(payload.town || "").trim(),
      remark: String(payload.remark || "").trim(),
      status: String(payload.status || "paid").trim(),
      txn: String(payload.txn || "").trim(),
      amountPaid: Number.isFinite(amountPaid) && amountPaid > 0 ? amountPaid : 300,
      paymentDate: String(payload.paymentDate || "").trim() || new Date().toISOString().split("T")[0],
      receiptNumber: "RCPT-" + new Date().getFullYear() + "-" + (2001 + sn),
      followUps: [],
      createdAt: Date.now(),
    },
  };
};

/* ---------- Sessions (in-memory token store) ---------- */
const sessions = new Map(); // token -> username

const authGuard = (req, res, next) => {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const username = sessions.get(token);
  if (!username) return res.status(401).json({ message: "Unauthorized." });
  const db = readDb();
  const user = Object.values(db.users).find((u) => u.username === username);
  if (!user) {
    sessions.delete(token);
    return res.status(401).json({ message: "Session expired." });
  }
  req.db = db;
  req.user = user;
  req.token = token;
  next();
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin role required." });
  }
  next();
};

const requirePerm = (perm) => (req, res, next) => {
  const perms = ROLE_PERMS[req.user.role] || {};
  if (!perms[perm]) {
    return res.status(403).json({
      message: `Your role (${req.user.role}) does not have permission to ${perm}.`,
    });
  }
  next();
};

/* ---------- App ---------- */
const app = express();

app.use(
  cors({
    origin: true, // reflect the request origin; for production set to specific origins
    credentials: true,
  })
);
app.use(express.json({ limit: "5mb" }));

/* === Health === */
app.get("/api/health", (_req, res) => res.json({ ok: true }));

/* === Auth === */
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body || {};
  const db = readDb();
  const matched = Object.values(db.users).find(
    (u) => u.username === String(username || "").trim() && u.password === String(password || "")
  );
  if (!matched) return res.status(401).json({ message: "Invalid credentials." });

  const token = makeId("TOK-");
  sessions.set(token, matched.username);
  addLog(db, matched.name, "Logged in as " + matched.role.toUpperCase());
  writeDb(db);
  res.json({ token, user: sanitizeUser(matched) });
});

app.post("/api/auth/logout", authGuard, (req, res) => {
  sessions.delete(req.token);
  addLog(req.db, req.user.name, "Logged out");
  writeDb(req.db);
  res.json({ ok: true });
});

app.post("/api/auth/change-password", authGuard, (req, res) => {
  const currentPassword = String(req.body?.currentPassword || "");
  const newPassword = String(req.body?.newPassword || "");
  if (req.user.password !== currentPassword) {
    return res.status(400).json({ message: "Current password is incorrect." });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ message: "New password must be at least 8 characters." });
  }
  const key = Object.keys(req.db.users).find((k) => req.db.users[k].username === req.user.username);
  req.db.users[key].password = newPassword;
  addLog(req.db, req.user.name, "Password changed");
  writeDb(req.db);
  res.json({ ok: true });
});

app.post("/api/auth/reset-password", authGuard, requirePerm("resetPasswords"), (req, res) => {
  const username = String(req.body?.username || "").trim();
  const key = Object.keys(req.db.users).find((k) => req.db.users[k].username === username);
  if (!key) return res.status(404).json({ message: "User not found." });
  const temporaryPassword = "Temp@" + Math.floor(1000 + Math.random() * 9000);
  req.db.users[key].password = temporaryPassword;
  addLog(req.db, req.user.name, "Password reset for " + username, username);
  writeDb(req.db);
  res.json({ temporaryPassword });
});

/* === Bootstrap === */
app.get("/api/bootstrap", authGuard, (req, res) => {
  res.json({
    user: sanitizeUser(req.user),
    employers: req.db.employers,
    employees: req.db.employees,
    activityLog: req.db.activityLog || [],
  });
});

/* === Employers === */
app.get("/api/employers", authGuard, (req, res) => {
  const q = String(req.query.q || "").toLowerCase();
  const status = String(req.query.status || "");
  const rows = req.db.employers.filter((item) => {
    if (status && status !== "all" && (item.status || "active") !== status) return false;
    if (!q) return true;
    return (item.company + item.person + item.designation + item.phone +
            item.state + item.district + item.town + item.remark)
      .toLowerCase().includes(q);
  });
  res.json(rows);
});

app.post("/api/employers", authGuard, requirePerm("create"), (req, res) => {
  const result = buildEmployerRecord(req.body || {}, req.db.employers);
  if (!result.ok) return res.status(400).json({ message: result.error });
  req.db.employers.unshift(result.record);
  addLog(req.db, req.user.name, "Added employer", result.record.company);
  writeDb(req.db);
  res.status(201).json(result.record);
});

app.post("/api/employers/bulk", authGuard, requirePerm("create"), (req, res) => {
  const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];
  if (!rows.length) return res.status(400).json({ message: "No rows provided." });
  if (rows.length > 500) return res.status(400).json({ message: "Maximum 500 rows per import." });
  const inserted = [];
  const failed = [];
  for (let i = 0; i < rows.length; i++) {
    const result = buildEmployerRecord(rows[i] || {}, [...req.db.employers, ...inserted]);
    if (result.ok) inserted.push(result.record);
    else failed.push({ row: i + 1, data: rows[i], error: result.error });
  }
  if (inserted.length) {
    req.db.employers = [...inserted].reverse().concat(req.db.employers);
    addLog(req.db, req.user.name,
      `Bulk imported ${inserted.length} employer${inserted.length === 1 ? "" : "s"}` +
      (failed.length ? ` (${failed.length} skipped)` : ""));
    writeDb(req.db);
  }
  res.status(inserted.length ? 201 : 400).json({ inserted, failed });
});

app.put("/api/employers/:id", authGuard, requirePerm("edit"), (req, res) => {
  const { id } = req.params;
  const idx = req.db.employers.findIndex((x) => x.id === id);
  if (idx === -1) return res.status(404).json({ message: "Employer not found." });
  const payload = req.body || {};
  if (payload.phone && !isPhoneValid(payload.phone)) {
    return res.status(400).json({ message: "Phone number must contain at least 10 digits." });
  }
  const dup = req.db.employers.some(
    (x) => x.id !== id && x.phone === payload.phone &&
           String(x.company || "").toLowerCase() === String(payload.company || "").toLowerCase()
  );
  if (dup) return res.status(400).json({ message: "Duplicate employer record." });
  req.db.employers[idx] = { ...req.db.employers[idx], ...payload };
  addLog(req.db, req.user.name, "Updated employer", req.db.employers[idx].company);
  writeDb(req.db);
  res.json(req.db.employers[idx]);
});

app.patch("/api/employers/:id/remark", authGuard, requirePerm("notes"), (req, res) => {
  const idx = req.db.employers.findIndex((x) => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: "Employer not found." });
  req.db.employers[idx].remark = String(req.body?.remark || "");
  addLog(req.db, req.user.name, "Updated remark on", req.db.employers[idx].company);
  writeDb(req.db);
  res.json(req.db.employers[idx]);
});

app.post("/api/employers/:id/followups", authGuard, requirePerm("notes"), (req, res) => {
  const note = String(req.body?.note || "").trim();
  if (!note) return res.status(400).json({ message: "Follow-up note is required." });
  const idx = req.db.employers.findIndex((x) => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: "Employer not found." });
  req.db.employers[idx].followUps = [
    { date: new Date().toLocaleString("en-IN"), note, by: req.user.name },
    ...(req.db.employers[idx].followUps || []),
  ];
  addLog(req.db, req.user.name, "Added follow-up to employer", req.db.employers[idx].company);
  writeDb(req.db);
  res.json(req.db.employers[idx]);
});

app.patch("/api/employers/:id/archive", authGuard, requirePerm("archive"), (req, res) => {
  const idx = req.db.employers.findIndex((x) => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: "Employer not found." });
  const current = req.db.employers[idx].status;
  req.db.employers[idx].status = current === "archived" ? "active" : "archived";
  addLog(req.db, req.user.name,
    req.db.employers[idx].status === "archived" ? "Archived employer" : "Restored employer",
    req.db.employers[idx].company);
  writeDb(req.db);
  res.json(req.db.employers[idx]);
});

app.delete("/api/employers/:id", authGuard, requirePerm("delete"), (req, res) => {
  const before = req.db.employers.length;
  const record = req.db.employers.find((x) => x.id === req.params.id);
  req.db.employers = req.db.employers.filter((x) => x.id !== req.params.id);
  if (req.db.employers.length === before) return res.status(404).json({ message: "Employer not found." });
  addLog(req.db, req.user.name, "Deleted employer", record?.company || req.params.id);
  writeDb(req.db);
  res.json({ ok: true });
});

/* === Employees === */
app.get("/api/employees", authGuard, (req, res) => {
  const q = String(req.query.q || "").toLowerCase();
  const status = String(req.query.status || "");
  const rows = req.db.employees.filter((item) => {
    if (status && status !== "all" && (item.status || "paid") !== status) return false;
    if (!q) return true;
    return (item.name + item.dept + item.designation + item.phone +
            item.state + item.district + item.town + item.remark + (item.txn || ""))
      .toLowerCase().includes(q);
  });
  res.json(rows);
});

app.post("/api/employees", authGuard, requirePerm("create"), (req, res) => {
  const result = buildEmployeeRecord(req.body || {}, req.db.employees);
  if (!result.ok) return res.status(400).json({ message: result.error });
  req.db.employees.unshift(result.record);
  addLog(req.db, req.user.name, "Added candidate", result.record.name);
  writeDb(req.db);
  res.status(201).json(result.record);
});

app.post("/api/employees/bulk", authGuard, requirePerm("create"), (req, res) => {
  const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];
  if (!rows.length) return res.status(400).json({ message: "No rows provided." });
  if (rows.length > 500) return res.status(400).json({ message: "Maximum 500 rows per import." });
  const inserted = [];
  const failed = [];
  for (let i = 0; i < rows.length; i++) {
    const result = buildEmployeeRecord(rows[i] || {}, [...req.db.employees, ...inserted]);
    if (result.ok) inserted.push(result.record);
    else failed.push({ row: i + 1, data: rows[i], error: result.error });
  }
  if (inserted.length) {
    req.db.employees = [...inserted].reverse().concat(req.db.employees);
    addLog(req.db, req.user.name,
      `Bulk imported ${inserted.length} candidate${inserted.length === 1 ? "" : "s"}` +
      (failed.length ? ` (${failed.length} skipped)` : ""));
    writeDb(req.db);
  }
  res.status(inserted.length ? 201 : 400).json({ inserted, failed });
});

app.put("/api/employees/:id", authGuard, requirePerm("edit"), (req, res) => {
  const { id } = req.params;
  const idx = req.db.employees.findIndex((x) => x.id === id);
  if (idx === -1) return res.status(404).json({ message: "Candidate not found." });
  const payload = req.body || {};
  if (payload.phone && !isPhoneValid(payload.phone)) {
    return res.status(400).json({ message: "Phone number must contain at least 10 digits." });
  }
  const dup = req.db.employees.some(
    (x) => x.id !== id && x.phone === payload.phone &&
           String(x.name || "").toLowerCase() === String(payload.name || "").toLowerCase()
  );
  if (dup) return res.status(400).json({ message: "Duplicate candidate record." });
  req.db.employees[idx] = { ...req.db.employees[idx], ...payload };
  addLog(req.db, req.user.name, "Updated candidate", req.db.employees[idx].name);
  writeDb(req.db);
  res.json(req.db.employees[idx]);
});

app.patch("/api/employees/:id/remark", authGuard, requirePerm("notes"), (req, res) => {
  const idx = req.db.employees.findIndex((x) => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: "Candidate not found." });
  req.db.employees[idx].remark = String(req.body?.remark || "");
  addLog(req.db, req.user.name, "Updated remark on", req.db.employees[idx].name);
  writeDb(req.db);
  res.json(req.db.employees[idx]);
});

app.post("/api/employees/:id/followups", authGuard, requirePerm("notes"), (req, res) => {
  const note = String(req.body?.note || "").trim();
  if (!note) return res.status(400).json({ message: "Follow-up note is required." });
  const idx = req.db.employees.findIndex((x) => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: "Candidate not found." });
  req.db.employees[idx].followUps = [
    { date: new Date().toLocaleString("en-IN"), note, by: req.user.name },
    ...(req.db.employees[idx].followUps || []),
  ];
  addLog(req.db, req.user.name, "Added follow-up to candidate", req.db.employees[idx].name);
  writeDb(req.db);
  res.json(req.db.employees[idx]);
});

app.patch("/api/employees/:id/archive", authGuard, requirePerm("archive"), (req, res) => {
  const idx = req.db.employees.findIndex((x) => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: "Candidate not found." });
  const current = req.db.employees[idx].status;
  req.db.employees[idx].status = current === "archived" ? "paid" : "archived";
  addLog(req.db, req.user.name,
    req.db.employees[idx].status === "archived" ? "Archived candidate" : "Restored candidate",
    req.db.employees[idx].name);
  writeDb(req.db);
  res.json(req.db.employees[idx]);
});

app.delete("/api/employees/:id", authGuard, requirePerm("delete"), (req, res) => {
  const before = req.db.employees.length;
  const record = req.db.employees.find((x) => x.id === req.params.id);
  req.db.employees = req.db.employees.filter((x) => x.id !== req.params.id);
  if (req.db.employees.length === before) return res.status(404).json({ message: "Candidate not found." });
  addLog(req.db, req.user.name, "Deleted candidate", record?.name || req.params.id);
  writeDb(req.db);
  res.json({ ok: true });
});

/* ---------- Boot ---------- */
ensureDb();
app.listen(PORT, () => {
  console.log(`Mindset Career backend running on http://localhost:${PORT}`);
});
