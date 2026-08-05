// Learn With Rinkesh — shared site name loader. Included on every page.
// Reads the site name set in Master Control (Site Settings) and updates
// the topbar brand text everywhere, so renaming the site in one place
// updates it site-wide without editing every page by hand.
(async function() {
  try {
    if (typeof supabaseClient === 'undefined') return;
    const { data } = await supabaseClient.from('page_content').select('content').eq('id', 'site-name').maybeSingle();
    if (!data || !data.content) return;
    document.querySelectorAll('.brand').forEach(brand => {
      // Keep the "A1" namebox badge, only replace the trailing site-name text
      const namebox = brand.querySelector('.namebox');
      brand.innerHTML = '';
      if (namebox) brand.appendChild(namebox);
      brand.appendChild(document.createTextNode(' ' + data.content));
    });
  } catch (e) { /* keep the default name on failure */ }
})();
