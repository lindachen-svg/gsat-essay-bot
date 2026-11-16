/* =========================================================
   首頁卡片渲染：讀取 window.CATALOG，自動產生題庫與批改紀錄卡片
   不要在 index.html 手寫卡片；新增內容請改 assets/catalog.js
   ========================================================= */

(function () {
  var C = window.CATALOG || { prompts: [], reports: [] };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function tagClass(type) { return type === "知性" ? "tag-zhixing" : "tag-qingyi"; }
  function promptById(id) {
    for (var i = 0; i < C.prompts.length; i++) if (C.prompts[i].id === id) return C.prompts[i];
    return null;
  }

  var pBox = document.getElementById("prompt-list");
  if (pBox) {
    pBox.innerHTML = C.prompts.map(function (p) {
      var count = C.reports.filter(function (r) { return r.prompt === p.id; }).length;
      return '<a class="card" href="' + esc(p.file) + '">' +
        '<span class="tag ' + tagClass(p.type) + '">' + esc(p.type) + '題 · ' + esc(p.id) + '</span>' +
        '<h3>' + esc(p.title) + '</h3>' +
        '<p>' + esc(p.summary) + '</p>' +
        '<div class="meta">已有 ' + count + ' 篇批改紀錄 · <span class="go">看題目 →</span></div>' +
        '</a>';
    }).join("");
  }

  var rBox = document.getElementById("report-list");
  if (rBox) {
    rBox.innerHTML = C.reports.map(function (r) {
      var p = promptById(r.prompt);
      return '<a class="card" href="' + esc(r.file) + '">' +
        '<span class="grade-badge">' + esc(r.grade) + '</span>' +
        '<span class="tag ' + tagClass(r.type) + '">' + esc(r.type) + '題 · ' + esc(r.id) + '</span>' +
        '<h3 style="padding-right:64px">' + esc(r.title) + '</h3>' +
        '<p>' + esc(r.summary) + '</p>' +
        '<div class="meta">' + esc(r.score) + ' / ' + esc(r.full) + ' 分' +
        (p ? ' · 題目：' + esc(p.title) : '') + ' · <span class="go">看批改 →</span></div>' +
        '</a>';
    }).join("");
  }

  /* 題目頁：自動列出「這題的批改紀錄」
     用法：<body data-base="../" data-prompt="p01"> + <div id="related-reports"></div> */
  var rel = document.getElementById("related-reports");
  if (rel) {
    var base = document.body.getAttribute("data-base") || "";
    var pid = document.body.getAttribute("data-prompt");
    var list = C.reports.filter(function (r) { return r.prompt === pid; });
    rel.innerHTML = list.length ? list.map(function (r) {
      return '<a class="card" href="' + esc(base + r.file) + '">' +
        '<span class="grade-badge">' + esc(r.grade) + '</span>' +
        '<span class="tag tag-demo">' + esc(r.id) + '</span>' +
        '<h3 style="padding-right:64px">' + esc(r.title) + '</h3>' +
        '<p>' + esc(r.summary) + '</p>' +
        '<div class="meta">' + esc(r.score) + ' / ' + esc(r.full) + ' 分 · <span class="go">看批改 →</span></div></a>';
    }).join("") : '<p class="muted">這題還沒有批改紀錄，成為第一篇吧！</p>';
  }

  var counter = document.getElementById("content-count");
  if (counter) {
    counter.textContent = C.prompts.length + " 道題目・" + C.reports.length + " 篇批改紀錄";
  }
})();
