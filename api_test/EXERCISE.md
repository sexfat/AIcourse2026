# 🔌 AI API 串接練習：營養成分查詢 App

## 練習目標

在不使用任何框架的情況下，利用 AI 工具（Claude / Codex）：
1. 理解 REST API 的請求/回應結構
2. 用 `fetch` + `async/await` 呼叫真實外部 API
3. 解析 JSON 資料並渲染成互動介面
4. 處理 Loading 狀態、錯誤與邊界條件

---

## 背景說明

上一個單元（Unit 03）我們用 Mock Data 建了一個卡路里紀錄 Dashboard。

這次，我們要把 Mock Data 換成真實的 API 資料。

使用的 API：**Open Food Facts**
- 完全免費，無需 API Key
- 支援瀏覽器直接呼叫（CORS）
- 端點：`https://world.openfoodfacts.org/cgi/search.pl`

---

## 練習步驟

### Step 1：在瀏覽器觀察 API 回傳的 JSON 結構

打開以下 URL（可直接在瀏覽器輸入），看看 JSON 長什麼樣子：

```
https://world.openfoodfacts.org/cgi/search.pl?search_terms=chicken&json=1&page_size=3
```

找到以下關鍵欄位：
- `products` 陣列（每個元素是一筆食物）
- `product_name`（食物名稱）
- `nutriments.energy-kcal_100g`（每 100g 熱量）
- `nutriments.proteins_100g`（蛋白質）
- `nutriments.carbohydrates_100g`（碳水化合物）
- `nutriments.fat_100g`（脂肪）

### Step 2：用 AI 生成 API 呼叫函式

把 API 的端點、參數格式、JSON 結構描述給 Claude，請他產出：

```js
async function searchFood(query) { ... }
```

要求：
- 使用 `fetch` + `async/await`
- 回傳解析後的食物陣列（只保留需要的欄位）
- `undefined` 的 nutriments 欄位給預設值 `0`

### Step 3：用 AI 生成搜尋 UI + 結果渲染

請 AI 建立完整的 HTML 結構和以下函式：

```js
async function handleSearch() { ... }   // 觸發搜尋、管理 loading 狀態
function renderResults(foods) { ... }   // 將食物陣列渲染成卡片
```

每張卡片要顯示：食物名稱、熱量、蛋白質、碳水、脂肪。

### Step 4：加上三種狀態的顯示

| 狀態 | 顯示內容 |
|------|---------|
| Loading | 「搜尋中...」或 Skeleton 動畫 |
| 查無結果 | 「查無結果，請嘗試其他關鍵字」 |
| API 錯誤 | 「呼叫失敗，請稍後再試」 |

### Step 5（進階）：防止 Race Condition

用 `AbortController` 取消上一個未完成的請求：

```js
let currentController = null;

async function searchFood(query) {
  if (currentController) currentController.abort();
  currentController = new AbortController();

  const res = await fetch(url, { signal: currentController.signal });
  // ...
}
```

---

## 提示：這個練習要注意哪些事？

（先自己嘗試，再對照注意事項）

<details>
<summary>點我展開提示清單</summary>

- CORS 錯誤（1 種場景）
- API Key 安全性問題（1 種場景）
- Race Condition：快速搜尋時舊結果覆蓋新結果
- `undefined` / `null` 的 nutriments 欄位需要防禦性處理
- 使用者輸入空字串時不應發出 API 請求

</details>

---

## 完成後的功能驗收清單

- [ ] 輸入食物名稱後，能正確呼叫 API 並顯示結果
- [ ] 搜尋過程中顯示 loading 狀態
- [ ] 查無結果時顯示友善提示，不是空白畫面
- [ ] API 錯誤時顯示錯誤訊息
- [ ] 每張卡片正確顯示：熱量、蛋白質、碳水、脂肪
- [ ] 快速重複搜尋不會顯示舊結果（Race Condition 已處理）
