import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { User, CheckCircle, XCircle, Mail, Phone, Calendar, MapPin, FileText, Users, Clock, Activity } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { proceedEmployeeApprovalRequests } from '@/features/employeeApproval/proceedemployeeApprovalslice';
import { fetchEmployeeApprovalRequests, fetchEmployeeAcceptRejectRequests } from '@/features/employeeApproval/employeeApprovalSlice';
import { deactivateContractualEmployee } from '@/features/employeeApproval/deactivateEmployeeSlice';
import AcceptDialog from '../alertboxes/AcceptDialog';
import RejectDialog from '../alertboxes/RejectDialog';
import DeactivateDialog from '../alertboxes/DeactivateDialog';
import { format } from 'date-fns';
import { RootState } from '@/app/store';
import Select from 'react-select';
import axiosInstance from '@/services/axiosInstance';
import toast from 'react-hot-toast';
import { useActiveContracts } from '@/hooks/useActiveContracts';
import { formatDate } from '@/lib/helperFunction';
import { Label } from '../ui/label';
type Props = {
  isOpen: boolean;
  selectedUnit: any;
  onClose: () => void;
  selectedRequest?: any;
  activeTab?: string;
  isEmployeeApprovalPage?: boolean;
  isCheckboxRequired?: boolean;
};

const EmployeeApprovalInfoDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  selectedRequest,
  activeTab,
  isEmployeeApprovalPage,
  isCheckboxRequired,
  selectedUnit,
}) => {
  const [isAcceptAlertOpen, setIsAcceptAlertOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [contracts, setContracts] = useState([]);
  const [selectedContractorId, setSelectedContractorId] = useState(null);
  const [selectedContractorNumber, setSelectedContractorNumber] = useState(null);
  const [imageError, setImageError] = useState(false);
  const { globelAssigndRolesAndUnits, Roles, departmentId } = useAppSelector((state: RootState) => state.user);
  const dispatch = useAppDispatch();
  const handleAcceptClick = () => setIsAcceptAlertOpen(true);
  const handleRejectClick = () => setIsRejectOpen(true);
  const handleDeactivateClick = () => setIsDeactivateOpen(true);
  const { data: activeContract, loading ,refetch} = useActiveContracts();
  const fetchContracts = async () => {
    try {
      const res = await axiosInstance.get('/ModuleManagement/GetAllContractMaster');
      setContracts(res.data?.data || []);
    } catch (err) {
      console.error('Error fetching contracts', err);
    } finally {
    }
  };
  useEffect(() => {
    fetchContracts();
  }, []);
  const handleProceedEmployeeApprovalAccept = async () => {
    if (!selectedContractorId || !selectedContractorNumber) {
      toast.error('Please select contractor');
      return;
    }
    try {
      const data = await dispatch(
        proceedEmployeeApprovalRequests({
          contractualEmployeeRequestId: selectedRequest?.contEmpID,
          isApproved: true,
          contractId: selectedContractorNumber?.value,
          remarks: '',
        })
      ).unwrap();
      if (data) {
        await dispatch(fetchEmployeeApprovalRequests(Number(selectedUnit.value))).unwrap();
        setIsAcceptAlertOpen(false);
        onClose();
        refetch()
        setSelectedContractorId(null);
        setSelectedContractorNumber(null);
      }
    } catch (error) {
      console.error('Error accepting employee approval request:', error);
    }
  };

  const handleProceedEmployeeApprovalReject = async () => {
    if (!remarks) {
      alert('Please provide remarks before rejecting');
      return;
    }
    try {
      await dispatch(
        proceedEmployeeApprovalRequests({
          contractualEmployeeRequestId: selectedRequest?.contEmpID,
          isApproved: false,
          remarks,
        })
      ).unwrap();

      // Refresh the latest data
      await dispatch(fetchEmployeeApprovalRequests(Number(selectedUnit.value))).unwrap();
      setRemarks('');
      setIsRejectOpen(false);
      onClose();
      setSelectedContractorId(null);
      setSelectedContractorNumber(null);
    } catch (error) {
      console.error('Error rejecting employee approval request:', error);
    }
  };

  const handleProceedEmployeeDeactivate = async () => {
    if (!selectedRequest?.employeeCode) {
      alert('Employee code not found');
      return;
    }
    try {
      await dispatch(
        deactivateContractualEmployee({
          employeeCodes: [selectedRequest.employeeCode],
        })
      ).unwrap();

      // Refresh the data based on the active tab
      if (activeTab === 'accepted') {
        await dispatch(fetchEmployeeAcceptRejectRequests({ Status: 0, unitId: Number(selectedUnit.value) })).unwrap();
      } else if (activeTab === 'rejected') {
        await dispatch(fetchEmployeeAcceptRejectRequests({ Status: 9, unitId: Number(selectedUnit.value) })).unwrap();
      } else {
        await dispatch(fetchEmployeeApprovalRequests(Number(selectedUnit.value))).unwrap();
      }

      setIsDeactivateOpen(false);
      onClose();
    } catch (error) {
      console.error('Error deactivating employee account:', error);
    }
  };

  const InfoItem = ({ icon: Icon, label, value, className = '' }: { icon: any; label: string; value?: React.ReactNode; className?: string }) => (
    <div className={`flex items-start gap-3 p-3 rounded-lg bg-white border border-gray-100 hover:border-gray-200 transition-colors ${className}`}>
      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
        <Icon className="w-5 h-5 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-gray-900 break-words">{value || '—'}</p>
      </div>
    </div>
  );

  const formatMaybeDate = (d?: string | Date) => {
    if (!d) return '—';
    const dateObj = d instanceof Date ? d : new Date(d);
    if (isNaN(dateObj.getTime())) return '—';
    return format(dateObj, 'dd MMM yyyy');
  };

  const initials = useMemo(() => {
    return (
      selectedRequest?.userName
        ?.split(' ')
        .filter(Boolean)
        .map((s: string) => s[0]?.toUpperCase())
        .slice(0, 2)
        .join('') || 'U'
    );
  }, [selectedRequest?.userName]);

  const contractNumberOptions = useMemo(() => {
    return (
      activeContract
        .find((ele) => Number(ele.contractorId) === Number(selectedContractorId?.value))
        ?.contracts?.map((item) => ({
          label: item.contractNumber,
          value: item.contractId,
          ...item,
        })) || []
    );
  }, [activeContract, selectedContractorId]);
  console.log(contractNumberOptions, 'contractNumberOptions');
  return (
    <div>
      <Dialog
        open={isOpen}
        onOpenChange={() => {
          setSelectedContractorId(null);
          setSelectedContractorNumber(null);
          onClose();
        }}
      >
        <DialogContent
          className="
            w-[calc(100vw-1.5rem)] sm:w-[calc(100vw-3rem)]
            max-w-sm sm:max-w-lg md:max-w-3xl lg:max-w-5xl
            max-h-[95vh] overflow-y-auto p-0 gap-0
            rounded-xl
          "
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-100">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold">
                <User className="w-5 h-5" />
                Employee Request
              </DialogTitle>
            </DialogHeader>
          </div>

          {selectedRequest && (
            <div className="p-4 mb-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <aside className="lg:col-span-4 ">
                  <figure className="w-full">
                    <div className="relative rounded-lg">
                      {(selectedRequest.profilePhoto || selectedRequest.imageUrl) && !imageError ? (
                        <img
                          src={selectedRequest.profilePhoto || selectedRequest.imageUrl}
                          alt={selectedRequest.userName ? `${selectedRequest.userName} photo` : 'Employee photo'}
                          className="h-full w-48 object-cover"
                          loading="lazy"
                          decoding="async"
                          onError={() => setImageError(true)}
                        />
                      ) : (
                        <div className="flex mb-4 items-center justify-center">
                          <div className="flex h-full w-full items-center justify-center">
                            <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-white/70 border border-gray-200 shadow-inner">
                              <span className="text-3xl font-semibold tracking-wide text-gray-700">{initials}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </figure>
                  <div className="space-y-1">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 break-words">{selectedRequest.userName || '—'}</h2>
                    <p className="text-sm text-gray-600">
                      Department:
                      <span className="text-gray-900 font-medium"> {selectedRequest.deptDFCCIL || '—'}</span>
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="font-medium">Appointment Letter</span>
                    </div>
                    <Button
                      variant="link"
                      size="sm"
                      className="px-0"
                      onClick={() => {
                        if (selectedRequest?.appointmentDoc) {
                          window.open(selectedRequest.appointmentDoc, '_blank', 'noopener,noreferrer');
                        }
                      }}
                      disabled={!selectedRequest?.appointmentDoc}
                    >
                      View Letter
                    </Button>
                  </div>
                  {activeTab === 'new' && (
                    <div className="grid grid-cols-1 gap-2">
                      <div>
                        <Label>Select Contractor</Label>
                        <Select
                          value={selectedContractorId}
                          isClearable
                          onChange={(e) => {
                            setSelectedContractorId(e);
                            setSelectedContractorNumber(null);
                          }}
                          options={activeContract.map((ele) => ({
                            label: ele?.contractorName,
                            value: ele?.contractorId,
                          }))}
                          placeholder="Select contractor"
                          className="mt-1"
                          styles={{
                            menuList: (provided) => ({
                              ...provided,
                              maxHeight: '210px',
                              overflowY: 'auto',
                            }),
                          }}
                        />
                      </div>
                      <div>
                        <Label>Select Contractor Number</Label>
                        <Select
                          value={selectedContractorNumber}
                          isClearable
                          onChange={(e) => {
                            setSelectedContractorNumber(e);
                          }}
                          options={contractNumberOptions}
                          placeholder="Select contractor number"
                          className="mt-1"
                          styles={{
                            menuList: (provided) => ({
                              ...provided,
                              maxHeight: '210px',
                              overflowY: 'auto',
                            }),
                          }}
                        />
                      </div>
                    </div>
                  )}
                </aside>

                <section className="lg:col-span-8">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h2 className="text-lg font-semibold text-gray-800">Request Details</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <InfoItem icon={User} label="Gender" value={selectedRequest.gender} />
                    <InfoItem icon={Calendar} label="Date of Birth" value={formatMaybeDate(selectedRequest.dob)} />
                    <InfoItem icon={Phone} label="Mobile" value={selectedRequest.mobile} />
                    <InfoItem icon={Mail} label="Email" value={selectedRequest.emailAddress} />
                    <InfoItem icon={Calendar} label="Joining Date" value={formatMaybeDate(selectedRequest.dojdfccil)} />
                    <InfoItem icon={MapPin} label="Location" value={selectedRequest.location} />
                  </div>
                  {selectedContractorNumber && activeTab === 'new' && (
                    <section className="mt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <h2 className="text-lg font-semibold text-gray-800">Contract Details</h2>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <InfoItem icon={User} label="Contractor" value={selectedContractorNumber?.contractorName} />
                        <InfoItem icon={Calendar} label="Start Date" value={formatDate(selectedContractorNumber?.startDate)} />
                        <InfoItem icon={Calendar} label="End Date" value={formatDate(selectedContractorNumber?.endDate)} />
                        <InfoItem
                          icon={Users} // better semantic
                          label="Total Employees"
                          value={selectedContractorNumber?.numberOfEmployees}
                        />
                        <InfoItem icon={CheckCircle} label="Approved" value={selectedContractorNumber?.approvedCount} />
                        <InfoItem icon={Clock} label="Remaining Slots" value={selectedContractorNumber?.remainingSlots} />
                      </div>
                    </section>
                  )}
                </section>
              </div>
            </div>
          )}

          {/* Actions */}
          {activeTab === 'accepted' && selectedRequest?.status === 0 && (
            <div className="border-t border-gray-200 p-4 sticky bottom-0 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
              <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                <Button onClick={handleDeactivateClick} variant="outline" className="border-red-300 text-red-700 hover:bg-red-50" size="sm">
                  <XCircle className="w-4 h-4 mr-1" />
                  Deactivate
                </Button>
              </div>
            </div>
          )}
          {activeTab === 'new' && (
            <div className="border-t border-gray-200 p-4 sticky bottom-0 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
              <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                <Button onClick={handleRejectClick} variant="outline" className="border-red-300 text-red-700 hover:bg-red-50" size="sm">
                  <XCircle className="w-4 h-4 mr-1" />
                  Reject
                </Button>
                <Button onClick={handleAcceptClick} className="bg-green-600 hover:bg-green-700" size="sm">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Accept
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AcceptDialog
        isOpen={isAcceptAlertOpen}
        onOpenChange={setIsAcceptAlertOpen}
        HandleProceedProfileChangeRequest={handleProceedEmployeeApprovalAccept}
        isEmployeeApprovalPage={isEmployeeApprovalPage}
        isCheckboxRequired={isCheckboxRequired}
      />
      <RejectDialog
        isOpen={isRejectOpen}
        onOpenChange={setIsRejectOpen}
        HandleProceedProfileChangeRequestReject={handleProceedEmployeeApprovalReject}
        remarks={remarks}
        setRemarks={setRemarks}
      />
      <DeactivateDialog
        isOpen={isDeactivateOpen}
        onOpenChange={setIsDeactivateOpen}
        HandleProceedDeactivate={handleProceedEmployeeDeactivate}
        employeeName={selectedRequest?.userName}
      />
    </div>
  );
};

export default EmployeeApprovalInfoDialog;
