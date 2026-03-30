import { useAppSelector } from '@/app/hooks';
import { RootState } from '@/app/store';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';

const Home = () => {
  const navigate = useNavigate();

  const { Roles } = useAppSelector((state: RootState) => state.user);
  useEffect(() => {
    if (Roles?.includes('GM') || Roles?.includes('GGM') || Roles?.includes('CGM') || Roles?.includes('SuperAdmin')) {
      navigate('/employee-delegate', { replace: true });
      return;
    }
    if (Roles.includes('Contractual Employee Approver') || Roles?.includes('SuperAdmin')) {
      navigate('/manage-contract', { replace: true });
      return;
    }
  }, [Roles, navigate]);

  return <div className="flex items-center justify-center min-h-screen">{/* <Loader /> */}</div>;
};

export default Home;
