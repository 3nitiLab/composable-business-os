// Single source of truth for the Business OS catalog.
// Imported by the browser (builder.js, app.js) AND by netlify/functions/scaffold.mjs.
//
// Structure follows the customer lifecycle rather than a features menu: a small
// business buys an outcome at a stage, not a checkbox. Add a module here and it
// appears in the picker, the preview and the exported spec at once.

export const CATEGORIES = [
  { id: "capture",    label: "Capture",    note: "Get found, and get the lead into a record you own." },
  { id: "nurture",    label: "Nurture",    note: "Follow up without anyone remembering to." },
  { id: "close",      label: "Close",      note: "Turn a conversation into paid work." },
  { id: "evangelize", label: "Evangelize", note: "Turn finished work into reviews and referrals." },
  { id: "reactivate", label: "Reactivate", note: "Win back the customers you already earned once." },
  { id: "ops",        label: "Operations", note: "The spine everything else hangs off." },
];

export const MODULES = [
  /* ---------------- capture ---------------- */
  {
    id: "contacts", name: "Contacts / CRM", cat: "capture", locked: true,
    blurb: "One record per person: history, tags, consent, source.",
    tables: ["contact", "tag", "contact_tag", "note"], routes: ["/contacts", "/contacts/:id"], widgets: [],
    prompt: "A contacts module: searchable list with tag and source filters, and a detail page showing a merged timeline (appointments, invoices, messages, campaign sends), notes, tags, and marketing consent flags per channel.",
  },
  {
    id: "forms", name: "Forms, surveys & quizzes", cat: "capture", default: true,
    blurb: "Capture forms that create a contact and a source on submit.",
    tables: ["form", "form_field", "submission"], routes: ["/forms", "/f/:slug"], widgets: [],
    prompt: "A form builder: drag-ordered fields, conditional logic, and a hosted public form that creates a contact plus a lead record on submit. Spam protection and a configurable post-submit redirect.",
    needs: ["contacts"],
  },
  {
    id: "sites", name: "Sites, funnels & landing pages", cat: "capture",
    blurb: "Hosted pages with a form and a tracked source per URL.",
    tables: ["page", "funnel", "funnel_step"], routes: ["/sites", "/p/:slug"], widgets: [],
    prompt: "A landing page and funnel builder: multi-step funnels with a hosted page per step, an embedded capture form, and per-step conversion counts.",
    needs: ["forms"],
  },
  {
    id: "chatwidget", name: "Website chat widget", cat: "capture",
    blurb: "Embeddable chat that lands in the same inbox as everything else.",
    tables: ["chat_session"], routes: ["/widget"], widgets: [],
    prompt: "An embeddable website chat widget: a single script tag, an offline mode that captures name and phone, and threads that land in the unified inbox against the matching contact.",
    needs: ["inbox"],
  },
  {
    id: "voiceai", name: "AI voice receptionist", cat: "capture",
    blurb: "Answers the calls nobody picks up, books straight into the calendar.",
    tables: ["call", "call_transcript", "voice_agent"], routes: ["/voice"], widgets: [],
    prompt: "An AI voice agent that answers inbound calls when no human does: greets with the business name, answers hours and service questions from a knowledge base, books into the calendar, and writes a transcript plus summary to the contact record. Always offers a human hand-off.",
    needs: ["calendar"],
  },
  {
    id: "calltracking", name: "Call tracking", cat: "capture",
    blurb: "A number per channel, so you know which ad actually rang.",
    tables: ["tracking_number", "call"], routes: ["/calls"], widgets: [],
    prompt: "Call tracking: provision a phone number per marketing channel, forward to the main line, and attribute each inbound call to its source with recording and duration on the contact timeline.",
    needs: ["contacts"],
  },
  {
    id: "missedcall", name: "Missed-call text-back", cat: "capture", default: true,
    blurb: "The highest-ROI automation a small business can switch on.",
    tables: ["missed_call_rule"], routes: ["/automations/missed-call"], widgets: [],
    prompt: "Missed-call text-back: when an inbound call goes unanswered, immediately send a configurable SMS to the caller and open a conversation thread. Respect quiet hours and skip known spam numbers.",
    needs: ["inbox"],
  },
  {
    id: "socialplanner", name: "Social planner", cat: "capture",
    blurb: "Queue posts across channels from one calendar.",
    tables: ["social_post", "social_account"], routes: ["/social"], widgets: [],
    prompt: "A social planner: connect Facebook, Instagram and Google Business Profile, compose once, schedule to a shared calendar, and show per-post reach and engagement after publishing.",
  },
  {
    id: "admanager", name: "Ad manager", cat: "capture",
    blurb: "Spend and cost-per-lead next to the leads themselves.",
    tables: ["ad_account", "ad_campaign", "ad_spend"], routes: ["/ads"], widgets: [],
    prompt: "An ad manager: pull spend and impressions from Google and Meta, join them to leads by source, and report cost per lead and cost per booked job per campaign.",
    needs: ["leadsource"],
  },
  {
    id: "leadsource", name: "Lead source attribution", cat: "capture", default: true,
    blurb: "Which channel produces booked revenue, not just clicks.",
    tables: ["lead", "source"], routes: ["/leads"], widgets: ["channels"],
    prompt: "Lead source attribution: a horizontal bar chart of new leads by channel for the period, and a trace from source through to booked revenue so a channel is judged on jobs won, not form fills.",
    needs: ["contacts"],
  },

  /* ---------------- nurture ---------------- */
  {
    id: "inbox", name: "Unified conversations inbox", cat: "nurture", default: true,
    blurb: "SMS, email, web chat and social DMs, one thread per person.",
    tables: ["conversation", "message", "channel"], routes: ["/inbox"], widgets: ["conversations"],
    prompt: "A unified conversations inbox merging SMS, email, web chat and Instagram/Facebook DMs into one thread per contact. Unread counts, assignment to a team member, and a reply box that picks the channel the customer last used.",
    needs: ["contacts"],
  },
  {
    id: "convai", name: "Conversation AI", cat: "nurture",
    blurb: "Drafts the reply; a human still presses send.",
    tables: ["ai_thread", "ai_setting", "knowledge_doc"], routes: ["/assistant"], widgets: [],
    prompt: "Conversation AI: draft inbox replies from the contact's history and a business knowledge base, summarise a long thread on open, and answer after-hours messages autonomously only when explicitly enabled. Every AI message is labelled as such and has a one-tap human hand-off.",
    needs: ["inbox"],
  },
  {
    id: "pipeline", name: "Sales pipelines", cat: "nurture", default: true,
    blurb: "Drag-and-drop stages with value and age per card.",
    tables: ["opportunity", "pipeline", "pipeline_stage"], routes: ["/pipeline"], widgets: ["pipeline"],
    prompt: "A kanban opportunities pipeline with configurable stages per pipeline. Each card shows contact, value, days in stage and next action; column headers carry stage totals. Cards go stale and turn amber after a configurable number of days.",
    needs: ["contacts"],
  },
  {
    id: "automation", name: "Workflows & automations", cat: "nurture", default: true,
    blurb: "Trigger, condition, action — with a run history you can audit.",
    tables: ["workflow", "workflow_step", "workflow_run"], routes: ["/automations"], widgets: ["automations"],
    prompt: "A workflow builder: trigger (form submitted, call missed, appointment completed, invoice overdue, tag added, stage changed) then conditions then actions (send SMS/email, wait, add tag, create task, move stage, notify staff). Per-workflow on/off, and a run history with the contact and outcome of every execution.",
  },
  {
    id: "calendar", name: "Calendars & booking", cat: "nurture", default: true,
    blurb: "Staff calendars plus a public booking page that respects them.",
    tables: ["appointment", "service", "staff", "availability"], routes: ["/calendar", "/book"], widgets: ["appointments"],
    prompt: "A calendar module: day and week views per staff member, service durations with buffer time, a public booking page that only offers genuinely free slots, and round-robin assignment when several staff offer the same service.",
    needs: ["contacts"],
  },
  {
    id: "reminders", name: "Appointment reminders", cat: "nurture", default: true,
    blurb: "The cheapest fix for no-shows there is.",
    tables: ["reminder_rule", "reminder_send"], routes: ["/calendar/reminders"], widgets: [],
    prompt: "Appointment reminders: configurable SMS and email reminders at set offsets before an appointment, a confirm/reschedule link in the message, and an automatic follow-up to anyone who no-shows.",
    needs: ["calendar"],
  },
  {
    id: "snippets", name: "Templates & snippets", cat: "nurture",
    blurb: "Stop retyping the same four answers.",
    tables: ["snippet", "template"], routes: ["/templates"], widgets: [],
    prompt: "A shared library of message templates and short snippets with merge fields (first name, appointment time, balance due), insertable from the inbox with a slash command.",
    needs: ["inbox"],
  },

  /* ---------------- close ---------------- */
  {
    id: "leadscoring", name: "Lead scoring", cat: "close",
    blurb: "Who to call first, on a morning with only two hours.",
    tables: ["score_rule", "contact_score"], routes: ["/leads/scoring"], widgets: [],
    prompt: "Lead scoring: rules that add or subtract points on behaviour (form submitted, page revisited, message replied, appointment no-showed) and a sorted call-list view of today's highest-scoring contacts.",
    needs: ["leadsource"],
  },
  {
    id: "proposals", name: "Estimates & proposals", cat: "close",
    blurb: "Send a priced estimate; accept it with a signature.",
    tables: ["estimate", "estimate_line", "signature"], routes: ["/estimates", "/estimates/:id"], widgets: [],
    prompt: "Estimates and proposals: build a priced document with optional line items the customer can toggle, send a public link, capture an e-signature on acceptance, and convert the accepted estimate into an invoice in one click.",
    needs: ["contacts"],
  },
  {
    id: "invoices", name: "Invoicing & payments", cat: "close", default: true,
    blurb: "Send it, take the card, chase what's late.",
    tables: ["invoice", "line_item", "payment"], routes: ["/invoices", "/invoices/:id"], widgets: ["invoices"],
    prompt: "Invoicing: line items with tax, card payment via Stripe, auto-mark paid on webhook, partial payments, and an overdue queue with a one-click reminder. Money stored in integer cents.",
    needs: ["contacts"],
  },
  {
    id: "textpay", name: "Text-2-Pay", cat: "close",
    blurb: "A payment link in the thread the customer is already in.",
    tables: ["payment_link"], routes: ["/pay/:token"], widgets: [],
    prompt: "Text-2-Pay: generate a short-lived hosted payment link for an amount and send it into an existing SMS thread; mark the invoice paid and post a confirmation back into the thread on success.",
    needs: ["invoices", "inbox"],
  },
  {
    id: "paidbooking", name: "Deposits & paid bookings", cat: "close",
    blurb: "A card on file turns a booking into a commitment.",
    tables: ["deposit_rule", "deposit"], routes: ["/calendar/deposits"], widgets: [],
    prompt: "Deposits on booking: require a deposit or a card on file for selected services, apply it to the final invoice, and enforce a configurable cancellation window with an automatic forfeit rule.",
    needs: ["calendar", "invoices"],
  },
  {
    id: "memberships", name: "Packages, plans & courses", cat: "close",
    blurb: "Recurring plans, prepaid sessions, gated content.",
    tables: ["plan", "subscription", "package_balance", "course", "enrollment"], routes: ["/plans", "/courses"], widgets: [],
    prompt: "Memberships and packages: recurring plans via Stripe subscriptions, prepaid session packages that decrement on a completed appointment with the balance shown on the contact record, and optional gated course content for enrolled members.",
    needs: ["invoices"],
  },
  {
    id: "upsells", name: "Order forms & upsells", cat: "close",
    blurb: "One-click add-ons at the moment of payment.",
    tables: ["order_form", "offer", "order"], routes: ["/offers"], widgets: [],
    prompt: "Order forms with one-click upsells and downsells: a checkout page with an order bump, a post-purchase upsell that reuses the stored card, and per-offer conversion reporting.",
    needs: ["invoices"],
  },
  {
    id: "giftcards", name: "Gift cards", cat: "close",
    blurb: "Prepaid balance that brings someone new through the door.",
    tables: ["gift_card", "gift_card_txn"], routes: ["/gift-cards"], widgets: [],
    prompt: "Gift cards: sell a card with a code and balance, redeem partially against an invoice, and track outstanding liability as a figure on the dashboard.",
    needs: ["invoices"],
  },

  /* ---------------- evangelize ---------------- */
  {
    id: "reputation", name: "Reviews & reputation", cat: "evangelize", default: true,
    blurb: "Rating, the unanswered queue, and who to ask next.",
    tables: ["review", "review_source"], routes: ["/reviews"], widgets: ["reviews"],
    prompt: "A reputation module: pull Google and Facebook reviews, show average rating with a star-count breakdown, and keep a queue of unanswered reviews sorted oldest first.",
  },
  {
    id: "reviewrequests", name: "Automated review requests", cat: "evangelize", default: true,
    blurb: "Ask right after the visit, when goodwill is highest.",
    tables: ["review_request"], routes: ["/reviews/requests"], widgets: [],
    prompt: "Automated review requests: trigger an SMS or email a configurable delay after a completed appointment or paid invoice, suppress anyone already asked in the last N months, and report request-to-review conversion.",
    needs: ["reputation", "automation"],
  },
  {
    id: "aireply", name: "AI review replies", cat: "evangelize",
    blurb: "Drafts a reply in the business's voice; the owner approves.",
    tables: ["review_reply"], routes: ["/reviews/replies"], widgets: [],
    prompt: "AI review replies: draft a response to each new review in a configured tone, never auto-publish a reply to anything under four stars, and route negative reviews to the owner with a suggested private follow-up instead.",
    needs: ["reputation"],
  },
  {
    id: "referrals", name: "Referral tracking", cat: "evangelize",
    blurb: "A link per customer, credit where it's due.",
    tables: ["referral_code", "referral"], routes: ["/referrals"], widgets: [],
    prompt: "Referral tracking: issue a unique link or code per customer or partner, attribute new contacts and closed revenue back to the referrer, and show a payout or reward ledger.",
    needs: ["leadsource"],
  },
  {
    id: "loyalty", name: "Loyalty program", cat: "evangelize",
    blurb: "Points or visits, redeemable at checkout.",
    tables: ["loyalty_account", "loyalty_txn", "reward"], routes: ["/loyalty"], widgets: [],
    prompt: "A loyalty program: accrue points per dollar or per visit, define rewards with a point cost, show the balance on the contact record, and redeem against an invoice at checkout.",
    needs: ["invoices"],
  },

  /* ---------------- reactivate ---------------- */
  {
    id: "broadcasts", name: "Email & SMS broadcasts", cat: "reactivate",
    blurb: "Segmented sends with unsubscribe handled properly.",
    tables: ["campaign", "send_log"], routes: ["/campaigns"], widgets: [],
    prompt: "Broadcast campaigns: compose an email or SMS, pick a segment, schedule it, and report delivered/opened/clicked/replied. Enforce per-channel consent, unsubscribe links and quiet hours — a send to a non-consenting contact must be impossible, not merely discouraged.",
    needs: ["segments"],
  },
  {
    id: "segments", name: "Smart lists & segmentation", cat: "reactivate", default: true,
    blurb: "Saved filters that stay current on their own.",
    tables: ["segment", "segment_rule"], routes: ["/segments"], widgets: [],
    prompt: "Smart lists: build a segment from tags, activity, spend, last visit date and lifecycle stage; save it; have membership recalculate continuously so it can be used as an automation audience.",
    needs: ["contacts"],
  },
  {
    id: "lifecycle", name: "Birthday & seasonal campaigns", cat: "reactivate",
    blurb: "Date-triggered sends that run themselves all year.",
    tables: ["lifecycle_campaign"], routes: ["/campaigns/lifecycle"], widgets: [],
    prompt: "Date-triggered campaigns: birthday and anniversary messages, plus seasonal campaigns scheduled once and repeating annually, each with an offer and a tracked redemption.",
    needs: ["broadcasts"],
  },
  {
    id: "winback", name: "Database reactivation", cat: "reactivate",
    blurb: "The list you already paid for, worked properly.",
    tables: ["winback_run"], routes: ["/campaigns/winback"], widgets: [],
    prompt: "Database reactivation: find contacts with no visit in N months, run a staged win-back sequence with an escalating offer, stop the sequence the moment someone replies or books, and report revenue recovered against messages sent.",
    needs: ["broadcasts", "automation"],
  },
  {
    id: "contentai", name: "Content AI", cat: "reactivate",
    blurb: "First drafts for posts, emails and page copy.",
    tables: ["content_draft"], routes: ["/content"], widgets: [],
    prompt: "Content AI: generate first-draft social posts, campaign emails and landing page copy from a short brief plus the business's service list and tone settings. Drafts always land in a review state, never published directly.",
  },

  /* ---------------- operations ---------------- */
  {
    id: "dashboard", name: "Dashboard & KPIs", cat: "ops", locked: true,
    blurb: "Headline numbers and the trend behind them.",
    tables: ["metric_snapshot"], routes: ["/"], widgets: ["kpis", "revenue"],
    prompt: "A dashboard home: four KPI tiles (revenue MTD, bookings, new leads, show rate) each with a period-over-period delta and a progress-to-target meter, plus a revenue-vs-expenses bar chart on a single shared dollar axis.",
  },
  {
    id: "tasks", name: "Tasks & activity log", cat: "ops", default: true,
    blurb: "The small stuff that otherwise falls through.",
    tables: ["task", "activity"], routes: ["/tasks"], widgets: ["tasks", "activity"],
    prompt: "Tasks with due dates and assignees, created by hand or by a workflow, plus a rolling activity feed of everything that happened in the account today.",
  },
  {
    id: "reporting", name: "Reporting", cat: "ops",
    blurb: "Revenue by service and staff, retention, exportable.",
    tables: ["report_view"], routes: ["/reports"], widgets: [],
    prompt: "Reporting: revenue by service and by staff member, new vs returning split, average ticket, show rate, and CSV export on every view. Each report states its date range and timezone explicitly.",
    needs: ["invoices"],
  },
  {
    id: "team", name: "Team & permissions", cat: "ops",
    blurb: "Roles, and what each person is allowed to see.",
    tables: ["user", "role", "permission"], routes: ["/team"], widgets: [],
    prompt: "A team module: invite by email, roles (owner / manager / front desk / provider), and row-level permissions so a provider sees only their own calendar and their own clients.",
  },
  {
    id: "locations", name: "Multi-location", cat: "ops",
    blurb: "Several sites or brands under one login.",
    tables: ["location", "user_location"], routes: ["/locations"], widgets: [],
    prompt: "Multi-location support: scope every record to a location, a switcher in the top bar, per-location staff and services, and a roll-up view that totals across locations for the owner role.",
    needs: ["team"],
  },
  {
    id: "integrations", name: "Integrations & API", cat: "ops",
    blurb: "Webhooks out, API in, so nothing is a dead end.",
    tables: ["api_key", "webhook", "webhook_delivery"], routes: ["/integrations"], widgets: [],
    prompt: "Integrations: outbound webhooks on key events with a delivery log and retry, scoped API keys, and a small REST API over contacts, appointments and invoices so the business is never locked in.",
  },
  /* ---- found only inside the product, not on the marketing site ---- */
  {
    id: "prospecting", name: "Prospecting & local audit", cat: "capture",
    blurb: "Score a local business's online presence, then pitch the gaps.",
    tables: ["prospect", "audit_report"], routes: ["/prospecting"], widgets: [],
    prompt: "A prospecting tool: look up a local business, score its online presence (listing accuracy, review volume and recency, site speed, mobile readiness), generate a shareable audit report, and push the business into the CRM as a lead with the audit attached.",
    needs: ["contacts"],
  },
  {
    id: "triggerlinks", name: "Trackable links", cat: "capture",
    blurb: "Know who clicked, and fire an automation off it.",
    tables: ["trigger_link", "link_click"], routes: ["/links"], widgets: [],
    prompt: "Trackable short links usable in any message: record who clicked and when on the contact timeline, and expose the click as an automation trigger.",
    needs: ["contacts"],
  },
  {
    id: "agentstudio", name: "AI agent studio", cat: "nurture",
    blurb: "Build the agent, feed it a knowledge base, read its logs.",
    tables: ["agent", "agent_version", "knowledge_doc", "agent_log"], routes: ["/agents", "/agents/:id"], widgets: [],
    prompt: "An agent studio: define an AI agent's role, tone, tools and escalation rules; attach a knowledge base of business documents; version each change; and keep an auditable log of every agent action with the ability to replay a conversation and see which knowledge chunk was used.",
    needs: ["convai"],
  },
  {
    id: "products", name: "Products & inventory", cat: "close",
    blurb: "A catalog with stock counts, for anyone who sells a thing.",
    tables: ["product", "variant", "collection", "inventory_item"], routes: ["/products"], widgets: [],
    prompt: "A product catalog: products with variants and prices, collections for grouping, inventory counts that decrement on order, and a low-stock threshold that raises a task.",
    needs: ["invoices"],
  },
  {
    id: "checkouts", name: "Abandoned checkout recovery", cat: "reactivate",
    blurb: "The cart they almost paid for, chased automatically.",
    tables: ["checkout_session"], routes: ["/checkouts"], widgets: [],
    prompt: "Abandoned checkout recovery: record started-but-unfinished checkouts, send a staged reminder sequence with a link back to the same cart, and report recovered revenue against messages sent.",
    needs: ["invoices", "automation"],
  },
  {
    id: "clientportal", name: "Client portal", cat: "evangelize",
    blurb: "One branded place for a customer's bookings, invoices and files.",
    tables: ["portal_user", "portal_document"], routes: ["/portal"], widgets: [],
    prompt: "A branded client portal: the customer signs in to see their upcoming appointments, invoice and payment history, package balance and shared documents, and can rebook or pay without contacting the business.",
    needs: ["contacts", "invoices"],
  },
  {
    id: "attribution", name: "Attribution reporting", cat: "ops",
    blurb: "First touch, last touch, and the revenue behind each.",
    tables: ["touchpoint", "attribution_model"], routes: ["/reports/attribution"], widgets: [],
    prompt: "Attribution reporting: record every touchpoint per contact, report first-touch and last-touch revenue side by side, and make explicit which model a number came from rather than presenting one blended figure.",
    needs: ["leadsource", "reporting"],
  },
  {
    id: "compliance", name: "Consent, audit log & compliance", cat: "ops",
    blurb: "Who saw what, who agreed to what, and when.",
    tables: ["consent_record", "audit_log", "data_request"], routes: ["/compliance"], widgets: [],
    prompt: "Compliance: per-channel consent records with timestamp and source of consent, an immutable audit log of who viewed or changed a contact record, and an export/delete flow for a customer data request. Required before any health-adjacent business can use the system.",
    needs: ["team"],
  },
];

export const byId = Object.fromEntries(MODULES.map(m => [m.id, m]));

/** Expand a selection to include everything the chosen modules depend on. */
export function resolve(ids) {
  const out = new Set(ids);
  let changed = true;
  while (changed) {
    changed = false;
    for (const id of [...out]) {
      for (const dep of byId[id]?.needs ?? []) {
        if (!out.has(dep)) { out.add(dep); changed = true; }
      }
    }
  }
  for (const m of MODULES) if (m.locked) out.add(m.id);
  return MODULES.filter(m => out.has(m.id)).map(m => m.id); // catalog order
}

export const defaultSelection = () => resolve(MODULES.filter(m => m.default).map(m => m.id));
