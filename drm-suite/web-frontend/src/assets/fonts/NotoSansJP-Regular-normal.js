// This file contains the base64 encoded Noto Sans JP font for jsPDF
// We'll fetch and embed the font at runtime instead of storing the full base64 here
export const NotoSansJPRegular = {
  fontName: 'NotoSansJP-Regular',
  fontStyle: 'normal',
  encoding: 'Identity-H',
  // Font will be loaded dynamically
  fontDataURL:
    'https://fonts.gstatic.com/ea/notosansjp/v5/NotoSansJP-Regular.otf',
};
