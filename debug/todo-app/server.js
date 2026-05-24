// Todo App Backend - server.js
// ⚠️ 這個檔案含有多個技術債問題，請找出並改善它們

var express = require('express')
var bodyParser = require('body-parser')
var sqlite3 = require('sqlite3')
var path = require('path')

var app = express()
var PORT = 3000
var SECRET_KEY = 'abc123password'   // 硬編碼密鑰
var DB_PATH = './todos.db'

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'))

// 資料庫初始化
var db = new sqlite3.Database(DB_PATH, function(err) {
  if (err) {
    console.log(err)
  } else {
    console.log('Connected to database')
  }
})

db.run(`CREATE TABLE IF NOT EXISTS todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  is_done INTEGER DEFAULT 0,
  createdAt TEXT,
  user_name TEXT
)`)

// ---- 命名不一致：有的用 camelCase，有的用 snake_case ----

// 取得所有 todo
app.get('/api/todos', function(req, res) {
  var user_name = req.query.user   // snake_case
  var queryStr = "SELECT * FROM todos WHERE user_name = '" + user_name + "'"  // SQL Injection 漏洞

  db.all(queryStr, function(err, rows) {
    if (err) {
      console.log('error: ' + err)   // 沒有回傳錯誤給 client
    }
    res.json(rows)
  })
})

// 新增 todo
app.post('/api/todos', function(req, res) {
  var todoTitle = req.body.title
  var UserName = req.body.user    // 命名不一致（大寫開頭）
  var created_at = new Date().toISOString()  // snake_case 混用

  // 未驗證輸入是否為空
  db.run(
    "INSERT INTO todos (title, is_done, createdAt, user_name) VALUES ('" + todoTitle + "', 0, '" + created_at + "', '" + UserName + "')",  // SQL Injection
    function(err) {
      if (err) {
        console.log(err)
        // 忘記回傳錯誤給 client
      } else {
        res.json({ success: true, id: this.lastID })
      }
    }
  )
})

// 更新 todo 狀態
app.put('/api/todos/:id', function(req, res) {
  var todo_id = req.params.id   // snake_case
  var isDone = req.body.is_done  // 混用

  db.run(
    'UPDATE todos SET is_done = ? WHERE id = ?',
    [isDone, todo_id],
    function(err) {
      if (err) {
        console.log(err)
      }
      res.json({ success: true })  // 不管有沒有 err 都回傳 success
    }
  )
})

// 刪除 todo
app.delete('/api/todos/:id', function(req, res) {
  var Id = req.params.id   // 命名不一致（大寫 I）

  db.run('DELETE FROM todos WHERE id = ?', [Id], function(err) {
    if (err) {
      console.log(err)
    }
    res.json({ message: 'deleted' })
  })
})

// 取得單一使用者資訊（未使用的 route）
function getUserData(userName) {
  return new Promise(function(resolve, reject) {
    db.get('SELECT * FROM users WHERE name = ?', [userName], function(err, row) {
      if (err) reject(err)
      resolve(row)
    })
  })
}

// 另一個相同功能但命名不同的函式（重複程式碼）
function get_user_info(user_name) {
  db.get('SELECT * FROM users WHERE name = ?', [user_name], function(err, row) {
    if (err) {
      console.log(err)
      return null
    }
    return row   // 這樣寫在 callback 裡沒有效果
  })
}

// 未使用的變數
var unusedConfig = {
  timeout: 5000,
  retries: 3
}

// 忘記移除的測試用 route
app.get('/test', function(req, res) {
  res.json({ status: 'ok', secret: SECRET_KEY })  // 洩漏 secret key！
})

app.listen(PORT, function() {
  console.log('Server running on port ' + PORT)
})
