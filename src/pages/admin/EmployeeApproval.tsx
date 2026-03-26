import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TableList from '@/components/ui/data-table';
import { Info, RefreshCcw } from 'lucide-react';
import Heading from '@/components/ui/heading';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { RootState } from '@/app/store';
import { fetchEmployeeApprovalRequests, fetchEmployeeAcceptRejectRequests } from '@/features/employeeApproval/employeeApprovalSlice';
import EmployeeApprovalInfoDialog from '@/components/Infodialogs/EmployeeApprovalnfoDialog';
import Loader from '@/components/ui/loader';
import { findEmployeeDetails } from '@/lib/helperFunction';
import AcceptDialog from '@/components/alertboxes/AcceptDialog';
import RejectDialog from '@/components/alertboxes/RejectDialog';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import Select from 'react-select';
import { useSelector } from 'react-redux';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import ProfileChangeRequestsInfoDialog from '@/components/Infodialogs/ProfileChangeRequestsInfoDialog';
import { contractProfileChangeRequest } from '@/features/employeeApproval/contractProfilerequestsslice';
import { proceedReportingofficerChangeRequests } from '@/features/employeeApproval/ProceedReportingAuthorityslice';
import { fetchProfileChangeRequest } from '@/features/employeeApproval/editprofilerequestsslice';
import { fetchContractReportingAuthorityRequests } from '@/features/employeeApproval/ContractReportingauthorityrequestsslice';
type TabKey = 'new' | 'personal-profile' | 'reporting-manager' | 'accepted' | 'rejected' | 'inactive';
const VALID_TABS: TabKey[] = ['new', 'personal-profile', 'reporting-manager', 'accepted', 'rejected', 'inactive'];

const EmployeeApproval: React.FC = () => {
  // --- URL <-> tab sync (react-router-dom) ---
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const tabFromUrl = useMemo<TabKey>(() => {
    const t = (searchParams.get('tab') || '').toLowerCase();
    return (VALID_TABS.includes(t as TabKey) ? t : 'new') as TabKey;
  }, [searchParams]);

  const [activeTab, setActiveTab] = useState<TabKey>(tabFromUrl);

  // when URL changes via back/forward, update tab state
  useEffect(() => {
    if (activeTab !== tabFromUrl) setActiveTab(tabFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabFromUrl]);

  const pushTabToUrl = useCallback(
    (tab: TabKey) => {
      const params = new URLSearchParams(location.search);
      params.set('tab', tab);
      navigate({ pathname: location.pathname, search: params.toString() }, { replace: false });
      setActiveTab(tab);
    },
    [location.pathname, location.search, navigate]
  );

  // --- Dialog state ---
  const [isProfileInfoOpen, setIsProfileInfoOpen] = useState(false);
  const [isEmployeeInfoOpen, setIsEmployeeInfoOpen] = useState(false);
  const [selectedProfileRequest, setSelectedProfileRequest] = useState<any>(null);
  const [selectedEmployeeRequest, setSelectedEmployeeRequest] = useState<any>(null);
  const { globelAssigndRolesAndUnits, Roles, departmentList } = useSelector((state: RootState) => state.user);
  const unitList = useAppSelector((state: RootState) => state.masterData.data.unit);
  // --- Accept/Reject (reporting officer) ---
  const [isAcceptAlertOpenReportingOfficer, setIsAcceptAlertOpenReportingOfficer] = useState(false);
  const [isRejectOpenReportingOfficer, setIsRejectOpenReportingOfficer] = useState(false);
  const [selectedAcceptRequestReportingOfficer, setSelectedAcceptRequestReportingOfficer] = useState<any>(null);
  const [selectedRejectRequestReportngOfficer, setSelectedRejectRequestReportngOfficer] = useState<any>(null);
  const [remarks, setRemarks] = useState('');
  const userInfo = useAppSelector((state: RootState) => state.user);
  // --- Store ---
  const { data: employeeApprovalData, loading: employeeApprovalLoading } = useAppSelector((state: RootState) => state.fetchEmployeeApproval);
  const { data: ProfileChangeRequests, loading: ProfileChangeRequestsLoading } = useAppSelector((state: RootState) => state.contractProfileChangeRequest);

  const { data: ReportingAuthorityRequests, loading: ReportingAuthorityRequestsLoading } = useAppSelector(
    (state: RootState) => state.fetchContractReportingAuthorityRequests
  );
  const employee = useAppSelector((s: RootState) => s.employee.employees);
  const dispatch = useAppDispatch();
  console.log(departmentList, 'departmentList');
  const unitOptions = useMemo(() => {
    if (unitList.length === 0) return [];

    // SuperAdmin → all units
    if (Roles.includes('SuperAdmin')) {
      return unitList.map((unit) => ({
        label: unit.name,
        value: unit.id,
      }));
    }

    if (globelAssigndRolesAndUnits.length > 0) {
      const unitMap = new Map<number, { label: string; value: number }>();

      globelAssigndRolesAndUnits.forEach((item) => {
        item.units.forEach((unit) => {
          const unitId = Number(unit.unitId);

          // validate against master list
          const exists = unitList.some((mu) => Number(mu.id) === unitId);
          if (!exists) return;

          // dedupe
          if (!unitMap.has(unitId)) {
            unitMap.set(unitId, {
              label: unit.unitName,
              value: unitId,
            });
          }
        });
      });

      return Array.from(unitMap.values());
    }

    return [];
  }, [Roles, globelAssigndRolesAndUnits, unitList]);
  // Set default selected unit as first option
  const [selectedUnit, setSelectedUnit] = useState(unitOptions.length > 0 ? unitOptions[0] : { value: userInfo.unitId, label: userInfo.Unit });
  // --- Fetch per active tab ---
  useEffect(() => {
    switch (activeTab) {
      case 'new':
        if (selectedUnit) {
          dispatch(fetchEmployeeApprovalRequests(Number(selectedUnit?.value)));
        }
        break;
      case 'accepted':
        if (selectedUnit) {
          dispatch(fetchEmployeeAcceptRejectRequests({ Status: 0, unitId: Number(selectedUnit?.value) }));
        }
        break;
      case 'inactive':
        if (selectedUnit) {
          dispatch(fetchEmployeeAcceptRejectRequests({ Status: 0, unitId: Number(selectedUnit?.value) }));
        }
        break;
      case 'rejected':
        if (selectedUnit) {
          dispatch(fetchEmployeeAcceptRejectRequests({ Status: 9, unitId: Number(selectedUnit?.value) }));
        }
        break;
      case 'personal-profile':
        dispatch(
          contractProfileChangeRequest({
            employeeCode: userInfo.EmpCode,
            location: selectedUnit.label,
            userName: userInfo.name,
          })
        );
        break;
      case 'reporting-manager':
        dispatch(
          fetchContractReportingAuthorityRequests({
            employeeCode: userInfo.EmpCode,
            location: selectedUnit.label,
            userName: userInfo.Unit,
          })
        );
        break;
      default:
        if (selectedUnit) {
          dispatch(fetchEmployeeApprovalRequests(Number(selectedUnit?.value)));
        }
    }
  }, [activeTab, dispatch, selectedUnit]);

  // --- Refresh handlers per tab ---
  const refreshNew = useCallback(() => {
    if (selectedUnit) {
      dispatch(fetchEmployeeApprovalRequests(Number(selectedUnit?.value)));
    }
  }, [dispatch, selectedUnit]);
  const refreshAccepted = useCallback(() => {
    if (selectedUnit) {
      dispatch(fetchEmployeeAcceptRejectRequests({ Status: 0, unitId: Number(selectedUnit?.value) }));
    }
  }, [dispatch, selectedUnit]);
  const refreshInactive = useCallback(() => {
    if (selectedUnit) {
      dispatch(fetchEmployeeAcceptRejectRequests({ Status: 0, unitId: Number(selectedUnit?.value) }));
    }
  }, [dispatch, selectedUnit]);
  const refreshRejected = useCallback(() => {
    if (selectedUnit) {
      dispatch(fetchEmployeeAcceptRejectRequests({ Status: 9, unitId: Number(selectedUnit?.value) }));
    }
  }, [dispatch, selectedUnit]);
  const refreshPersonal = useCallback(() => dispatch(fetchProfileChangeRequest()), [dispatch]);
  const refreshReporting = useCallback(
    () =>
      dispatch(
        fetchContractReportingAuthorityRequests({
          employeeCode: userInfo.EmpCode,
          location: selectedUnit.label,
          userName: userInfo.Unit,
        })
      ),
    [dispatch]
  );

  // --- Info handlers ---
  const openProfileInfo = (item: any) => {
    setSelectedProfileRequest(item);
    setIsProfileInfoOpen(true);
  };
  const closeProfileInfo = () => {
    setIsProfileInfoOpen(false);
    setSelectedProfileRequest(null);
  };
  const openEmployeeInfo = (item: any) => {
    setSelectedEmployeeRequest(item);
    setIsEmployeeInfoOpen(true);
  };
  const closeEmployeeInfo = () => {
    setIsEmployeeInfoOpen(false);
    setSelectedEmployeeRequest(null);
  };

  // --- Accept/Reject handlers ---
  const handleAcceptReportingOfficerRequestClick = (Request: any) => {
    setSelectedAcceptRequestReportingOfficer(Request);
    setIsAcceptAlertOpenReportingOfficer(true);
  };
  const handleRejectReportingOfficerRequestClick = (Request: any) => {
    setSelectedRejectRequestReportngOfficer(Request);
    setIsRejectOpenReportingOfficer(true);
  };
  const HandleProceedReportingOfficerReject = async () => {
    try {
      await dispatch(
        proceedReportingofficerChangeRequests({
          employeeCode: selectedRejectRequestReportngOfficer?.newRecords?.employeeCode,
          isApproved: false,
          remarks,
        })
      ).unwrap();
      dispatch(
        fetchContractReportingAuthorityRequests({
          employeeCode: userInfo.EmpCode,
          location: selectedUnit.label,
          userName: userInfo.Unit,
        })
      );
      setRemarks('');
      setIsRejectOpenReportingOfficer(false);
    } catch (e) {
      console.error('Error rejecting reporting officer change request:', e);
    }
  };
  const HandleProceedReportingOfficerAccept = async () => {
    try {
      await dispatch(
        proceedReportingofficerChangeRequests({
          employeeCode: selectedAcceptRequestReportingOfficer?.newRecords?.employeeCode,
          isApproved: true,
          remarks: '',
        })
      ).unwrap();
      dispatch(
        fetchContractReportingAuthorityRequests({
          employeeCode: userInfo.EmpCode,
          location: selectedUnit.label,
          userName: userInfo.Unit,
        })
      );
      setIsAcceptAlertOpenReportingOfficer(false);
    } catch (e) {
      console.error('Error accepting reporting officer change request:', e);
    }
  };

  // --- Columns ---
  const profileColumns = [
    { accessorKey: 'Sr.No', header: 'Sr.No', cell: ({ row }: any) => row.index + 1, enableGlobalFilter: false },
    { accessorKey: 'employeeCode', header: 'Employee Code', accessorFn: (row: any) => row?.oldRecored?.employeeCode ?? '' },
    {
      accessorKey: 'employeeName',
      header: 'Employee Name',
      accessorFn: (row: any) => row?.oldRecored?.userName ?? '',
      cell: ({ row }: any) => <div className="uppercase">{row.original?.oldRecored?.userName?.toLowerCase()}</div>,
    },
    { accessorKey: 'department', header: 'Department', accessorFn: (row: any) => row?.oldRecored?.department ?? '' },
    { accessorKey: 'location', header: 'Unit Name', accessorFn: (row: any) => row?.oldRecored?.location ?? '' },
    {
      id: 'completeInfo',
      header: 'Info',
      enableGlobalFilter: false,
      cell: ({ row }: any) => (
        <Button onClick={() => openProfileInfo(row.original)} className="bg-blue-600 hover:bg-blue-700" size="sm">
          <Info className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  const reportingManagerColumns = [
    { id: 'serial', header: 'Sr.No', cell: ({ row }: any) => row.index + 1, enableGlobalFilter: false },
    { accessorKey: 'employeeCode', header: 'Employee Code', accessorFn: (r: any) => r?.oldRecored?.employeeCode ?? '' },
    {
      accessorKey: 'employeeName',
      header: 'Employee Name',
      accessorFn: (r: any) => r?.oldRecored?.userName ?? '',
      cell: ({ row }: any) => <div className="uppercase">{row.original?.oldRecored?.userName?.toLowerCase()}</div>,
    },
    { accessorKey: 'location', header: 'Unit Name', accessorFn: (row: any) => row?.oldRecored?.location ?? '' },
    { accessorKey: 'department', header: 'Department', accessorFn: (row: any) => row?.oldRecored?.department ?? '' },

    {
      accessorKey: 'currentManagerName',
      header: 'Current Reporting Manager',
      accessorFn: (r) => findEmployeeDetails(employee, r?.oldRecored?.reportingOfficer)?.employee?.empName ?? '',
      cell: ({ row }) => {
        const code = row.original?.oldRecored?.reportingOfficer?.trim();
        const name = findEmployeeDetails(employee, code)?.employee?.empName?.toLowerCase();
        return <div className="uppercase">{[code, name].filter(Boolean).join(' - ') || '-'}</div>;
      },
    },
    {
      accessorKey: 'requestedManagerName',
      header: 'Requested Reporting Manager',
      accessorFn: (r) => findEmployeeDetails(employee, r?.newRecords?.reportingOfficer)?.employee?.empName ?? '',
      cell: ({ row }) => {
        const code = row.original?.newRecords?.reportingOfficer?.trim();
        const name = findEmployeeDetails(employee, code)?.employee?.empName?.toLowerCase();
        return <div className="uppercase">{[code, name].filter(Boolean).join(' - ') || 'NA'}</div>;
      },
    },
    {
      id: 'Actions',
      header: 'Actions',
      enableGlobalFilter: false,
      cell: ({ row }: any) => (
        <div className="flex justify-center gap-2">
          <Button className="bg-green-700 hover:bg-green-800" size="sm" onClick={() => handleAcceptReportingOfficerRequestClick(row.original)}>
            Accept
          </Button>
          <Button className="bg-red-700 hover:bg-red-800" size="sm" onClick={() => handleRejectReportingOfficerRequestClick(row.original)}>
            Reject
          </Button>
        </div>
      ),
    },
  ];
  const isRestrictedUser = !Roles.includes('SuperAdmin');
  const isSpecialUnit = [1, 396].includes(Number(selectedUnit?.value));

  const shouldApplyDeptFilter = isRestrictedUser && isSpecialUnit;

  // make data optional + default to []
  const filterByDept = <T,>(data: T[] | undefined, getDept: (item: T) => string | undefined): T[] => {
    if (!shouldApplyDeptFilter) return data ?? [];

    return (data ?? []).filter((item) => departmentList?.includes(getDept(item)?.toLowerCase() || ''));
  };
  const employeeApprovalRows = useMemo(() => {
    return filterByDept(employeeApprovalData, (ele) => ele?.deptDFCCIL);
  }, [employeeApprovalData, shouldApplyDeptFilter, departmentList]);

  const ProfileChangeRequestsFiltered = useMemo(() => {
    return filterByDept(ProfileChangeRequests, (ele) => ele?.oldRecored?.department);
  }, [ProfileChangeRequests, shouldApplyDeptFilter, departmentList]);

  const ReportingAuthorityRequestsFiltered = useMemo(() => {
    return filterByDept(ReportingAuthorityRequests, (ele) => ele?.oldRecored?.department);
  }, [ReportingAuthorityRequests, shouldApplyDeptFilter, departmentList]);

  // ⚠️ avoid double filtering if not needed
  const employeeApprovalRowsFiltered = useMemo(() => {
    return filterByDept(employeeApprovalRows, (ele) => ele?.deptDFCCIL);
  }, [employeeApprovalRows, shouldApplyDeptFilter, departmentList]);
  // Loading flags per tab for refresh buttons
  const isLoadingMap: Record<TabKey, boolean> = {
    new: employeeApprovalLoading,
    accepted: employeeApprovalLoading,
    inactive: employeeApprovalLoading,
    rejected: employeeApprovalLoading,
    'personal-profile': ProfileChangeRequestsLoading,
    'reporting-manager': ReportingAuthorityRequestsLoading,
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between">
        <Heading type={2}>Contractual Employee Approval</Heading>
        <div className="min-w-[200px]">
          <Label>Select Unit</Label>
          <Select value={selectedUnit} onChange={setSelectedUnit} options={unitOptions} />
        </div>
      </div>
      {(employeeApprovalLoading || ProfileChangeRequestsLoading || ReportingAuthorityRequestsLoading) && <Loader />}
      <Tabs value={activeTab} onValueChange={(v) => pushTabToUrl(v as TabKey)}>
        <TabsList className="gap-1 sm:gap-2">
          <TabsTrigger value="new">New Registration</TabsTrigger>
          <TabsTrigger value="personal-profile">Profile Requests</TabsTrigger>
          <TabsTrigger value="reporting-manager">Reporting Officer</TabsTrigger>
          <TabsTrigger value="accepted" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            Active
          </TabsTrigger>
          <TabsTrigger value="inactive" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
            Inactive
          </TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
        <TabsContent value="new" className="mt-4 sm:mt-6">
          <TableList
            showItemPerPage={20}
            columns={[
              { accessorKey: 'Sr.No', header: 'Sr.No', cell: ({ row }: any) => row.index + 1, enableGlobalFilter: false },
              {
                accessorKey: 'name',
                header: 'Name',
                accessorFn: (r: any) => r?.userName ?? '',
                cell: ({ row }: any) => <div className="uppercase">{row?.original?.userName}</div>,
              },
              { accessorKey: 'deptDFCCIL', header: 'Department', accessorFn: (r: any) => r?.deptDFCCIL ?? '' },
              { accessorKey: 'location', header: 'Unit Name', accessorFn: (r: any) => r?.location ?? '' },
              // { accessorKey: 'vendor', header: 'Vendor Name', accessorFn: (r: any) => r?.vendor ?? '' },

              { accessorKey: 'mobile', header: 'Contact No.', accessorFn: (r: any) => r?.mobile ?? '' },
              {
                id: 'info',
                header: 'Info',
                enableGlobalFilter: false,
                cell: ({ row }: any) => (
                  <Button onClick={() => openEmployeeInfo(row.original)} className="bg-blue-600 hover:bg-blue-700" size="sm">
                    <Info className="w-4 h-4" />
                  </Button>
                ),
              },
            ]}
            data={employeeApprovalRows || []}
            showSearchInput
            inputPlaceholder="Search registration requests..."
            rightElements={
              <Button variant="default" onClick={refreshNew} disabled={isLoadingMap['new']} className="flex items-center gap-2" title="Refresh">
                <RefreshCcw className={`h-4 w-4 ${isLoadingMap['new'] ? 'animate-spin' : ''}`} aria-hidden="true" />
                Refresh
              </Button>
            }
          />
        </TabsContent>

        <TabsContent value="personal-profile" className="mt-4 sm:mt-6">
          <TableList
            showItemPerPage={20}
            data={ProfileChangeRequestsFiltered || []}
            columns={profileColumns}
            showSearchInput
            inputPlaceholder="Search personal profile requests..."
            rightElements={
              <Button
                variant="default"
                onClick={refreshPersonal}
                disabled={isLoadingMap['personal-profile']}
                className="flex items-center gap-2"
                title="Refresh"
              >
                <RefreshCcw className={`h-4 w-4 ${isLoadingMap['personal-profile'] ? 'animate-spin' : ''}`} aria-hidden="true" />
                Refresh
              </Button>
            }
          />
        </TabsContent>

        <TabsContent value="reporting-manager" className="mt-4 sm:mt-6">
          <TableList
            showItemPerPage={20}
            data={(ReportingAuthorityRequestsFiltered || []).filter(
              (item) => item?.oldRecored?.tOemploy?.toLowerCase() === 'contractual' || item?.newRecords?.tOemploy?.toLowerCase() === 'contractual'
            )}
            columns={reportingManagerColumns}
            showSearchInput
            inputPlaceholder="Search reporting manager requests..."
            rightElements={
              <Button
                variant="default"
                onClick={refreshReporting}
                disabled={isLoadingMap['reporting-manager']}
                className="flex items-center gap-2"
                title="Refresh"
              >
                <RefreshCcw className={`h-4 w-4 ${isLoadingMap['reporting-manager'] ? 'animate-spin' : ''}`} aria-hidden="true" />
                Refresh
              </Button>
            }
          />
        </TabsContent>

        {/* Accepted */}
        <TabsContent value="accepted" className="mt-4 sm:mt-6">
          <TableList
            showItemPerPage={20}
            columns={[
              { accessorKey: 'employeeCode', header: 'Employee ID', accessorFn: (r: any) => r?.employeeCode ?? r?.employeeCode ?? '' },
              {
                accessorKey: 'name',
                header: 'Name',
                accessorFn: (r: any) => r?.name ?? r?.userName ?? '',
                cell: ({ row }: any) => <div className="uppercase">{row?.original?.userName}</div>,
              },
              { accessorKey: 'mobile', header: 'Contact No.', accessorFn: (r: any) => r?.mobile ?? '' },
              { accessorKey: 'location', header: 'Unit', accessorFn: (r: any) => r?.location ?? '-' },
              {
                accessorKey: 'deptDFCCIL',
                header: 'Department',
                accessorFn: (r: any) => r?.deptDFCCIL ?? '-',
                cell: ({ row }: any) => <div className="uppercase">{row?.original?.deptDFCCIL}</div>,
              },
              {
                accessorKey: 'vendor',
                header: 'Vendor',
                accessorFn: (r: any) => r?.vendor ?? '-',
                cell: ({ row }: any) => <div className="capitalize">{row?.original?.vendor}</div>,
              },
              {
                accessorKey: 'approvedBy',
                header: 'Approved By',
                accessorFn: (r: any) => r?.approvedBy ?? '-',
                cell: ({ row }: any) => <div className="uppercase">{row?.original?.approvedBy}</div>,
              },

              {
                id: 'info',
                header: 'Info',
                enableGlobalFilter: false,
                cell: ({ row }: any) => (
                  <Button onClick={() => openEmployeeInfo(row.original)} className="bg-blue-600 hover:bg-blue-700" size="sm">
                    <Info className="w-4 h-4" />
                  </Button>
                ),
              },
            ]}
            data={employeeApprovalRowsFiltered?.filter((item: any) => item?.status === 0)}
            showSearchInput
            inputPlaceholder="Search accepted requests..."
            rightElements={
              <Button variant="default" onClick={refreshAccepted} disabled={isLoadingMap['accepted']} className="flex items-center gap-2" title="Refresh">
                <RefreshCcw className={`h-4 w-4 ${isLoadingMap['accepted'] ? 'animate-spin' : ''}`} aria-hidden="true" />
                Refresh
              </Button>
            }
          />
        </TabsContent>
        <TabsContent value="inactive" className="mt-4 sm:mt-6">
          <TableList
            showItemPerPage={20}
            columns={[
              { accessorKey: 'employeeCode', header: 'Employee Code', accessorFn: (r: any) => r?.employeeCode ?? r?.employeeCode ?? '' },
              {
                accessorKey: 'name',
                header: 'Name',
                accessorFn: (r: any) => r?.name ?? r?.userName ?? '',
                cell: ({ row }: any) => <div className="uppercase">{row?.original?.userName}</div>,
              },
              { accessorKey: 'mobile', header: 'Contact No.', accessorFn: (r: any) => r?.mobile ?? '' },
              { accessorKey: 'location', header: 'Unit', accessorFn: (r: any) => r?.location ?? '-' },
              { accessorKey: 'deptDFCCIL', header: 'Department', accessorFn: (r: any) => r?.deptDFCCIL ?? '-' },
              { accessorKey: 'vendor', header: 'Vendor', accessorFn: (r: any) => r?.vendor ?? '-' },
              {
                accessorKey: 'approvedBy',
                header: 'Approved By',
                accessorFn: (r: any) => r?.approvedBy ?? '-',
                cell: ({ row }: any) => <div className="uppercase">{row?.original?.approvedBy}</div>,
              },

              {
                id: 'info',
                header: 'Info',
                enableGlobalFilter: false,
                cell: ({ row }: any) => (
                  <Button onClick={() => openEmployeeInfo(row.original)} className="bg-blue-600 hover:bg-blue-700" size="sm">
                    <Info className="w-4 h-4" />
                  </Button>
                ),
              },
            ]}
            data={employeeApprovalRowsFiltered?.filter((item: any) => item?.status === 9)}
            showSearchInput
            inputPlaceholder="Search deactivated requests..."
            rightElements={
              <Button variant="default" onClick={refreshInactive} disabled={isLoadingMap['inactive']} className="flex items-center gap-2" title="Refresh">
                <RefreshCcw className={`h-4 w-4 ${isLoadingMap['inactive'] ? 'animate-spin' : ''}`} aria-hidden="true" />
                Refresh
              </Button>
            }
          />
        </TabsContent>

        {/* Rejected */}
        <TabsContent value="rejected" className="mt-4 sm:mt-6">
          <TableList
            columns={[
              { accessorKey: 'Sr.No', header: 'Sr.No', cell: ({ row }: any) => row.index + 1, enableGlobalFilter: false },
              {
                accessorKey: 'name',
                header: 'Name',
                accessorFn: (r: any) => r?.name ?? r?.userName ?? '',
                cell: ({ row }: any) => <div className="uppercase">{row?.original?.userName}</div>,
              },
              { accessorKey: 'deptDFCCIL', header: 'Department', accessorFn: (r: any) => r?.deptDFCCIL ?? '' },
              { accessorKey: 'location', header: 'Unit Name', accessorFn: (r: any) => r?.location ?? '' },
              { accessorKey: 'mobile', header: 'Contact No.', accessorFn: (r: any) => r?.mobile ?? '' },
              {
                id: 'info',
                header: 'Info',
                enableGlobalFilter: false,
                cell: ({ row }: any) => (
                  <Button onClick={() => openEmployeeInfo(row.original)} className="bg-blue-600 hover:bg-blue-700" size="sm">
                    <Info className="w-4 h-4" />
                  </Button>
                ),
              },
            ]}
            data={employeeApprovalRowsFiltered}
            showSearchInput
            inputPlaceholder="Search rejected requests..."
            rightElements={
              <Button variant="default" onClick={refreshRejected} disabled={isLoadingMap['rejected']} className="flex items-center gap-2" title="Refresh">
                <RefreshCcw className={`h-4 w-4 ${isLoadingMap['rejected'] ? 'animate-spin' : ''}`} aria-hidden="true" />
                Refresh
              </Button>
            }
          />
        </TabsContent>
      </Tabs>

      {/* Profile-change info dialog (Profile Requests) */}
      <ProfileChangeRequestsInfoDialog
        isCheckboxRequired={false}
        isOpen={isProfileInfoOpen}
        onClose={closeProfileInfo}
        selectedRequest={selectedProfileRequest}
      />

      {/* Accept/Reject dialogs for Reporting Officer */}
      <AcceptDialog
        isOpen={isAcceptAlertOpenReportingOfficer}
        onOpenChange={setIsAcceptAlertOpenReportingOfficer}
        HandleProceedProfileChangeRequest={HandleProceedReportingOfficerAccept}
        isEmployeeApprovalPage={true}
        isCheckboxRequired={false}
      />
      <RejectDialog
        isOpen={isRejectOpenReportingOfficer}
        onOpenChange={setIsRejectOpenReportingOfficer}
        setRemarks={setRemarks}
        remarks={remarks}
        HandleProceedProfileChangeRequestReject={HandleProceedReportingOfficerReject}
      />

      {/* Employee-approval info dialog (New/Accepted/Rejected) */}
      <EmployeeApprovalInfoDialog
        isOpen={isEmployeeInfoOpen}
        onClose={closeEmployeeInfo}
        selectedRequest={selectedEmployeeRequest}
        activeTab={activeTab}
        isEmployeeApprovalPage={true}
        isCheckboxRequired={false}
        selectedUnit={selectedUnit}
      />
    </div>
  );
};

export default EmployeeApproval;
