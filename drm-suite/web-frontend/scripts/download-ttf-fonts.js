// Google Fonts APIから実際のTTFフォントファイルを取得するスクリプト
const fs = require('fs');
const https = require('https');
const path = require('path');

const FONTS_DIR = path.join(__dirname, '..', 'public', 'fonts');

// 確実にディレクトリを作成
if (!fs.existsSync(FONTS_DIR)) {
  fs.mkdirSync(FONTS_DIR, { recursive: true });
}

// Google Fonts APIからTTFを取得（User-Agent指定）
async function downloadTTFFont(family, weight, fileName) {
  return new Promise((resolve, reject) => {
    // Google Fonts APIのCSS URLを構築
    const cssUrl = `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&display=block`;

    const options = {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    };

    console.log(`📥 Fetching CSS: ${cssUrl}`);

    // まずCSSを取得してTTFのURLを抽出
    https
      .get(cssUrl, options, (cssResponse) => {
        let cssData = '';

        cssResponse.on('data', (chunk) => (cssData += chunk));
        cssResponse.on('end', () => {
          // TTFのURLを抽出（ttf形式を優先）
          const ttfMatch = cssData.match(
            /url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.ttf)\)/,
          );
          const woff2Match = cssData.match(
            /url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/,
          );

          const fontUrl = ttfMatch
            ? ttfMatch[1]
            : woff2Match
              ? woff2Match[1]
              : null;

          if (!fontUrl) {
            reject(new Error('Font URL not found in CSS'));
            return;
          }

          console.log(`📥 Downloading font: ${fontUrl}`);

          // フォントファイルを実際にダウンロード
          const filePath = path.join(FONTS_DIR, fileName);
          const file = fs.createWriteStream(filePath);

          https
            .get(fontUrl, options, (fontResponse) => {
              if (fontResponse.statusCode !== 200) {
                reject(new Error(`HTTP ${fontResponse.statusCode}`));
                return;
              }

              fontResponse.pipe(file);
              file.on('finish', () => {
                file.close();
                const stats = fs.statSync(filePath);
                console.log(
                  `✅ Downloaded: ${fileName} (${Math.round(stats.size / 1024)}KB)`,
                );
                resolve();
              });
            })
            .on('error', reject);
        });
      })
      .on('error', reject);
  });
}

async function main() {
  console.log('🚀 Downloading Noto Sans JP TTF fonts from Google Fonts...');

  const fonts = [
    {
      family: 'Noto+Sans+JP',
      weight: '400',
      fileName: 'NotoSansJP-Regular.ttf',
    },
    {
      family: 'Noto+Sans+JP',
      weight: '500',
      fileName: 'NotoSansJP-Medium.ttf',
    },
    { family: 'Noto+Sans+JP', weight: '700', fileName: 'NotoSansJP-Bold.ttf' },
  ];

  for (const font of fonts) {
    try {
      await downloadTTFFont(font.family, font.weight, font.fileName);
    } catch (error) {
      console.error(`❌ Failed to download ${font.fileName}:`, error.message);
    }
  }

  console.log('✅ TTF Font download completed!');

  // ファイル一覧を表示
  console.log('\n📁 Downloaded fonts:');
  const files = fs.readdirSync(FONTS_DIR);
  files.forEach((file) => {
    const filePath = path.join(FONTS_DIR, file);
    const stats = fs.statSync(filePath);
    console.log(`  ${file} - ${Math.round(stats.size / 1024)}KB`);
  });
}

main().catch(console.error);
