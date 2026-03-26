import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { User, Mail, Phone, MapPin, Calendar, Building, Users, FileText, CheckCircle, Clock, XCircle } from 'lucide-react';
import { findEmployeeDetails, formatDate } from '@/lib/helperFunction';
import { proceedReportingofficerChangeRequests } from '@/features/profilechangeslices/ProceedReportingAuthorityslice';
import { fetchReportingAuthorityRequests } from '@/features/profilechangeslices/Reportingauthorityrequestsslice';
import { useDispatch } from 'react-redux';
import { useAppDispatch } from '@/app/hooks';
import AcceptDialog from '../alertboxes/AcceptDialog';
import RejectDialog from '../alertboxes/RejectDialog';
import { Button } from '../ui/button';

const ReportingAuthorityRequestsInfoDialog = ({ isOpen, onClose, selectedRequest, employee }) => {
  console.log('Selected Reporting Authority Request:', selectedRequest);
  const [isAcceptAlertOpenReportingOfficer, setIsAcceptAlertOpenReportingOfficer] = useState(false);
  const [isRejectOpenReportingOfficer, setIsRejectOpenReportingOfficer] = useState(false);
  const dispatch = useAppDispatch();
  const [remarks, setRemarks] = useState('');

  const handleAcceptReportingOfficerRequestClick = () => {
    setIsAcceptAlertOpenReportingOfficer(true);
  };

  const handleRejectReportingOfficerRequestClick = () => {
    setIsRejectOpenReportingOfficer(true);
  };

  const HandleProceedReportingOfficerAccept = async () => {
    try {
      await dispatch(
        proceedReportingofficerChangeRequests({
          employeeCode: selectedRequest?.employeeCode,
          isApproved: true,
          remarks: '',
        })
      ).unwrap();

      // Refresh the data
      dispatch(fetchReportingAuthorityRequests());

      // Close dialogs
      setIsAcceptAlertOpenReportingOfficer(false);
      onClose(); // Close the main info dialog
    } catch (error) {
      console.error('Error accepting reporting officer change request:', error);
    }
  };

  const HandleProceedReportingOfficerReject = async () => {
    try {
      await dispatch(
        proceedReportingofficerChangeRequests({
          employeeCode: selectedRequest?.employeeCode,
          isApproved: false,
          remarks: remarks,
        })
      ).unwrap();

      // Refresh the data
      dispatch(fetchReportingAuthorityRequests());

      // Reset remarks and close dialogs
      setRemarks('');
      setIsRejectOpenReportingOfficer(false);
      onClose(); // Close the main info dialog
    } catch (error) {
      console.error('Error rejecting reporting officer change request:', error);
    }
  };

  if (!selectedRequest) return null;

  const getStatusIcon = (status) => {
    switch (status) {
      case 99:
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 1:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 0:
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 99:
        return 'Pending';
      case 1:
        return 'Approved';
      case 0:
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 99:
        return 'bg-yellow-100 text-yellow-800';
      case 1:
        return 'bg-green-100 text-green-800';
      case 0:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const InfoItem = ({ icon: Icon, label, value, className = '' }) => (
    <div className={`flex items-start gap-2 ${className}`}>
      <Icon className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <span className="text-xs text-gray-500 block">{label}</span>
        <span className="text-sm font-medium text-gray-900 break-words">{value || 'N/A'}</span>
      </div>
    </div>
  );

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-semibold">Reporting Officer Change Request</DialogTitle>
                <DialogDescription className="text-sm text-gray-600 mt-1">
                  Request ID: {selectedRequest.edtEmpDetID} • Code: {selectedRequest.employeeCode}
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(selectedRequest.status)}
                <Badge className={getStatusColor(selectedRequest.status)}>{getStatusText(selectedRequest.status)}</Badge>
              </div>
            </div>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[calc(90vh-120px)] pr-2">
            <div className="space-y-4">
              {/* Employee Basic Info Card */}
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Left Column - Personal Info */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900 border-b pb-1">Personal Information</h4>
                      {selectedRequest.userName && <InfoItem icon={User} label="Full Name" value={selectedRequest.userName} />}
                      {selectedRequest.gender && <InfoItem icon={User} label="Gender" value={selectedRequest.gender} />}
                      {selectedRequest.dob && <InfoItem icon={Calendar} label="Date of Birth" value={formatDate(selectedRequest.dob)} />}
                      {selectedRequest.dateOfAnniversary && (
                        <InfoItem icon={Calendar} label="Anniversary" value={formatDate(selectedRequest.dateOfAnniversary)} />
                      )}
                      {selectedRequest.aboutUs && <InfoItem icon={FileText} label="About" value={selectedRequest.aboutUs} />}
                    </div>

                    {/* Middle Column - Contact Info */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900 border-b pb-1">Contact Information</h4>
                      {selectedRequest.mobile && <InfoItem icon={Phone} label="Mobile" value={selectedRequest.mobile} />}
                      {selectedRequest.extensionNo && <InfoItem icon={Phone} label="Extension" value={selectedRequest.extensionNo} />}
                      {selectedRequest.email && <InfoItem icon={Mail} label="Official Email" value={selectedRequest.email} />}
                      {selectedRequest.personalEmailId && <InfoItem icon={Mail} label="Personal Email" value={selectedRequest.personalEmailId} />}
                      {selectedRequest.location && <InfoItem icon={MapPin} label="Location" value={selectedRequest.location} />}
                    </div>

                    {/* Right Column - Professional Info */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900 border-b pb-1">Professional Information</h4>
                      {selectedRequest.designation && <InfoItem icon={Building} label="Designation" value={selectedRequest.designation} />}
                      {selectedRequest.positionGrade && <InfoItem icon={Badge} label="Position Grade" value={selectedRequest.positionGrade} />}
                      {selectedRequest.department && <InfoItem icon={Building} label="Department" value={selectedRequest.department} />}
                      {selectedRequest.dateOfJoining && <InfoItem icon={Calendar} label="Joining Date" value={formatDate(selectedRequest.dateOfJoining)} />}
                      {selectedRequest.toemploy && <InfoItem icon={Users} label="Employment Type" value={selectedRequest.toemploy} />}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Reporting Officer Change Details */}
              {selectedRequest.reportingOfficer && (
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium text-gray-900 border-b pb-2 mb-3">Reporting Officer Change Details</h4>
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <InfoItem
                        icon={User}
                        label="Requested Reporting Officer"
                        value={findEmployeeDetails(employee, selectedRequest.reportingOfficer)?.employee?.empName || 'Unknown Employee'}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div className="flex space-x-2 justify-end">
            <Button onClick={handleAcceptReportingOfficerRequestClick} className="bg-green-600 hover:bg-green-700 text-white">
              <CheckCircle className="w-4 h-4 mr-1" />
              Accept
            </Button>
            <Button onClick={handleRejectReportingOfficerRequestClick} className="bg-red-600 hover:bg-red-700 text-white">
              <XCircle className="w-4 h-4 mr-1" />
              Reject
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AcceptDialog
        isOpen={isAcceptAlertOpenReportingOfficer}
        onOpenChange={setIsAcceptAlertOpenReportingOfficer}
        HandleProceedProfileChangeRequest={HandleProceedReportingOfficerAccept}
      />
      <RejectDialog
        isOpen={isRejectOpenReportingOfficer}
        onOpenChange={setIsRejectOpenReportingOfficer}
        setRemarks={setRemarks}
        remarks={remarks}
        HandleProceedProfileChangeRequestReject={HandleProceedReportingOfficerReject}
      />
    </div>
  );
};

export default ReportingAuthorityRequestsInfoDialog;
