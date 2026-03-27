// import React, { useState } from 'react';
// import { useSelector } from 'react-redux';
// import { RootState } from '@/app/store';
// import Select from 'react-select';
// import { useAppSelector } from '@/app/hooks';

// type Employee = {
//   empId: number;
//   empCode: string;
//   empName: string;
//   designation: string;
//   department: string;
//   unitId: number;
// };

// type OptionType = {
//   value: number;
//   label: string;
//   empName: string;
//   empCode: string;
//   designation: string;
//   department: string;
// };

// const EmployeeSelect = ({ employees }) => {
//   const { GGMDepartments } = useAppSelector((state: RootState) => state.user);
//   const employeeOptions: OptionType[] = employees
//     .filter((ele) => GGMDepartments?.includes(ele?.department?.toLowerCase()))
//     .map((emp) => ({
//       value: emp.empId,
//       label: `${emp.empName} (${emp.empCode})`,
//       empName: emp.empName,
//       empCode: emp.empCode,
//       designation: emp.designation,
//       department: emp.department,
//     }));

//   const [selectedOptions, setSelectedOptions] = useState<OptionType[]>([]);

//   return (
//     <div>
//       <Select
//         className="mt-2"
//         isMulti
//         options={employeeOptions}
//         value={selectedOptions}
//         onChange={(selected) => setSelectedOptions(selected as OptionType[])}
//         placeholder="Select employees..."
//         isSearchable
//         formatOptionLabel={(option) => (
//           <div className="flex items-center gap-3">
//             <div className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full font-bold uppercase">{option.empName[0]}</div>
//             <div>
//               <div className="text-sm font-medium text-gray-800">{option.empName}</div>
//               <div className="text-xs text-gray-500">
//                 {option.empCode} | {option.designation} | {option.department}
//               </div>
//             </div>
//           </div>
//         )}
//         filterOption={(option, inputValue) => {
//           const { empName, empCode, designation, department } = option.data;
//           const search = inputValue.toLowerCase();
//           return (
//             empName.toLowerCase().includes(search) ||
//             empCode.toLowerCase().includes(search) ||
//             designation.toLowerCase().includes(search) ||
//             department.toLowerCase().includes(search)
//           );
//         }}
//       />
//     </div>
//   );
// };

// export default EmployeeSelect;

import React from 'react';
import Select from 'react-select';
import { Label } from '@/components/ui/label';
import { useAppSelector } from '@/app/hooks';
import { RootState } from '@/app/store';

interface Employee {
  empId: number;
  empCode: string;
  empName: string | null;
  department: string | null;
  designation: string | null;
  unitName: string;
  unitId: number;
  imageURL?: string | null;
}

interface UserSelectProps {
  employees: Employee[];
  value: { userCode: string; userDetail: string }[];
  onChange: (value: { userCode: string; userDetail: string }[]) => void;
  isMulti?: boolean;
  label?: string;
  isDisabled?: boolean;
}

const EmployeeSelect: React.FC<UserSelectProps> = ({ employees, value, onChange, label, isDisabled = false }) => {
  const formatField = (field?: string | null) => (field && field.trim() !== '' && field.trim().toLowerCase() !== 'na' ? field : null);
  const { GGMDepartments } = useAppSelector((state: RootState) => state.user);

  const options =
    employees
      ?.filter((emp) => emp?.empName && emp.empName?.trim() !== '' && GGMDepartments?.includes(emp?.department?.toLowerCase()))
      .map((emp) => {
        const designation = formatField(emp.designation);
        const department = formatField(emp.department);
        const parts = [emp.empCode, emp.empName, designation, department].filter(Boolean);
        return {
          value: emp.empCode,
          label: parts.join(' | '),
          empName: emp.empName,
          empCode: emp.empCode,
          designation,
          department,
          imageURL: emp.imageURL,
          data: emp,
          unitId: emp.unitId,
        };
      }) || [];

  const handleChange = (selectedOption: any) => {
    if (selectedOption) {
      const selectedUser = {
        userCode: selectedOption.value,
        userDetail: selectedOption.empName || selectedOption.value,
        unitId: selectedOption.unitId,
        department: selectedOption.department,
      };
      onChange([selectedUser]);
    } else {
      onChange([]);
    }
  };

  const getCurrentValue = () => {
    if (!value || value?.length === 0) {
      return null;
    }
    const firstValue = value[0];
    const employee = employees?.find((e) => e.empCode === firstValue.userCode);
    if (!employee) return null;

    const designation = formatField(employee.designation);
    const department = formatField(employee.department);
    const parts = [employee.empCode, employee.empName, designation, department].filter(Boolean);

    return {
      value: firstValue.userCode,
      label: parts.join(' | '),
      empName: employee.empName,
      empCode: employee.empCode,
      designation,
      department,
      imageURL: employee.imageURL,
      data: employee,
    };
  };

  const formatOptionLabel = (option: any) => (
    <div className="flex items-center gap-3">
      {option.imageURL ? (
        <img
          src={option.imageURL}
          alt={option.empName ?? option.empCode}
          className="w-8 h-8 rounded-full object-cover"
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
      ) : null}

      <div className={`w-8 h-8 ${option.imageURL ? 'hidden' : ''} flex items-center justify-center bg-primary text-white rounded-full font-bold uppercase`}>
        {option.empName?.[0] ?? option.empCode?.[0]}
      </div>

      <div>
        <div className="text-sm font-medium text-gray-800">{option.empName}</div>
        <div className="text-xs text-gray-500">{[option.empCode, option.designation, option.department].filter(Boolean).join(' | ')}</div>
      </div>
    </div>
  );

  const customFilterOption = (option: any, inputValue: string) => {
    const { empName, empCode, designation, department } = option.data;
    const search = inputValue.toLowerCase();
    return (
      empName?.toLowerCase().includes(search) ||
      empCode?.toLowerCase().includes(search) ||
      designation?.toLowerCase().includes(search) ||
      department?.toLowerCase().includes(search)
    );
  };

  const customStyles = {
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected ? '#e0f2fe' : base.backgroundColor,
      color: state.isSelected ? '#0c4a6e' : base.color,
      fontWeight: state.isSelected ? '600' : base.fontWeight,
    }),
  };

  return (
    <div className="grid gap-2">
      {label && <Label>{label}</Label>}
      <Select
        isDisabled={isDisabled}
        className="mt-2"
        options={options}
        value={getCurrentValue()}
        onChange={handleChange}
        placeholder="Select an Employee"
        isSearchable
        isClearable
        formatOptionLabel={formatOptionLabel}
        styles={customStyles}
        filterOption={customFilterOption}
        noOptionsMessage={() => 'No employees found'}
        closeMenuOnSelect={true}
      />
    </div>
  );
};

export default EmployeeSelect;
