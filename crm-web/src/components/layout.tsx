import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, Map, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import MobileNav from '@/components/mobile-nav';
import api from '@/lib/api';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
    }
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Navigation */}
      <MobileNav />
      
      <div className="flex h-screen bg-gray-100">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-64 bg-white shadow-md">
          <div className="p-4">
            <h2 className="text-xl font-bold">CRM System</h2>
            <p className="text-sm text-gray-500">{user?.companyName}</p>
          </div>
          <nav className="mt-8">
            <a
              href="/dashboard"
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              <LayoutDashboard className="mr-3 h-5 w-5" />
              ダッシュボード
            </a>
            <a
              href="/map"
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              <Map className="mr-3 h-5 w-5" />
              地図表示
            </a>
            <a
              href="/projects"
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              <Users className="mr-3 h-5 w-5" />
              プロジェクト
            </a>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Desktop Header */}
          <header className="hidden md:block bg-white shadow-sm">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center">
                <span className="text-gray-600">
                  {user?.name} ({user?.role})
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                ログアウト
              </Button>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 pt-16 md:pt-0">{children}</main>
        </div>
      </div>
    </>
  );
}