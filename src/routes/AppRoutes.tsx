import { Routes, Route } from 'react-router';
import { useEffect } from 'react';
import PrivateRoute from './PrivateRoute';
import Unauthorized from '@/pages/unauthorized/Unauthorized';
import NotFound from '@/pages/notFound/NotFound';
import HomePage from '@/pages/home/Home';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import FrontChannelLogout from '@/auth/FrontChannelLogout';
import { useAppSelector } from '@/app/hooks';
import { useGlobalLogout } from '@/auth/useGlobalLogout';
import { AppDispatch, RootState } from '@/app/store';
import { fetchApplications } from '@/features/applications/applicationSlice';
import AppLayout from '@/components/layout/app-layout';
import Seo from '@/components/common/Seo';
import { useAppName } from '@/hooks/useAppName';
import { useAuth } from 'react-oidc-context';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMasterData } from '@/features/masterData/masterSlice';
import CreateContract from '@/pages/user/CreateContract';
import EmployeeApproval from '@/pages/admin/EmployeeApproval';
import ContractHistory from '@/pages/user/ContractHistory';
import ManageContractor from '@/pages/user/ManageContractor';
import Delegate from '@/pages/admin/Delegate';
import { fetchEmployeesList } from '@/features/employee/employeeSlice';

const AppRoutes = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { fullDescription, description } = useAppName();
  const applications = useAppSelector((state: RootState) => state.applications.applications);
  const { isAuthenticated } = useAuth();
  const masterData = useSelector((state: RootState) => state.masterData.data);
  useEffect(() => {
    if (isAuthenticated && masterData?.employees?.length === 0) {
      dispatch(fetchMasterData());
      dispatch(fetchEmployeesList());
    }
  }, [masterData.employees, isAuthenticated]);
  useGlobalLogout();
  useEffect(() => {
    if (applications.length === 0) {
      dispatch(fetchApplications());
    }
  }, [applications, dispatch]);

  return (
    <>
      <Seo title={fullDescription} description={description} />
      <Routes>
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/logout-notification" element={<FrontChannelLogout />} />
        <Route element={<AppLayout isAdmin={false} />}>
          <Route element={<PrivateRoute allowedRoles={['user']} />}>
            <Route path="/" element={<HomePage />} />
          </Route>
          <Route element={<PrivateRoute allowedRoles={['SuperAdmin', 'Contract Manager', 'Contractual Employee Approver']} />}>
            <Route path="/manage-contractor" element={<ManageContractor />} />
            <Route path="/manage-contract" element={<CreateContract />} />
            <Route path="/contractual" element={<EmployeeApproval />} />
            <Route path="/archived-contract" element={<ContractHistory />} />
          </Route>
          <Route element={<PrivateRoute allowedRoles={['CGM', 'GGM']} />}>
            <Route path="/employee-delegate" element={<Delegate />} />
          </Route>
        </Route>
        <Route element={<AppLayout isAdmin={true} />}>
          <Route element={<PrivateRoute allowedRoles={['SuperAdmin', 'Contract Manager', 'Contractual Employee Approver']} />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default AppRoutes;
