# ✅ 參考答案：API 串接練習重點解析

> 建議先完成練習再看這份答案！

---

## 核心程式碼解析

### 1. searchFood() — API 呼叫函式

```js
let currentController = null;

async function searchFood(query) {
  // ✅ 防止 Race Condition：取消上一個未完成的請求
  if (currentController) {
    currentController.abort();
  }
  currentController = new AbortController();

  const url = `https://world.openfoodfacts.org/cgi/search.pl` +
    `?search_terms=${encodeURIComponent(query)}&json=1&page_size=6` +
    `&fields=product_name,nutriments`;

  try {
    const res = await fetch(url, { signal: currentController.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();

    // ✅ 防禦性處理：過濾掉沒有名稱的產品，nutriments 欄位給預設值 0
    return (data.products || [])
      .filter(p => p.product_name)
      .map(p => {
        const n = p.nutriments || {};
        return {
          name:    p.product_name,
          kcal:    Math.round(n['energy-kcal_100g'] ?? 0),
          protein: Math.round((n['proteins_100g'] ?? 0) * 10) / 10,
          carbs:   Math.round((n['carbohydrates_100g'] ?? 0) * 10) / 10,
          fat:     Math.round((n['fat_100g'] ?? 0) * 10) / 10,
        };
      });

  } catch (err) {
    // ✅ AbortError 不是真正的錯誤，讓呼叫方忽略它
    if (err.name === 'AbortError') return null;
    throw err;
  }
}
```

**關鍵知識點：**
| 技術 | 用途 |
|------|------|
| `encodeURIComponent(query)` | 避免特殊字元破壞 URL |
| `AbortController` | 取消舊請求，防止 Race Condition |
| `?? 0` (Nullish Coalescing) | 當欄位為 `undefined` 或 `null` 時給預設值 |
| `res.ok` 檢查 | HTTP 4xx/5xx 不會自動拋錯，需手動檢查 |
| `&fields=...` | 限制回傳欄位，縮小 response 體積 |

---

### 2. handleSearch() — 管理狀態與呼叫流程

```js
async function handleSearch() {
  const query = document.getElementById('searchInput').value.trim();

  // ✅ 防禦：空字串不發請求
  if (!query) return;

  // ✅ 顯示 Loading 狀態
  showLoading();
  hideError();

  try {
    const foods = await searchFood(query);

    // ✅ searchFood 回傳 null 代表被取消，直接忽略
    if (foods === null) return;

    renderResults(foods);

  } catch (err) {
    renderEmpty();
    showError('API 呼叫失敗，請檢查網路連線後再試。');
  }
}
```

---

### 3. renderResults() — 三種狀態的顯示邏輯

```js
function renderResults(foods) {
  const area = document.getElementById('resultsArea');

  // 狀態 1：查無結果
  if (foods.length === 0) {
    area.innerHTML = `
      <div class="empty-state">
        查無結果，請嘗試其他關鍵字（建議使用英文）
      </div>`;
    return;
  }

  // 狀態 2：有結果，渲染卡片
  area.innerHTML = `
    <div class="results-grid">
      ${foods.map(food => `
        <div class="food-card">
          <div class="food-name">${escapeHtml(food.name)}</div>
          <div class="nutri-item">熱量：${food.kcal} kcal/100g</div>
          <div class="nutri-item">蛋白質：${food.protein} g</div>
          <div class="nutri-item">碳水：${food.carbs} g</div>
          <div class="nutri-item">脂肪：${food.fat} g</div>
          <button onclick="addToDiary(${JSON.stringify(food)})">
            + 加入紀錄
          </button>
        </div>
      `).join('')}
    </div>`;
}

// ✅ 安全：避免 XSS（食物名稱是外部資料，要 escape）
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
```

**⚠️ 重要：XSS 防護**
Open Food Facts 的 `product_name` 是使用者上傳的資料，可能包含 `<script>` 等惡意內容。
直接用 `innerHTML` 插入時，必須先 `escapeHtml()` 或改用 `textContent`。

---

## 常見問題 Q&A

### Q: 為什麼有些食物的 kcal 顯示為 0？

A: Open Food Facts 是社群貢獻的資料庫，部分產品的 nutriments 欄位沒有填寫，
API 回傳 `undefined`。我們用 `?? 0` 給預設值，所以顯示 0。
這是資料品質問題，不是程式碼的 bug。

### Q: CORS 錯誤怎麼辦？

A: Open Food Facts 支援 CORS，正常情況下不會有問題。
如果遇到，可能是：
1. 網路問題（試試 VPN 或換網路）
2. 你改用了其他不支援 CORS 的 API
   → 解法：在自己的後端建代理路由

### Q: 為什麼要用 `encodeURIComponent(query)`？

A: 如果使用者輸入「雞胸肉」或「beef & chicken」，
直接拼進 URL 會破壞 query string 格式（`&` 會被誤判為下一個參數）。
`encodeURIComponent` 會把這些字元轉成 URL 安全格式（`%26` 等）。

---

## 延伸學習

| 主題 | 關鍵字 |
|------|--------|
| 更優雅的 loading | CSS Skeleton Screen |
| 減少 API 請求數 | debounce（延遲觸發）|
| 取消重複請求 | AbortController |
| API Key 安全 | Backend Proxy, Environment Variables |
| 快取 API 結果 | localStorage, in-memory cache |
| 更豐富的 API | USDA FoodData Central, Nutritionix |
