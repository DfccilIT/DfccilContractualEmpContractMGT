import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import Select from 'react-select';

type Employee = {
  empId: number;
  empCode: string;
  empName: string;
  designation: string;
  department: string;
  unitId: number;
};

type OptionType = {
  value: number;
  label: string;
  empName: string;
  empCode: string;
  designation: string;
  department: string;
};

const EmployeeSelect = () => {
  const { user, employee } = useSelector((state: RootState) => ({
    user: state.user,
    employee: state.employee,
  }));
  

  const employees: Employee[] = employee.employees.filter((emp) => emp.unitId === Number(user.unitId));

  const employeeOptions: OptionType[] = employees.map((emp) => ({
    value: emp.empId,
    label: `${emp.empName} (${emp.empCode})`,
    empName: emp.empName,
    empCode: emp.empCode,
    designation: emp.designation,
    department: emp.department,
  }));

  const [selectedOptions, setSelectedOptions] = useState<OptionType[]>([]);

  const selectedEmployees = employees.filter((emp) => selectedOptions.some((opt) => opt.value === emp.empId));

  return (
    <div>
      <label className="font-semibold">Select Employees:</label>

      <Select
        className="mt-2"
        isMulti
        options={employeeOptions}
        value={selectedOptions}
        onChange={(selected) => setSelectedOptions(selected as OptionType[])}
        placeholder="Select employees..."
        isSearchable
        formatOptionLabel={(option) => (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full font-bold uppercase">
              {option.empName[0]}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-800">{option.empName}</div>
              <div className="text-xs text-gray-500">
                {option.empCode} | {option.designation} | {option.department}
              </div>
            </div>
          </div>
        )}
        filterOption={(option, inputValue) => {
          const { empName, empCode, designation, department } = option.data;
          const search = inputValue.toLowerCase();
          return (
            empName.toLowerCase().includes(search) ||
            empCode.toLowerCase().includes(search) ||
            designation.toLowerCase().includes(search) ||
            department.toLowerCase().includes(search)
          );
        }}
      />

      <div className="mt-4">
        <h4 className="font-semibold">Selected Employees:</h4>
        <ul className="list-disc ml-6">
          {selectedEmployees.map((emp) => (
            <li key={emp.empId}>
              {emp.empName} - {emp.designation}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default EmployeeSelect;