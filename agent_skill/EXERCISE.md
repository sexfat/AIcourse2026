# 🧩 Agent Skill 練習：打造「Code Review Checklist」Skill

## 練習目標

1. 理解 Agent Skill 的兩層結構（Metadata + Instructions）並親手寫一份
2. 遵守 Claude Code 的存放與命名規範，讓 Skill 真正被系統辨識
3. 驗證「漸進式披露」機制：確認 Skill 只在相關情境下被觸發
4. 測試 Skill 是否讓 Agent 嚴格照你規定的規則與格式輸出

---

## 背景說明

早上的課程教過：Agent Skill 就像一本「SOP 操作手冊」，把步驟、判斷規則、輸出格式都寫好，Agent 拿到後，以後執行同類任務就會嚴格照手冊走，不用每次都重新解釋。

這次要實作的情境：**工程師寫完程式碼後，想請 AI 幫忙做 Code Review**。如果沒有 Skill，你每次都要打一長串提示詞告訴 AI 要檢查哪些項目、輸出要長怎樣；有了 Skill，只要說「幫我 review 一下」，Agent 就會自動套用你寫好的檢查清單與輸出格式。

---

## 真實範例參考（先看，再動手）

在開始寫之前，先看一份系統裡已經存在、真正在運作的 Skill，了解實際檔案長什麼樣子：

```bash
cat ~/.claude/skills/git-commit-summary/SKILL.md
```

觀察重點：
- 檔案最上方有 `---` 包起來的 YAML frontmatter，裡面有 `name` 與 `description`
- 資料夾名稱（`git-commit-summary`）跟 frontmatter 裡的 `name` 完全一致
- 檔名是全大寫的 `SKILL.md`
- frontmatter 下方才是給 Agent 看的具體步驟（Markdown 格式，沒有固定語法限制）

---

## 練習步驟

### Step 1：設計你的 Metadata 層

先想清楚這個 Skill 的：
- **name**：小寫、用 `-` 連接（如 `code-review-checklist`），且要跟資料夾名稱一致
- **description**：要寫清楚「什麼情境會用到」，這是系統判斷要不要載入的依據。試著想：如果 description 寫得太模糊（例如只寫「審查程式碼」），會發生什麼問題？

### Step 2：設計指令層的五個要素

針對 Code Review 這個任務，分別寫出：

| 要素 | 要回答的問題 |
|------|------|
| Goals | 這個 Skill 最終要幫使用者達成什麼？ |
| Steps | Agent 該按照什麼順序做事？（例如：先抓 diff，再逐項檢查） |
| Rules | 遇到不同類型的問題時，怎麼判斷嚴重程度？ |
| Output Format | 輸出必須長什麼樣子，才能讓你一眼看出能不能合併？ |
| Examples | 給 Agent 一組「假設輸入 → 期待輸出」的範例，讓它模仿 |

建議的檢查清單方向（可自行增減）：
- 安全漏洞（如 SQL Injection、硬編碼密鑰）
- 錯誤處理（是否有未處理的 exception、錯誤是否被吞掉）
- 命名一致性
- 重複程式碼
- 明顯的效能問題

### Step 3：寫成 SKILL.md

把 Step 1、2 的內容整理成一份完整檔案，格式範例：

```markdown
---
name: code-review-checklist
description: 當使用者要求 code review、審查 diff、檢查 PR 品質時使用。
---

# Code Review Checklist

## Goals
...

## Steps
1. ...
2. ...

## Rules
- ...

## Output Format
...

## Examples
...
```

### Step 4：依規則存放

1. 在 `~/.claude/skills/` 下建立一個資料夾，名稱跟你的 `name` 完全一致
2. 把檔案存成 `SKILL.md`（注意：全部大寫，不是 `Skill.md`）

```bash
mkdir -p ~/.claude/skills/code-review-checklist
# 把內容存到 ~/.claude/skills/code-review-checklist/SKILL.md
```

### Step 5：實際測試

開一個新的 Claude Code 對話（Skill 是啟動時載入的，現有對話視窗可能偵測不到新增的 Skill），測試兩種情境：

1. **應該觸發**：對著一段有問題的程式碼說「幫我 review 一下這段 code」，確認 Agent 是否依照你的清單與格式輸出
2. **不應該觸發**：問一個完全不相關的問題（例如「今天天氣如何」），確認 Skill 沒有被誤觸發、影響到無關的對話

### Step 6（進階）：刻意製造邊界情況

試著貼一段「完全沒問題」的乾淨程式碼，看看你的 Rules 是否有處理「無需修改」這種情況，還是 Agent 會硬擠出問題來湊數。

---

## 提示：常見的撰寫疏失

（先自己嘗試，再對照提示）

<details>
<summary>點我展開提示清單</summary>

- description 寫太模糊（例如只寫「審查程式碼」），導致系統不確定何時該載入，或誤觸發在不相關的對話
- Rules 沒有覆蓋「找不到問題」的邊界情況，導致 Agent 為了符合格式硬掰出問題
- Output Format 沒有規定具體結構（例如要不要表格、要不要先給結論），測試時很難判斷 Agent 有沒有真的照做
- 資料夾名稱跟 `name` 沒有完全一致（多一個空格、大小寫不同），導致 Skill 沒被偵測到
- 檔名打成 `Skill.md` 或 `skill.md`，而非規定的全大寫 `SKILL.md`

</details>

---

## 完成後的驗收清單

- [ ] `SKILL.md` 存放在 `~/.claude/skills/<name>/SKILL.md`，資料夾名稱與 `name` 完全一致
- [ ] frontmatter 包含 `name` 與 `description`，且 description 清楚描述觸發情境
- [ ] 指令層包含 Goals、Steps、Rules、Output Format、Examples 五個要素
- [ ] 用一段「有問題的程式碼」測試，Agent 有依照規定的格式與規則輸出
- [ ] 用一個不相關的問題測試，確認 Skill 沒有被誤觸發
- [ ] 用一段「乾淨的程式碼」測試邊界情況，確認 Agent 不會硬湊問題
