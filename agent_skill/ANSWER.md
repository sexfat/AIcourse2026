# ✅ 參考答案：Code Review Checklist Skill

> 建議先完成練習再看這份答案！這份不是唯一解，重點是你的 Skill 有沒有真正被觸發、有沒有照規則輸出。

---

## 完整 SKILL.md 範例

存放路徑：`~/.claude/skills/code-review-checklist/SKILL.md`

```markdown
---
name: code-review-checklist
description: 當使用者要求 code review、審查 diff、檢查 PR 品質，或說「幫我看一下這段 code」「可以合併嗎」時使用。
---

# Code Review Checklist

## Goals
在使用者要求審查程式碼時，依固定檢查清單系統性審查，並給出明確的
「可以合併 / 需要修正」結論，而不是零散的意見。

## Steps
1. 取得要審查的內容：
   - 若使用者已貼上程式碼，直接使用
   - 若使用者只說「幫我 review」沒有貼程式碼，執行 `git diff` 與
     `git diff --cached`，取得目前的變更
   - 若兩者都沒有變更可審查，告知使用者並停止，不要編造問題
2. 依照下方 Rules 逐項檢查
3. 依 Output Format 整理成結論

## Rules
判斷問題嚴重程度：
- **高（必須修正才能合併）**：安全漏洞（SQL Injection、硬編碼密鑰、未驗證輸入）、
  會導致功能錯誤的邏輯問題、未處理的例外導致程式崩潰
- **中（建議修正）**：重複程式碼、命名不一致、缺少邊界條件處理
- **低（可選）**：風格問題、可讀性建議、效能可以更好但目前沒有實際影響

如果逐項檢查後沒有發現任何問題，**必須明確說「沒有發現問題」**，
不可以為了符合輸出格式硬找出問題。

## Output Format
固定輸出兩個部分：

1. 第一段：**結論**（粗體），只能是「✅ 可以合併」或「⚠️ 建議修正後再合併」
2. 第二段：以表格列出問題（若無問題則省略此表格，改寫「沒有發現需要修正的問題」）

   | 嚴重度 | 問題描述 | 位置 | 建議 |
   |--------|----------|------|------|

## Examples

**輸入：**
```js
function getUser(id) {
  db.query("SELECT * FROM users WHERE id = " + id, (err, row) => {
    console.log(err);
    return row;
  });
}
```

**期待輸出：**

**⚠️ 建議修正後再合併**

| 嚴重度 | 問題描述 | 位置 | 建議 |
|--------|----------|------|------|
| 高 | 字串拼接組 SQL，有 SQL Injection 風險 | `getUser` 第 2 行 | 改用參數化查詢（`?` placeholder） |
| 高 | callback 內 `return row` 無法被呼叫方取得 | `getUser` 第 4 行 | 改用 Promise 或 callback 參數回傳結果 |
| 中 | 錯誤只 `console.log`，沒有往外拋出或處理 | `getUser` 第 3 行 | 應該呼叫 `callback(err)` 或 `reject(err)` |
```

---

## 設計說明

### 1. 為什麼 description 要寫這麼具體？

```
description: 當使用者要求 code review、審查 diff、檢查 PR 品質，或說「幫我看一下這段 code」「可以合併嗎」時使用。
```

Claude Code 啟動時只讀 frontmatter（漸進式披露的第一層），靠 `description` 判斷某次提問跟哪個 Skill相關。如果寫得太籠統（例如只寫「審查程式碼」），有兩個風險：
- **該觸發時沒觸發**：使用者說「幫我看看這個 PR 寫得好不好」，系統可能覺得跟「審查程式碼」關聯度不夠高
- **不該觸發時誤觸發**：泛用的詞彙可能跟其他 Skill 的描述重疊，或在不相關對話中被誤判相關

把使用者實際會說的話（「可以合併嗎」「幫我看一下這段 code」）直接寫進 description，是最有效的寫法。

### 2. 為什麼 Rules 要明確規定「沒問題也要說沒問題」？

這是這份 Skill 設計上最重要的一條規則。沒有這條規則時，Agent 為了「看起來有在做事」、湊滿 Output Format 規定的表格，很容易在乾淨的程式碼裡硬掰出無關緊要的「問題」。明確禁止這個行為，才能讓 Skill 的輸出真正可信。

### 3. 為什麼 Output Format 規定結論只能是兩個固定選項？

如果讓 Agent 自由發揮結論的寫法，每次測試結果的用詞都會不一樣，你很難驗證「Agent 有沒有真的照規則跑完一輪檢查」。把結論收斂成兩個固定選項（✅ / ⚠️），既符合工程師快速掃過 PR 結論的習慣，也方便你在測試時一眼判斷 Skill 有沒有正常運作。

---

## 常見問題 Q&A

### Q: 為什麼資料夾名稱要跟 `name` 完全一致？

A: Claude Code 是用資料夾名稱去掃描 `~/.claude/skills/` 底下有哪些可用的 Skill，再讀取裡面 `SKILL.md` 的 frontmatter 確認 `name` 對得上。如果資料夾叫 `Code Review` 但 `name` 寫 `code-review-checklist`，兩者對不上，系統會無法正確辨識、甚至直接忽略這個資料夾。

### Q: 為什麼一定要用全大寫的 `SKILL.md`，而不是 `Skill.md` 或 `skill.md`？

A: 這是系統內部寫死的辨識規則，跟「檔名首字大寫看起來比較正式」這種美感考量無關——大小寫不對，系統就找不到這個檔案，整個 Skill 等於不存在。這也是這次課程教材原本寫錯的地方（之前寫成首字母大寫的 `Skill.md`），實際規則是全大寫。

### Q: 我可以同時準備多個 Skill 嗎？會不會互相干擾？

A: 可以，而且這正是「漸進式披露」設計的目的——系統一次只會讀取所有 Skill 的 Metadata 層（成本很低），真正命中某個 `description` 才會載入該 Skill 完整的指令層。只要每個 Skill 的 `description` 寫得夠具體、彼此觸發情境不重疊，多個 Skill 並存不會互相干擾。

### Q: Steps 裡規定「沒有變更可審查就停止，不要編造問題」，這是為什麼？

A: 這跟 Rules 裡「沒問題也要說沒問題」是同一個設計精神：Skill 的價值在於讓 Agent 的行為「可預期、可信任」。如果輸入本身就是空的，卻還是生出一份看起來煞有介事的審查報告，使用者反而會被誤導以為真的審查了東西。

---

## 延伸學習

| 主題 | 關鍵字 |
|------|--------|
| 讓 Skill 攜帶可執行腳本，不只是純文字指令 | Skill `scripts/` 子目錄，可參考 `~/.claude/skills/skill-creator` |
| 讓 Skill 引用額外的參考文件，避免指令層過長 | Skill `references/` 子目錄，可參考 `~/.claude/skills/frontend-engineer` |
| 用程式化方式檢查多個 Skill 的 description 是否互相衝突 | Skill 命名衝突 / description overlap |
| 團隊共用 Skill，而不是只放在個人電腦 | 專案層級 `.claude/skills/`（隨專案 repo 一起提交）vs 使用者層級 `~/.claude/skills/` |
| 把 Skill 跟 MCP 工具結合，做出真正能查詢外部資料的 Agent | 早上「MCP vs Agent Skill」那一節的「出門小助手」範例 |
