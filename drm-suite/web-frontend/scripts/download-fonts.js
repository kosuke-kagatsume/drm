// Google Fonts APIから適切なTTFフォントを取得するスクリプト
const fs = require('fs');
const https = require('https');
const path = require('path');

const FONTS_DIR = path.join(__dirname, '..', 'public', 'fonts');

// 確実にディレクトリを作成
if (!fs.existsSync(FONTS_DIR)) {
  fs.mkdirSync(FONTS_DIR, { recursive: true });
}

// Noto Sans JPの各ウェイトをダウンロード
const fonts = [
  {
    url: 'https://fonts.gstatic.com/s/notosansjp/v52/nKKF-GM_FYFRJvXzVXaAPe97P0Q.woff2',
    name: 'NotoSansJP-Regular.woff2',
  },
  {
    url: 'https://fonts.gstatic.com/s/notosansjp/v52/nKKU-GM_FYFRJvXzVXaAPe9pdP_jCw.woff2',
    name: 'NotoSansJP-Medium.woff2',
  },
  {
    url: 'https://fonts.gstatic.com/s/notosansjp/v52/nKKU-GM_FYFRJvXzVXaAPe97dP_jCw.woff2',
    name: 'NotoSansJP-Bold.woff2',
  },
];

async function downloadFont(fontUrl, fileName) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(FONTS_DIR, fileName);
    const file = fs.createWriteStream(filePath);

    https
      .get(fontUrl, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}`));
          return;
        }

        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✅ Downloaded: ${fileName}`);
          resolve();
        });
      })
      .on('error', (err) => {
        fs.unlink(filePath, () => {}); // エラー時はファイル削除
        reject(err);
      });
  });
}

async function main() {
  console.log('📥 Downloading Japanese fonts...');

  for (const font of fonts) {
    try {
      await downloadFont(font.url, font.name);
    } catch (error) {
      console.error(`❌ Failed to download ${font.name}:`, error.message);
    }
  }

  console.log('✅ Font download completed!');
}

main().catch(console.error);
