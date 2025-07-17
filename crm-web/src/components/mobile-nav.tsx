import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, LayoutDashboard, Map, Users, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import { mockApi, isMockMode } from '@/lib/mock-api';

export default function MobileNav() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      if (isMockMode()) {
        await mockApi.logout();
      } else {
        await api.post('/auth/logout');
      }
    } catch (error) {
      // Continue with logout even if API call fails
    }
    logout();
    navigate('/login');
  };

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'ダッシュボード' },
    { href: '/map', icon: Map, label: '地図表示' },
    { href: '/projects', icon: Users, label: 'プロジェクト' },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="mr-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
            <h1 className="text-lg font-semibold">CRM System</h1>
          </div>
          <div className="text-sm text-gray-600">
            {user?.name}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-40 transform bg-black bg-opacity-50 transition-opacity md:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />
      
      <div
        className={`fixed top-0 left-0 z-40 h-full w-64 transform bg-white shadow-lg transition-transform md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="p-4 pt-16">
            <p className="text-sm text-gray-500">{user?.companyName}</p>
          </div>
          
          <nav className="flex-1">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(item.href);
                  setIsOpen(false);
                }}
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100"
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </a>
            ))}
          </nav>
          
          <div className="border-t p-4">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              ログアウト
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}