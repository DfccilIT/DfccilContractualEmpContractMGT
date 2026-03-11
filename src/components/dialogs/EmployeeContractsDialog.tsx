import React, { useState } from 'react';
import Select from 'react-select';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export const EmployeeContractsDialog = ({ open, onOpenChange, selectedContract, selectedEmployees, setSelectedEmployees, employeeOptions, handleSubmit }) => {
  const [errors, setErrors] = useState<{ employees?: string }>({});

  const handleEmployeeChange = (selected) => {
    if (!selected) {
      setSelectedEmployees([]);
      return;
    }

    const selectAll = selected.find((s) => s.value === 'ALL');

    if (selectAll) {
      setSelectedEmployees(employeeOptions);
    } else {
      setSelectedEmployees(selected);
    }

    setErrors({});
  };

  const validateForm = () => {
    const newErrors: { employees?: string } = {};

    if (!selectedEmployees?.length) {
      newErrors.employees = 'Please select at least one employee';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

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
      minHeight: '42px',
    }),

    valueContainer: (provided) => ({
      ...provided,
      maxHeight: '70px',
      overflowY: 'auto',
      flexWrap: 'wrap',
    }),

    multiValue: (provided) => ({
      ...provided,
      maxWidth: '100%',
    }),
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Assign Employees</DialogTitle>
        </DialogHeader>

        {/* Contract Info */}
        {selectedContract && (
          <div className="bg-gray-50 p-3 rounded-md text-sm">
            <p>
              <span className="font-semibold">Contract:</span> {selectedContract.contractNumber}
            </p>
            <p>
              <span className="font-semibold">Contractor:</span> {selectedContract.contractor}
            </p>
          </div>
        )}

        {/* Employee Select */}
        <div className="space-y-2 mt-4">
          <Label className="text-sm font-semibold text-gray-700">
            Employees <span className="text-red-500">*</span>
          </Label>

          <Select
            isMulti
            closeMenuOnSelect={false}
            value={selectedEmployees.filter((e) => e.value !== 'ALL')}
            onChange={handleEmployeeChange}
            options={[{ value: 'ALL', label: 'Select All Employees' }, ...employeeOptions]}
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

          {errors.employees && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.employees}
            </p>
          )}
        </div>

        {/* Submit */}
        <div className="pt-6 flex justify-end">
          <ConfirmDialog
            triggerClassName="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            description="Are you sure you want to assign these employees?"
            actionLabel="Confirm"
            triggerLabel="Assign"
            beforeOpen={() => validateForm()}
            onConfirm={handleSubmit}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
