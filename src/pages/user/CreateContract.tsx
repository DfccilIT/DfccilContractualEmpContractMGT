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
  const [formData, setFormData] = useState({
    unit: null,
    contractor: null,
    department: null,
    contractNo: '',
    startDate: '',
    endDate: '',
    noOfEmployees: null,
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.unit) newErrors.unit = 'Unit is required';

    if (!formData.contractor) newErrors.contractor = 'Contractor is required';

    if (!formData.department) newErrors.department = 'Department is required';

    if (!formData.contractNo.trim()) newErrors.contractNo = 'Contract number is required';

    if (!formData.startDate) newErrors.startDate = 'Start date is required';

    if (!formData.endDate) newErrors.endDate = 'End date is required';

    if (!formData.noOfEmployees || formData.noOfEmployees <= 0) newErrors.noOfEmployees = 'Employee count must be greater than 0';

    if (formData.startDate && formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.endDate = 'End date cannot be before start date';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const fetchStaticData = async () => {
    try {
      setLoading(true);

      const response = await axiosInstance.get('/ContractManagement/get-static-data');

      const allUnits = response.data.data.unit;
      const allDepartments = response.data.data.departments;

      const isSuperAdmin = userDetails?.Roles?.includes('Super Admin');

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

          setFormData((prev) => ({
            ...prev,
            unit: formattedUnit,
          }));
        }
      }

      setDepartments(allDepartments);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDepartments = useMemo(() => {
    const contractor = contractors.find((c) => c.contractorId === formData.contractor?.value);

    return (
      contractor?.mappings
        ?.filter((m) => m.unitId === formData.unit?.value)
        ?.map((m) => ({
          label: m.departmentName,
          value: m.departmentId,
        })) || []
    );
  }, [formData.contractor, formData.unit, contractors]);

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

  const filteredContractors = useMemo(() => {
    if (!formData.unit) return [];

    return contractors
      ?.filter((c) => c.mappings?.some((m) => Number(m.unitId) === Number(formData.unit.value)))
      ?.map((c) => ({
        label: c.contractor,
        value: c.contractorId,
      }));
  }, [contractors, formData.unit]);

  const fetchMappingId = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/ContractManagement/get-unit-contract-Mapping?contractId=${formData.contractor.value}&unitId=${formData.unit.value}&departmentId=${formData.department.value}`
      );
      if (response.data.statusCode === 200) {
        return response.data.data;
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const mappingId = await fetchMappingId();

      const payload = {
        contractUnitMappingId: mappingId,
        contractNumber: formData.contractNo,
        startDate: formData.startDate,
        endDate: formData.endDate,
        numberOfEmployees: formData.noOfEmployees,
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
  const customSelectStyles = {
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#e1e7eb' : state.isFocused ? '#f0f4f6' : 'white',
      color: '#111827',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#111827',
    }),
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? '#9ca3af' : '#d1d5db',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#9ca3af',
      },
    }),
  };

  const clearError = (field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;

      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
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

  useEffect(() => {
    fetchStaticData();
    fetchContractorsData();
    fetchContract();
  }, []);

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
      accessorKey: 'numberOfEmployees',
      header: 'No. of Employees',
      cell: ({ row }) => <div className="px-2 py-3 font-semibold">{row.original.numberOfEmployees || '-'}</div>,
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
              const rowData = row.original;

              const unitOption = units.find((u) => u.value === rowData.unitId) || null;

              const contractorData = contractors.find((c) => c.contractorId === rowData.contractorId);

              const contractorOption = contractorData ? { value: contractorData.contractorId, label: contractorData.contractor } : null;

              const departmentOption =
                contractorData?.mappings
                  ?.filter((m) => m.unitId === rowData.unitId)
                  ?.map((m) => ({
                    label: m.departmentName,
                    value: m.departmentId,
                  }))
                  ?.find((d) => d.value === rowData.departmentId) || null;

              setSelectedRow(rowData);
              setMode('edit');

              setFormData({
                unit: unitOption,
                contractor: contractorOption,
                department: departmentOption,
                contractNo: rowData.contractNumber,
                startDate: rowData.startDate?.split('T')[0],
                endDate: rowData.endDate?.split('T')[0],
                noOfEmployees: rowData.numberOfEmployees,
              });

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
                setFormData({
                  unit: userDetails.Roles.includes('Super Admin') ? null : units[0] || null,
                  contractor: null,
                  department: null,
                  contractNo: '',
                  startDate: '',
                  endDate: '',
                  noOfEmployees: null,
                });

                setMode('add');
                setShowModal(true);
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Contract
            </Button>
            <TableList columns={columns} data={contracts} showSearchInput showRefresh onRefresh={() => fetchContract()} />
          </CardContent>
        </Card>
      </div>
      <CreateContractDialog
        open={showModal}
        onOpenChange={setShowModal}
        mode={mode}
        formData={formData}
        setFormData={setFormData}
        units={units}
        filteredContractors={filteredContractors}
        filteredDepartments={filteredDepartments}
        errors={errors}
        clearError={clearError}
        customSelectStyles={customSelectStyles}
        validateForm={validateForm}
        handleSubmit={handleSubmit}
      />
    </div>
  );
};

export default CreateContract;
