import { MODULES, CATEGORIES, byId, resolve, defaultSelection } from "/modules.js";

const $ = (s, r = document) => r.querySelector(s);
const PRESETS = {
  lean:     ["dashboard", "contacts", "calendar", "invoices", "tasks"],
  medspa:   ["dashboard", "contacts", "calendar", "reminders", "inbox", "invoices", "memberships", "reputation", "reviewrequests", "automation", "tasks", "leadsource", "compliance"],
  services: ["dashboard", "contacts", "calendar", "pipeline", "proposals", "invoices", "leadsource", "missedcall", "automation", "team", "tasks"],
  all:      MODULES.map(m => m.id),
};

const state = {
  business: "3nitiLab",
  stack: "lovable",
  picked: new Set(defaultSelection()),
};

/* ---------- persistence: the preview reads this same key ---------- */
const KEY = "businessOS.config";
function save() {
  const cfg = { business: state.business, stack: state.stack, modules: resolve([...state.picked]) };
  try { localStorage.setItem(KEY, JSON.stringify(cfg)); } catch {}
  return cfg;
}
function load() {
  try {
    const cfg = JSON.parse(localStorage.getItem(KEY) || "null");
    if (!cfg) return;
    state.business = cfg.business ?? state.business;
    state.stack = cfg.stack ?? state.stack;
    if (Array.isArray(cfg.modules) && cfg.modules.length) state.picked = new Set(cfg.modules);
  } catch {}
}
/* A link can carry a selection: #business=Name&stack=lovable&modules=contacts,forms */
function loadFromHash() {
  const p = new URLSearchParams(location.hash.slice(1));
  if (p.has("business")) state.business = p.get("business");
  if (p.has("stack")) state.stack = p.get("stack");
  const ids = (p.get("modules") || "").split(",").filter(id => byId[id]);
  if (ids.length) state.picked = new Set(ids);
}

/* ---------- catalog ---------- */
function renderCatalog() {
  $("#catalog").innerHTML = CATEGORIES.map(cat => {
    const mods = MODULES.filter(m => m.cat === cat.id);
    return `<section class="cat">
      <h2>${cat.label}</h2><p>${cat.note}</p>
      <div class="mods">${mods.map(modCard).join("")}</div>
    </section>`;
  }).join("");
  $("#catalog").addEventListener("change", e => {
    const id = e.target.value;
    if (!id) return;
    e.target.checked ? state.picked.add(id) : state.picked.delete(id);
    sync();
  });
}

function modCard(m) {
  const deps = (m.needs ?? []).map(d => `<span class="tag dep">needs ${byId[d].name}</span>`).join("");
  const tables = m.tables.slice(0, 3).map(t => `<span class="tag">${t}</span>`).join("");
  return `<label class="mod" data-id="${m.id}">
    <input type="checkbox" value="${m.id}"${m.locked ? " disabled" : ""}>
    <div class="head">
      <span class="box"><svg viewBox="0 0 24 24"><path d="M4 12l6 6L20 6"/></svg></span>
      <span class="name">${m.name}</span>
    </div>
    <p class="blurb">${m.blurb}</p>
    <div class="tagrow">${m.locked ? '<span class="tag req">always on</span>' : ""}${deps}${tables}</div>
  </label>`;
}

/* ---------- summary + spec ---------- */
let specTimer;
function sync() {
  const resolved = resolve([...state.picked]);
  const auto = resolved.filter(id => !state.picked.has(id));

  for (const m of MODULES) {
    const label = $(`.mod[data-id="${m.id}"]`);
    const box = label.querySelector("input");
    box.checked = resolved.includes(m.id);
    label.querySelector(".tag.auto")?.remove();
    if (auto.includes(m.id)) {
      label.querySelector(".tagrow").insertAdjacentHTML("afterbegin", '<span class="tag auto">added as a dependency</span>');
    }
  }

  const mods = resolved.map(id => byId[id]);
  const tables = new Set(mods.flatMap(m => m.tables));
  const routes = new Set(mods.flatMap(m => m.routes));

  $("#summary").innerHTML = `
    <div class="line"><span>Modules</span><b>${resolved.length} <span style="color:var(--text-3);font-weight:400">/ ${MODULES.length}</span></b></div>
    <div class="line"><span>Database tables</span><b>${tables.size}</b></div>
    <div class="line"><span>Routes</span><b>${routes.size}</b></div>
    <div class="line"><span>Rough build size</span><b>${size(resolved.length)}</b></div>
    <div class="pills">${resolved.map(id =>
      `<span class="pill${auto.includes(id) ? " auto" : ""}">${byId[id].name}</span>`).join("")}</div>`;

  save();
  clearTimeout(specTimer);
  specTimer = setTimeout(fetchSpec, 200);
}

const size = n => n <= 5 ? "weekend" : n <= 9 ? "1–2 weeks" : n <= 13 ? "3–4 weeks" : "a real project";

let latest = null;
async function fetchSpec() {
  const cfg = save();
  const pre = $("#specOut");
  pre.classList.add("skeleton");
  try {
    const res = await fetch("/api/scaffold", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(cfg),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    latest = await res.json();
    pre.textContent = latest.prompt;
  } catch (err) {
    latest = null;
    pre.textContent = `Could not reach /api/scaffold (${err.message}).\nRun the site with: npx netlify-cli dev`;
  }
  pre.classList.remove("skeleton");
}

/* ---------- actions ---------- */
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.setAttribute("data-show", "");
  setTimeout(() => t.removeAttribute("data-show"), 1900);
}

function wire() {
  $("#bizName").value = state.business;
  $("#stack").value = state.stack;
  $("#bizName").addEventListener("input", e => { state.business = e.target.value.trim() || "My Business"; sync(); });
  $("#stack").addEventListener("change", e => { state.stack = e.target.value; sync(); });

  for (const btn of document.querySelectorAll("[data-preset]")) {
    btn.addEventListener("click", () => {
      state.picked = new Set(PRESETS[btn.dataset.preset]);
      sync();
      toast(`Loaded the “${btn.textContent}” preset`);
    });
  }

  $("#copyBtn").addEventListener("click", async () => {
    if (!latest) return toast("Spec not ready — is netlify dev running?");
    try { await navigator.clipboard.writeText(latest.prompt); toast("Prompt copied — paste it into Lovable"); }
    catch { toast("Clipboard blocked; open the spec panel and copy manually"); }
  });

  $("#downloadBtn").addEventListener("click", () => {
    if (!latest) return toast("Spec not ready — is netlify dev running?");
    const bundle =
      `${latest.prompt}\n\n---\n\n## File tree\n\n\`\`\`\n${latest.tree}\n\`\`\`\n\n` +
      `## config.json\n\n\`\`\`json\n${JSON.stringify(latest.config, null, 2)}\n\`\`\`\n`;
    const url = URL.createObjectURL(new Blob([bundle], { type: "text/markdown" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${latest.config.business.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-business-os.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Downloaded");
  });

  $("#theme").addEventListener("click", () => {
    const dark = getComputedStyle(document.body).getPropertyValue("--surface-0").trim().startsWith("#08");
    const next = dark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch {}
  });
}

load();
loadFromHash();
renderCatalog();
wire();
sync();
