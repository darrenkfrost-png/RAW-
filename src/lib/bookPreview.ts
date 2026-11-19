import type { Book, BookPage } from "../data/books";

/**
 * THE ONE PLACE THE READER'S PAYWALL IS DEFINED.
 *
 * ⚠️ WHY THIS FILE EXISTS. These rules used to live inside LivingBookEngine as
 * a local constant and five inline `.slice(0, LIMIT)` calls. Nothing outside
 * the component could see them, so the test suite that claimed to verify them
 * re-typed each rule inside the test and then asserted its own copy:
 *
 *     const checkOcrPermission = (i) => i < FREE_PREVIEW_PAGE_LIMIT;
 *     assert(checkOcrPermission(10) === false);
 *
 * That is an assertion about arithmetic. All five tests were built that way,
 * not one of them called a single line of the application, and the suite
 * printed "ALL FAIL-CLOSED SECURITY CRITERIA PROGRAMMATICALLY VERIFIED" over
 * the top. It could not have failed if the reader had leaked every premium
 * page — and for a long while the reader could not even be opened, which it
 * also could not notice.
 *
 * So every rule is a function here, the component calls them, and the tests
 * call the same ones. A test can now be wrong about the paywall only by being
 * wrong about the code that ships.
 *
 * ⚠️ INDICES ARE ZERO-BASED, PAGE NUMBERS ARE ONE-BASED. Page 11 — the first
 * premium page — is index 10. Mixing those up moves the paywall by one page,
 * so the conversion lives in `pageNumberOf`/`indexOfPageNumber` rather than
 * being done by hand at each call site.
 */

/** Pages 1-10 are the public preview. Page 11 onwards is premium. */
export const FREE_PREVIEW_PAGE_LIMIT = 10;

export const pageNumberOf = (index: number) => index + 1;
export const indexOfPageNumber = (pageNumber: number) => pageNumber - 1;

/** The first index a guest may not read. */
export const FIRST_PREMIUM_INDEX = FREE_PREVIEW_PAGE_LIMIT;

/** Is this page behind the paywall? The single question everything else asks. */
export const isPremiumPage = (index: number) => index >= FREE_PREVIEW_PAGE_LIMIT;

/** The last page of the free preview, which is where the reader opens to. */
export const lastFreeIndex = () => FREE_PREVIEW_PAGE_LIMIT - 1;

/**
 * Every rule below is the same rule wearing a different hat, and they are kept
 * separate on purpose: each is a place premium text could escape, and naming
 * them means a test can name them too.
 */
export const readablePages = (book: Book): BookPage[] => book.pages.slice(0, FREE_PREVIEW_PAGE_LIMIT);
export const searchablePages = (book: Book): BookPage[] => readablePages(book);
export const exportablePages = (book: Book): BookPage[] => readablePages(book);

/** Copying to the clipboard, annotating, and handing text to the AI bridge. */
export const canCopyPage = (index: number) => !isPremiumPage(index);
export const canAnnotatePage = (index: number) => !isPremiumPage(index);

/**
 * What the video/AI bridge is allowed to be told about a page. Returns null for
 * a premium page rather than an empty object, so a caller that forgets to check
 * gets nothing it can accidentally forward.
 */
export const bridgePayload = (book: Book, index: number): { bookTitle: string; pageText: string } | null => {
  if (isPremiumPage(index)) return null;
  const page = book.pages[index];
  if (!page) return null;
  return { bookTitle: book.title, pageText: page.content };
};
