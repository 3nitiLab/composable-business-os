// The intake questionnaire. Asked in order; a question with `when` is only asked
// when that function returns true for the answers so far.
//
// Types:  text   one line of free text
//         list   several short items, comma-separated
//         one    pick one option id
//         many   pick any option ids, comma-separated
//         number a figure (blank = unknown)
//         yesno  y / n
//
// Answers are plain JSON keyed by question id, so an intake can be typed live
// (node intake/run.mjs) or written up afterwards from notes and a letter.

export const QUESTIONS = [
  /* ---------- who ---------- */
  { id: "owner",     type: "text", ask: "Owner's full name" },
  { id: "business",  type: "text", ask: "Business name" },
  { id: "about",     type: "text", ask: "In one or two sentences: what the business is, where, and for whom" },
  { id: "entity",    type: "text", ask: "What do they call a customer record? (families, clients, customers, leads…)", default: "customers" },

  /* ---------- where it stands ---------- */
  { id: "status", type: "one", ask: "Where does the engagement stand?", options: [
    { id: "interest",     label: "Letter of interest — not engaged, nothing quoted" },
    { id: "quoted",       label: "Quoted, nothing built" },
    { id: "consultation", label: "Paid consultation / research" },
    { id: "built",        label: "Paid work, built in stages" },
  ]},

  /* ---------- front door ---------- */
  { id: "website", type: "one", ask: "What website do they have today?", options: [
    { id: "none",    label: "None" },
    { id: "builder", label: "A builder site they made themselves (GoDaddy, Wix, Google Sites…)" },
    { id: "custom",  label: "A custom site" },
  ]},
  { id: "website_tool", type: "text", ask: "Which builder? (blank if unknown)", when: a => a.website === "builder" },
  { id: "enquiry_path", type: "one", ask: "When someone wants to enquire, what does the site give them?", options: [
    { id: "mailto",  label: "An email address / mailto button" },
    { id: "thin",    label: "A form that only asks name and email" },
    { id: "forms",   label: "Several separate forms (e.g. Google Forms per service)" },
    { id: "message", label: "“Message us” on social / chat apps" },
    { id: "good",    label: "A proper enquiry form already" },
  ], when: a => a.website !== "none" },
  { id: "enquiry_fields", type: "list", ask: "What should an enquiry already tell them before they reply?" },
  { id: "site_label", type: "text", ask: "One word for what the site shows (programmes, catalog, classes…). Blank = none", when: a => a.website !== undefined },
  { id: "site_pages", type: "list", ask: "What should the public site cover? (programmes, pricing, tours, journal…)" },

  /* ---------- repeat questions ---------- */
  { id: "repeat_topics", type: "list", ask: "Which questions do they answer over and over? (blank if none)" },
  { id: "ai_guardrail", type: "yesno", ask: "Must an assistant answer only from text they approved, and hand anything uncertain to them?", when: a => a.repeat_topics?.length },

  /* ---------- conversations ---------- */
  { id: "channels", type: "many", ask: "Where do customers message them?", options: [
    { id: "email", label: "Email" }, { id: "sms", label: "SMS" }, { id: "phone", label: "Phone calls" },
    { id: "whatsapp", label: "WhatsApp" }, { id: "telegram", label: "Telegram" },
    { id: "messenger", label: "Facebook Messenger" }, { id: "instagram", label: "Instagram" },
    { id: "webchat", label: "Website chat" },
  ]},
  { id: "android", type: "yesno", ask: "Capture messages from the apps on one Android phone into the dashboard?", when: a => (a.channels ?? []).filter(c => ["sms","whatsapp","telegram","messenger","instagram"].includes(c)).length >= 3 },
  { id: "chat_orders", type: "yesno", ask: "Should customers be able to order through a Telegram bot?" },

  /* ---------- records ---------- */
  { id: "records_today", type: "many", ask: "Where do customer records live today?", options: [
    { id: "inbox",  label: "In the email inbox" }, { id: "sheets", label: "Spreadsheets" },
    { id: "chats",  label: "Scattered across chat apps" }, { id: "crm", label: "A separate CRM" },
    { id: "calendar_tool", label: "A booking/calendar tool not linked to the CRM" },
    { id: "memory", label: "In the owner's head" },
  ]},
  { id: "stages", type: "list", ask: "What stages does a customer move through? (enquired, tour, trial, enrolled…)" },
  { id: "history_sources", type: "list", ask: "Past records to bring across at the start? (old chats, CRM export, booking history…)" },

  /* ---------- paperwork ---------- */
  { id: "packet", type: "list", ask: "Paperwork a new customer must complete (forms, waivers, records, signatures). Blank if none" },
  { id: "packet_today", type: "one", ask: "How is that paperwork handled today?", options: [
    { id: "email_paper", label: "Paper/PDF sent by email, printed, signed, scanned back" },
    { id: "forms",       label: "Online forms, but nothing tracks what's missing" },
    { id: "ok",          label: "Handled well already" },
  ], when: a => a.packet?.length },
  { id: "compliance", type: "yesno", ask: "Is that paperwork a regulatory / compliance record (licensing, subsidy, health)?", when: a => a.packet?.length },

  /* ---------- money ---------- */
  { id: "payment_routes", type: "list", ask: "How does money arrive today? (card via X, Zelle, cash, subsidy…). Blank if not trading yet" },
  { id: "take_payments", type: "yesno", ask: "Should the system take card payments itself (Stripe)?" },

  /* ---------- team & work ---------- */
  { id: "team", type: "one", ask: "Who else works in the business?", options: [
    { id: "solo",          label: "Owner alone" },
    { id: "collaborators", label: "Separate collaborators, each talking to the owner one-to-one" },
    { id: "staff",         label: "Staff who are scheduled to jobs / classes" },
    { id: "coteacher",     label: "A small fixed team (e.g. two teachers)" },
  ]},
  { id: "task_capture", type: "yesno", ask: "Do decisions and assignments get made in chat and then retyped into a task list by hand?", when: a => a.team === "collaborators" },
  { id: "per_seat", type: "yesno", ask: "Is per-seat pricing what keeps the others out of the current tool?", when: a => a.team === "collaborators" },
  { id: "daily_summary", type: "yesno", ask: "Would a short daily summary in their chat app beat another dashboard?" },
  { id: "dispatch", type: "list", ask: "What must a job offer to staff carry? (address, distance, rate, time…)", when: a => a.team === "staff" },
  { id: "staff_admin", type: "list", ask: "Staff admin done by hand today (hours, pay, schedules, transport…). Blank if none" },

  /* ---------- booking ---------- */
  { id: "booking", type: "list", ask: "What gets booked? (tours, calls, parties, classes…). Blank if nothing" },

  /* ---------- qualify ---------- */
  { id: "scoring", type: "list", ask: "Should an assessment score people into a level or package? List the levels (blank = no)" },
  { id: "portal", type: "yesno", ask: "Do customers need their own login area (portal)?" },

  /* ---------- marketing ---------- */
  { id: "content", type: "list", ask: "What do they already do that outsiders never see? (events, results, behind-the-scenes). Blank if none" },
  { id: "reviews", type: "text", ask: "Where do reviews/feedback arrive? (Google, Amazon…). Blank if not a concern" },
  { id: "video", type: "yesno", ask: "Are they asking about an automated video / YouTube channel?" },
  { id: "research", type: "yesno", ask: "Is the first deliverable a feasibility / cost research report rather than a build?" },

  /* ---------- how they want to own it ---------- */
  { id: "keep_tools", type: "list", ask: "Tools they want to KEEP (the build sits alongside, not on top)" },
  { id: "replace_tools", type: "list", ask: "Tools the build would replace or retire" },
  { id: "languages", type: "list", ask: "Interface languages", default: ["English"] },
  { id: "self_build", type: "yesno", ask: "Do they want to keep building / editing it themselves afterwards?" },
  { id: "phone", type: "yesno", ask: "Will they run it mostly from a phone?", default: true },

  /* ---------- evidence ---------- */
  { id: "hours_per_week", type: "number", ask: "Admin hours per week they report (blank if not stated)" },
  { id: "extra_pains", type: "list", ask: "Anything else that hurts, in a short phrase each" },
  { id: "built", type: "list", ask: "Which screens are already built and shown working? (screen ids, see --screens)", when: a => a.status === "built" },
  { id: "partial", type: "list", ask: "Which screens are partly built? (screen ids)", when: a => a.status === "built" },
  { id: "later", type: "list", ask: "Screens deferred to a later tier / quoted separately (screen ids)" },
  // Not asked live; edit the JSON: screen_notes {screenId: "extra sentence"},
  // screen_names {screenId: "Label"} to rename a row,
  // extra_screens [{ name, features, status?, modules? }] for anything the catalog lacks.
  { id: "source", type: "text", ask: "Source of these answers (e.g. signed letter, date)" },
];
