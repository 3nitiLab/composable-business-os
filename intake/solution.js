// Intake answers -> a proposed solution: pain points, tech stack, screens.
// Every screen names the catalog capabilities it is built from, so the same
// answers also produce a Studio config (public/modules.js resolves the rest).

import { resolve, byId } from "../public/modules.js";

const CHANNEL = {
  email: "email", sms: "SMS", phone: "phone", whatsapp: "WhatsApp", telegram: "Telegram",
  messenger: "Messenger", instagram: "Instagram", webchat: "website chat",
};
const MESSAGING = ["sms", "whatsapp", "telegram", "messenger", "instagram"];

const join = xs => xs.length <= 1 ? (xs[0] ?? "") : xs.slice(0, -1).join(", ") + " and " + xs.at(-1);
const first = s => String(s || "").trim().split(/\s+/)[0];
const cap = s => s ? s[0].toUpperCase() + s.slice(1) : s;
const has = x => Array.isArray(x) ? x.length > 0 : !!x;

/* ---------------- screens ---------------- */
// Order is the order they appear on the card. `when` decides inclusion,
// `features` writes the right-hand column from the answers.
export const SCREENS = [
  {
    id: "website", name: a => a.site_label ? `Website / ${a.site_label}` : "Website",
    modules: ["sites", "forms"],
    when: a => a.website !== undefined,
    features: a => [
      a.website === "none" ? "New public website" : "Website rebuilt from owner-approved content",
      a.site_pages?.length ? `: ${join(a.site_pages)}` : "",
      a.enquiry_path === "mailto" ? ". Every call-to-action becomes a real form, and the email address comes off the public page." : ".",
    ].join(""),
  },
  {
    id: "enquiry", name: () => "Enquiry form",
    modules: ["forms", "leadsource"],
    when: a => has(a.enquiry_fields) && a.enquiry_path !== "good",
    features: a => `Enquiry that arrives already carrying ${join(a.enquiry_fields)}, with its source recorded — no first round of emails to collect it.`,
  },
  {
    id: "assessment", name: () => "Assessment / scoring",
    modules: ["forms", "leadscoring"],
    when: a => has(a.scoring),
    features: a => `Step-by-step intake questions that ask for an email first and suggest a level: ${join(a.scoring)}.`,
  },
  {
    id: "frontdesk", name: () => "AI front desk",
    modules: ["chatwidget", "convai", "agentstudio"],
    when: a => has(a.repeat_topics),
    features: a => `Website assistant answering ${join(a.repeat_topics)}` +
      (a.ai_guardrail ? " — only from text the owner wrote and approved; anything it is unsure of goes straight to the owner." : "."),
  },
  {
    id: "crm", name: a => `Owner dashboard / ${a.entity === "customers" ? "CRM" : cap(a.entity)}`,
    modules: ["contacts", "pipeline", "tasks", "dashboard"],
    when: a => has(a.stages) || has(a.records_today),
    features: a => `One record per ${singular(a.entity)}` +
      (a.stages?.length ? `, moving through ${join(a.stages)}` : "") +
      `; a follow-up queue showing who is still owed a reply.`,
  },
  {
    id: "inbox", name: () => "Unified inbox",
    modules: ["inbox", "snippets", "convai"],
    when: a => (a.channels ?? []).filter(c => MESSAGING.includes(c)).length >= 2,
    features: a => `${join((a.channels ?? []).map(c => CHANNEL[c]))} in one conversation list with the ${singular(a.entity)}'s record beside it; draft reply, owner edits and approves — nothing sends on its own.`,
  },
  {
    id: "android", name: () => "Android client",
    modules: ["inbox", "integrations"],
    when: a => a.android === true,
    features: a => `Captures ${join((a.channels ?? []).filter(c => MESSAGING.includes(c)).map(c => CHANNEL[c]))} from the apps on one physical Android phone into the dashboard.`,
  },
  {
    id: "orderbot", name: () => "Telegram ordering bot",
    modules: ["upsells", "inbox"],
    when: a => a.chat_orders === true,
    features: () => "Customers place orders through a Telegram bot; each order lands against the customer record.",
  },
  {
    id: "recovery", name: () => "Customer history import",
    modules: ["contacts", "integrations"],
    when: a => has(a.history_sources),
    features: a => `Brings ${join(a.history_sources)} into one ${singular(a.entity)} list at the start, duplicates merged, rather than starting from an empty system.`,
  },
  {
    id: "packet", name: a => a.compliance ? "Enrolment packet / compliance file" : "Registration & paperwork",
    modules: ["forms", "proposals", "compliance", "automation"],
    when: a => has(a.packet) && a.packet_today !== "ok",
    features: a => `Online packet: ${join(a.packet)}, signed and uploaded from a phone. Then the screen that matters — what is still missing, for which ${singular(a.entity)}` +
      (a.compliance ? "; stored as the compliance record, not in an inbox." : "."),
  },
  {
    id: "ledger", name: () => "Payments ledger",
    modules: ["invoices", "reporting"],
    when: a => has(a.payment_routes) || a.take_payments,
    features: a => (a.payment_routes?.length
      ? `One place to see what has been paid, whichever way it came in (${join(a.payment_routes)}); who owes what this month is a screen, not a reconciliation.`
      : "Payment records against each order or booking.") +
      (a.take_payments ? " Stripe card payments connected." : ""),
  },
  {
    id: "tasks", name: () => "AI task capture",
    modules: ["tasks", "automation", "convai"],
    when: a => a.task_capture === true,
    features: a => `Approved ${a.channels?.includes("telegram") ? "Telegram" : "chat"} conversations become suggested tasks — person, date, product — with Create / Ignore; the original message stays linked. The system proposes, a person confirms.`,
  },
  {
    id: "teamview", name: () => "Collaborator phone view",
    modules: ["team", "tasks"],
    when: a => a.team === "collaborators",
    features: a => `Each collaborator sees only their own work on their phone` + (a.per_seat ? ", without a paid seat per person." : "."),
  },
  {
    id: "dispatch", name: () => "Staff offers & schedule",
    modules: ["team", "calendar", "automation"],
    when: a => a.team === "staff",
    features: a => `Jobs go out as offers to chosen staff` + (a.dispatch?.length ? `, carrying ${join(a.dispatch)}` : "") +
      "; accept / decline, who has not answered, and each person's own calendar.",
  },
  {
    id: "staffadmin", name: () => "Staff hours & admin",
    modules: ["team", "reporting"],
    when: a => has(a.staff_admin),
    features: a => `${cap(join(a.staff_admin))} kept in the system instead of worked out from messages.`,
  },
  {
    id: "booking", name: a => `Bookings / ${a.booking?.[0] ?? "calendar"}`,
    modules: ["calendar", "reminders"],
    when: a => has(a.booking),
    features: a => `Booking requests for ${join(a.booking)} with confirmation and reminders, on the same record as the enquiry.`,
  },
  {
    id: "portal", name: () => "Client portal / login",
    modules: ["clientportal", "memberships"],
    when: a => a.portal === true,
    features: () => "Client area for updates, practices, resources and check-ins; email, Google and Apple sign-in.",
  },
  {
    id: "daily", name: () => "Daily summary",
    modules: ["automation", "reporting"],
    when: a => a.daily_summary === true,
    features: a => `A short daily summary and reminders sent back into ${a.channels?.includes("telegram") ? "Telegram" : "their chat app"}, instead of another dashboard to remember.`,
  },
  {
    id: "reviews", name: () => "Reviews as product feedback",
    modules: ["reputation"],
    when: a => has(a.reviews),
    features: a => `${a.reviews} reviews read into the same structure, so a repeated complaint becomes work instead of waiting to be noticed.`,
  },
  {
    id: "content", name: () => "Content & social",
    modules: ["socialplanner", "contentai"],
    when: a => has(a.content),
    features: a => `Photos and video off a phone → AI-prepared posts → owner approves before anything publishes. Starting from what already happens: ${join(a.content)}.`,
  },
  {
    id: "research", name: () => "Feasibility research",
    modules: [],
    when: a => a.research === true,
    features: () => "Architecture options worked against the owner's own hardware, machine time and monthly API cost, plus evidenced niche research before anything is built.",
  },
  {
    id: "video", name: () => "Automated video pipeline",
    modules: ["contentai"],
    when: a => a.video === true,
    features: () => "Script → narration → edit pipeline with operating rules per episode; sample formats and voices produced by the pipeline itself.",
  },
  {
    id: "training", name: () => "Owner workflow",
    modules: [],
    when: a => a.self_build === true,
    features: a => `Hands-on setup and build training so ${first(a.owner)} can keep editing and extending it independently — architecture set once, streets built by the owner.`,
  },
];

function singular(entity = "customers") {
  const e = String(entity).toLowerCase();
  if (e.endsWith("ies")) return e.slice(0, -3) + "y";
  return e.endsWith("s") ? e.slice(0, -1) : e;
}

/* ---------------- pain points ---------------- */
function painPoints(a) {
  const p = [];
  const channels = (a.channels ?? []).map(c => CHANNEL[c]);
  const lead =
    a.enquiry_path === "mailto" ? "The website's only way in is an email address, so every enquiry starts from nothing" :
    a.enquiry_path === "thin"   ? "The enquiry form asks for name and email only, so every enquiry starts from nothing" :
    a.enquiry_path === "forms"  ? `Enquiries and registrations arrive through several separate forms${a.website_tool ? ` on ${a.website_tool}` : ""}` :
    a.enquiry_path === "message" ? `Enquiries arrive across ${join(channels)}` : null;
  if (lead) p.push(lead + (a.enquiry_fields?.length ? ` — ${join(a.enquiry_fields.slice(0, 3))} have to be collected by hand.` : "."));
  if (has(a.repeat_topics)) p.push(/^the same/i.test(a.repeat_topics[0])
    ? `${cap(a.repeat_topics[0])} — answered one at a time, by hand.`
    : `The same questions — ${join(a.repeat_topics.slice(0, 4))} — are answered one at a time, by hand.`);
  if (a.records_today?.length) {
    const where = { inbox: "the inbox", sheets: "spreadsheets", chats: "chat apps", crm: "a CRM", calendar_tool: "a calendar tool with no link to the CRM", memory: "the owner's memory" };
    p.push(`No single ${singular(a.entity)} record — details live in ${join(a.records_today.map(r => where[r]))}.`);
  }
  if (has(a.packet) && a.packet_today === "email_paper") p.push(`Paperwork is paper moved by email; nothing tracks which ${singular(a.entity)} still owes which document${a.compliance ? ", and it is the compliance record" : ""}.`);
  if (has(a.payment_routes) && a.payment_routes.length > 1) p.push(`Money arrives through ${join(a.payment_routes)}; who has paid is worked out, not looked up.`);
  if (a.task_capture) p.push("Decisions are made in one-to-one chats and retyped into a task list only the owner can see.");
  if (a.per_seat) p.push("Per-seat pricing decides who is allowed into the system — the owner and nobody else.");
  if (a.team === "staff" && has(a.dispatch)) p.push(`Staffing a job means asking everybody at once; offers go out without ${join(a.dispatch.slice(0, 2))}.`);
  if (has(a.staff_admin)) p.push(`${cap(join(a.staff_admin))}: worked out by hand.`);
  if (has(a.content)) p.push("What the business already does well reaches existing customers and almost nobody else.");
  for (const x of a.extra_pains ?? []) p.push(cap(x.replace(/\.?$/, ".")));
  if (a.hours_per_week) p.push(`The owner reports roughly ${a.hours_per_week} hours of admin per week.`);
  return p;
}

/* ---------------- tech stack ---------------- */
function techStack(a, screens) {
  const ids = new Set(screens.map(s => s.id));
  const s = [];
  const builds = [...ids].some(id => !["research", "video", "training"].includes(id));
  if (a.self_build) s.push("Claude (AI assistant for building and managing the business)");
  if (builds) s.push("Lovable (AI for websites and apps)");
  if (builds && (ids.has("crm") || ids.has("tasks") || ids.has("packet") || ids.has("dispatch")))
    s.push(`Supabase database for ${dataNouns(a, ids)}`);
  if (ids.has("frontdesk")) s.push("AI website assistant");
  if (ids.has("orderbot") || ids.has("tasks") || ids.has("daily") && a.channels?.includes("telegram")) s.push("Telegram bot");
  if (a.channels?.includes("whatsapp") && (ids.has("inbox") || a.take_payments)) s.push("WhatsApp integration");
  if (ids.has("android")) s.push("Custom Android app connecting business messages to one dashboard");
  if (ids.has("packet")) s.push("E-signature and document upload");
  if (a.take_payments) s.push("Stripe payment integration");
  if (ids.has("recovery")) s.push("Custom import tool for past conversations and exports");
  if (ids.has("tasks")) s.push("AI task-extraction workflow");
  if (a.channels?.includes("email") && ids.has("inbox")) s.push("Email integration");
  if (ids.has("research") || ids.has("video")) s.push("Local-hardware cost model and API cost estimate");
  if ((a.languages ?? []).length > 1) s.push(`${a.languages.join("/")} interface`);
  if (a.phone !== false && builds) s.push("Progressive web app for phone and desktop");
  if (a.keep_tools?.length) s.push(`Sits alongside ${join(a.keep_tools)} (kept)`);
  return s;
}

function dataNouns(a, ids) {
  const n = [a.entity || "customers"];
  if (ids.has("enquiry") || ids.has("frontdesk")) n.push("enquiries");
  if (ids.has("packet")) n.push("documents");
  if (ids.has("ledger")) n.push("payments");
  if (ids.has("tasks")) n.push("projects", "tasks", "message history");
  if (ids.has("dispatch")) n.push("bookings", "staff offers");
  if (ids.has("orderbot")) n.push("orders");
  if (ids.has("crm") && !ids.has("tasks")) n.push("follow-ups");
  return join([...new Set(n)]);
}

/* ---------------- assemble ---------------- */
export const STATUS = {
  interest:     { label: "Letter of interest — not engaged", row: "Proposed" },
  quoted:       { label: "Quoted — nothing built yet",        row: "Proposed" },
  consultation: { label: "Paid consultation",                  row: "Delivered as research" },
  built:        { label: "Paid work, built in stages",         row: null },
};

export function buildSolution(a) {
  const screens = SCREENS.filter(s => s.when(a)).map(s => {
    const built = a.status === "built" && (a.built ?? []).includes(s.id);
    const partial = a.status === "built" && (a.partial ?? []).includes(s.id);
    const note = a.screen_notes?.[s.id];
    return {
      id: s.id,
      name: a.screen_names?.[s.id] ?? s.name(a),
      features: s.features(a) + (note ? " " + note : ""),
      status: (a.later ?? []).includes(s.id) ? "Later / quoted separately"
        : STATUS[a.status]?.row ?? (built ? "Built" : partial ? "Partly built" : "Next / requested"),
      modules: s.modules,
    };
  }).concat((a.extra_screens ?? []).map(x => ({
    id: x.id ?? "extra", name: x.name, features: x.features, modules: x.modules ?? [],
    status: STATUS[a.status]?.row ?? x.status ?? "Next / requested",
  })));
  const picked = [...new Set(screens.flatMap(s => s.modules))];
  const modules = resolve(picked);
  const tables = [...new Set(modules.flatMap(id => byId[id].tables))];
  const lead = screens.filter(s => /^(Built|Partly)/.test(s.status));
  const tagline = (lead.length ? lead : screens).filter(s => !["training", "daily", "reviews"].includes(s.id))
    .slice(0, 3).map((s, i) => i ? s.name.split(" / ")[0].toLowerCase().replace(/^ai /, "AI ") : s.name.split(" / ")[0])
    .join(" + ");

  return {
    owner: a.owner, first: first(a.owner).toUpperCase(),
    business: a.business, about: a.about, tagline,
    status: STATUS[a.status]?.label ?? "",
    pains: painPoints(a),
    stack: techStack(a, screens),
    screens,
    phoneNote: a.phone !== false && screens.some(s => !["research", "video", "training"].includes(s.id)),
    studioConfig: { business: a.business, stack: "lovable", modules },
    tables,
    source: a.source,
  };
}
