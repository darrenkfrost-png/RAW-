/**
 * EVERY WAY THROUGH THIS SITE, WRITTEN ONCE.
 *
 * ⚠️ WHY THIS FILE EXISTS. The same destinations were spelled out in four
 * separate places — the header strip, the left rail, the Explore mega menu and
 * the phone menu — and they had drifted apart. The rail offered Academy,
 * Performance, Knowledge and The Vault; the header offered none of them. The
 * mega menu offered four category links and called itself "Explore
 * Everything". The phone menu was the only list that named the protocol
 * builder. So what a visitor could reach depended on which piece of furniture
 * they happened to open, which is the honest reason people said they could not
 * work out how to use it.
 *
 * Now there is one list. Every surface reads it, so a page is either reachable
 * from all of them or from none, and adding a page means adding one line here.
 *
 * ⚠️ PLAIN ENGLISH IN THE LABELS. The rail called the home page "Terminal",
 * the shop "Arsenal" and the knowledge base "Database". The machine-code
 * styling is the brand and it stays — but a visitor should not have to decode
 * a label to find the shop. The names below say what the thing is.
 */

export interface NavItem {
  label: string;
  /** A route, or omitted when the item opens a panel instead. */
  to?: string;
  /** Which panel this opens: resolved by the component that renders it. */
  opens?: 'store' | 'search' | 'stack' | 'settings' | 'wallpaper' | 'manual' | 'screensaver';
  /** One line of plain English, shown in the directory. */
  note?: string;
}

/**
 * The destinations shown as named buttons in the top bar, in order.
 *
 * ⚠️ THIS ROW IS NOT A SELECTION, IT IS A PRIORITY ORDER. The bar measures
 * what fits and shows the leading items (see Navbar); the rest are always in
 * the directory, and on a phone the row scrolls so none of them are lost.
 */
export const PRIMARY: NavItem[] = [
  { label: 'Shop', to: '/shop', note: 'Every product RAW makes' },
  { label: 'Films', to: '/films', note: 'The brand films' },
  { label: 'The Vault', to: '/watch', note: '116 films, searchable by what was said' },
  { label: 'Protocols', to: '/protocol-stacks', note: 'Ready-made stacks' },
  { label: 'Academy', to: '/academy', note: 'Training and technique' },
  { label: 'Knowledge', to: '/knowledge-core', note: 'What each ingredient does' },
  { label: 'Performance', to: '/performance-system', note: 'The system behind the products' },
  { label: 'Our Story', to: '/our-story', note: 'Where RAW came from' },
];

export interface NavGroup {
  title: string;
  items: NavItem[];
}

/** Every page and every panel on the site, grouped the way a visitor thinks. */
export const DIRECTORY: NavGroup[] = [
  {
    title: 'Shop',
    items: [
      { label: 'All products', to: '/shop', note: 'The full catalogue' },
      { label: 'Nutrients', to: '/nutrients' },
      { label: 'Recovery', to: '/recovery' },
      { label: 'Combat', to: '/combat' },
      { label: 'Visual gallery', to: '/gallery', note: 'Every product, photographed' },
      { label: 'Compare products', to: '/compare' },
      { label: 'Buy at the official store', opens: 'store', note: 'Orders are taken at rawofficial.co' },
    ],
  },
  {
    title: 'Watch & learn',
    items: [
      { label: 'The Vault', to: '/watch', note: '116 films, searchable by what was said' },
      { label: 'Films', to: '/films' },
      { label: 'Showcase', to: '/showcase' },
      { label: 'Academy', to: '/academy' },
      { label: 'Knowledge base', to: '/knowledge-core' },
    ],
  },
  {
    title: 'Build a stack',
    items: [
      { label: 'Build your own', to: '/protocol-builder' },
      { label: 'Ready-made stacks', to: '/protocol-stacks' },
      { label: 'Performance system', to: '/performance-system' },
      { label: 'My stack', opens: 'stack', note: 'What you have gathered so far' },
    ],
  },
  {
    title: 'About RAW',
    items: [
      { label: 'Our story', to: '/our-story' },
      { label: 'Manifesto', to: '/manifesto' },
      { label: 'RAW Cares', to: '/raw-cares' },
      { label: 'Stay Safe', to: '/stay-safe' },
      { label: 'Site analytics', to: '/analytics' },
    ],
  },
  {
    title: 'Your account',
    items: [
      { label: 'Account', to: '/account' },
      { label: 'Delivery', to: '/logistics' },
      { label: 'Contact us', to: '/contact' },
      { label: 'Terms of use', to: '/terms-of-use' },
      { label: 'Privacy policy', to: '/privacy-policy' },
    ],
  },
  {
    title: 'How it looks',
    items: [
      { label: 'Keyboard shortcuts', opens: 'manual' },
      { label: 'Display settings', opens: 'settings' },
      { label: 'Background film', opens: 'wallpaper' },
      { label: 'Screensaver', opens: 'screensaver' },
    ],
  },
];

/**
 * EVERY ADDRESS THIS APP ACTUALLY SERVES A PAGE AT.
 *
 * ⚠️ WHY THIS IS NEEDED, AND HOW IT WAS CAUGHT. The breadcrumb trail turns
 * each segment into a link to its own level — which assumes every level is a
 * page. Two are not: /product/29 and /target/fighters have no /product or
 * /target route, so the trail offered two links that landed on "page not
 * found". scripts/linkcheck.mjs found them on six pages; nothing on screen
 * looked wrong until you pressed one.
 *
 * A segment is linked only if its path is in here. Keep it in step with the
 * <Route> list in src/App.tsx — `npm run linkcheck` fails if it drifts.
 */
export const REAL_PATHS: ReadonlySet<string> = new Set([
  '/',
  '/shop',
  '/gallery',
  '/films',
  '/watch',
  '/our-story',
  '/raw-cares',
  '/showcase',
  '/stay-safe',
  '/stay-safe/feedback',
  '/contact',
  '/terms-of-use',
  '/privacy-policy',
  '/nutrients',
  '/recovery',
  '/combat',
  '/analytics',
  '/account',
  '/checkout',
  '/logistics',
  '/manifesto',
  '/protocol-builder',
  '/protocol-stacks',
  '/performance-system',
  '/compare',
  '/academy',
  '/knowledge-core',
]);
