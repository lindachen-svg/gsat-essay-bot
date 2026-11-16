# AGENTS.md

本專案（紅筆小改｜學測國寫批改機器人）的完整規則寫在 **[CLAUDE.md](CLAUDE.md)**，任何 AI 工具（Codex、Cursor、Gemini CLI、Copilot 等）都必須先完整閱讀並遵守該文件。

## 最重要的五條規則（摘要）

1. **網站可以一直長大，但評分標準和報告格式永遠一致。** 評分只依 `rubric.html`／`CLAUDE.md` 第 7 節。
2. **新增內容一律複製 `templates/` 的模板**：題目用 `prompt-template.html`，報告用 `report-template.html`。
3. **命名**：題目 `prompts/pNN-英文短名.html`，報告 `reports/rNN-pNN-英文短名.html`，編號接續不重複。
4. **登記**：新增頁面後必須在 `assets/catalog.js` 加一筆，首頁才看得到。
5. **樣式**：只能用 `assets/style.css` 既有的變數與元件，不新增 `<style>`、不寫死色碼、不引入框架。

完成任何修改前，請執行 `CLAUDE.md` 第 9 節的檢查清單。
