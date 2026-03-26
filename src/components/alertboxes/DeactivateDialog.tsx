import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DeactivateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  HandleProceedDeactivate?: () => Promise<void> | void;
  employeeName?: string;
}

const DeactivateDialog: React.FC<DeactivateDialogProps> = ({ isOpen, onOpenChange, HandleProceedDeactivate, employeeName }) => {
  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleDeactivate = async () => {
    if (HandleProceedDeactivate) {
      try {
        await HandleProceedDeactivate();
      } catch (error) {
        console.error('Error deactivating account:', error);
      }
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-semibold text-gray-900">Deactivate Employee Account</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600 mt-2">
            {employeeName ? (
              <>
                Are you sure you want to deactivate the account for <span className="font-semibold text-gray-900">{employeeName}</span>? This action will
                disable access for this employee and cannot be undone.
              </>
            ) : (
              <>Are you sure you want to deactivate this employee account? This action will disable access for this employee and cannot be undone.</>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex space-x-2">
          <AlertDialogCancel onClick={handleCancel} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleDeactivate} className="px-4 py-2 rounded-md font-medium transition-colors bg-red-600 text-white hover:bg-red-700">
            Deactivate Account
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeactivateDialog;
