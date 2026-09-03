# Stay Safe With RAW — campaign kit

Everything the two pages don't cover: the emails that carry people between the steps, the social copy, the venue pitch, and the things to fix before launch.

---

## 1. The funnel

| Step | Where it happens | What triggers the next step |
|---|---|---|
| 1. Sign up | `raw-stay-safe-landing.html` | Form POST → your endpoint |
| 2. Confirm address | Email A → reply or short address form | Address captured |
| 3. Pack dispatched | Email B | 10–14 day wait |
| 4. Feedback | Email C → `raw-feedback-form.html?id=…&e=…` | Response stored |
| 5. Nudge | Email D, 7 days later, only if no response | — |

The feedback page reads `?id=`, `?e=` and `?n=` from the link, so every response ties back to the signup that received the pack. Build the link as:

```
https://rawprotection.com/feedback?id=SIGNUP_ID&e=EMAIL&n=FIRST_NAME
```

One thing the current flow is missing: you capture name and email at signup but not a postal address. Two options — ask for the address in Email A (keeps the landing page to two fields, which is why conversion will be high), or add address fields to the landing form and lose some signups. I'd keep it as it is and collect the address by email; it also filters out junk signups before you pay for postage.

---

## 2. Emails

### Email A — confirm the signup

**Subject:** Your free RAW pack — where should we send it?
**Preheader:** Two lines and it's on its way. Nothing to pay, now or later.

> Hi [First name],
>
> You're on the list for a free pack of RAW condoms. No catch, no payment, nothing to cancel.
>
> We just need somewhere to send it. Reply to this email with your address, or use the link below:
>
> **[Add my address]**
>
> Once it arrives, give them a go. In a couple of weeks we'll send one short form asking what you thought — that's the only thing we ask for in return, and honest beats glowing.
>
> Stay safe,
> The RAW team
>
> *Plain packaging. Nothing on the outside says what's inside.*

### Email B — dispatched

**Subject:** Your RAW pack is on its way
**Preheader:** Plain packaging. Nothing on the outside.

> Hi [First name],
>
> Your pack went out today and should be with you in [X] working days. It arrives in plain packaging with nothing on the outside.
>
> A few things worth knowing:
>
> - Ten in a box, individually sealed in foil.
> - Water-based lubricant only. Oil-based products — Vaseline, baby oil, lotion — damage latex.
> - Store somewhere cool and dry, out of direct sunlight.
> - One condom, one time. Never reuse.
>
> Full instructions are printed on the box.
>
> We'll be in touch in a couple of weeks to ask what you thought.
>
> Stay safe,
> The RAW team

### Email C — the feedback ask

**Subject:** So — what did you think?
**Preheader:** Nine questions, two minutes. Be blunt.

> Hi [First name],
>
> You've had your RAW pack for a couple of weeks now. This is the bit we asked for.
>
> Nine questions, about two minutes. We're not after five stars — we're after the truth. If the fit was wrong, the lube was thin or the box was too loud, that's exactly what we want to hear, and it's what changes the next production run.
>
> **[Tell us what you thought]**
>
> Thanks for taking part.
>
> The RAW team

### Email D — one nudge, then stop

**Subject:** Last ask, then we'll leave you alone
**Preheader:** Two minutes. Then we're done.

> Hi [First name],
>
> We won't chase this again. If you've got two minutes, the feedback form is here:
>
> **[Tell us what you thought]**
>
> If you'd rather not, that's fine — the pack was free either way. No feedback required, no strings.
>
> The RAW team

### Email E — venue confirmation (for the non-"just me" signups)

**Subject:** RAW for [Venue name] — how many do you need?
**Preheader:** No cost, no contract, no branding you have to display.

> Hi [First name],
>
> Thanks for putting [venue] forward. We'd like to send you a supply for the washrooms, front desk or cloakroom — free, no contract, and no branding you have to put up.
>
> Two quick questions so we send the right amount:
>
> 1. Roughly how many people come through in a week?
> 2. Where would they sit — washroom dispenser, behind the bar, front desk?
>
> Reply with a delivery address and we'll get the first box out. If it moves, we'll top you up.
>
> Stay safe,
> The RAW team

---

## 3. Social copy

The hashtag is **#StaySafeWithRAW** across everything. Every post ends on the same URL.

### Launch post — Instagram / Facebook feed

> We're giving away 100,000 condoms.
>
> Not samples. Not free with purchase. Not a promotion where you spend money first.
>
> Free means free.
>
> Sex is part of life. Protection should be too — and it shouldn't depend on whether you've got money in your pocket, remembered to stop at a shop, or feel comfortable asking for it.
>
> Sign up at rawprotection.com. Name, email, and we'll send you a pack. All we ask is what you thought of them.
>
> #StaySafeWithRAW

### Short feed variants

- *"100,000 free condoms. No catch. That's the whole post."*
- *"No lectures. No judgment. No awkward conversations. Just protection when you need it."*
- *"We'd rather you tried the product and told us the truth than read a review we paid for. 100,000 packs, free, starting now."*
- *"Free with purchase isn't free. Ours is. 100,000 of them."*
- *"Every one of these is 1,000 condoms." (pair with the 100-square grid from the landing page)*

### Story / Reel hooks — first three seconds

1. "We're giving away 100,000 condoms and we're not asking for a penny."
2. "Free with purchase isn't free."
3. "Nobody should have to choose between a night out and staying safe."
4. "Two fields. That's the entire sign-up."
5. "100,000 condoms. £0. Here's the catch — there isn't one."

Story frame sequence: **hook → the number → 'free means free' → how it works in three cards → swipe-up.** Use the vertical assets for these; the wide ones will crop badly.

### X / Threads

> 100,000 free condoms. No purchase, no subscription, no catch.
>
> Sign up, we post you a pack, you tell us what you actually thought.
>
> rawprotection.com #StaySafeWithRAW

### LinkedIn — aimed at venues and partners, not consumers

> We're putting 100,000 condoms into circulation free of charge, through bars, clubs, gyms, hotels, festivals and universities.
>
> If you run a venue, we'll supply you at no cost. No contract, no branding you're required to display. It sits in the washroom or behind the bar and it's there when someone needs it.
>
> Access to protection shouldn't depend on whether someone remembered to stop at a shop. Get in touch if you want in.

### TikTok

Keep it to the hook plus the number on screen. The product shots do the work — no voiceover explaining condoms to people who know what condoms are. Comments will do the rest; the "what's the catch" question in the comments is the campaign's best organic asset, so answer every one of them with the same three words.

---

## 4. Venue outreach

### Cold email / DM to a bar or club

**Subject:** Free condoms for [venue] — no cost, no contract

> Hi,
>
> We're RAW. We're giving away 100,000 condoms and we'd like [venue] to have some.
>
> Here's the whole offer: we send you a box, you put them in the washrooms or behind the bar, they're free to your customers. No cost to you, no contract, no branding you have to display, no minimum. If they go, we top you up.
>
> If that works, reply with a delivery address and roughly how busy you get, and we'll send the first lot.
>
> [Name], RAW — rawprotection.com

### Who to approach, in order of return

1. **Student unions and university welfare teams** — highest volume per contact, and they already have distribution points and a sexual health remit.
2. **Sexual health clinics and charities** — they will take stock, but ask what certification they need on file first.
3. **Nightclubs and late bars** — washroom dispensers, high visibility, the right context.
4. **Gyms and combat sports clubs** — changing rooms, weekly footfall.
5. **Festivals and event organisers** — one contact, enormous volume, but book months ahead.
6. **Hotels** — slower, more procurement, but good for brand placement.
7. **Barbers and tattoo studios** — small volume, but they're where the conversation is already relaxed.

---

## 5. Fix before launch

**Artwork.** Several of the generated posters have text errors baked into the pixels. Don't print or post these as they are:

- Vertical hero poster: reads "100,000 FREE **CONDOOMS**."
- Bar mockup: reads "100,000 FREE **FREE** CONDOMS."
- Multiple renders have garbled pack copy — "NATURAL BUSSER LATEX", "NATURAL RLBBIISD LAFE0", and a foil reading "STAY REDS WITH RAW".

The two clean assets are the "Protect what matters" banner and the "Protect yourself. Protect others." vertical. For everything else, re-set the headline type over the product photography rather than trying to patch the render.

**Copy.** Your Option 1 and Option 2 promise different things — Option 1 is a straight giveaway, Option 2 makes feedback the exchange. The pages use Option 2's mechanic with Option 1's tone. Pick one and keep it identical across the site, the emails and the ads, because "no catch" plus an obligation is exactly the inconsistency people will pick at in the comments.

**Practical.** Before the first email goes out:

- [ ] Postage costed per pack, including the plain outer.
- [ ] A cap on packs per person and a way to enforce it (email dedupe at minimum).
- [ ] Age check — a self-declared 18+ box is what's on the page; check whether that's sufficient for your fulfilment partner.
- [ ] Territory — the page says UK addresses. Decide before you advertise internationally.
- [ ] A privacy policy live at a real URL, linked from both forms. You're collecting names, emails and addresses tied to sexual health data; under UK GDPR that combination deserves proper handling, and it's worth getting an actual look at it rather than a template.
- [ ] Product certification documents to hand. The first venue or clinic that asks will ask for CE/UKCA marking and batch records, and "we'll find out" is a bad first answer.
- [ ] Unsubscribe link in every email, working, one click.

**Claims to avoid.** Keep to what the box says: natural rubber latex, lubricated, single use, five year shelf life. Don't publish comparative claims about thinness, strength or feel against other brands unless you can evidence them — and don't imply the product eliminates risk. "Reduces the risk of pregnancy and sexually transmitted infections when used correctly" is the safe form of words and it's already in the landing page footer.

---

## 6. What to measure

Six numbers, weekly:

1. **Signups** — and the split between "just me" and venue requests.
2. **Address completion rate** — the step most likely to leak. If it drops below about 60%, move the address onto the landing page and accept the lower signup number.
3. **Packs dispatched** against the 100,000, which is what the square grid on the landing page shows.
4. **Feedback response rate.** Anything above 15% on a free product is healthy; the honest answer is that most people won't reply.
5. **Average score, and the fault rate** — the "did anything go wrong" answers matter more than the star rating. A tear or slip rate that clusters anywhere near a percent is a manufacturing conversation, not a marketing one.
6. **Cost per completed feedback.** That's the real price of the campaign: unit cost plus postage divided by responses, not by packs sent.
