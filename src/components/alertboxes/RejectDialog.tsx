import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAppDispatch } from '@/app/hooks';

const RejectDialog = ({ isOpen, onOpenChange, setRemarks, remarks, HandleProceedProfileChangeRequestReject }) => {
  const dispatch = useAppDispatch();
  const [localRemarks, setLocalRemarks] = useState('');

  // Sync local state with parent state
  useEffect(() => {
    setLocalRemarks(remarks || '');
  }, [remarks]);

  // Update parent state when local state changes
  const handleRemarksChange = (value) => {
    setLocalRemarks(value);
    setRemarks(value);
  };

  const handleCancel = () => {
    // console.log('User cancelled reject');
    setLocalRemarks('');
    setRemarks('');
    onOpenChange(false);
  };

  const handleReject = async () => {
    if (isFormValid && HandleProceedProfileChangeRequestReject) {
      try {
        await HandleProceedProfileChangeRequestReject();
      } catch (error) {
        console.error('Error processing rejection:', error);
      }
    }
  };

  const isFormValid = localRemarks && localRemarks.trim().length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md z-50" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">Reject Profile Change Request</DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            Please provide a reason for rejecting this profile change request. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 space-y-4">
          <div>
            <label htmlFor="reject-remarks" className="block text-sm font-medium text-gray-700 mb-2">
              Remarks <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reject-remarks"
              name="remarks"
              value={localRemarks}
              onChange={(e) => handleRemarksChange(e.target.value)}
              placeholder="Enter reason for rejection..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
              style={{ minHeight: '100px' }}
              rows={4}
              autoFocus
            />
            {(!localRemarks || localRemarks.trim().length === 0) && <p className="text-xs text-gray-500 mt-1">Remarks are required to reject the request</p>}
          </div>
        </div>

        <DialogFooter className="flex space-x-2">
          <Button variant="outline" onClick={handleCancel} className="px-4 py-2">
            Cancel
          </Button>
          <Button
            onClick={handleReject}
            disabled={!isFormValid}
            className={`px-4 py-2 ${isFormValid ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          >
            Reject Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RejectDialog;
