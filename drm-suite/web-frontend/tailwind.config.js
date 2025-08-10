// const { createGlobPatternsForDependencies } = require('@nx/next/tailwind');

// The above utility import will not work if you are using Next.js' --turbo.
// Instead you will have to manually add the dependent paths to be included.
// For example
// ../libs/buttons/**/*.{ts,tsx,js,jsx,html}',                 <--- Adding a shared lib
// !../libs/buttons/**/*.{stories,spec}.{ts,tsx,js,jsx,html}', <--- Skip adding spec/stories files from shared lib

// If you are **not** using `--turbo` you can uncomment both lines 1 & 19.
// A discussion of the issue can be found: https://github.com/nrwl/nx/issues/26510

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './{src,pages,components,app}/**/*.{ts,tsx,js,jsx,html}',
    '!./{src,pages,components,app}/**/*.{stories,spec}.{ts,tsx,js,jsx,html}',
    //     ...createGlobPatternsForDependencies(__dirname)
  ],
  theme: {
    extend: {
      colors: {
        dandori: {
          blue: '#0099CC', // メインのターコイズブルー
          'blue-light': '#00CCFF', // 明るいブルー
          'blue-dark': '#006699', // 濃いブルー
          orange: '#FF9933', // オレンジ
          pink: '#FF3366', // ピンク
          yellow: '#FFCC33', // イエロー
          cream: '#FFF5E6', // クリーム
          sky: '#66CCFF', // スカイブルー
        },
      },
      backgroundImage: {
        'gradient-dandori': 'linear-gradient(135deg, #0099CC 0%, #00CCFF 100%)',
        'gradient-warm': 'linear-gradient(135deg, #FF9933 0%, #FFCC33 100%)',
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'bounce-light': 'bounceLight 2s infinite',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        bounceLight: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
