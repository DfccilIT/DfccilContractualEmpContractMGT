import React, { useState, useEffect, useMemo } from 'react';
import { fetchRoles } from '@/features/allRole/allRoleSlice';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, RefreshCcw, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { RootState } from '@/app/store';
import EmployeeSelect from '@/components/employeeSelect/EmployeeSelect';
import axiosInstance from '@/services/axiosInstance';
import { fetchEmpRoleList } from '@/features/allRole/empRoleListSlice';
import TableList from '@/components/ui/data-table';
import Loader from '@/components/ui/loader';
import { useSelector } from 'react-redux';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import toast from 'react-hot-toast';

const Heading = ({ type, children }) => {
  const Component = `h${type}`;
  const classes = {
    1: 'text-2xl sm:text-3xl font-bold',
    2: 'text-xl sm:text-2xl font-semibold',
    3: 'text-lg sm:text-xl font-medium',
  };

  return React.createElement(Component, { className: classes[type] || classes[2] }, children);
};

const Delegate = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<{ userCode: string; userDetail: string; unitId: any; department: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignmentStatus, setAssignmentStatus] = useState(null);
  const employeeList = useAppSelector((state: RootState) => state.employee.employees);
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: RootState) => state.user);
  const { userList, loading } = useAppSelector((state: RootState) => state.empRoleList);
  const { unit: unitList } = useAppSelector((state: RootState) => state.masterData.data);
  const { globelAssigndRolesAndUnits, Roles, GGMDepartments } = useSelector((state: RootState) => state.user);
  const { roles } = useAppSelector((state: RootState) => state.roles);
  const rolesList = useMemo(() => {
    return roles?.filter((ele) => ele?.description === 'Contractual Employee Approver' || ele?.description === 'Contract Manager');
  }, [roles]);
  const [role, setRole] = useState('');
  const unitOptions = useMemo(() => {
    if (unitList.length === 0) return [];

    if (Roles.includes('SuperAdmin')) {
      return unitList.map((unit) => ({
        label: unit.name,
        value: unit.id,
      }));
    }

    if (globelAssigndRolesAndUnits?.length > 0) {
      const assignedUnits = globelAssigndRolesAndUnits.flatMap((item) =>
        item.units.map((unit) => ({
          label: unit.unitName,
          value: unit.unitId,
        }))
      );

      const validatedUnits = assignedUnits
        .map((assignedUnit) => {
          const masterUnit = unitList.find((mu) => Number(mu.id) === Number(assignedUnit.value));
          return masterUnit ? assignedUnit : null;
        })
        .filter(Boolean) as { label: string; value: number }[];
      const uniqueUnits = Array.from(new Map(validatedUnits.map((u) => [u.value, u])).values());

      return uniqueUnits;
    }

    return [];
  }, [Roles, globelAssigndRolesAndUnits, unitList]);
  const [assignmentUnit, setAssignmentUnit] = useState(unitOptions[0]?.value?.toString());
  const [tableFilterUnit, setTableFilterUnit] = useState(unitOptions[0]?.value?.toString());
  useEffect(() => {
    dispatch(fetchRoles());
    dispatch(fetchEmpRoleList());
  }, [dispatch, user.unitId]);

  const filteredEmployees = useMemo(() => {
    return employeeList?.filter((ele) => {
      const isSuperAdmin = Roles?.includes('SuperAdmin');
      if (isSuperAdmin) {
        return Number(ele?.unitId) === Number(assignmentUnit);
      }
      return GGMDepartments?.includes(ele?.department?.toLowerCase?.() || '') && Number(ele?.unitId) === Number(assignmentUnit);
    });
  }, [assignmentUnit, employeeList, Roles?.length]);
  const allowedRoles = new Set(['Contractual Employee Approver']);
  const filteredTableData = useMemo(() => {
    if (!Array.isArray(userList)) return [];

    const isSuperAdmin = Roles?.includes('SuperAdmin');

    return userList.filter((user: any) => {
      const hasValidRole = user?.roles?.some((role: any) => allowedRoles.has(role?.roleName));
      if (!hasValidRole) return false;
      const unitMatch = tableFilterUnit === '0' || Number(user?.unit) === Number(tableFilterUnit);
      if (!unitMatch) return false;
      if (isSuperAdmin) return true;
      return GGMDepartments?.includes(user?.deptDFCCIL?.toLowerCase?.() || '');
    });
  }, [userList, tableFilterUnit, Roles, GGMDepartments]);
  useEffect(() => {
    setSelectedEmployee([]);
    setAssignmentStatus(null);
  }, [assignmentUnit]);

  useEffect(() => {
    setAssignmentStatus(null);
  }, [selectedEmployee]);

  const handleAssignRole = async () => {
    if (!selectedEmployee || selectedEmployee.length === 0) {
      setAssignmentStatus({
        type: 'error',
        message: 'Please select both an employee and a role',
      });
      return;
    }

    setIsSubmitting(true);
    setAssignmentStatus(null);
    try {
      const response = await axiosInstance.post('/User/AddUserRoleMapping', {
        empCode: selectedEmployee[0]?.userCode,
        empUnitId: assignmentUnit, // Use selected assignment unit
        userRoles: [
          {
            roleId: role,
            departments: selectedEmployee[0]?.unitId === 396 ? [selectedEmployee[0]?.department] : ['all'],
          },
        ],
      });
      if (response.data.statusCode === 200) {
        setAssignmentStatus({
          type: 'success',
          message: 'Role assigned successfully!',
        });
        dispatch(fetchEmpRoleList());
        setTimeout(() => {
          setSelectedEmployee([]);
          setAssignmentStatus(null);
        }, 2000);
      } else {
        toast.error('The selected employee is already exist with the same role');
      }
    } catch (error) {
      setAssignmentStatus({
        type: 'error',
        message: 'Failed to assign role. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const deleteRoleMapping = async (iD) => {
    try {
      const response = await axiosInstance.delete(`/User/DeleteEMPRoleAssignment?MappingId=${iD}`);
      if (response.data.statusCode === 200) {
        dispatch(fetchEmpRoleList());
      }
    } catch (err) {
      console.log(err);
    }
  };

  // Table columns configuration
  const columns = useMemo(
    () => [
      {
        id: 'sn',
        header: 'S.No.',
        cell: ({ row }) => row.index + 1,
      },
      {
        id: 'empCode',
        header: 'Employee Code',
        accessorKey: 'empCode',
        cell: ({ row }) => row.original?.empCode,
      },
      {
        id: 'emplName',
        accessorKey: 'emplName',
        header: 'Employee Name',
        cell: ({ row }) => <div className="capitalize">{row?.original?.emplName}</div>,
      },
      {
        id: 'unit',
        header: 'Unit',
        accessorKey: 'location',
        cell: ({ row }) => {
          return <div>{row?.original?.location}</div>;
        },
      },
      {
        id: 'deptDFCCIL',
        accessorKey: 'deptDFCCIL',
        header: 'Department',
        cell: ({ row }) => <div className="capitalize">{row?.original?.deptDFCCIL}</div>,
      },

      {
        id: 'roles',
        header: 'Role',
        accessorKey: 'roles',
        cell: ({ row }) => {
          const roles = row.original?.roles;
          if (!roles || roles.length === 0) return 'No roles assigned';
          return <div className="capitalize">{roles.map((role) => role.roleName).join(', ')}</div>;
        },
      },
      {
        id: 'action',
        header: 'Action',
        accessorKey: 'action',
        cell: ({ row }) => {
          return (
            <div className="">
              <ConfirmDialog
                onConfirm={() => {
                  deleteRoleMapping(row?.original?.mappingId);
                }}
                actionLabel="Remove Role"
                title="Remove Role from Employee"
                description="Are you sure you want to remove this role from the employee? This action cannot be undone."
                icon={<Trash2 />}
              />
            </div>
          );
        },
      },
    ],
    [employeeList]
  );

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 max-w-full">
      <Heading type={2}>Role Assignment</Heading>
      {loading && <Loader />}
      <Card className="w-full">
        <CardContent className="p-3">
          <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-6 gap-3 lg:items-end">
            {/* Unit Selection for Assignment */}
            <div className="w-full">
              <Label className="text-sm font-medium mb-2 block">Select Unit</Label>
              <Select value={assignmentUnit} onValueChange={setAssignmentUnit}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Unit" />
                </SelectTrigger>
                <SelectContent>
                  {unitOptions.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value.toString()}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Employee Selection */}
            <div className="w-full">
              <Label className="text-sm font-medium mb-2 block">Select Employee</Label>
              <EmployeeSelect value={selectedEmployee} onChange={setSelectedEmployee} employees={filteredEmployees} isDisabled={!assignmentUnit} />
            </div>
            {/* Role Selection for Assignment */}
            <div className="w-full">
              <Label className="text-sm font-medium mb-2 block">Select Role</Label>
              <Select
                value={role}
                onValueChange={(e) => {
                  setRole(e);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  {rolesList?.map((role: any) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.roleName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Assign Button */}
            <div className="w-full lg:w-auto">
              <Button
                onClick={handleAssignRole}
                disabled={!selectedEmployee || selectedEmployee?.length === 0 || isSubmitting || !role}
                className="w-full lg:w-auto lg:px-8"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span className="hidden sm:inline">Assigning...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <span>Assign Role</span>
                )}
              </Button>
            </div>
          </div>

          {/* Status Messages */}
          {assignmentStatus && (
            <Alert className={`${assignmentStatus.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'} mx-1`}>
              {assignmentStatus.type === 'success' && <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />}
              <AlertDescription className={`${assignmentStatus.type === 'success' ? 'text-green-700' : 'text-red-700'} text-sm`}>
                {assignmentStatus.message}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="w-full">
        <div className="w-full overflow-x-auto">
          <div className="min-w-full">
            {/* {loading ? (
              <Loader />
            ) : ( */}
              <div>
                <div className="flex items-center">
                  <div className="w-full mb-4">
                    <Label className="text-sm font-medium mb-2 block">Filter by Unit</Label>
                    <Select value={tableFilterUnit} onValueChange={setTableFilterUnit}>
                      <SelectTrigger className="w-full max-w-xs">
                        <SelectValue placeholder="Select Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {unitOptions.map((unit) => (
                          <SelectItem key={unit.value} value={unit.value.toString()}>
                            {unit.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={() => dispatch(fetchEmpRoleList())}>
                    <RefreshCcw />
                  </Button>
                </div>
                <TableList columns={columns} data={filteredTableData} />
              </div>
            {/* )} */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Delegate;
