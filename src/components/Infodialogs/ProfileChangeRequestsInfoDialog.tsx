import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, User, XCircle } from 'lucide-react';
import AcceptDialog from '../alertboxes/AcceptDialog';
import { acceptProfileChangeRequests } from '@/features/employeeApproval/acceptprofilechangerequestslice';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchProfileChangeRequest } from '@/features/employeeApproval/editprofilerequestsslice';
import RejectDialog from '../alertboxes/RejectDialog';
import { Button } from '../ui/button';
import { RootState } from '@/app/store';
import { useSearchParams } from 'react-router';

const ProfileChangeRequestsInfoDialog = ({ isOpen, onClose, selectedRequest, isCheckboxRequired }) => {
  const [isAcceptAlertOpenProfileChange, setIsAcceptAlertOpenProfileChange] = useState(false);
  const [isRejectOpenProfileChange, setIsRejectOpenProfileChange] = useState(false);
  const [remarks, setRemarks] = useState('');
  const { Roles } = useAppSelector((state: RootState) => state.user);
  const [searchParams] = useSearchParams();
  const subTabFromUrl = searchParams.get('status') || 'pending';
  const dispatch = useAppDispatch();

  const handleAcceptProfileChangeRequestClick = () => {
    setIsAcceptAlertOpenProfileChange(true);
  };

  const handleRejectProfileChangeRequestClick = () => {
    setIsRejectOpenProfileChange(true);
  };

  const HandleProceedProfileChangeRequestAccept = async () => {
    try {
      await dispatch(
        acceptProfileChangeRequests({
          employeeCode: selectedRequest?.oldRecored?.employeeCode,
          isApproved: true,
          remarks: '',
        })
      ).unwrap();

      // Refresh the data
      dispatch(fetchProfileChangeRequest());

      // Close dialogs
      setIsAcceptAlertOpenProfileChange(false);
      onClose(); // Close the main info dialog
    } catch (error) {
      console.error('Error accepting profile change request:', error);
    }
  };

  const HandleProceedProfileChangeRequestReject = async () => {
    try {
      await dispatch(
        acceptProfileChangeRequests({
          employeeCode: selectedRequest?.oldRecored?.employeeCode,
          isApproved: false,
          remarks: remarks,
        })
      ).unwrap();

      dispatch(fetchProfileChangeRequest());

      setRemarks('');
      setIsRejectOpenProfileChange(false);
      onClose();
    } catch (error) {
      console.error('Error rejecting profile change request:', error);
    }
  };

  const fieldMappings = {
    employeeCode: 'Employee Code',
    userName: 'Name',
    gender: 'Gender',
    designation: 'Designation',
    positionGrade: 'Position Grade',
    department: 'Department',
    dob: 'Date of Birth',
    dateOfAnniversary: 'Anniversary Date',
    dateOfJoining: 'Joining Date',
    location: 'Location',
    mobile: 'Mobile',
    emailAddress: 'Email',
    email: 'Email',
    personalEmailAddress: 'Personal Email',
    personalEmailId: 'Personal Email',
    tOemploy: 'Employment Type',
    toemploy: 'Employment Type',
    // aboutUs: 'About',
    // photo: 'Photo',
    // reportingOfficer: 'Reporting Officer',
    extensionNo: 'Extension No',
  };

  // Function to normalize values for comparison
  const normalizeValue = (value) => {
    if (value === null || value === undefined || value === '') return '';
    return String(value).toLowerCase().replace(/\s+/g, '');
  };

  // Function to check if a field has changed
  const isFieldChanged = (key, oldValue, newValue) => {
    const normalizedOld = normalizeValue(oldValue);
    const normalizedNew = normalizeValue(newValue);
    return normalizedOld !== normalizedNew;
  };

  const formatValue = (key, value) => {
    if (value === null || value === undefined || value === '') return null;

    // Format dates
    if (key.includes('date') || key === 'dob') {
      try {
        return new Date(value).toLocaleDateString();
      } catch (e) {
        return value;
      }
    }

    if (key === 'photo') {
      return value;
    }

    return value;
  };

  const renderEmployeeFields = (employee, isNewData = false, oldEmployee = null) => {
    if (!employee) return null;

    const textColorClass = isNewData ? 'text-blue-600' : 'text-gray-600';
    const valueColorClass = isNewData ? 'text-blue-800' : 'text-gray-800';

    const fieldsToRender = Object.entries(employee)
      .filter(([key, value]) => {
        return (
          value !== null &&
          value !== undefined &&
          value !== '' &&
          value !== 'NA' &&
          key !== 'requestId' &&
          key !== 'reportingOfficer' &&
          key !== 'aboutUs' &&
          key !== 'photo'
        );
      })
      .map(([key, value]) => {
        const label = fieldMappings[key] || key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
        const formattedValue = formatValue(key, value);

        // Also skip if formattedValue becomes NA after formatting
        if (formattedValue === null || formattedValue === 'NA') return null;

        // Check if field has changed (only for new data comparison)
        let isChanged = false;
        if (isNewData && oldEmployee) {
          const oldValue = oldEmployee[key];
          isChanged = isFieldChanged(key, oldValue, value);
        }

        // Apply highlighting styles for changed fields
        const highlightClass = isChanged ? 'bg-yellow-100 border border-yellow-300 rounded px-2 py-1' : '';
        const labelHighlight = isChanged ? 'font-bold text-orange-600' : textColorClass;
        const valueHighlight = isChanged ? 'font-bold text-orange-800' : valueColorClass;

        return (
          <div key={key} className={highlightClass}>
            <span className={`${labelHighlight} text-sm`}>{label}: </span>
            <span className={`font-medium ${valueHighlight} ${key.includes('email') ? 'break-all' : ''}`}>{formattedValue}</span>
          </div>
        );
      })
      .filter(Boolean); // remove null returns

    // Split into 3 columns
    const columns = [[], [], []];
    fieldsToRender.forEach((field, index) => {
      columns[index % 3].push(field);
    });

    return columns.map((columnFields, columnIndex) => (
      <div key={columnIndex} className="space-y-2">
        {columnFields}
      </div>
    ));
  };

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl w-full max-h-[90vh] overflow-y-auto" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">Profile Change Request</DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Current Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {renderEmployeeFields(selectedRequest.oldRecored || selectedRequest, false)}
                </div>
              </div>

              {selectedRequest.newRecords && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Requested Changes
                    <span className="text-sm text-orange-600 font-normal ml-2">(Changed fields are highlighted)</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {renderEmployeeFields(selectedRequest.newRecords, true, selectedRequest.oldRecored || selectedRequest)}
                  </div>
                </div>
              )}
            </div>
          )}
          {!Roles?.includes('CGM') && subTabFromUrl === 'pending' && (
            <div className="flex space-x-2 justify-end">
              <Button onClick={handleAcceptProfileChangeRequestClick} className="bg-green-600 hover:bg-green-700 text-white">
                <CheckCircle className="w-4 h-4 mr-1" />
                Accept
              </Button>

              <Button onClick={handleRejectProfileChangeRequestClick} className="bg-red-600 hover:bg-red-700 text-white">
                <XCircle className="w-4 h-4 mr-1" />
                Reject
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AcceptDialog
        isOpen={isAcceptAlertOpenProfileChange}
        onOpenChange={setIsAcceptAlertOpenProfileChange}
        HandleProceedProfileChangeRequest={HandleProceedProfileChangeRequestAccept}
        isEmployeeApprovalPage={false}
        isCheckboxRequired={isCheckboxRequired}
      />
      <RejectDialog
        isOpen={isRejectOpenProfileChange}
        onOpenChange={setIsRejectOpenProfileChange}
        setRemarks={setRemarks}
        remarks={remarks}
        HandleProceedProfileChangeRequestReject={HandleProceedProfileChangeRequestReject}
      />
    </div>
  );
};

export default ProfileChangeRequestsInfoDialog;
