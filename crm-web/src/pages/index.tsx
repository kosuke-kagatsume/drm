import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';

export default function IndexPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  // If authenticated, go to dashboard, otherwise show demo
  return <Navigate to={isAuthenticated ? '/dashboard' : '/demo'} />;
}