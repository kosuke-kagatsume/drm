import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { useAuthStore } from '@/store/auth';
import LoginPage from '@/pages/login';
import DashboardPage from '@/pages/dashboard';
import DemoPage from '@/pages/demo';
import IndexPage from '@/pages/index';
import Layout from '@/components/layout';
import MapPage from '@/pages/map';
import ProjectsPage from '@/pages/projects';
import ProjectDetailPage from '@/pages/project-detail';
import FollowUpPage from '@/pages/follow-up';
import QuotePage from '@/pages/quote';
import AfterServicePage from '@/pages/after-service';
import AfterServiceCalendarPage from '@/pages/after-service-calendar';
import RealtimeDashboardPage from '@/pages/realtime-dashboard';
import AIInsightsPage from '@/pages/ai-insights';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<IndexPage />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />}
          />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/realtime" element={<RealtimeDashboardPage />} />
                    <Route path="/ai-insights" element={<AIInsightsPage />} />
                    <Route path="/map" element={<MapPage />} />
                    <Route path="/projects" element={<ProjectsPage />} />
                    <Route path="/projects/:id" element={<ProjectDetailPage />} />
                    <Route path="/projects/:projectId/follow-up" element={<FollowUpPage />} />
                    <Route path="/quote" element={<QuotePage />} />
                    <Route path="/after-service" element={<AfterServicePage />} />
                    <Route path="/after-service-calendar" element={<AfterServiceCalendarPage />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </>
  );
}

export default App;
