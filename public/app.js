import { byId, resolve, defaultSelection } from "/modules.js";

const $ = (s, r = document) => r.querySelector(s);
const el = (h) => { const t = document.createElement("template"); t.innerHTML = h.trim(); return t.content.firstElementChild; };
const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const money = (n) => "$" + Math.round(n).toLocaleString("en-US");
const moneyK = (n) => n >= 1000 ? "$" + (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + "k" : "$" + n;
const fmt = { money, number: (n) => n.toLocaleString("en-US"), percent: (n) => n.toFixed(1) + "%" };

/* ---------- config: whatever Studio last saved ---------- */
function config() {
  try {
    const c = JSON.parse(localStorage.getItem("businessOS.config") || "null");
    if (c?.modules?.length) return { business: c.business || "Business OS", modules: resolve(c.modules) };
  } catch {}
  return { business: "Business OS", modules: defaultSelection() };
}

const cfg = config();
const active = new Set(cfg.modules.flatMap(id => byId[id].widgets));
const has = (w) => active.has(w);

/* ---------- sidebar from the chosen modules ---------- */
const ICONS = {
  dashboard: '<path d="M3 12l9-8 9 8"/><path d="M5 10v10h14V10"/>',
  contacts: '<path d="M16 21v-2a4 4 0 0 0-8 0v2"/><circle cx="12" cy="7" r="4"/>',
  calendar: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/>',
  inbox: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  pipeline: '<rect x="3" y="4" width="5" height="16" rx="1"/><rect x="10" y="4" width="5" height="11" rx="1"/><rect x="17" y="4" width="4" height="7" rx="1"/>',
  invoices: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
  subscriptions: '<path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>',
  reporting: '<path d="M3 17l6-6 4 4 7-8"/><path d="M20 7h-5m5 0v5"/>',
  leadsource: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  reputation: '<path d="M12 3l2.6 5.6 6.1.8-4.5 4.2 1.2 6.1L12 16.8 6.6 19.7l1.2-6.1L3.3 9.4l6.1-.8z"/>',
  campaigns: '<path d="M3 11l18-7-7 18-2.5-8z"/>',
  sites: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/>',
  automation: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>',
  ai: '<path d="M12 3v4M12 17v4M4.9 7l2.8 2M16.3 15l2.8 2M4.9 17l2.8-2M16.3 9l2.8-2"/><circle cx="12" cy="12" r="3.5"/>',
  team: '<circle cx="9" cy="8" r="3.5"/><path d="M2 20a7 7 0 0 1 14 0"/><path d="M17 5a3.5 3.5 0 0 1 0 7M18 20a6 6 0 0 0-2-4.5"/>',
  tasks: '<path d="M4 7l2 2 4-4"/><path d="M4 17l2 2 4-4"/><path d="M13 7h8M13 17h8"/>',
};
$("#bizName").textContent = cfg.business;
document.title = `${cfg.business} — Operations`;
$("#nav").innerHTML = cfg.modules.map((id, i) => {
  const m = byId[id];
  return `<a href="#" ${i === 0 ? 'aria-current="page"' : ""}>
    <svg viewBox="0 0 24 24">${ICONS[id] || ICONS.dashboard}</svg>${esc(m.name)}</a>`;
}).join("");

/* ---------- layout ---------- */
const content = $("#content");
function layout() {
  const side = ["appointments", "conversations"].find(has);
  const thirds = ["channels", "pipeline", "reviews", "tasks", "automations", "activity"].filter(has)
    .filter(w => w !== side);

  const parts = [];
  if (has("kpis")) parts.push(`<section class="grid kpis" id="w-kpis" aria-label="Key metrics"></section>`);
  if (has("revenue") || side) {
    parts.push(`<section class="grid ${has("revenue") && side ? "cols" : ""}">
      ${has("revenue") ? card("revenue", "Revenue vs. expenses", `<span class="sub" id="marginNote"></span>`,
        `<figure><div class="legend" id="rvLegend"></div><div id="revenueChart"></div>
         <figcaption>Monthly totals on one shared dollar axis. Hover a month for detail.</figcaption></figure>`) : ""}
      ${side === "appointments" ? card("appointments", "Today&rsquo;s schedule", `<span class="sub" id="apptCount"></span>`, `<div class="stack" id="apptList"></div>`) : ""}
      ${side === "conversations" ? card("conversations", "Inbox", `<span class="sub" id="inboxCount"></span>`, `<div class="stack" id="inboxList"></div>`) : ""}
    </section>`);
  }
  for (let i = 0; i < thirds.length; i += 3) {
    parts.push(`<section class="grid cols-3">${thirds.slice(i, i + 3).map(widgetCard).join("")}</section>`);
  }
  if (has("invoices")) {
    parts.push(`<section class="grid" style="margin-top:16px">${card("invoices", "Recent invoices",
      `<span class="sub" id="arNote"></span>`,
      `<table><thead><tr><th>Invoice</th><th>Client</th><th>Due</th><th>Status</th><th>Amount</th></tr></thead>
       <tbody id="invoiceRows"></tbody></table>`)}</section>`);
  }
  content.innerHTML = parts.join("");
}
const card = (id, title, sub, body) =>
  `<div class="card" id="w-${id}"><header><h2>${title}</h2>${sub || ""}</header>${body}</div>`;

const WIDGETS = {
  channels:    () => card("channels", "Where leads came from", "", `<figure><div id="channelChart"></div><figcaption>New leads this period.</figcaption></figure>`),
  pipeline:    () => card("pipeline", "Pipeline", `<span class="sub" id="pipeNote"></span>`, `<figure><div id="pipeChart"></div><figcaption>Open opportunities by stage.</figcaption></figure>`),
  reviews:     () => card("reviews", "Reviews", `<span class="sub" id="revNote"></span>`, `<div id="reviewBox"></div>`),
  tasks:       () => card("tasks", "Open tasks", "", `<ul class="tasks" id="taskList"></ul>`),
  automations: () => card("automations", "Automations", "", `<ul class="tasks" id="autoList"></ul>`),
  activity:    () => card("activity", "Activity", "", `<ul class="feed" id="activityList"></ul>`),
};
const widgetCard = (w) => WIDGETS[w]();

/* ---------- svg helpers ---------- */
const SVG = (w, h, inner, cls = "chart") =>
  `<svg class="${cls}" viewBox="0 0 ${w} ${h}" role="img" preserveAspectRatio="xMidYMid meet">${inner}</svg>`;

// Bar with rounded end at the data end, square at the baseline.
function vBar(x, y, w, h, r = 4) {
  r = Math.min(r, w / 2, h);
  return `M${x} ${y + h}V${y + r}a${r} ${r} 0 0 1 ${r} ${-r}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}V${y + h}Z`;
}
function hBar(x, y, w, h, r = 4) {
  r = Math.min(r, h / 2, w);
  return `M${x} ${y}h${w - r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1 ${-r} ${r}H${x}Z`;
}
function niceMax(v) {
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  return Math.ceil(v / (p / 2)) * (p / 2);
}

/* ---------- tooltip ---------- */
const tip = $("#tip");
function showTip(evt, html) {
  tip.innerHTML = html;
  tip.setAttribute("data-show", "");
  tip.style.left = evt.clientX + "px";
  tip.style.top = evt.clientY + "px";
}
const hideTip = () => tip.removeAttribute("data-show");
function hoverable(svgHost, onEnter) {
  svgHost.addEventListener("pointerleave", () => { hideTip(); svgHost.querySelector("svg")?.classList.remove("dim"); });
  svgHost.addEventListener("pointermove", (e) => {
    const g = e.target.closest("[data-i]");
    const svg = svgHost.querySelector("svg");
    if (!g) { hideTip(); svg.classList.remove("dim"); return; }
    svg.classList.add("dim");
    for (const n of svg.querySelectorAll(".mark")) n.classList.toggle("hot", n.closest("[data-i]") === g);
    showTip(e, onEnter(+g.dataset.i));
  });
}

/* ---------- widgets ---------- */
function renderKpis(d) {
  $("#w-kpis").innerHTML = d.kpis.map(k => {
    const pct = Math.min(100, Math.round((k.value / k.target) * 100));
    const up = k.delta >= 0;
    return `<div class="card kpi">
      <div class="label">${esc(k.label)}</div>
      <div class="value tnum">${fmt[k.format](k.value)}</div>
      <div class="foot">
        <span class="delta ${up ? "up" : "down"}">${up ? "▲" : "▼"} ${Math.abs(k.delta).toFixed(1)}%</span>
        <span>vs. last period</span>
      </div>
      <div class="meter"><i style="width:${pct}%"></i></div>
      <div class="foot" style="margin-top:6px"><span>${pct}% of ${fmt[k.format](k.target)} target</span></div>
    </div>`;
  }).join("");
}

function renderRevenue(d) {
  const S = d.revenueSeries;
  const W = 640, H = 260, P = { t: 14, r: 10, b: 28, l: 46 };
  const iw = W - P.l - P.r, ih = H - P.t - P.b;
  const max = niceMax(Math.max(...S.flatMap(s => [s.revenue, s.expenses])));
  const y = v => P.t + ih - (v / max) * ih;
  const band = iw / S.length, bw = Math.min(26, (band - 14) / 2);

  const grid = [0, .25, .5, .75, 1].map(f => {
    const v = max * f, yy = y(v);
    return `<line class="grid-line" x1="${P.l}" y1="${yy}" x2="${W - P.r}" y2="${yy}"/>
            <text class="axis-text" x="${P.l - 8}" y="${yy + 4}" text-anchor="end">${moneyK(v)}</text>`;
  }).join("");

  const bars = S.map((s, i) => {
    const cx = P.l + band * i + band / 2;
    // 2px surface gap between the adjacent pair
    const x1 = cx - bw - 1, x2 = cx + 1;
    return `<g data-i="${i}">
      <rect x="${P.l + band * i}" y="${P.t}" width="${band}" height="${ih}" fill="transparent"/>
      <path class="mark" d="${vBar(x1, y(s.revenue), bw, P.t + ih - y(s.revenue))}" fill="var(--series-1)"/>
      <path class="mark" d="${vBar(x2, y(s.expenses), bw, P.t + ih - y(s.expenses))}" fill="var(--series-2)"/>
      <text class="axis-text" x="${cx}" y="${H - 8}" text-anchor="middle">${esc(s.label)}</text>
    </g>`;
  }).join("");

  $("#revenueChart").innerHTML = SVG(W, H, `${grid}<line class="grid-line" x1="${P.l}" y1="${P.t + ih}" x2="${W - P.r}" y2="${P.t + ih}"/>${bars}`);
  $("#rvLegend").innerHTML =
    `<span><i style="background:var(--series-1)"></i>Revenue</span><span><i style="background:var(--series-2)"></i>Expenses</span>`;

  const last = S.at(-1);
  $("#marginNote").textContent = `${Math.round((1 - last.expenses / last.revenue) * 100)}% margin in ${last.label}`;

  hoverable($("#revenueChart"), i => {
    const s = S[i], m = s.revenue - s.expenses;
    return `<h4>${esc(s.label)}</h4>
      <div class="row"><span><i style="background:var(--series-1)"></i>Revenue</span><b>${money(s.revenue)}</b></div>
      <div class="row"><span><i style="background:var(--series-2)"></i>Expenses</span><b>${money(s.expenses)}</b></div>
      <div class="row" style="margin-top:4px;border-top:1px solid var(--border);padding-top:4px"><span>Margin</span><b>${money(m)}</b></div>`;
  });
}

function renderChannels(d) {
  const C = [...d.channels].sort((a, b) => b.value - a.value);
  const W = 400, rowH = 34, H = C.length * rowH + 6, labelW = 150, barMax = W - labelW - 46;
  const max = Math.max(...C.map(c => c.value));
  const rows = C.map((c, i) => {
    const w = Math.max(3, (c.value / max) * barMax), yy = i * rowH + 8;
    return `<g data-i="${i}">
      <rect x="0" y="${yy - 6}" width="${W}" height="${rowH - 2}" fill="transparent"/>
      <text class="axis-text" x="0" y="${yy + 12}">${esc(c.label)}</text>
      <path class="mark" d="${hBar(labelW, yy + 2, w, 14)}" fill="var(--series-1)"/>
      <text class="value-text" x="${labelW + w + 8}" y="${yy + 13}">${c.value}</text>
    </g>`;
  }).join("");
  $("#channelChart").innerHTML = SVG(W, H, rows);
  const total = C.reduce((a, c) => a + c.value, 0);
  hoverable($("#channelChart"), i =>
    `<h4>${esc(C[i].label)}</h4><div class="row"><span>Leads</span><b>${C[i].value}</b></div>
     <div class="row"><span>Share</span><b>${Math.round((C[i].value / total) * 100)}%</b></div>`);
}

function renderPipeline(d) {
  const P = d.pipeline, W = 400, rowH = 36, H = P.length * rowH + 6, labelW = 132, barMax = W - labelW - 62;
  const max = Math.max(...P.map(s => s.value));
  const rows = P.map((s, i) => {
    const w = Math.max(3, (s.value / max) * barMax), yy = i * rowH + 8;
    return `<g data-i="${i}">
      <rect x="0" y="${yy - 6}" width="${W}" height="${rowH - 2}" fill="transparent"/>
      <text class="axis-text" x="0" y="${yy + 13}">${esc(s.stage)}</text>
      <path class="mark" d="${hBar(labelW, yy + 2, w, 15)}" fill="var(--ord-${i + 1}, var(--series-1))"/>
      <text class="value-text" x="${labelW + w + 8}" y="${yy + 14}">${moneyK(s.value)}</text>
    </g>`;
  }).join("");
  $("#pipeChart").innerHTML = SVG(W, H, rows);
  $("#pipeNote").textContent = `${P.reduce((a, s) => a + s.count, 0)} open · ${money(P.reduce((a, s) => a + s.value, 0))}`;
  hoverable($("#pipeChart"), i =>
    `<h4>${esc(P[i].stage)}</h4><div class="row"><span>Deals</span><b>${P[i].count}</b></div>
     <div class="row"><span>Value</span><b>${money(P[i].value)}</b></div>`);
}

function renderReviews(d) {
  const r = d.reviews, max = Math.max(...r.breakdown.map(b => b.count));
  $("#revNote").textContent = `${r.unanswered} unanswered`;
  $("#reviewBox").innerHTML = `
    <div style="display:flex;align-items:baseline;gap:10px;margin-bottom:10px">
      <span class="tnum" style="font-size:32px;font-weight:650;letter-spacing:-.03em">${r.average}</span>
      <span style="color:var(--text-3);font-size:12.5px">${r.total} reviews · +${r.newThisMonth} this month</span>
    </div>
    ${r.breakdown.map(b => `
      <div style="display:flex;align-items:center;gap:8px;margin:5px 0;font-size:12.5px">
        <span style="width:26px;color:var(--text-3)" class="tnum">${b.stars}★</span>
        <span style="flex:1;height:8px;border-radius:999px;background:var(--grid);overflow:hidden">
          <i style="display:block;height:100%;width:${(b.count / max) * 100}%;background:var(--series-1);border-radius:999px"></i>
        </span>
        <span class="tnum" style="width:30px;text-align:right;color:var(--text-2)">${b.count}</span>
      </div>`).join("")}`;
}

function renderAppointments(d) {
  $("#apptCount").textContent = `${d.appointments.filter(a => a.status !== "cancelled").length} booked`;
  $("#apptList").innerHTML = d.appointments.map(a => `
    <div class="row-item">
      <span class="time">${esc(a.time)}</span>
      <span style="flex:1"><span class="who">${esc(a.client)}</span><br><span class="what">${esc(a.service)} · ${esc(a.staff)}</span></span>
      <span class="chip ${a.status}">${esc(a.status)}</span>
    </div>`).join("");
}

function renderInbox(d) {
  const unread = d.conversations.filter(c => c.unread).length;
  $("#inboxCount").textContent = unread ? `${unread} unread` : "all caught up";
  $("#inboxList").innerHTML = d.conversations.map(c => `
    <div class="row-item">
      <span class="dot" style="background:${c.unread ? "var(--accent)" : "var(--border-strong)"};margin-top:0"></span>
      <span style="flex:1;min-width:0">
        <span class="who">${esc(c.who)}</span>
        <br><span class="what" style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(c.preview)}</span>
      </span>
      <span style="text-align:right"><span class="chip draft">${esc(c.channel)}</span><br><span class="what">${esc(c.when)}</span></span>
    </div>`).join("");
}

function renderInvoices(d) {
  $("#invoiceRows").innerHTML = d.invoices.map(v => `
    <tr>
      <td><b>${esc(v.id)}</b></td>
      <td>${esc(v.client)}</td>
      <td>${esc(v.due)}</td>
      <td><span class="chip ${v.status}">${esc(v.status)}</span></td>
      <td class="tnum"><b>${money(v.amount)}</b></td>
    </tr>`).join("");
  const outstanding = d.invoices.filter(v => v.status !== "paid").reduce((a, v) => a + v.amount, 0);
  const overdue = d.invoices.filter(v => v.status === "overdue").reduce((a, v) => a + v.amount, 0);
  $("#arNote").textContent = `${money(outstanding)} outstanding · ${money(overdue)} overdue`;
}

function renderTasks(d) {
  $("#taskList").innerHTML = d.tasks.map((t, i) => `
    <li class="${t.done ? "done" : ""}">
      <input type="checkbox" id="t${i}" ${t.done ? "checked" : ""}>
      <label for="t${i}">${esc(t.title)}</label>
      <span class="due">${esc(t.due)}</span>
    </li>`).join("");
  $("#taskList").addEventListener("change", e =>
    e.target.closest("li").classList.toggle("done", e.target.checked));
}

function renderAutomations(d) {
  $("#autoList").innerHTML = d.automations.map(a => `
    <li>
      <span class="chip ${a.status === "on" ? "paid" : "draft"}">${a.status}</span>
      <label>${esc(a.name)}</label>
      <span class="due">${a.runs} runs</span>
    </li>`).join("");
}

function renderActivity(d) {
  $("#activityList").innerHTML = d.activity.map(a => `
    <li><span class="dot"></span><span><p>${esc(a.text)}</p><span class="when">${esc(a.when)}</span></span></li>`).join("");
}

/* ---------- data ---------- */
async function loadAndRender(range = "6m") {
  content.setAttribute("aria-busy", "true");
  let d;
  try {
    const res = await fetch(`/api/metrics?range=${range}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    d = await res.json();
  } catch (err) {
    content.innerHTML = `<div class="card"><h2>Couldn't load data</h2>
      <p style="color:var(--text-2)">${esc(err.message)} — start the site with <code>npx netlify-cli dev</code> so <code>/api/metrics</code> is served.</p></div>`;
    return;
  }
  layout();
  if (has("kpis")) renderKpis(d);
  if (has("revenue")) renderRevenue(d);
  if (has("appointments") && $("#apptList")) renderAppointments(d);
  if (has("conversations") && $("#inboxList")) renderInbox(d);
  if (has("channels") && $("#channelChart")) renderChannels(d);
  if (has("pipeline") && $("#pipeChart")) renderPipeline(d);
  if (has("reviews") && $("#reviewBox")) renderReviews(d);
  if (has("tasks") && $("#taskList")) renderTasks(d);
  if (has("automations") && $("#autoList")) renderAutomations(d);
  if (has("activity") && $("#activityList")) renderActivity(d);
  if (has("invoices") && $("#invoiceRows")) renderInvoices(d);
  $("#asof").textContent =
    `${cfg.modules.length} modules · updated ${new Date(d.generatedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
  content.removeAttribute("aria-busy");
}

for (const b of document.querySelectorAll("[data-range]")) {
  b.addEventListener("click", () => {
    for (const o of document.querySelectorAll("[data-range]")) o.removeAttribute("aria-pressed");
    b.setAttribute("aria-pressed", "true");
    loadAndRender(b.dataset.range);
  });
}
$("#theme").addEventListener("click", () => {
  const dark = getComputedStyle(document.body).getPropertyValue("--surface-0").trim().startsWith("#08");
  const next = dark ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem("theme", next); } catch {}
});

loadAndRender();
