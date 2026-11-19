(function () {
  const PROJECT = "https://pkqcxcfuelubonlkjgoq.supabase.co";
  const KEY = "sb_publishable_rTPtpxMftXim8X_Re9LxMg_vZaF_ade";
  const BUCKET = "sada-app-assets";
  let registry = Object.create(null);
  function url(path) {
    return PROJECT + "/storage/v1/object/public/" + BUCKET + "/" + String(path).split("/").map(encodeURIComponent).join("/");
  }
  async function refresh() {
    const response = await fetch(PROJECT + "/rest/v1/app_assets?select=asset_key,title,category,storage_path,metadata,mime_type&is_active=eq.true&order=sort_order.asc", {
      headers: { apikey: KEY, Authorization: "Bearer " + KEY }
    });
    if (!response.ok) throw new Error("Unable to load visual assets: " + response.status);
    const rows = await response.json();
    const next = Object.create(null);
    rows.forEach(function (row) { next[row.asset_key] = { url: url(row.storage_path), title: row.title, category: row.category, mime_type: row.mime_type || '', metadata: row.metadata || {} }; });
    registry = next;
    window.SADA_ASSETS = api;
    window.dispatchEvent(new CustomEvent("sada-assets-ready", { detail: registry }));
    apply(document);
    return registry;
  }
  function apply(root) {
    (root || document).querySelectorAll("[data-sada-asset]").forEach(function (node) {
      const item = registry[node.getAttribute("data-sada-asset")];
      if (!item) return;
      if (node.tagName === "IMG" || node.tagName === "VIDEO" || node.tagName === "AUDIO") node.src = item.url;
      else node.style.backgroundImage = "url(" + JSON.stringify(item.url) + ")";
    });
  }
  const api = {
    url: function (key, fallback) { return registry[key] ? registry[key].url : (fallback || ""); },
    get: function (key) { return registry[key] || null; },
    all: function () { return registry; },
    refresh: refresh,
    apply: apply
  };
  window.SADA_ASSETS = api;
  refresh().catch(function (error) { console.warn("[Sada assets]", error.message); });
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) { m.addedNodes.forEach(function (n) { if (n.nodeType === 1) { if (n.matches && n.matches("[data-sada-asset]")) apply(n.parentNode || document); else apply(n); } }); });
  });
  document.addEventListener("DOMContentLoaded", function () { observer.observe(document.body, { childList: true, subtree: true }); });
})();