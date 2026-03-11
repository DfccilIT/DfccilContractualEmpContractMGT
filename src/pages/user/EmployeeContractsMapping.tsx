import { Card, CardContent } from '@/components/ui/card';
import Select from 'react-select';
import React, { useEffect, useMemo, useState } from 'react';
import { Label } from '@/components/ui/label';
import axiosInstance from '@/services/axiosInstance';
import { Loader } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { RootState } from '@/app/store';
import ConfirmDialog from '@/components/common/ConfirmDialog';

const EmployeeContractsMapping = () => {
  const userDetails = useAppSelector((state: RootState) => state.user);

  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [contracts, setContracts] = useState([]);

  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedContract, setSelectedContract] = useState(null);
  const [selectedEmployees, setSelectedEmployees] = useState([]);

  /* ---------------- API CALLS ---------------- */

  const fetchStaticData = async () => {
    try {
      const res = await axiosInstance.get('/ContractManagement/get-static-data');
      setDepartments(res.data.data.departments);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchContracts = async () => {
    try {
      const res = await axiosInstance.get('/ContractManagement/get-all-contract');
      setContracts(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get('/ContractManagement/employees-available');

      const unitEmployees = res.data.data.filter((emp) => emp.location === userDetails.Unit);

      setEmployees(unitEmployees);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchStaticData();
    fetchContracts();
  }, []);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const payload = {
        contractId: selectedContract?.value,
        employeeMasterIds: selectedEmployees.map((emp) => emp.value),
      };

      const response = await axiosInstance.post('/ContractManagement/contract-employees-sync', payload);
      
      console.log(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- OPTIONS ---------------- */

  const departmentOptions = useMemo(
    () =>
      departments.map((d) => ({
        value: d.departmentid,
        label: d.department,
      })),
    [departments]
  );

  const contractOptions = useMemo(() => {
    if (!selectedDepartment) return [];

    return contracts
      .filter((c) => c.department === selectedDepartment.label)
      .map((c) => ({
        value: c.pkContractId,
        label: c.contractNumber,
      }));
  }, [contracts, selectedDepartment]);

  const employeeOptions = useMemo(() => {
    const empOptions = employees.map((emp) => ({
      value: emp.employeeId,
      label: emp.userName,
      empCode: emp.employeeCode,
      department: emp.deptDFCCIL,
    }));

    return [{ value: 'ALL', label: 'Select All Employees' }, ...empOptions];
  }, [employees]);

  /* ---------------- EMPLOYEE SELECT ---------------- */

  const handleEmployeeChange = (selected) => {
    if (!selected) {
      setSelectedEmployees([]);
      return;
    }

    const selectAll = selected.find((s) => s.value === 'ALL');

    if (selectAll) {
      setSelectedEmployees(employeeOptions.filter((e) => e.value !== 'ALL'));
    } else {
      setSelectedEmployees(selected);
    }
  };

  /* ---------------- SELECT STYLE ---------------- */

  const customSelectStyles = {
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#e1e7eb' : state.isFocused ? '#f0f4f6' : 'white',
      color: '#111827',
    }),
    control: (provided) => ({
      ...provided,
      borderColor: '#d1d5db',
      boxShadow: 'none',
      '&:hover': { borderColor: '#9ca3af' },
    }),
  };

  return (
    <div className="p-4 md:p-8">
      {loading && <Loader />}

      <div className="max-w-[1600px] mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Assign Contracts</h1>
          <p className="text-gray-600 mt-1">Assign Contracts to employees</p>
        </div>

        <Card className="border-0 shadow-md">
          <CardContent className="mt-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* Department */}
              <div className="space-y-2">
                <Label>Department *</Label>

                <Select
                  value={selectedDepartment}
                  onChange={setSelectedDepartment}
                  options={departmentOptions}
                  placeholder="Select Department"
                  isClearable
                  styles={customSelectStyles}
                />
              </div>

              {/* Contract */}
              <div className="space-y-2">
                <Label>Contract No. *</Label>

                <Select
                  value={selectedContract}
                  onChange={setSelectedContract}
                  options={contractOptions}
                  placeholder="Select Contract"
                  isClearable
                  styles={customSelectStyles}
                />
              </div>

              {/* Employees */}
              <div className="space-y-2">
                <Label>Employees *</Label>

                <Select
                  isMulti
                  closeMenuOnSelect={false}
                  value={selectedEmployees}
                  onChange={handleEmployeeChange}
                  options={employeeOptions}
                  placeholder="Select Employees"
                  styles={customSelectStyles}
                  formatOptionLabel={(option) => {
                    if (option.value === 'ALL') {
                      return <div className="text-blue-600 font-semibold">Select All Employees</div>;
                    }

                    return (
                      <div className="flex flex-col">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-gray-500">
                          {option.empCode} | {option.department}
                        </span>
                      </div>
                    );
                  }}
                />
              </div>
            </div>
            <div className="pt-6 flex justify-end">
              <ConfirmDialog
                triggerClassName="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                description={'Are you sure you want to map these employess with this contract?'}
                actionLabel="Confirm"
                triggerLabel={'Submit'}
                // beforeOpen={() => validateForm()}
                onConfirm={handleSubmit}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeContractsMapping;
