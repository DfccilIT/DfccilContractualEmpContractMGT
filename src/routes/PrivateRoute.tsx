import React, { useEffect, useRef } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router';
import { useAuth } from 'react-oidc-context';
import Loader from '@/components/ui/loader';
import { fetchUserProfile } from '@/features/user/userSlice';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useSessionChecker } from '@/hooks/useSessionChecker';
import { UserRole } from '@/types/auth';
import { loadTokenFromSession } from '@/features/user/TokenDataSlice';

interface PrivateRouteProps {
  allowedRoles?: UserRole[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ allowedRoles = [] }) => {
  const auth = useAuth();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  useSessionChecker();

  const { loading: userLoading, Roles } = useAppSelector((state) => state.user);
  const isAuthenticated = auth.isAuthenticated;
  const isInitializing = auth.isLoading;
  const redirectHandled = useRef(false);
  useEffect(() => {
    if (!isAuthenticated && !isInitializing && !redirectHandled.current) {
      redirectHandled.current = true;
      auth.signinRedirect({
        state: {
          returnUrl: location.pathname + location.search, // includes query params
        },
      });
    }
  }, [isAuthenticated, isInitializing, location.pathname, location.search, auth]);

  useEffect(() => {
    if (isAuthenticated && auth.user && !redirectHandled.current) {
      redirectHandled.current = true;

      dispatch(fetchUserProfile());
      dispatch(loadTokenFromSession());

      let returnUrl: string | undefined;

      if (auth.user?.state && typeof (auth.user.state as any).returnUrl === 'string') {
        returnUrl = (auth.user.state as any).returnUrl;
      }

      const fallbackUrl = location.pathname + location.search;
      navigate(returnUrl ?? fallbackUrl, { replace: true });
    }
  }, [isAuthenticated, auth.user, dispatch, navigate, location.pathname, location.search]);
  const hasRequiredRole = allowedRoles.length === 0 || Roles.some((r) => allowedRoles.includes(r as UserRole));
  if (userLoading || isInitializing) return <Loader />;
  if (allowedRoles.length > 0 && Roles?.length > 0 && !hasRequiredRole) return <Navigate to="/unauthorized" replace />;

  if (!isAuthenticated || userLoading) {
    return <Loader />;
  }

  return <Outlet />;
};

export default PrivateRoute;
