import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useAppSelector } from '@/app/hooks';
import { RootState } from '@/app/store';
import axiosInstance from '@/services/axiosInstance';
import { showCustomToast } from '@/components/common/showCustomToast';
import Loader from '@/components/ui/loader';
import { Button } from '@/components/ui/button';
import { Pencil, Plus } from 'lucide-react';
import { CreateContractDialog } from '@/components/dialogs/CreateContractModal';
import ExpandableTableList from '@/components/ui/expand-table';

const CreateContract = () => {
  const userDetails = useAppSelector((state: RootState) => state.user);
  const [loading, setLoading] = useState(false);
  const [contractors, setContractors] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState<'add' | 'edit'>('add');
  const [selectedRow, setSelectedRow] = React.useState(null);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [contractEmployees, setContractEmployees] = useState({});
  const [employeeSearch, setEmployeeSearch] = useState({});
  const [selectedUnit, setSelectedUnit] = useState('');

  const allowedRoles = ['SuperAdmin', 'Contract Manager'];
  const isSuperAdmin = userDetails?.Roles?.includes('SuperAdmin');

  const unitOptions = useMemo(() => {
    const map = new Map();

    userDetails?.roleAssigned
      ?.filter((role) => allowedRoles.includes(role.roleAssign))
      ?.forEach((role) => {
        role.units?.forEach((u) => {
          map.set(u.mstUnitId, {
            value: u.mstUnitId,
            label: u.unitName,
          });
        });
      });

    return Array.from(map.values());
  }, [userDetails]);

  const departmentOptions = useMemo(() => {
    // SuperAdmin → first unit departments
    if (isSuperAdmin) {
      return (
        userDetails?.roleAssigned?.[0]?.units?.[0]?.departments?.map((d) => ({
          value: d.departmentId,
          label: d.departmentName,
        })) || []
      );
    }

    const map = new Map();

    userDetails?.roleAssigned
      ?.filter((role) => allowedRoles.includes(role.roleAssign))
      ?.forEach((role) => {
        role.units?.forEach((u) => {
          u.departments?.forEach((d) => {
            map.set(d.departmentId, {
              value: d.departmentId,
              label: d.departmentName,
            });
          });
        });
      });

    return Array.from(map.values());
  }, [userDetails]);

  const fetchContractorsData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/ContractManagement/get-contractors');
      setContractors(response.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      const payload = {
        contractUnitMappingId: formData.contractUnitMappingId,
        contractNumber: formData.contractNumber,
        startDate: formData.startDate,
        endDate: formData.endDate,
        numberOfEmployees: formData.numberOfEmployees,
        employeeMasterIds: formData.employeeMasterIds,
      };

      let response;

      if (mode === 'edit') {
        response = await axiosInstance.put(`/ContractManagement/update-contract/${selectedRow.pkContractId}`, payload);
      } else {
        response = await axiosInstance.post('/ContractManagement/create-contract', payload);
      }

      if (response.data.statusCode === 200) {
        showCustomToast({
          title: 'Success',
          type: 'success',
          message: mode === 'edit' ? 'Contract updated successfully' : 'Contract created successfully',
        });

        setShowModal(false);
        setSelectedRow(null);

        fetchContract();
        if (mode === 'edit' && selectedRow?.pkContractId) {
          fetchContractEmployees(selectedRow.pkContractId);
        }
      }
    } catch (error) {
      console.log(error);
      showCustomToast({
        title: 'Error',
        type: 'error',
        message: error?.response?.data?.message || 'Something went wrong',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchContract = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/ContractManagement/get-all-contract');
      setContracts(response.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get('/ContractManagement/employees-available');

      const isSuperAdmin = userDetails?.Roles?.includes('SuperAdmin');

      let employees = res.data.data;

      if (!isSuperAdmin) {
        employees = employees.filter((emp) => emp.location === userDetails.Unit);
      }

      const formatted = employees.map((emp) => ({
        value: emp.employeeId,
        label: emp.userName,
        empCode: emp.employeeCode,
        department: emp.deptDFCCIL,
      }));

      setEmployeeOptions(formatted);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContractorsData();
    fetchContract();
    fetchEmployees();
  }, []);

  const filteredContracts = useMemo(() => {
    let data = contracts;

    if (!userDetails.unitId) return data;

    if (!userDetails.Roles.includes('SuperAdmin')) {
      data = data.filter((c) => c.unit === userDetails.Unit);
    }

    if (selectedUnit) {
      data = data.filter((c) => c.unit === selectedUnit);
    }

    return data;
  }, [contracts, userDetails, selectedUnit]);

  const fetchContractEmployees = async (contractId) => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(`/ContractManagement/get-contract-employees-search?contractId=${contractId}`);

      const employees = res.data.data || [];

      setContractEmployees((prev) => ({
        ...prev,
        [contractId]: employees,
      }));
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      accessorKey: 'key',
      header: 'SR NO.',
      cell: ({ row }) => <div className="px-2 py-3 font-semibold">{row.index + 1}</div>,
    },
    {
      accessorKey: 'contractNumber',
      header: 'Contract No.',
      cell: ({ row }) => <div className="px-2 py-3 font-semibold">{row.original.contractNumber}</div>,
    },
    {
      accessorKey: 'contractor',
      header: 'Contractor',
      cell: ({ row }) => <div className="px-2 py-3 font-semibold">{row.original.contractor.toUpperCase()}</div>,
    },
    {
      accessorKey: 'numberOfEmployees',
      header: 'No. of Employees',
      cell: ({ row }) => <div className="px-2 py-3 font-semibold">{row.original.numberOfEmployees || '-'}</div>,
    },
    {
      accessorKey: 'department',
      header: 'Department',
      cell: ({ row }) => <div className="px-2 py-3 font-semibold">{row.original.department.toUpperCase() || '-'}</div>,
    },
    {
      accessorKey: 'startDate',
      header: 'Start Date',
      cell: ({ row }) => (
        <div className="px-2 py-3 font-semibold">
          {new Date(row.original.startDate).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </div>
      ),
    },
    {
      accessorKey: 'endDate',
      header: 'End Date',
      cell: ({ row }) => (
        <div className="px-2 py-3 font-semibold">
          {new Date(row.original.endDate).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </div>
      ),
    },
    {
      accessorKey: 'action',
      header: 'Action',
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-2">
          {/* Edit Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={async () => {
              const contractId = row.original.pkContractId;

              if (!contractEmployees[contractId]) {
                await fetchContractEmployees(contractId);
              }

              setSelectedRow(row.original);
              setMode('edit');
              setShowModal(true);
            }}
            className="h-8 w-8 border-gray-200 hover:bg-blue-50 hover:text-blue-600"
            title="Update"
          >
            <Pencil className="w-4 h-4" />
          </Button>

          {/* Delete Button */}
          {/* <ConfirmDialog
            triggerClassName="h-8 w-8 p-0 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
            triggerLabel=""
            onConfirm={() => handleDelete()}
            icon={<Trash2 size={16} />}
            title="Delete Contract"
            description="Are you sure you want to delete this contract? This action cannot be undone."
          /> */}
        </div>
      ),
    },
  ];

  const assignedEmployees = useMemo(() => {
    if (!selectedRow) return [];
    return contractEmployees[selectedRow.pkContractId] || [];
  }, [selectedRow, contractEmployees]);

  return (
    <div className="p-4 md:p-8">
      {loading && <Loader />}
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Manage Contracts</h1>
            <p className="text-gray-600 mt-1">Create and manage contract records for departments and units.</p>
          </div>
        </div>
        <Card className="border-0 shadow-md">
          <CardContent className="mt-5">
            <Button
              onClick={() => {
                setMode('add');
                setSelectedRow(null);
                setShowModal(true);
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Contract
            </Button>
            <ExpandableTableList
              columns={columns}
              data={filteredContracts}
              showSearchInput
              showRefresh
              onRefresh={fetchContract}
              rightElements={
                <>
                  {unitOptions.length > 1 && (
                    <div className="mb-4 mt-5 w-64">
                      <select value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)} className="w-full border rounded-md p-2">
                        <option value="">All Units</option>
                        {unitOptions.map((u) => (
                          <option key={u.value} value={u.label}>
                            {u.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              }
              renderExpanded={(row) => {
                const contractId = row.pkContractId;
                const searchText = employeeSearch[contractId] || '';

                if (!contractEmployees[contractId]) {
                  fetchContractEmployees(contractId);
                }

                const employees = contractEmployees[contractId] || [];

                const filteredEmployees = employees.filter((emp) =>
                  `${emp.employeeCode} ${emp.userName} ${emp.mobile}`.toLowerCase().includes(searchText.toLowerCase())
                );

                return (
                  <div className="w-full">
                    <div className="flex justify-between mb-3">
                      {/* <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleAssignEmployees(row)}>
                        Assign Employees
                      </Button> */}
                      <input
                        placeholder="Search employee..."
                        value={searchText}
                        onChange={(e) =>
                          setEmployeeSearch((prev) => ({
                            ...prev,
                            [contractId]: e.target.value,
                          }))
                        }
                        className="w-64 border p-2 rounded-md"
                      />
                    </div>
                    {/* SECOND TABLE */}
                    <div className="max-h-[300px] overflow-y-auto border rounded-md">
                      <table className="w-full border rounded-md">
                        <thead className="bg-gray-200 sticky top-0">
                          <tr>
                            <th className="px-4 py-2 text-left">Employee Code</th>
                            <th className="px-4 py-2 text-left">Name</th>
                            <th className="px-4 py-2 text-left">Department</th>
                            <th className="px-4 py-2 text-left">Mobile</th>
                          </tr>
                        </thead>

                        <tbody>
                          {filteredEmployees.length ? (
                            filteredEmployees.map((emp, i) => (
                              <tr key={i}>
                                <td className="px-4 py-2">{emp.employeeCode}</td>
                                <td className="px-4 py-2">{emp.userName}</td>
                                <td className="px-4 py-2">{emp.deptDFCCIL}</td>
                                <td className="px-4 py-2">{emp.mobile}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={3} className="text-center py-3 text-gray-500">
                                No employees assigned
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              }}
            />
          </CardContent>
        </Card>
      </div>
      <CreateContractDialog
        open={showModal}
        onOpenChange={setShowModal}
        mode={mode}
        initialData={selectedRow}
        units={unitOptions}
        Contractors={contractors}
        Departments={departmentOptions}
        employees={employeeOptions}
        assignedEmployees={assignedEmployees}
        onSave={handleSubmit}
      />
    </div>
  );
};

export default CreateContract;
