import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppSelector } from '@/app/hooks';
import { RootState } from '@/app/store';
import axiosInstance from '@/services/axiosInstance';
import { showCustomToast } from '@/components/common/showCustomToast';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Loader from '@/components/ui/loader';
import TableList from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import Select from 'react-select';
import { Label } from '@/components/ui/label';
import { AlertCircle, Pencil, Plus, Trash2 } from 'lucide-react';
import { CreateContractDialog } from '@/components/dialogs/CreateContractModal';
import ExpandableTable from '@/components/ui/expand-table';
import ExpandableTableList from '@/components/ui/expand-table';
import { EmployeeContractsDialog } from '@/components/dialogs/EmployeeContractsDialog';

const CreateContract = () => {
  const userDetails = useAppSelector((state: RootState) => state.user);
  const [loading, setLoading] = useState(false);
  const [contractors, setContractors] = useState([]);
  const [units, setUnits] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState<'add' | 'edit'>('add');
  const [selectedRow, setSelectedRow] = React.useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);

  const fetchStaticData = async () => {
    try {
      setLoading(true);

      const response = await axiosInstance.get('/ContractManagement/get-static-data');

      const allUnits = response.data.data.unit;
      const allDepartments = response.data.data.departments;

      const isSuperAdmin = userDetails?.Roles?.includes('SuperAdmin');

      if (isSuperAdmin) {
        // show all units
        const formattedUnits = allUnits.map((u) => ({
          value: u.unitid,
          label: u.unitName,
        }));

        setUnits(formattedUnits);
      } else {
        const userUnit = allUnits.find((u) => u.unitName === userDetails.Unit);

        if (userUnit) {
          const formattedUnit = {
            value: userUnit.unitid,
            label: userUnit.unitName,
          };

          setUnits([formattedUnit]);
        }
      }
      setDepartments(allDepartments);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

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
      } else {
        showCustomToast({
          title: 'Error',
          type: 'error',
          message: response.data.message || 'Operation failed',
        });
      }
    } catch (error) {
      console.log(error);

      showCustomToast({
        title: 'Error',
        type: 'error',
        message: 'Something went wrong',
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
    fetchStaticData();
    fetchContractorsData();
    fetchContract();
    fetchEmployees();
  }, []);

  const filteredContracts = useMemo(() => {
    if (!userDetails.unitId) return contracts;

    if (userDetails.Roles.includes('SuperAdmin')) {
      return contracts;
    }

    return contracts.filter((c) => c.unit === userDetails.Unit);
  }, [contracts, userDetails]);

  console.log(contracts);
  console.log(filteredContracts);

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
      cell: ({ row }) => <div className="px-2 py-3 font-semibold">{row.original.contractor}</div>,
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
            onClick={() => {
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

  const handleAssignEmployees = (row) => {
    setSelectedContract(row);
    setShowAssignModal(true);
  };

  const handleAssignEmployeesSubmit = async () => {
    try {
      setLoading(true);

      const payload = {
        contractId: selectedContract?.pkContractId,
        employeeMasterIds: selectedEmployees.map((emp) => emp.value),
      };

      const response = await axiosInstance.post('/ContractManagement/contract-employees-sync', payload);

      if (response.data.statusCode === 200) {
        showCustomToast({
          title: 'Success',
          type: 'success',
          message: response.data.message || 'Employees synced successfully',
        });

        setShowAssignModal(false);
        setSelectedEmployees([]);
        fetchContract();
      } else {
        showCustomToast({
          title: 'Error',
          type: 'error',
          message: response.data.message || 'Something went wrong',
        });
      }
    } catch (error) {
      console.log(error);

      showCustomToast({
        title: 'Error',
        type: 'error',
        message: 'Failed to assign employees',
      });
    } finally {
      setLoading(false);
    }
  };
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
            {/* <TableList columns={columns} data={filteredContracts} showSearchInput showRefresh onRefresh={() => fetchContract()} /> */}
            <ExpandableTableList
              columns={columns}
              data={filteredContracts}
              showSearchInput
              showRefresh
              onRefresh={fetchContract}
              renderExpanded={(row) => (
                <div className="space-y-4">
                  {/* TOP ACTION BUTTON */}
                  <div className="flex justify-start">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleAssignEmployees(row)}>
                      Assign Employees
                    </Button>
                  </div>

                  {/* SECOND TABLE */}
                  <table className="w-full border rounded-md">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="px-4 py-2 text-left">Employee</th>
                        <th className="px-4 py-2 text-left">Department</th>
                        <th className="px-4 py-2 text-left">Joining Date</th>
                      </tr>
                    </thead>

                    <tbody>
                      {row.employees?.length ? (
                        row.employees.map((emp, i) => (
                          <tr key={i}>
                            <td className="px-4 py-2">{emp.name}</td>
                            <td className="px-4 py-2">{emp.department}</td>
                            <td className="px-4 py-2">{emp.joiningDate}</td>
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
              )}
            />
          </CardContent>
        </Card>
      </div>
      <CreateContractDialog
        open={showModal}
        onOpenChange={setShowModal}
        mode={mode}
        initialData={selectedRow}
        units={units}
        Contractors={contractors}
        Departments={departments}
        onSave={handleSubmit}
      />
      <EmployeeContractsDialog
        open={showAssignModal}
        onOpenChange={setShowAssignModal}
        selectedContract={selectedContract}
        selectedEmployees={selectedEmployees}
        setSelectedEmployees={setSelectedEmployees}
        employeeOptions={employeeOptions}
        handleSubmit={handleAssignEmployeesSubmit}
      />
    </div>
  );
};

export default CreateContract;
