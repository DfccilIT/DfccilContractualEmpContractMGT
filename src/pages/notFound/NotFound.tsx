import React from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const handleGoBack = () => {
    navigate('/manage-contract');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e2e8f0] px-4">
      <div className="w-full max-w-md p-10 rounded-3xl bg-white/80 backdrop-blur-xl shadow-2xl border border-gray-200 text-center transition-all animate-fade-in">
        <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-gradient-to-tr from-yellow-400 to-yellow-600 rounded-full shadow-md">
          <AlertTriangle className="w-10 h-10 text-white" />
        </div>

        <h1 className="text-3xl font-extrabold text-gray-800 mb-3">Page Not Found</h1>
        <p className="text-gray-700 text-base leading-relaxed mb-6">
          The page you are trying to access could not be found. It may have been removed, renamed, or the URL might be incorrect.
        </p>

        <div className="text-left text-sm text-gray-700 space-y-6 mb-8">
          <div>
            <h2 className="font-semibold text-gray-800 mb-1">Possible Reasons:</h2>
            <ul className="list-disc list-inside">
              <li>The page has been deleted or no longer exists.</li>
              <li>The URL was typed incorrectly.</li>
              <li>You followed an outdated or broken link.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold text-gray-800 mb-1">Recommended Actions:</h2>
            <ul className="list-disc list-inside">
              <li>Return to the homepage using the button below.</li>
              <li>Verify the URL in your browser’s address bar.</li>
              <li>Contact support if you need further assistance.</li>
            </ul>
          </div>
        </div>

        <Button
          onClick={handleGoBack}
          className="w-full hidden sm:flex bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Home Page
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
