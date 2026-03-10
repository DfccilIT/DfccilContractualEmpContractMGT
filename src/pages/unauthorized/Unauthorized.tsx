import React from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Lock } from 'lucide-react';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/transfer-request');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e2e8f0] px-4">
      <div className="w-full max-w-md p-10 rounded-3xl bg-white/80 backdrop-blur-xl shadow-2xl border border-gray-200 text-center transition-all animate-fade-in">
        <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-gradient-to-tr from-red-500 to-red-700 rounded-full shadow-md">
          <Lock className="w-10 h-10 text-white" />
        </div>

        <h1 className="text-3xl font-extrabold text-gray-800 mb-3">Access Denied</h1>
        <p className="text-gray-700 text-base leading-relaxed mb-6">
          You do not have the necessary authorization to access this page. If you believe you have reached this page in error, please contact your system
          administrator.
        </p>

        <div className="text-left text-sm text-gray-700 space-y-6 mb-8">
          <div>
            <h2 className="font-semibold text-gray-800 mb-1">Recommended Actions:</h2>
            <ul className="list-disc list-inside">
              <li>Return to the home page using the button below.</li>
              <li>Log out and sign in with the appropriate account.</li>
              <li>Reach out to your system administrator for further assistance.</li>
            </ul>
          </div>
        </div>

        <Button className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2 transition-all" onClick={handleGoBack}>
          <ArrowLeft className="w-4 h-4" />
          Return to Home Page
        </Button>
      </div>
    </div>
  );
};

export default Unauthorized;
