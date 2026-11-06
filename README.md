# free forever

### 42 AI coding tools, sorted by how free they really are

**13 free forever · 24 limited · 5 reference**

---

Free forever is a directory of AI coding tools that cost you nothing to start — and it is built
around one uncomfortable fact: **"free" is not one thing.**

An ad-funded agent that will never charge you and a 5-credit trial that dies on Tuesday
look identical on a marketing page. Sort them wrong and you pick the trial, love it, and
get the bill. So this list splits them first, then tells you the catch.

**Nobody has paid to be on it.** No affiliate links, no referral codes, no sponsorships.

**Published version:** every push to `main` redeploys the site automatically — see
[Publishing it](#publishing-it) at the bottom if you want your own copy online.

> [!IMPORTANT]
> **How to open it:** double-click `index.html`. It opens in your browser like any
> website. No install, no account, no terminal. It works offline except for the fonts.

---

## The three tiers

The list opens on the first one. Here is what each means before you scroll.

| Tier | What it means |
|:--|:--|
| 🟢 **Free forever** — 13 | No card, no expiry. An advertiser, a company, a university or your own graphics card pays instead of you. Use it for as long as you like. |
| 🟡 **Limited free** — 24 | A genuine free allowance that runs out — monthly credits, a one-time grant, an unpublished cap, or a "promotional period" the company can switch off. Try it; do not build your week around it. |
| ⚪ **Reference** — 5 | Not tools. Directories that check their own rows, and student bundles that need verification. |

**The test that separates them:** ask *who pays the inference bill next month?*
If the answer is an advertiser or the vendor, it survives. If the answer is "you, once
this runs out," it is a trial wearing a free-plan costume.

---

## Start here, depending on you

Skip the browsing. Pick the row that sounds like your situation.

| If you are… | Start with | Because |
|:--|:--|:--|
| **Completely new, want to try in a browser tab** | [freecode](https://freecode.sh/) | Runs on the web. No install, no card, no API key. |
| **On a phone right now** | [VibeFree](https://vibefree.dev/) | Chat works with no login at all. Also a VS Code extension later. |
| **On Windows or Linux, want a real agent** | [Freebuff](https://freebuff.com/) | 30 free hours a day, installers for every OS including ARM. |
| **On a Mac, want to do security work** | [free-pi](https://freepi.ai/) | 26 models including "Defense" models that will not refuse lawful work on your own systems. |
| **Want the strongest models for zero money** | [Google Antigravity](https://antigravity.google/) | Runs Claude Opus/Sonnet and Gemini on a $0 plan. No ads at all. |
| **Want a developer account that pays you back** | [ADCode](https://adcode.bluethenics.com/) | Half of the ad revenue its sponsor cards earn is credited to you. |
| **Already pay for Claude or ChatGPT** | [idlepay](https://www.idlepay.co/) | Does not give you a model — pays you 50% for the time your AI spends thinking. |
| **Have a decent GPU and hate accounts** | [Ollama](https://ollama.com/) | Local models. No account, no key, no telemetry. Nothing can be taken away. |
| **A student** | [GitHub Student Pack](https://education.github.com/pack) | ~80 partner offers, from one verification. |

**Is Windows your machine and Linux a stranger?** Start with Freebuff or freecode.
A few entries here are Mac/Linux-only or PowerShell-first, and the entries say so.

---

## What you should know before you paste anything

Every tool here sends your prompt somewhere you do not control. The answers differ a lot,
and this is the part the product pages bury.

> [!WARNING]
> **Five things, plainly:**
>
> 1. **free-pi keeps the most.** Its consent screen says your sessions are saved as traces,
>    used to train models, and *"may be shared or sold to third parties"* — with no opt-out
>    once you accept.
> 2. **Freebuff's ad model reads your sessions.** Messages, agent traces, files and usage
>    may be analysed to personalise ads and train ad models.
> 3. **VibeFree reads the first 1,500 characters of every message** to pick an ad, keeps only
>    topic labels, and drops them after 30 minutes. The message itself is not kept for ads.
> 4. **idlepay reads one timestamp.** That is all.
> 5. **Ollama reads nothing, because nothing leaves your machine.**

So: **keep passwords and API keys out of prompts.** Never paste a `.env` file. And if you
are on a work laptop, ask before pasting company code — that is your employer's call, not
the free plan's.

---

## How to read an entry

Every entry gives you the same eight things, including the awkward ones:

```
Name + where it lives     ← what it is, in one line
Free                      ← the actual allowance, in the vendor's own numbers
Paid by                   ← who is paying, and what they want
Runs on                   ← platforms you need
Licence                   ← can it be taken away or forked?
Why it is on this page    ← the honest reason it made the cut
THE CATCH (red box)       ← the thing the landing page does not mention
Evidence + date           ← "vendor page" or "directory", and when it was read
```

Two labels on every entry tell you how much to trust it:

- **`vendor page`** — read on the company's own site. Their numbers, their words.
- **`directory`** — that company did not state it, so it came from a directory that
  re-checks its rows on a schedule. Weaker. Follow the link if it matters.

**Anything marked `+2 more in the full entry`** has extra catches kept out of the short
list so the page stays readable. On a phone you get all of them.

---

## Six questions, before you install anything

1. **Who reads my prompts?** — see the warning above. It varies wildly.
2. **What is the allowance measured in?** — hours, agent time, credits per turn, or
   responses per 5 hours. Two tools saying "a daily allowance" can differ fifty-fold.
3. **Is the free model the good model?** — usually not. Freebuff's free tier is one slow
   DeepSeek model; DeepAI's free chat excludes its good models.
4. **What happens at the limit?** — resets later, silently gone, or an invite to a card.
5. **Can it be taken away?** — yes. Gemini CLI's free tier ran at 1,000 requests a day, was
   cut in March 2026 and switched off on 18 June 2026. Prefer the open-licence ones.
6. **Does it need a card, an account, or both?** — none of the 13 needs a card. Some need an
   account (GitHub, Google, AWS) and the entry says which.

---

## Things that are not what they look like

Worth saying out loud, because the names mislead:

- **Idlen and idlepay are not coding agents.** They pay you for ad time during AI waits.
  Bring your own Claude or ChatGPT; they will not write code for you.
- **DeepAI's free plan does not include its API.** Its own docs say API access needs Pro.
- **Freebuff Cloud is deprecated.** Its page says so. Use the desktop or browser app.
- **TRAE's "free" is a one-time allowance**, not a monthly one.
- **"No API key required" is not the same as "free."** Several tools still require an
  account, and every one of them still meters you.

---

## What this page does not do

Honest limits, up front:

- **Nothing was installed or signed up for.** Every number is the vendor's own claim,
  unmeasured by us. Per-turn allowances, speed and code quality are untested here.
- **It is not a quality ranking.** Being listed means "this is genuinely free to start",
  not "this is good."
- **Free tiers rot.** Everything was read on **6 November 2026**. Re-check the linked
  sources before you rely on any allowance.
- **"Top pick" means approachable, not best.** It flags an easy, well-documented way in —
  not the highest-quality output.

---

## Words that get thrown around

| Term | What it actually means |
|:--|:--|
| **Agent** | A tool that edits your files and runs commands, not just chats. |
| **Terminal / CLI** | A text window. Powerful, but it is a black box if you are new. |
| **API key** | A password for a model. Some tools need one; the free-forever ones do not. |
| **BYOK** | "Bring your own key" — the tool is free, the model is your bill. |
| **Open weight / local model** | A model small enough to run on your own computer. |
| **Token** | The unit models are billed in. ~750 words ≈ 1,000 tokens. |
| **Agent time / hours** | How some tools meter you — the clock, not the words. |
| **Offerwall** | A page of surveys and sign-ups. Finish one, earn credits. Screenouts pay nothing. |
| **Inference** | Running the model. The thing that costs money. |

---

## The one rule

Every tool here processes your prompt somewhere you do not control.

Free is a perfectly fair trade — **as long as you can name what you handed over.**
If you cannot name it, do not paste it.

---

## Publishing it

You do not need this to *read* the page — double-clicking `index.html` works forever.
This is only for putting your own copy on the web so you can share a link.

The workflow is already written: `.github/workflows/deploy.yml`. On every push to `main`
it checks the site is not broken, then publishes it to GitHub Pages. There is no build
step, because the folder *is* the website.

**One-time setup, in this order** (doing it in the other order is the usual mistake):

1. Create an empty repository on GitHub and push this folder to it:
   ```bash
   git init && git add -A && git commit -m "free forever"
   git remote add origin https://github.com/YOUR-NAME/free-forever.git
   git branch -M main && git push -u origin main
   ```
2. On GitHub open **Settings → Pages** and set **Source** to **GitHub Actions**.
   Not "Deploy from a branch" — the workflow cannot publish until this is set.
3. Push again (or open the **Actions** tab and re-run the workflow). The first run
   after step 2 is what actually goes live.
4. Your address appears in the **Actions** run summary when it finishes:
   `https://YOUR-NAME.github.io/free-forever/`

**What the check catches before anything goes live:** a missing or empty file, a
JavaScript syntax error, an entry with a missing field, a bad tier, an empty catch list,
or a duplicate ID. It also prints the tier counts, so a run tells you
`entries: 42 — forever 13, limited 24, reference 5`.

**If it fails**, the error names the file and the entry, for example
`::error::idlen is missing howPaid`. Fix that entry, push again.

**If the deploy step fails with a permissions error**, step 2 was skipped or set to the
wrong source. Set it to **GitHub Actions** and re-run.

**Custom domain:** add it in **Settings → Pages → Custom domain**, then put the domain in
a file called `CNAME` at the top of the folder. The workflow publishes that file with
everything else.

---

<p align="center">
<sub>

Compiled 6 November 2026 · 42 entries · 13 free forever · 24 limited · 5 reference<br>
Sources are linked on every entry · no affiliate links · no sponsorships<br>
Check the date before you trust a number. Free tiers rot fast.

</sub>
</p>
