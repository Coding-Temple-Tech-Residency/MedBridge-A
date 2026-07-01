import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import UploadPage from './components/UploadPage';
import ResultsPage from './components/ResultsPage';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import NotFoundPage from './components/NotFoundPage';

// ── Protected layout: Header + page content ───────────────────────────────────
const AppLayout: React.FC = () => (
  <div className="min-h-screen">
    <Header />
    <Outlet />
  </div>
);

// ── App ───────────────────────────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes — redirect to /dashboard when already authenticated */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected routes — redirect to /login when unauthenticated */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<LandingPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/results" element={<ResultsPage />} />
          </Route>
        </Route>

        {/* Default redirect and 404 */}
        <Route path="/" element={<PublicRoute />}>
          <Route index element={<LoginPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
