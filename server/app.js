const express = require('express');
const admin = require('firebase-admin');
// const serviceAccount = require('./path/to/your-service-account-file.json');
const cors = require('cors');
const cookieParser = require('cookie-parser'); 
const dotenv = require('dotenv');
const path = require('path');
const app = express()

// .envファイルから環境変数を読み込む
dotenv.config(); 

const port = process.env.PORT || 3000; // Herokuでポートは動的に設定される

// CORSの設定
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://murmurbox-7794a48dc19f.herokuapp.com']
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// JSONデータのパースを有効にする
app.use(express.json());

// cookie-parserの設定（これによりreq.cookiesにアクセス可能になる）
app.use(cookieParser());

// 本番環境の場合のみ、dist/フォルダの静的ファイルを配信
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));

  // ルーティング設定の前に静的ファイル配信設定を追加
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
} else {
  // 開発環境の場合は、クライアントアプリはViteの開発サーバーが管理
  console.log('development mode. Not use static files from dist');
}

// ルーティング設定
app.get('/', (req, res) => {
  res.send('Hello World!')
})

const routes = require('./routes'); // `routes.js`ファイルで定義されたルート群
app.use('/api', routes); // APIエンドポイントのベースパスを指定

// サーバーの起動
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})