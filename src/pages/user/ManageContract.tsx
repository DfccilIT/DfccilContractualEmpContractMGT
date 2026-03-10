import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { RootState } from '@/app/store';
import axiosInstance from '@/services/axiosInstance';
import { showCustomToast } from '@/components/common/showCustomToast';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Loader from '@/components/ui/loader';
import TableList from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { ContractModal } from '@/components/dialogs/ContractModal';

const ManageContract = () => {
  const [contracts, setContracts] = useState([]);
  const userDetails = useAppSelector((state: RootState) => state.user);
  // const { unit, departments } = useAppSelector((state: RootState) => state.masterData.data);
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState<'add' | 'edit'>('add');
  const [selectedRow, setSelectedRow] = React.useState(null);
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState([]);
  const [departments, setDepartments] = useState([]);

  const fetchStaticData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/ContractManagement/get-static-data');
      setUnits(response.data.data.unit);
      setDepartments(response.data.data.departments);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchStaticData();
  }, []);

  const unitOptions = useMemo(() => {
    if (userDetails.Roles.includes('SuperAdmin')) {
      return units?.map((u) => ({
        value: u.unitid,
        label: u.unitName,
      }));
    }
    return units
      ?.filter((u) => u.unitName === userDetails.Unit)
      ?.map((u) => ({
        value: u.unitid,
        label: u.unitName,
      }));
  }, [units, userDetails]);

  const departmentOptions = useMemo(() => departments?.map((d) => ({ value: d.departmentid, label: d.department })), [departments]);

  const fetchContractorsData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/ContractManagement/get-contractors');
      setContracts(response.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchContractorsData();
  }, []);

  const handleSaveContract = async (formData) => {
    try {
      setLoading(true);

      const payload = {
        contractor: formData.contractorName,
        mappings: formData.departments.map((deptId) => ({
          fkUnitId: Number(formData.unit),
          fkDepartmentId: Number(deptId),
        })),
      };

      let response;

      if (mode === 'edit') {
        response = await axiosInstance.put(`/ContractManagement/update-contractor/${selectedRow.contractorId}`, payload);
      } else {
        response = await axiosInstance.post('/ContractManagement/create-contractor', payload);
      }

      if (response.data.statusCode === 200) {
        showCustomToast({
          title: 'Success',
          message: mode === 'edit' ? 'Contract updated successfully' : 'Contract created successfully',
          type: 'success',
        });

        setShowModal(false);
        setSelectedRow(null);
        fetchContractorsData();
      }
    } catch (error) {
      showCustomToast({
        title: 'Error',
        message: 'Operation failed',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };
  const filteredContracts = useMemo(() => {
    if (!userDetails.unitId) return contracts;

    if (userDetails.Roles.includes('SuperAdmin')) {
      return contracts;
    }

    return contracts.filter((c) => c.mappings?.[0]?.unitName === userDetails.Unit);
  }, [contracts, userDetails]);

  const columns = [
    {
      accessorKey: 'key',
      header: 'SR NO.',
      cell: ({ row }) => <div className="px-2 py-3 font-semibold">{row.index + 1}</div>,
    },
    {
      accessorKey: 'contractor',
      header: 'Contractor Name',
      cell: ({ row }) => <div className="px-2 py-3 font-semibold">{row.original.contractor.toUpperCase()}</div>,
    },
    {
      accessorKey: 'unit',
      header: 'Unit',
      cell: ({ row }) => <div className="px-2 py-3 font-semibold">{row.original.mappings?.[0]?.unitName.toUpperCase() || '-'}</div>,
    },
    {
      accessorKey: 'department',
      header: 'Departments',
      cell: ({ row }) => <div className="px-2 py-3 font-semibold">{row.original.mappings?.map((m) => m.departmentName).join(' , ') || '-'}</div>,
    },
    {
      accessorKey: 'action',
      header: 'Action',
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => {
              setSelectedRow(row.original);
              setMode('edit');
              setShowModal(true);
            }}
            className="rounded-lg border p-1 text-gray-600 hover:bg-gray-100"
          >
            <Edit className="w-4 h-4" />
          </button>

          <ConfirmDialog
            triggerClassName={'bg-red-500 px-1 h-6'}
            triggerLabel=""
            onConfirm={() => handleDelete(row.original.contractorId)}
            icon={<Trash2 size={16} />}
            description="Are you sure you want to delete this contract? This action cannot be undone."
            title="Delete Contract"
          />
        </div>
      ),
    },
  ];

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const response = await axiosInstance.put(`/ContractManagement/deactivate-contractor/${id}`);
      if (response.data.statusCode === 200) {
        showCustomToast({
          title: 'Success',
          message: 'Contractor deactivated successfully',
          type: 'success',
        });
        setShowModal(false);
        fetchContractorsData();
      }
    } catch (err) {
      showCustomToast({
        title: 'Error',
        message: 'Failed to delete contract',
        type: 'error',
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
            <p className="text-gray-600 mt-1">Add, modify, or deactivate contractor mappings for organizational units and departments.</p>
          </div>
        </div>
        <Card className="border-0 shadow-md">
          <CardContent>
            <div className="flex">
              <Button
                onClick={() => {
                  const userUnit = units.find((u) => u.unitName === userDetails.Unit);
                  console.log(userUnit.unitid  , " djofhoijhfoi")
                  setMode('add');
                  setSelectedRow({
                    contractor: '',
                    mappings: [
                      {
                        unitId: userUnit?.unitid || null,
                        departmentId: null,
                      },
                    ],
                  });

                  setShowModal(true);
                }}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Contract
              </Button>
            </div>
            <TableList columns={columns} data={filteredContracts} showSearchInput showRefresh />
          </CardContent>
        </Card>
      </div>
      <ContractModal
        open={showModal}
        onOpenChange={setShowModal}
        mode={mode}
        initialData={selectedRow}
        units={unitOptions}
        departments={departmentOptions}
        onSave={handleSaveContract}
      />
    </div>
  );
};

export default ManageContract;
