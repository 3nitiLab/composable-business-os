# Intake

A question-by-question intake that turns what you know about a business into a
proposed solution card: **business, pain points, tech stack, and a screen-by-screen
table of features**, one page per business, the same layout as a 3nitiLab portfolio.

It sits beside the Studio and does not change it. It reads the same catalog
(`public/modules.js`), so every card also carries a Studio config: the capabilities
its screens need, dependencies resolved.

## Run it

No install. Node 18+.

```bash
node intake/run.mjs                              # asks the questions, saves the answers, writes the card
node intake/run.mjs --fill answers.json          # asks only what the file doesn't answer yet
node intake/run.mjs a.json b.json --pdf          # renders from saved answers; several = portfolio.html too
node intake/run.mjs --screens                    # screen ids, for the "built" / "later" answers
```

Output goes to `intake/out/` (git-ignored) or `--out <dir>`: for each business
`<slug>.html`, `.md`, `.studio.json`, and `.pdf` with `--pdf` (uses local Chrome).

Try it on the fictional example:

```bash
node intake/run.mjs intake/examples/rivera-plumbing.json
```

## Files

| File | What it is |
|---|---|
| `questions.js` | The questionnaire. Conditional questions carry a `when`. |
| `solution.js` | Answers → pain points, tech stack, screens. Each screen names the catalog capabilities it uses. |
| `render.js` | The card (HTML, print-ready) and a Markdown version. |
| `run.mjs` | CLI: ask, save, render, print. |

## Rules it keeps

- **Status is stated, not implied.** Letter of interest and quoted → every row says *Proposed*.
  Paid work → each row is *Built*, *Partly built* or *Next / requested* from the answers.
- **Nothing is added that the answers don't support.** A screen appears only when an answer calls for it.
- **Tools the owner wants to keep are named as kept.** The build sits alongside them.
- An AI assistant answers only from owner-approved text when the owner asks for that guardrail.

Answer files about real clients hold client data. Keep them out of this repository.
