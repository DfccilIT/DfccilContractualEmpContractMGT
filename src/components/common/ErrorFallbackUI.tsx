import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';
import { environment } from '@/config';
import { useAppSelector } from '@/app/hooks';
import { RootState } from '@/app/store';
const ErrorFallbackUI = () => {
  const { EmpCode } = useAppSelector((state: RootState) => state.user);
  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/manage-contract';
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="w-full max-w-2xl px-4 py-10">
        <div className="text-center mb-8">
          <div className="relative inline-block mb-6">
            <div className="relative z-10 inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 animate-pulse">
              <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="absolute top-4 left-8 w-6 h-6 bg-blue-200 rounded-full opacity-40"></div>
            <div className="absolute bottom-2 right-6 w-8 h-8 bg-purple-200 rounded-full opacity-40"></div>
            <div className="absolute top-8 right-4 w-5 h-5 bg-yellow-200 rounded-full opacity-40"></div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 tracking-tight">Oops! Something went wrong</h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">We've hit a roadblock. Our team has been notified and is working on it.</p>
        </div>

        <Card className="border-red-200 shadow-xl mb-6 overflow-hidden relative">
          <div className="absolute h-1 bg-gradient-to-r from-red-400 via-red-500 to-red-600 w-full top-0"></div>

          <CardHeader className="bg-white border-b border-red-100 pb-3">
            <CardTitle className="text-red-700 text-lg md:text-xl flex items-center">
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Error Information
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-4">
            <p className="text-gray-700 mb-4 leading-relaxed">
              The application encountered an unexpected error while processing your request. We're sorry for the inconvenience this may have caused.
            </p>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row gap-3 bg-gray-50 border-t p-4 items-center justify-center">
            <Button variant="outline" className="w-full sm:w-auto border-gray-300 hover:bg-gray-100 hover:text-gray-900 transition-all" onClick={handleGoHome}>
              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Go to Homepage
            </Button>
            <Button
              className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg transition-all"
              onClick={handleRefresh}
            >
              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Try Again
            </Button>
          </CardFooter>
        </Card>

        {/* Footer section */}
        <div className="text-center text-gray-500 text-sm bg-white p-3 rounded-lg shadow-sm border border-gray-100">
          <p>If this problem persists, please contact our IT support team at:</p>
          {/* <p className="font-medium mt-1 text-gray-600">support@yourcompany.com</p> */}
        </div>
      </div>
    </div>
  );
};

export default ErrorFallbackUI;
