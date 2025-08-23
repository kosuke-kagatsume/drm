// Japanese font setup for jsPDF
export async function setupJapaneseFont(doc: any) {
  try {
    // IPAexフォントのCDNから取得（より軽量で日本語対応）
    const fontUrl =
      'https://cdn.jsdelivr.net/npm/@mincho/font-ipa-ex-mincho@1.0.1/IPA-ex-Mincho.woff';

    // フォントをbase64に変換
    const response = await fetch(fontUrl);
    const blob = await response.blob();
    const reader = new FileReader();

    return new Promise((resolve) => {
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const fontBase64 = base64.split(',')[1];

        // カスタムフォントとして追加
        doc.addFileToVFS('IPA-ex-Mincho.ttf', fontBase64);
        doc.addFont('IPA-ex-Mincho.ttf', 'IPA', 'normal');
        doc.setFont('IPA');

        resolve(true);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn('Failed to load Japanese font, using fallback', error);
    // フォールバック: デフォルトフォントを使用
    doc.setFont('helvetica');
    return false;
  }
}

// 日本語テキストを安全に描画するヘルパー関数
export function drawJapaneseText(
  doc: any,
  text: string,
  x: number,
  y: number,
  options?: any,
) {
  try {
    // 日本語文字を含むかチェック
    const hasJapanese =
      /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\u3400-\u4dbf]/.test(
        text,
      );

    if (hasJapanese) {
      // 日本語が含まれる場合、文字を分割して描画
      const chars = text.split('');
      let currentX = x;

      chars.forEach((char) => {
        if (
          /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\u3400-\u4dbf]/.test(
            char,
          )
        ) {
          // 日本語文字の場合、□で代替表示（フォントが読み込めない場合）
          doc.text('□', currentX, y, options);
        } else {
          // ASCII文字はそのまま表示
          doc.text(char, currentX, y, options);
        }
        currentX += doc.getTextWidth(char);
      });
    } else {
      // 日本語を含まない場合は通常通り描画
      doc.text(text, x, y, options);
    }
  } catch (error) {
    // エラーの場合は通常のテキスト描画
    doc.text(text, x, y, options);
  }
}

// 簡易的な日本語対応（文字を□で置換）
export function sanitizeJapaneseText(text: string): string {
  // 日本語文字を検出して代替文字に置換
  return text.replace(
    /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\u3400-\u4dbf]/g,
    '□',
  );
}
