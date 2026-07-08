import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import MissionControl from './pages/MissionControl';
import LiveOperations from './pages/LiveOperations';
import SmartMap from './pages/SmartMap';
import AIDecisionEngine from './pages/AIDecisionEngine';
import HistoricalReplay from './pages/HistoricalReplay';
import ImpactAnalytics from './pages/ImpactAnalytics';
import RoleDashboards from './pages/RoleDashboards';
import NotFound from './pages/NotFound';
import Layout from './layouts/MainLayout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DemoModeProvider } from './context/DemoModeContext';
import { RoleProvider } from './context/RoleContext';
import DemoModeSelector from './components/DemoModeSelector';
import Profile from './pages/Profile';
import SignUp from './pages/SignUp';
import { ProtectedRoute } from './components/ProtectedRoute';
import Workspace from './pages/Workspace';
import { WorkspaceProviders } from './context/WorkspaceProviders';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <ErrorBoundary>
        <DemoModeProvider>
          <RoleProvider>
            <Routes>
              {/* ── Public routes ── */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/signup" element={<SignUp />} />

              {/* ── Primary workspace (Digital Twin shell) ── */}
              <Route
                path="/workspace"
                element={
                  <WorkspaceProviders>
                    <Workspace />
                  </WorkspaceProviders>
                }
              />

              {/* ── Authenticated routes ── */}
              <Route path="/profile" element={<Layout><Profile /></Layout>} />
              <Route path="/mission-control" element={<Layout><MissionControl /></Layout>} />
              <Route path="/live-ops" element={<Layout><LiveOperations /></Layout>} />
              <Route path="/ai-engine" element={<Layout><AIDecisionEngine /></Layout>} />

              {/* ── Role-restricted routes ── */}
              <Route
                path="/gis-map"
                element={
                  <ProtectedRoute allowedRoles={['cooperative', 'government', 'research']}>
                    <Layout><SmartMap /></Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/historical"
                element={
                  <ProtectedRoute allowedRoles={['cooperative', 'government', 'research']}>
                    <Layout><HistoricalReplay /></Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute allowedRoles={['cooperative', 'government', 'research']}>
                    <Layout><ImpactAnalytics /></Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboards"
                element={
                  <ProtectedRoute allowedRoles={['cooperative', 'government', 'research']}>
                    <Layout><RoleDashboards /></Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboards/*"
                element={
                  <ProtectedRoute allowedRoles={['cooperative', 'government', 'research']}>
                    <Layout><RoleDashboards /></Layout>
                  </ProtectedRoute>
                }
              />

              {/* ── 404 fallback ── */}
              <Route path="*" element={<NotFound />} />
            </Routes>

            {/* Global Demo Mode selector overlay */}
            <DemoModeSelector />
          </RoleProvider>
        </DemoModeProvider>
      </ErrorBoundary>
    </div>
  );
}

export default App;
