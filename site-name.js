// Learn With Rinkesh — shared site name loader. Included on every page.
// Reads the site name set in Master Control (Site Settings) and replaces
// every occurrence of the default name — the topbar, the page title, and
// any body text that mentions it — so renaming the site in one place
// updates it everywhere without editing every page by hand.
(async function() {
  try {
    if (typeof supabaseClient === 'undefined') return;
    const { data } = await supabaseClient.from('page_content').select('content').eq('id', 'site-name').maybeSingle();
    if (!data || !data.content) return;
    const newName = data.content;
    const defaultName = 'Learn With Rinkesh';
    if (newName === defaultName) return;

    // Walk every visible text node on the page (skip script/style content,
    // which could break real code) and swap the name in place.
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue.includes(defaultName)) return NodeFilter.FILTER_SKIP;
        const tag = node.parentNode && node.parentNode.tagName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    let n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(node => {
      node.nodeValue = node.nodeValue.split(defaultName).join(newName);
    });

    // Also update the browser tab title if it mentions the default name.
    if (document.title.includes(defaultName)) {
      document.title = document.title.split(defaultName).join(newName);
    }
  } catch (e) { /* keep the default name on failure */ }
})();
