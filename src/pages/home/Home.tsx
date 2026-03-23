import React from 'react';
import { useAuth } from 'react-oidc-context';
import { Navigate } from 'react-router';

const Home = () => {
  const auth = useAuth();

  return <Navigate to="/manage-contractor" replace={true} />;
};

export default Home;
