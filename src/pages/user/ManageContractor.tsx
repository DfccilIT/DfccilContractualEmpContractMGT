import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Pencil, Plus, Trash2 } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { RootState } from '@/app/store';
import axiosInstance from '@/services/axiosInstance';
import { showCustomToast } from '@/components/common/showCustomToast';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Loader from '@/components/ui/loader';
import TableList from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { ContractorModal } from '@/components/dialogs/ContractorModal';

const ManageContractor = () => {
  const [contracts, setContracts] = useState([]);
  const userDetails = useAppSelector((state: RootState) => state.user);
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState<'add' | 'edit'>('add');
  const [selectedRow, setSelectedRow] = React.useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState('');

  const allowedRoles = ['SuperAdmin', 'Contract Manager'];
  const isSuperAdmin = userDetails?.Roles?.includes('SuperAdmin');
  // const isContractManager = userDetails?.Roles?.includes('Contract Manager');

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
        message: error?.response?.data?.message || 'Something went wrong',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredContractors = useMemo(() => {
    if (isSuperAdmin) return contracts;

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
          <ConfirmDialog
            triggerClassName="h-8 w-8 p-0 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
            triggerLabel=""
            onConfirm={() => handleDelete(row.original.contractorId)}
            icon={<Trash2 size={16} />}
            title="Delete Contractor"
            description="Are you sure you want to delete this contractor? This action cannot be undone."
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
    } catch (error) {
      showCustomToast({
        title: 'Error',
        message: error?.response?.data?.message || 'Something went wrong',
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
            <h1 className="text-2xl font-bold">Manage Contractors</h1>
            <p className="text-gray-600 mt-1">Add, modify, or delete contractor mappings for organizational units and departments.</p>
          </div>
        </div>
        <Card className="border-0 shadow-md">
          <CardContent>
            <div className="flex">
              <Button
                onClick={() => {
                  const userUnit = unitOptions.find((u) => u.label === userDetails.Unit) || unitOptions[0];

                  setMode('add');

                  setSelectedRow({
                    contractor: '',
                    mappings: [
                      {
                        unitId: userUnit?.value ?? null,
                        departmentId: null,
                      },
                    ],
                  });

                  setShowModal(true);
                }}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Contractor
              </Button>
            </div>
            <TableList
              columns={columns}
              data={filteredContractors}
              showSearchInput
              showRefresh
              onRefresh={() => fetchContractorsData()}
              // rightElements={
              //   <>
              //     {unitOptions.length > 1 && (
              //       <div className="mb-4 mt-5 w-64">
              //         <select value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)} className="w-full border rounded-md p-2">
              //           <option value="">All Units</option>
              //           {unitOptions.map((u) => (
              //             <option key={u.value} value={u.label}>
              //               {u.label}
              //             </option>
              //           ))}
              //         </select>
              //       </div>
              //     )}
              //   </>
              // }
            />
          </CardContent>
        </Card>
      </div>
      <ContractorModal
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

export default ManageContractor;
