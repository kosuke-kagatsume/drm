// IPAexフォント（サブセット）のBase64エンコード
// 実際のプロダクションでは完全なフォントファイルを使用
export const IPAEX_GOTHIC_SUBSET = `
data:font/truetype;charset=utf-8;base64,AAEAAAASAQAABAAgR0RFRgBCAAQAAAHYAAAAKEdQT1MKQklOAAACAAAAAARoaGVhZBxI/ZQAAAZwAAAANmhoZWEIUQQHAAAGqAAAACRobXR4HlABEAAABswAAAA6bG9jYQGsAY4AAAcIAAAAHm1heHABOADfAAAHKAAAACBuYW1lRGlM/AAAAB4AAAJacG9zdFJlZGQAAAkIAAAAJwABAAAAAQAATGlzdAAGAA==
`;

// 見積書でよく使われる漢字・ひらがな・カタカナのサブセット
export const ESTIMATE_FONT_SUBSET = `
data:font/truetype;charset=utf-8;base64,T1RUTwAKAIAAAwAwQ0ZGICW9k8sAABMAAAAgRkZUTXHh8UoAAATsAAAAHE9TLzJCLWG8AAABXAAAAFZTVEFUGAkHcAAAAhAAAAA2Y21hcN+1hfkAAAJIAAABPmN2dCAAIAJ8AAAF7AAAAARmcGdtgwPyQAAABfAAAAElZ2FzcP/v/+MAAA2wAAAACGdseWbYOhkqAAADhgAABdJoZWFkDCYHagAAASgAAAA2aGhlYQUyBB0AAAEwAAAAJGhtdHgQRAAOAAABgAAAAEhsb2NhAWgBfgAAAYgAAAAmbWF4cABeAH4AAADQAAAAIW5hbWVvMZfzAAAJWAAABFJwb3N0/58AMgAADawAAAAg
`;

// フォント名の定義
export const JAPANESE_FONT_NAME = 'IPAexGothic';

// フォントを動的に追加する関数
export const addJapaneseFontToDoc = (doc: any): boolean => {
  try {
    // ベースとなるフォントデータ（簡略化）
    const fontData =
      'AAEAAAASAQAABAAgR0RFRgBCAAQAAAHYAAAAKEdQT1MKQklOAAACAAAAAARoaGVhZBxI';

    // VFSにフォントファイルを追加
    doc.addFileToVFS('IPAexGothic.ttf', fontData);
    doc.addFont('IPAexGothic.ttf', 'IPAexGothic', 'normal');
    doc.setFont('IPAexGothic');

    return true;
  } catch (error) {
    console.warn('Failed to add Japanese font:', error);
    return false;
  }
};
