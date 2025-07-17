// モックAPI - バックエンドが利用できない場合のデモ用

const MOCK_USER = {
  id: '1',
  email: 'admin@crm.com',
  name: '管理者',
  role: 'ADMIN',
  companyId: '1',
  companyName: 'デモ建設株式会社',
};

const MOCK_TOKENS = {
  accessToken: 'mock-access-token-' + Date.now(),
  refreshToken: 'mock-refresh-token-' + Date.now(),
};

export const mockApi = {
  login: async (email: string, password: string) => {
    // 疑似的な遅延
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (email === 'admin@crm.com' && password === 'password123') {
      return {
        ...MOCK_TOKENS,
        user: MOCK_USER,
      };
    }
    
    throw new Error('Invalid credentials');
  },
  
  logout: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return { success: true };
  },
  
  refresh: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_TOKENS;
  },
};

export const isMockMode = () => {
  // 環境変数やローカルストレージでモックモードを判定
  return import.meta.env.VITE_MOCK_API === 'true' || 
         localStorage.getItem('mock-mode') === 'true' ||
         window.location.hostname.includes('vercel.app'); // Vercelデプロイ時は自動的にモックモード
};