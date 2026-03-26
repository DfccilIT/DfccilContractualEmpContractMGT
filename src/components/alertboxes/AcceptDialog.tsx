import React, { useState } from 'react';
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
import { Checkbox } from '../ui/checkbox';
import { useAppDispatch } from '@/app/hooks';

interface AcceptDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  HandleProceedProfileChangeRequest?: () => Promise<void> | void;
  isEmployeeApprovalPage?: boolean;
  isCheckboxRequired?: boolean; // ✅ New prop
}

const AcceptDialog: React.FC<AcceptDialogProps> = ({
  isOpen,
  onOpenChange,
  HandleProceedProfileChangeRequest,
  isEmployeeApprovalPage = false,
  isCheckboxRequired = true, // ✅ Default true
}) => {
  const [isChecked, setIsChecked] = useState(false);
  const dispatch = useAppDispatch();

  const handleCancel = () => {
    onOpenChange(false);
    setIsChecked(false);
  };

  const handleAccept = async () => {
    // Only require checkbox if required and not on employee approval page
    if ((isEmployeeApprovalPage || !isCheckboxRequired || isChecked) && HandleProceedProfileChangeRequest) {
      try {
        await HandleProceedProfileChangeRequest();
        setIsChecked(false);
      } catch (error) {
        console.error('Error processing request:', error);
      }
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-semibold text-gray-900">Confirm Profile Change Request</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600 mt-2">
            Are you sure you want to accept this profile change request? This action will approve the requested changes and cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Show checkbox only if required */}
        {isCheckboxRequired && !isEmployeeApprovalPage && (
          <div className="my-4">
            <label className="flex items-start space-x-3 cursor-pointer">
              <Checkbox checked={isChecked} onCheckedChange={setIsChecked} />
              <span className="text-sm text-gray-700 leading-5">
                I confirm that I have updated the changes in SAP and want to approve this profile change request.
              </span>
            </label>
          </div>
        )}

        <AlertDialogFooter className="flex space-x-2">
          <AlertDialogCancel onClick={handleCancel} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleAccept}
            disabled={isCheckboxRequired && !isEmployeeApprovalPage && !isChecked} // ✅ Check requirement before enabling
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              !isCheckboxRequired || isEmployeeApprovalPage || isChecked
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Accept Request
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AcceptDialog;
