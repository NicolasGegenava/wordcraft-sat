# Wordcraft

A simple SAT vocabulary quiz: a short definition, four shuffled words, and instant feedback. Includes 990 words, 20-question rounds, and saved missed-word notes.

**No accounts. No API keys. No database. No installation required to play.**

**[Play Wordcraft online](https://nicolasgegenava.github.io/wordcraft-sat/)** · [Open the single-file version](https://nicolasgegenava.github.io/wordcraft-sat/wordcraft.html)

## Play on your computer

Download **wordcraft.html** from this repository and open it in your browser. It contains the entire quiz and works without an internet connection. You can send this one file to someone else.

Alternatively, download the repository ZIP, extract it, and open **index.html**. Keep the five website files together.

Missed-word notes are saved in your browser. They do not sync between devices or addresses. Browsers handle storage for downloaded files differently; use a hosted copy for a stable address. Private browsing or clearing browser data can remove notes. If saving is unavailable, the quiz says so.

## Put your own copy online with GitHub Pages

1. Fork this repository into your GitHub account. Keep it public for GitHub Pages on GitHub Free.
2. If GitHub asks, enable workflows on the fork's **Actions** tab.
3. Open **Settings → Pages**. Under **Build and deployment**, select **GitHub Actions** as the source.
4. Open **Actions → Publish website → Run workflow** and run it on `main`.
5. When the run succeeds, open the website link shown in the deployment.

After this one-time setup, pushes to `main` publish automatically. Visitors can play without a GitHub or ChatGPT account. Your repository's Settings → Pages screen shows the website address.

Official instructions: [GitHub Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Use any static website host

Upload these six files into the public folder of your host (the last one powers the offline download):

```text
index.html
style.css
vocab.js
notes.js
app.js
wordcraft.html
```

Set no build command and no server runtime. The start page is `index.html`. Relative asset paths work both on a domain and in a subfolder. You can also rename the self-contained `wordcraft.html` to `index.html` and upload that single file.

## How to play

- Choose one of the four words, or press **1–4**.
- Read the feedback, then select **Next question** or press **Enter**.
- After 20 questions, review the definitions you missed, your answers, and the correct words.
- Open **My missed-word notes** below the quiz to revisit saved mistakes. Repeat misses update the count.

Definitions are short and have no example-sentence clues. Each word appears once in the current shuffled deck before that deck is refilled; reloading starts a new deck. Only missed-word notes persist.

## Make changes

Edit `style.css` for colors and layout, `app.js` for quiz behavior, and `notes.js` for saved notes. `vocab.js` contains entries with `word`, `pos`, and `definition` fields. Keep definitions short, with no answer word inside them. The quiz expects at least 20 words and enough distinct choices per part of speech.

The five website files are the editable source. `wordcraft.html` is a generated convenience copy: after edits, regenerate it using Node.js 20 or newer:

```sh
node scripts/package.mjs
```

This also prepares `_site/` for deployment. The GitHub workflow regenerates the copy it publishes, so no build tools are needed on your own computer to edit and publish through GitHub.

To run the checks, use:

```sh
npm test
```

No `npm install` is needed; there are no dependencies. To run checks directly: `node scripts/check-quiz.cjs`, `node scripts/check-notes.cjs`, and `node scripts/check-package.cjs`.

## Privacy

The quiz makes no analytics or API requests. Answers and notes stay in browser storage. The only external link is the credited source PDF. Hosting providers may maintain their own access logs. This static quiz is a practice tool, not a secure examination system: answers are present in the downloadable word list.

## Credits and reuse

The vocabulary list comes from [SparkNotes: The 1000 Most Common SAT Words](https://img.sparknotes.com/content/testprep/pdf/sat.vocab.pdf). This implementation contains 990 distinct entries from the available transcription, with a few corrected or shortened definitions. The list's title is not a claim about current SAT frequency. Wordcraft is not affiliated with SparkNotes or College Board.

The original application code is MIT-licensed. Third-party vocabulary content is excluded from that code license; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
