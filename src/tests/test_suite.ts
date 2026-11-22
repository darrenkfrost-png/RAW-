/**
 * THE READER'S PAYWALL, TESTED AGAINST THE CODE THAT SHIPS.
 *
 * ⚠️ WHAT THIS REPLACES, AND WHY IT IS WORTH READING BEFORE EDITING IT.
 *
 * Every one of the five tests here used to define the rule it was testing
 * inside its own body and then assert its own definition:
 *
 *     const checkOcrPermission = (i) => i < FREE_PREVIEW_PAGE_LIMIT;
 *     assert(checkOcrPermission(10) === false, "Page 11 OCR must be restricted.");
 *
 *     for (let idx = 0; idx < FREE_PREVIEW_PAGE_LIMIT; idx++) {
 *       const isLocked = idx >= FREE_PREVIEW_PAGE_LIMIT;   // always false
 *       assert(!isLocked, `Page index ${idx} should be public.`);
 *     }
 *
 * Those are assertions about arithmetic. The second one checks that the numbers
 * 0 to 9 are less than 10. Not one of the five called a single line of the
 * application — the only thing imported from it was the book DATA — and over
 * the top the suite printed:
 *
 *     ALL FAIL-CLOSED SECURITY CRITERIA PROGRAMMATICALLY VERIFIED.
 *
 * It would have printed that if the reader had leaked every premium page. It
 * did print it while the reader could not be opened at all: /defrost's desktop
 * was being squashed into a 171px strip by a leftover `filter: blur(0px)` in
 * the shell, so all seven of its controls were unclickable on the live site for
 * who knows how long. A suite that never touches the app cannot notice that the
 * app is unreachable.
 *
 * So: the rules now live in src/lib/bookPreview.ts, the reader calls them, and
 * these tests call the same ones. A test can be wrong about the paywall only by
 * being wrong about the code that ships. The last test guards the arrangement
 * itself — it fails if the reader starts defining the rule a second time.
 *
 * This is NOT the whole paywall story, and saying so is the point of the
 * closing summary: these are unit tests over the rules. That the reader really
 * renders a lock screen at page 11, with no premium text in the page source, is
 * was checked in the browser by scripts/readerlock.mjs — RETIRED 2026-11-22,
 * because the only page that mounted the reader (/defrost) was removed at the
 * founder's request. These rules still hold and are still tested; nothing on
 * the site renders them at present. See the note at the top of that probe.
 */
import { booksData } from "../data/books";
import {
  FREE_PREVIEW_PAGE_LIMIT,
  FIRST_PREMIUM_INDEX,
  isPremiumPage,
  lastFreeIndex,
  readablePages,
  searchablePages,
  exportablePages,
  canCopyPage,
  canAnnotatePage,
  bridgePayload,
} from "../lib/bookPreview";
import fs from "node:fs";
import path from "node:path";

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(msg);
}

function runTest(name: string, testFn: () => void) {
  try {
    testFn();
    passed++;
    console.log(`[PASS] ${name}`);
  } catch (error: any) {
    failed++;
    console.error(`[FAIL] ${name}\n       ${error.message}`);
  }
}

/* ⚠️ THE MARKER IS THE EVIDENCE. Every premium page in the data begins
   "SECRET CONTENT - ". If that ever stops being true, the leak tests below stop
   proving anything — they would be searching for a string that is nowhere in
   the data and finding it nowhere, which reads exactly like a pass. So the
   marker's presence is asserted first, and the count is reported. */
const MARKER = "SECRET CONTENT";
const everyBook = booksData;

console.log("\nREADER PAYWALL — unit tests over the shipped rules\n");

runTest("the test data still marks its premium pages, so the leak tests mean something", () => {
  assert(everyBook.length > 0, "there are no books to test");
  let marked = 0;
  let premiumPages = 0;
  for (const book of everyBook) {
    assert(
      book.pages.length > FREE_PREVIEW_PAGE_LIMIT,
      `"${book.title}" has ${book.pages.length} pages; a book needs more than ${FREE_PREVIEW_PAGE_LIMIT} for there to be a paywall to test`,
    );
    book.pages.forEach((page, idx) => {
      if (!isPremiumPage(idx)) return;
      premiumPages++;
      if (page.content.includes(MARKER)) marked++;
    });
  }
  assert(premiumPages > 0, "no book has a page past the preview limit");
  assert(
    marked === premiumPages,
    `${premiumPages - marked} of ${premiumPages} premium pages carry no "${MARKER}" marker — the leak tests below would pass vacuously`,
  );
  console.log(`       ${premiumPages} premium pages across ${everyBook.length} books, all marked`);
});

runTest("the boundary sits between page 10 and page 11, counted from the shipped rule", () => {
  // Not a restatement of the rule: these are the shipped function's answers.
  assert(isPremiumPage(lastFreeIndex()) === false, "the last free page is being treated as premium");
  assert(isPremiumPage(FIRST_PREMIUM_INDEX) === true, "the first premium page is being treated as free");
  assert(lastFreeIndex() === FREE_PREVIEW_PAGE_LIMIT - 1, "lastFreeIndex disagrees with the limit");
  // Page numbers are 1-based; the paywall must fall after page 10, not page 9 or 11.
  assert(lastFreeIndex() + 1 === 10, `the free preview ends at page ${lastFreeIndex() + 1}, not page 10`);
  assert(FIRST_PREMIUM_INDEX + 1 === 11, `the paywall starts at page ${FIRST_PREMIUM_INDEX + 1}, not page 11`);
});

runTest("no premium text reaches the pages the reader will render", () => {
  for (const book of everyBook) {
    const pages = readablePages(book);
    assert(pages.length === FREE_PREVIEW_PAGE_LIMIT, `"${book.title}" offers ${pages.length} readable pages`);
    const leaked = pages.filter((p) => p.content.includes(MARKER)).map((p) => p.pageNumber);
    assert(leaked.length === 0, `"${book.title}" would render premium text on page(s) ${leaked.join(", ")}`);
  }
});

runTest("no premium text reaches the search index", () => {
  for (const book of everyBook) {
    const pages = searchablePages(book);
    const leaked = pages.filter((p) => p.content.includes(MARKER)).map((p) => p.pageNumber);
    assert(leaked.length === 0, `searching "${book.title}" could surface page(s) ${leaked.join(", ")}`);
    // And the real question a visitor would ask: does a premium phrase match?
    const phrase = book.pages[FIRST_PREMIUM_INDEX].content.split(" ").slice(2, 6).join(" ").toLowerCase();
    const hits = pages.filter((p) => p.content.toLowerCase().includes(phrase));
    assert(hits.length === 0, `the premium phrase "${phrase}" is findable in "${book.title}"`);
  }
});

runTest("no premium text reaches an export", () => {
  for (const book of everyBook) {
    const pages = exportablePages(book);
    assert(pages.length === FREE_PREVIEW_PAGE_LIMIT, `exporting "${book.title}" yields ${pages.length} pages`);
    const leaked = pages.filter((p) => p.content.includes(MARKER)).map((p) => p.pageNumber);
    assert(leaked.length === 0, `an export of "${book.title}" would contain page(s) ${leaked.join(", ")}`);
  }
});

runTest("no premium text reaches the clipboard, the notes, or the AI bridge", () => {
  for (const book of everyBook) {
    assert(canCopyPage(lastFreeIndex()) === true, "the last free page cannot be copied");
    assert(canCopyPage(FIRST_PREMIUM_INDEX) === false, "a premium page can be copied");
    assert(canAnnotatePage(FIRST_PREMIUM_INDEX) === false, "a premium page can be annotated");

    const free = bridgePayload(book, lastFreeIndex());
    assert(free !== null, "the bridge refuses a free page");
    assert(!free!.pageText.includes(MARKER), "the bridge payload for a free page contains premium text");
    assert(bridgePayload(book, FIRST_PREMIUM_INDEX) === null, "the bridge hands out a premium page");
    // Past the end of the book must also be refused, not crash.
    assert(bridgePayload(book, book.pages.length + 5) === null, "the bridge answers for a page that does not exist");
  }
});

/* ⚠️ THE RULE MUST EXIST IN EXACTLY ONE PLACE, or this suite drifts back into
   testing a copy. The reader is read as text and checked for a second
   definition: a bare `10`, or its own slice of the page list. This is the test
   that would have caught the old arrangement. */
runTest("the reader defines the paywall nowhere — it imports it", () => {
  const file = path.resolve(process.cwd(), "src/components/LivingBookEngine.tsx");
  const source = fs.readFileSync(file, "utf8");
  assert(
    /from ["']\.\.\/lib\/bookPreview["']/.test(source),
    "LivingBookEngine does not import the paywall rules from src/lib/bookPreview",
  );
  const redefinitions = [
    [/const\s+FREE_PREVIEW_PAGE_LIMIT\s*=/, "it declares its own FREE_PREVIEW_PAGE_LIMIT"],
    [/\.slice\(\s*0\s*,\s*10\s*\)/, "it slices the page list with a bare 10"],
    [/>=\s*10\b/, "it compares a page index against a bare 10"],
  ] as const;
  const found = redefinitions.filter(([re]) => re.test(source)).map(([, why]) => why);
  assert(found.length === 0, `the paywall is defined twice — ${found.join("; ")}`);
});

console.log(`\n${passed} passed, ${failed} failed`);
console.log(
  failed
    ? "DO NOT PUSH.\n"
    : `The reader's paywall rules hold for all ${everyBook.length} books. This covers the RULES only —\n` +
        "that a reader renders a lock screen at page 11 was proven in the browser by\n" +
        "scripts/readerlock.mjs, now retired: /defrost, the only page that mounted the\n" +
        "reader, was removed on 2026-11-22. No page renders the reader today.\n",
);
process.exit(failed ? 1 : 0);
