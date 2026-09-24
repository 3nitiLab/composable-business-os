# Contributing

The most valuable contribution is a **capability definition from a market you
actually work in**. The method is only as good as the catalog behind it, and a
catalog is worth more the more verticals it covers.

## Adding a capability

Add an entry to `MODULES` in [`public/modules.js`](public/modules.js). It appears in
the picker, the preview and the generated specification automatically — there is no
registration step.

```js
{
  id: "waitlist",                     // kebab-free, stable, referenced by `needs`
  name: "Cancellation waitlist",
  cat: "nurture",                     // an id from CATEGORIES
  blurb: "One line an owner would recognise as their own problem.",
  tables: ["waitlist_entry"],         // tables this adds to the data model
  routes: ["/waitlist"],              // routes this adds
  widgets: [],                        // dashboard widget ids, usually empty
  needs: ["calendar"],                // structural dependencies only
  prompt: "What a competent implementer needs to build it correctly, including
           the failure mode that makes it non-trivial.",
}
```

### What makes a good entry

- **`blurb` names the owner's problem, not the feature.** "The cheapest fix for
  no-shows there is" beats "sends reminder notifications."
- **`needs` is 'cannot exist without', never 'pairs nicely with'.** If the capability
  would function standalone in a degraded but honest form, it is not a dependency.
- **`prompt` includes the hard part.** Anyone can specify a happy path. State the
  suppression rule, the race condition, the consent check — the thing that makes a
  naive implementation wrong.
- **One capability per entry.** If the blurb needs an "and", it is two entries.

### Checks before opening a PR

```bash
node --input-type=module -e "import('./public/modules.js').then(({MODULES,byId})=>{
  const bad = MODULES.flatMap(m => (m.needs ?? []).filter(d => !byId[d]).map(d => m.id + ' -> ' + d));
  const dup = MODULES.map(m => m.id).filter((v, i, a) => a.indexOf(v) !== i);
  console.log('broken deps:', bad.length ? bad : 'none');
  console.log('duplicate ids:', dup.length ? dup : 'none');
})"
```

Then run `npx netlify-cli dev`, select your capability in the Studio, and confirm the
generated specification reads correctly.

## Other contributions

- **Methodology corrections.** If a step in [METHODOLOGY.md](METHODOLOGY.md) does not
  survive contact with a real engagement, that is worth an issue.
- **A retargeted catalog.** If you fork this for a different market, open an issue —
  a pointer to it belongs in the README.

## Scope

This repository is a scoping and specification tool. It is not becoming a no-code
builder, a hosted product, or a runtime. Contributions that pull it in those
directions will be declined with thanks.
