import type * as React from 'react';
import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { CircularProgress } from '@mui/material';
import { GuestRoute } from '@/components/auth/GuestRoute';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import PermissionRouteGuard from '@/components/auth/PermissionRouteGuard';

const MainLayout = lazy(() => import('./layouts/MainLayout'));
const AuthLayout = lazy(() => import('./layouts/AuthLayout'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const WelcomePage = lazy(() => import('./pages/welcome'));
const ProfilePage = lazy(() => import('./pages/profile'));
const ProjectsPage = lazy(() => import('./pages/projects'));
const ProjectDetailPage = lazy(() => import('./pages/projects/detail'));
const TasksPage = lazy(() => import('./pages/tasks'));
const MembersPage = lazy(() => import('./pages/members'));
const ReportsPage = lazy(() => import('./pages/reports'));
const ActivityPage = lazy(() => import('./pages/activity'));
const UsersPage = lazy(() => import('./pages/users'));
const RolesPage = lazy(() => import('./pages/roles'));
const ModulesPage = lazy(() => import('./pages/modules'));
const ActionsPage = lazy(() => import('./pages/actions'));
const PermissionsPage = lazy(() => import('./pages/permissions'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const RecoverPassword = lazy(() => import('./pages/auth/RecoverPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const ChangePassword = lazy(() => import('./pages/auth/ChangePassword'));
const NotFound = lazy(() =>
  import('./pages/not-found').then((module) => ({ default: module.NotFound })),
);

const RouteFallback: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <CircularProgress sx={{ color: 'white' }} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3500} />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/welcome" element={<WelcomePage />} />
              <Route path="/profile" element={<ProfilePage />} />

              <Route element={<PermissionRouteGuard permissionType="projects" permissionActions={['read']} />}>
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
              </Route>

              <Route element={<PermissionRouteGuard permissionType="tasks" permissionActions={['read']} />}>
                <Route path="/tasks" element={<TasksPage />} />
              </Route>

              <Route element={<PermissionRouteGuard permissionType="members" permissionActions={['read']} />}>
                <Route path="/members" element={<MembersPage />} />
              </Route>

              <Route element={<PermissionRouteGuard permissionType="reports" permissionActions={['read']} />}>
                <Route path="/reports" element={<ReportsPage />} />
              </Route>

              <Route element={<PermissionRouteGuard permissionType="activity" permissionActions={['read']} />}>
                <Route path="/activity" element={<ActivityPage />} />
              </Route>

              {/* Permission-guarded routes */}
              <Route element={<PermissionRouteGuard permissionType="users" permissionActions={['read']} />}>
                <Route path="/users" element={<UsersPage />} />
              </Route>
              
              <Route element={<PermissionRouteGuard permissionType="roles" permissionActions={['read']} />}>
                <Route path="/roles" element={<RolesPage />} />
              </Route>
              
              <Route element={<PermissionRouteGuard permissionType="modules" permissionActions={['read']} />}>
                <Route path="/modules" element={<ModulesPage />} />
              </Route>
              
              <Route element={<PermissionRouteGuard permissionType="actions" permissionActions={['read']} />}>
                <Route path="/actions" element={<ActionsPage />} />
              </Route>
              
              <Route element={<PermissionRouteGuard permissionType="permissions" permissionActions={['read']} />}>
                <Route path="/permissions" element={<PermissionsPage />} />
              </Route>
            </Route>
          </Route>

          <Route element={<GuestRoute />}>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/recover-password" element={<RecoverPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/change-password" element={<ChangePassword />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
};

export default App;
