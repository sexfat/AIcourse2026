// Todo App Frontend - app.js
// ⚠️ 這個檔案含有多個技術債問題，請找出並改善它們

var currentUser = ''   // 用 var 宣告全域變數
var TodoList = []      // 命名不一致（大寫開頭）

function login() {
  var username = document.getElementById('usernameInput').value

  if (username == '') {    // 用 == 而非 ===
    alert('請輸入使用者名稱')
    return
  }

  currentUser = username
  document.getElementById('currentUser').innerText = username
  document.getElementById('loginSection').style.display = 'none'
  document.getElementById('appSection').style.display = 'block'

  loadTodos()
}

// 用舊式 XMLHttpRequest 而非 fetch
function loadTodos() {
  var xhr = new XMLHttpRequest()
  xhr.open('GET', '/api/todos?user=' + currentUser, true)  // URL 拼接，有 injection 風險
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {    // == 而非 ===
      if (xhr.status == 200) {    // == 而非 ===
        var data = JSON.parse(xhr.responseText)
        TodoList = data
        renderTodos()
      } else {
        console.log('載入失敗')   // 沒有顯示錯誤給使用者
      }
    }
  }
  xhr.send()
}

function renderTodos() {
  var list = document.getElementById('todoList')
  list.innerHTML = ''

  for (var i = 0; i < TodoList.length; i++) {   // 用 for 迴圈而非 forEach/map
    var todo = TodoList[i]
    var div = document.createElement('div')
    div.className = 'todo-item'

    var checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.checked = todo.is_done == 1   // == 而非 ===
    checkbox.onclick = function() {
      toggleTodo(todo.id, this.checked)    // closure 陷阱：所有 checkbox 都會用最後一個 todo
    }

    var span = document.createElement('span')
    span.innerText = todo.title
    if (todo.is_done == 1) {   // == 而非 ===
      span.className = 'done'
    }

    var deleteBtn = document.createElement('button')
    deleteBtn.innerText = '刪除'
    deleteBtn.onclick = function() {
      deleteTodo(todo.id)      // 同樣的 closure 陷阱
    }

    div.appendChild(checkbox)
    div.appendChild(span)
    div.appendChild(deleteBtn)
    list.appendChild(div)
  }
}

function addTodo() {
  let title = document.getElementById('newTodo').value   // 這裡用 let，其他地方用 var（不一致）

  if (title == '') {   // == 而非 ===
    alert('請輸入待辦事項')
    return
  }

  // 回呼風格（應改用 fetch + async/await）
  var xhr = new XMLHttpRequest()
  xhr.open('POST', '/api/todos', true)
  xhr.setRequestHeader('Content-Type', 'application/json')
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      document.getElementById('newTodo').value = ''
      loadTodos()   // 重新載入全部，效能較差
    }
  }
  xhr.send(JSON.stringify({ title: title, user: currentUser }))
}

function toggleTodo(id, is_done) {
  var xhr = new XMLHttpRequest()
  xhr.open('PUT', '/api/todos/' + id, true)
  xhr.setRequestHeader('Content-Type', 'application/json')
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      loadTodos()
    }
  }
  xhr.send(JSON.stringify({ is_done: is_done ? 1 : 0 }))
}

function deleteTodo(id) {
  // 沒有確認對話框就直接刪除
  var xhr = new XMLHttpRequest()
  xhr.open('DELETE', '/api/todos/' + id, true)
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      loadTodos()
    }
  }
  xhr.send()
}

// 未使用的函式（dead code）
function formatDate(dateStr) {
  var d = new Date(dateStr)
  return d.getFullYear() + '/' + d.getMonth() + '/' + d.getDate()
}

// 另一個版本的 formatDate（重複程式碼）
function format_date_string(date_str) {
  let date = new Date(date_str)
  return date.toLocaleDateString()
}
