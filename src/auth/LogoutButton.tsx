import { useState } from 'react';

import { Power, LogOut } from 'lucide-react';
// import { useGlobalLogout } from './useGlobalLogout';
import {
  AlertDialogDescription,
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { useGlobalLogout } from './useGlobalLogout';

const LogoutButton = () => {
  const { globalLogout } = useGlobalLogout();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await globalLogout();
      setIsOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative group border-2 border-slate-200 hover:border-red-300 transition-all duration-300 hover:shadow-lg hover:shadow-red-100 bg-gradient-to-br from-white to-slate-50 hover:from-red-50 hover:to-white"
        >
          <Power className="w-5 h-5 text-slate-600 group-hover:text-red-500 transition-all duration-300 group-hover:rotate-180" />
          <div className="absolute inset-0 rounded-md bg-gradient-to-r from-red-400/0 via-red-400/0 to-red-400/0 group-hover:from-red-400/10 group-hover:via-red-400/5 group-hover:to-red-400/10 transition-all duration-500" />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="max-w-md mx-auto bg-gradient-to-br from-white via-slate-50 to-white border-0 shadow-2xl shadow-slate-200/50">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-orange-500/5 rounded-lg" />

        <AlertDialogHeader className="relative">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/25">
                <LogOut className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <AlertDialogTitle className="text-center text-xl font-semibold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Confirm Logout
          </AlertDialogTitle>

          <AlertDialogDescription className=" text-slate-600 leading-relaxed mt-3">
            <div className="space-y-2">
              <div className="text-black text-lg text-center">Are you sure you want to terminate all your current sessions?</div>
              <div className="flex items-center justify-center gap-2 text-xs mt-4 text-slate-500">
                You will be logged out from all applications and need to sign in again.
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="relative flex-col sm:flex-row gap-3 mt-6">
          <AlertDialogCancel className="w-full sm:w-auto order-2 sm:order-1 border-2 border-slate-200 hover:border-slate-300 bg-gradient-to-r from-slate-50 to-white hover:from-slate-100 hover:to-slate-50 text-slate-700 font-medium transition-all duration-300 hover:shadow-md">
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={handleLogout}
            className="w-full sm:w-auto order-1 sm:order-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 transition-all duration-300 transform hover:-translate-y-0.5 border-0"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Yes, Logout
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LogoutButton;
