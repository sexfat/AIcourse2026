# ✅ 參考答案：問題清單與改善建議

> 建議先完成練習再看這份答案！

---

## 問題總覽報告

### 🔴 高嚴重性：安全漏洞

| # | 位置 | 問題 | 影響 | 改善方式 |
|---|------|------|------|---------|
| 1 | `server.js` L38, L54 | **SQL Injection**：直接用字串拼接 SQL 查詢，未使用 Prepared Statement | 攻擊者可讀取/刪除全部資料 | 改用 `?` 佔位符的 Prepared Statement |
| 2 | `server.js` L8, L80 | **硬編碼密鑰 + 測試路由洩漏**：`SECRET_KEY` 寫在程式碼中，且 `/test` 路由會直接回傳它 | 密鑰外洩，可能被用於偽造身分 | 改用環境變數 `process.env.SECRET_KEY`，刪除測試路由 |

---

### 🟡 中嚴重性：程式碼品質

| # | 位置 | 問題 | 影響 | 改善方式 |
|---|------|------|------|---------|
| 3 | `server.js` 全檔 | **舊式 `var` 宣告**：應使用 `const`/`let` | 無塊作用域保護，容易造成非預期的變數行為 | 改用 `const`（不變）或 `let`（可變） |
| 4 | `app.js` 全檔 | **舊式 XMLHttpRequest**：應使用 `fetch` API | 程式碼冗長，可讀性差，難以維護 | 改用 `fetch` + `async/await` |
| 5 | `server.js` 全檔 | **Callback 風格**：應使用 `async/await` | 程式碼縮排深、可讀性差（Callback Hell） | 改用 `util.promisify` 或支援 Promise 的 DB 套件 |
| 6 | `app.js` L48-51, L55-58 | **`==` 而非 `===`**：寬鬆相等比較 | 可能造成非預期的型別轉換錯誤 | 統一改用 `===` |

---

### 🟡 中嚴重性：命名不一致

| # | 位置 | 問題 |
|---|------|------|
| 7 | `server.js` L39 vs L54 | `user_name`（snake_case）和 `UserName`（PascalCase）混用，都是指「使用者名稱」 |
| 8 | `server.js` L40 vs L41 | `created_at`（snake_case）和 `createdAt`（camelCase）混用 |
| 9 | `server.js` L87 vs L97 | `getUserData`（camelCase）和 `get_user_info`（snake_case）是相同功能但命名風格不同 |
| 10 | `app.js` L2 vs L4 | `currentUser`（camelCase）和 `TodoList`（PascalCase）混用全域變數 |
| 11 | `app.js` L47 | `addTodo()` 內部用 `let`，其他函式用 `var`，風格不一致 |

---

### 🟡 中嚴重性：錯誤處理不足

| # | 位置 | 問題 |
|---|------|------|
| 12 | `server.js` L45 | `GET /api/todos` 發生錯誤時，只 `console.log`，卻繼續執行 `res.json(rows)`（rows 可能是 undefined）|
| 13 | `server.js` L65 | `POST /api/todos` 發生錯誤時，沒有回傳錯誤給 client，client 不會知道新增失敗 |
| 14 | `server.js` L75 | `PUT` 路由不管 `err` 是否存在都回傳 `{ success: true }` |

---

### 🟠 低嚴重性：邏輯錯誤 & Dead Code

| # | 位置 | 問題 |
|---|------|------|
| 15 | `app.js` L55, L65 | **Closure 陷阱**：for 迴圈用 `var i` + closure，所有 checkbox/delete 按鈕都會操作最後一個 `todo` |
| 16 | `server.js` L97-105 | `get_user_info()` 函式在 callback 裡 `return null`/`return row`，實際上這兩個 return 沒有任何效果 |
| 17 | `server.js` L108-111 | `unusedConfig` 變數宣告後從未被使用（Dead Code）|
| 18 | `app.js` L95-103 | `formatDate` 和 `format_date_string` 兩個功能相同的函式，都未被使用（重複 Dead Code）|
| 19 | `app.js` L46 | 新增 todo 成功後呼叫 `loadTodos()` 重新載入全部資料，效能較差 |

---

## 改善後的重點程式碼範例

### SQL Injection 修復

```js
// ❌ 錯誤寫法
const queryStr = "SELECT * FROM todos WHERE user_name = '" + userName + "'"
db.all(queryStr, callback)

// ✅ 正確寫法（Prepared Statement）
db.all('SELECT * FROM todos WHERE user_name = ?', [userName], callback)
```

### 環境變數取代硬編碼

```js
// ❌ 錯誤寫法
const SECRET_KEY = 'abc123password'

// ✅ 正確寫法
const SECRET_KEY = process.env.SECRET_KEY
if (!SECRET_KEY) throw new Error('SECRET_KEY 環境變數未設定')
```

### XMLHttpRequest → fetch + async/await

```js
// ❌ 舊式寫法
function loadTodos() {
  var xhr = new XMLHttpRequest()
  xhr.open('GET', '/api/todos?user=' + currentUser, true)
  xhr.onreadystatechange = function() { ... }
  xhr.send()
}

// ✅ 現代寫法
async function loadTodos() {
  const res = await fetch(`/api/todos?user=${encodeURIComponent(currentUser)}`)
  if (!res.ok) throw new Error('載入失敗')
  const data = await res.json()
  todoList = data
  renderTodos()
}
```

### Closure 陷阱修復

```js
// ❌ 錯誤寫法（for + var + closure）
for (var i = 0; i < todoList.length; i++) {
  var todo = todoList[i]
  checkbox.onclick = function() { toggleTodo(todo.id, this.checked) }
}

// ✅ 正確寫法（forEach 或傳入參數）
todoList.forEach(todo => {
  checkbox.onclick = () => toggleTodo(todo.id, checkbox.checked)
})
```
