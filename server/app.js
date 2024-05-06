const express = require('express');
const admin = require('firebase-admin');
// const serviceAccount = require('./path/to/your-service-account-file.json');
const cors = require('cors');
const app = express()
const dotenv = require('dotenv');
const port = 3000

// CORSの設定
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'], // フロントエンドが動作するオリジンを指定
  credentials: true // 認証情報を含むリクエストをサポート
}));

// JSONデータのパースを有効にする
app.use(express.json());

// ルーティング設定
app.get('/', (req, res) => {
  res.send('Hello World!')
})

// .envファイルから環境変数を読み込む
dotenv.config(); 

const routes = require('./routes'); // `routes.js`ファイルで定義されたルート群
app.use('/api', routes); // APIエンドポイントのベースパスを指定

// サーバーの起動
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})