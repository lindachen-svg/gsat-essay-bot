/* =========================================================
   批改機器人：瀏覽器端健檢 + 批改指令產生器
   - 評分標準文字必須與 rubric.html、CLAUDE.md 第 7 節一致
   - 新增錯字或贅詞規則：只改 TYPOS / FILLERS 兩個陣列
   ========================================================= */

(function () {
  var C = window.CATALOG || { prompts: [] };

  /* 常見錯別字：[錯, 正] */
  var TYPOS = [
    ["再接在厲", "再接再厲"], ["在接再厲", "再接再厲"], ["一股作氣", "一鼓作氣"],
    ["迫不急待", "迫不及待"], ["走頭無路", "走投無路"], ["甘敗下風", "甘拜下風"],
    ["談笑風聲", "談笑風生"], ["心曠神宜", "心曠神怡"], ["一愁莫展", "一籌莫展"],
    ["按步就班", "按部就班"], ["再所難免", "在所難免"], ["莫明其妙", "莫名其妙"],
    ["既使", "即使"], ["因該", "應該"], ["不加思索", "不假思索"],
    ["世外桃園", "世外桃源"], ["鬼鬼崇崇", "鬼鬼祟祟"], ["美輪美煥", "美輪美奐"],
    ["穿流不息", "川流不息"], ["一切就序", "一切就緒"], ["渡過難關", "度過難關"],
    ["做客他鄉", "作客他鄉"], ["反應問題", "反映問題"], ["必需要", "必須要"]
  ];

  /* 口語贅詞：[詞, 出現幾次以上提醒] */
  var FILLERS = [
    ["然後", 2], ["就是", 2], ["我覺得", 2], ["真的", 2], ["其實", 3],
    ["所以說", 1], ["反正", 1], ["超級", 1], ["很多很多", 1], ["非常非常", 1]
  ];

  var RUBRIC_TEXT = [
    "每大題 25 分，先定等級再給分：",
    "A+ 22–25｜A 18–21｜B+ 14–17｜B 10–13｜C+ 6–9｜C 1–5｜0 分：空白、文不對題、僅抄題幹",
    "知性題分兩小題分開給分：",
    "  第一小題（4 分）A 3–4｜B 2｜C 1",
    "  第二小題（21 分）A+ 19–21｜A 15–18｜B+ 12–14｜B 8–11｜C+ 5–7｜C 1–4",
    "斟酌扣分：錯別字多、標點誤用（一逗到底、半形標點）、字數明顯不足。"
  ].join("\n");

  var $ = function (id) { return document.getElementById(id); };
  var sel = $("prompt-select"), essay = $("essay"), flags = $("flags");

  /* 題目選單 */
  sel.innerHTML = C.prompts.map(function (p) {
    return '<option value="' + p.id + '">' + p.id + '｜' + p.type + '題｜' + p.title + '</option>';
  }).join("") +
    '<option value="custom-知性">自訂題目（知性題）</option>' +
    '<option value="custom-情意">自訂題目（情意題）</option>';
  sel.addEventListener("change", function () {
    $("custom-wrap").style.display = sel.value.indexOf("custom") === 0 ? "grid" : "none";
  });

  function currentPrompt() {
    if (sel.value.indexOf("custom") === 0) {
      return { id: "自訂", type: sel.value.split("-")[1], title: "自訂題目", ask: $("custom-prompt").value || "（未填寫題目）" };
    }
    for (var i = 0; i < C.prompts.length; i++) if (C.prompts[i].id === sel.value) return C.prompts[i];
    return C.prompts[0];
  }

  function count(text, word) {
    var n = 0, i = text.indexOf(word);
    while (i !== -1) { n++; i = text.indexOf(word, i + word.length); }
    return n;
  }

  function analyze() {
    var raw = essay.value;
    var text = raw.replace(/\s+/g, "");
    var paras = raw.split(/\n+/).map(function (s) { return s.trim(); }).filter(Boolean);
    var sentences = text.split(/[。！？!?]/).filter(function (s) { return s.length > 0; });
    var longest = sentences.reduce(function (m, s) { return Math.max(m, s.length); }, 0);
    var han = (text.match(/[一-鿿]/g) || []).length;

    $("s-chars").textContent = text.length;
    $("s-han").textContent = han;
    $("s-paras").textContent = paras.length;
    $("s-sent").textContent = sentences.length;
    $("s-long").textContent = longest;

    var out = [];
    if (!text) { flags.innerHTML = '<li class="ok">貼上作文後，這裡會出現健檢結果。</li>'; return []; }

    TYPOS.forEach(function (t) {
      if (text.indexOf(t[0]) !== -1) out.push("錯字：「" + t[0] + "」應為「" + t[1] + "」");
    });
    FILLERS.forEach(function (f) {
      var n = count(text, f[0]);
      if (n >= f[1]) out.push("口語贅詞：「" + f[0] + "」出現 " + n + " 次，考慮刪減或換句話說");
    });
    var half = (text.match(/[一-鿿][,.?!;:][一-鿿]?/g) || []).length;
    if (half) out.push("半形標點：發現 " + half + " 處，國寫請使用全形標點（，。？！）");
    if (longest > 60) out.push("一逗到底：最長的一句有 " + longest + " 字，建議在 40 字內斷句");
    if (paras.length && paras.length < 3) out.push("段落偏少：只有 " + paras.length + " 段，建議至少「起、承轉、合」三段");
    if (paras.length > 7) out.push("段落偏多：共 " + paras.length + " 段，檢查是否有段落只有一兩句");
    var p = currentPrompt();
    if (p.type === "情意" && text.length < 500) out.push("字數提醒：情意題通常需要 500–700 字才寫得出層次，目前 " + text.length + " 字");

    flags.innerHTML = out.length
      ? out.map(function (s) { return "<li>" + s + "</li>"; }).join("")
      : '<li class="ok">健檢沒有發現明顯問題，可以進入第 ③ 步讓 AI 細改。</li>';
    return out;
  }

  function buildPrompt() {
    var p = currentPrompt();
    var found = analyze();
    var paras = essay.value.split(/\n+/).map(function (s) { return s.trim(); }).filter(Boolean);
    var numbered = paras.map(function (s, i) { return "【第" + (i + 1) + "段】" + s; }).join("\n");

    return [
      "你是「紅筆小改」，一位熟悉學測國寫閱卷原則、會鼓勵學生的國文老師。請依下列標準批改這篇作文，並嚴格依照【輸出格式】回覆，不要多寫其他段落。",
      "",
      "【題型】" + p.type + "題",
      "【題目】" + p.title,
      "【題目要求】" + (p.ask || ""),
      "",
      "【評分標準】",
      RUBRIC_TEXT,
      "",
      "【批改原則】",
      "1. 先判定等級，再在區間內給分；必須說明「為什麼不是上一級」。",
      "2. 每一句評語都要引用原文（用「」框起來），不寫空泛的稱讚或批評。",
      "3. 每段先寫優點（✓），再寫待改（✎）。",
      "4. 不要重寫整篇，只挑最需要改的一段示範改寫。",
      "5. 錯別字與標點逐一列出，沒有就寫「無」。",
      "",
      "【輸出格式】",
      "## 等級與分數（知性題請分列第一、二小題）",
      "## 四面向評語：① 題旨掌握 ② 內容深度 ③ 結構組織 ④ 文辭表達（各 1–2 句）",
      "## 逐段批註（第 N 段：✓ … ／ ✎ …）",
      "## 錯別字與標點（原文 → 修正）",
      "## 升級三件事（要升到下一級，最該做的三件事）",
      "## 示範改寫（改寫前／改寫後）",
      "",
      "【學生作文】",
      numbered || "（尚未貼上作文）",
      "",
      "【機器健檢結果，供參考】",
      found.length ? found.map(function (s) { return "- " + s; }).join("\n") : "- 無明顯問題"
    ].join("\n");
  }

  essay.addEventListener("input", analyze);
  sel.addEventListener("change", analyze);

  $("build").addEventListener("click", function () {
    var box = $("output");
    box.textContent = buildPrompt();
    box.style.display = "block";
    $("copy").disabled = false;
    $("copy-msg").textContent = "";
  });

  $("copy").addEventListener("click", function () {
    var text = $("output").textContent;
    var done = function () { $("copy-msg").textContent = "已複製！貼到 Claude／ChatGPT／Gemini 就能開始批改。"; };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { $("copy-msg").textContent = "請手動選取上方文字複製。"; });
    } else {
      $("copy-msg").textContent = "請手動選取上方文字複製。";
    }
  });
})();
