import { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from './components/layout/PageTransition';
import { Navbar } from './components/layout/Navbar';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { LoadingScreen } from './components/ui/LoadingScreen';

// ─── Lazy-loaded pages ───
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Events = lazy(() => import('./pages/Events'));
const EventDetail = lazy(() => import('./pages/EventDetail'));
const Tickets = lazy(() => import('./pages/Tickets'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Schedule = lazy(() => import('./pages/Schedule'));
const Profile = lazy(() => import('./pages/Profile'));
const OrganizerHome = lazy(() => import('./pages/OrganizerHome'));
const CreateEvent = lazy(() => import('./pages/CreateEvent'));
const ManageEvent = lazy(() => import('./pages/ManageEvent'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ManageUsers = lazy(() => import('./pages/ManageUsers'));
const ManageEvents = lazy(() => import('./pages/ManageEvents'));
const Announcements = lazy(() => import('./pages/Announcements'));
const Sponsors = lazy(() => import('./pages/SponsorsAdmin'));

export default function App() {
  const location = useLocation();
  const isAuthPage = ['/', '/login', '/register', '/forgot-password'].includes(location.pathname) || location.pathname.startsWith('/reset-password');
  const isDashboard = !isAuthPage && location.pathname !== '/';

  return (
    <div className="min-h-screen bg-prisma-black">
      {!isDashboard && <Navbar />}
      <AnimatePresence mode="wait">
        <Suspense fallback={<LoadingScreen />}>
          <Routes location={location} key={location.pathname}>
            {/* Public */}
            <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
            <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
            <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
            <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
            <Route path="/reset-password/:token" element={<PageTransition><ResetPassword /></PageTransition>} />

            {/* Student Dashboard */}
            <Route path="/dashboard" element={<DashboardLayout><PageTransition><Dashboard /></PageTransition></DashboardLayout>} />
            <Route path="/events" element={<DashboardLayout><PageTransition><Events /></PageTransition></DashboardLayout>} />
            <Route path="/events/:id" element={<DashboardLayout><PageTransition><EventDetail /></PageTransition></DashboardLayout>} />
            <Route path="/tickets" element={<DashboardLayout><PageTransition><Tickets /></PageTransition></DashboardLayout>} />
            <Route path="/notifications" element={<DashboardLayout><PageTransition><Notifications /></PageTransition></DashboardLayout>} />
            <Route path="/schedule" element={<DashboardLayout><PageTransition><Schedule /></PageTransition></DashboardLayout>} />
            <Route path="/profile" element={<DashboardLayout><PageTransition><Profile /></PageTransition></DashboardLayout>} />

            {/* Organizer */}
            <Route path="/organizer" element={<DashboardLayout><PageTransition><OrganizerHome /></PageTransition></DashboardLayout>} />
            <Route path="/organizer/events/new" element={<DashboardLayout><PageTransition><CreateEvent /></PageTransition></DashboardLayout>} />
            <Route path="/organizer/events/:id" element={<DashboardLayout><PageTransition><ManageEvent /></PageTransition></DashboardLayout>} />

            {/* Admin */}
            <Route path="/admin" element={<DashboardLayout><PageTransition><AdminDashboard /></PageTransition></DashboardLayout>} />
            <Route path="/admin/users" element={<DashboardLayout><PageTransition><ManageUsers /></PageTransition></DashboardLayout>} />
            <Route path="/admin/events" element={<DashboardLayout><PageTransition><ManageEvents /></PageTransition></DashboardLayout>} />
            <Route path="/admin/announcements" element={<DashboardLayout><PageTransition><Announcements /></PageTransition></DashboardLayout>} />
            <Route path="/admin/sponsors" element={<DashboardLayout><PageTransition><Sponsors /></PageTransition></DashboardLayout>} />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </div>
  );
}
