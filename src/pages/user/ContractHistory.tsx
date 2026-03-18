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
import { EmployeeContractsDialog } from '@/components/dialogs/EmployeeContractsDialog';

const ContractHistory = () => {
  const userDetails = useAppSelector((state: RootState) => state.user);
  const [loading, setLoading] = useState(false);
  const [contractHistory, setContractHistory] = useState([]);
  const [contractEmployees, setContractEmployees] = useState({});
  const [employeeSearch, setEmployeeSearch] = useState({});
  const [selectedUnit, setSelectedUnit] = useState('');

  const allowedRoles = ['SuperAdmin', 'Contract Manager'];

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

  const fetchContract = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/ContractManagement/get-contract-history');
      setContractHistory(response.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContract();
  }, []);

  const filteredContractHistory = useMemo(() => {
    if (!userDetails.unitId) return contractHistory;

    if (userDetails.Roles.includes('SuperAdmin')) {
      if(!selectedUnit) return contractHistory;

      return contractHistory.filter((c)=> c.unit === selectedUnit)
    }

    return contractHistory.filter((c) => c.unit === userDetails.Unit);
  }, [contractHistory, userDetails , selectedUnit]);

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
  ];

  return (
    <div className="p-4 md:p-8">
      {loading && <Loader />}
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Archive Contracts</h1>
            <p className="text-gray-600 mt-1">View and manage previously completed or inactive contracts.</p>
          </div>
        </div>
        <Card className="border-0 shadow-md">
          <CardContent className="mt-5">
            <ExpandableTableList
              columns={columns}
              data={filteredContractHistory}
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
    </div>
  );
};

export default ContractHistory;
