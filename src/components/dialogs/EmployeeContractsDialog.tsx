import React, { useEffect, useRef, useState } from 'react';
import Select from 'react-select';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export const EmployeeContractsDialog = ({ open, onOpenChange, selectedContract, selectedEmployees, setSelectedEmployees, employeeOptions, handleSubmit }) => {
  const [errors, setErrors] = useState<{ employees?: string }>({});
  const [limitErrorOpen, setLimitErrorOpen] = useState(false);
  const [limitErrorMsg, setLimitErrorMsg] = useState('');

  useEffect(() => {
    if (!open) {
      setErrors({});
      setSelectedEmployees([]);
    }
  }, [open]);

  const selectRef = useRef(null);

  const handleEmployeeChange = (selected) => {
    if (!selected) {
      setSelectedEmployees([]);
      return;
    }

    const selectAll = selected.find((s) => s.value === 'ALL');
    let newSelection = selectAll ? employeeOptions : selected;

    if (selectedContract?.numberOfEmployees && newSelection.length > selectedContract.numberOfEmployees) {
      setLimitErrorMsg(`You can only assign ${selectedContract.numberOfEmployees} employees`);
      setLimitErrorOpen(true);
      return;
    }

    setSelectedEmployees(newSelection);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: { employees?: string } = {};

    if (!selectedEmployees?.length) {
      newErrors.employees = 'Please select at least one employee';
    } else if (selectedContract?.numberOfEmployees && selectedEmployees.length > selectedContract.numberOfEmployees) {
      newErrors.employees = `You can only assign ${selectedContract.numberOfEmployees} employees`;
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
      <DialogContent onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()} className="max-w-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold tracking-wide">Assign Employees</DialogTitle>
            <p className="text-sm text-blue-100">Select employees to assign to this contract</p>
          </DialogHeader>
        </div>
        <div className="p-4 space-y-3">
          {/* Contract Info */}
          {selectedContract && (
            <div className="border rounded-lg p-4 bg-gray-50 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Contract Details</h3>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Contract No</p>
                  <p className="font-medium text-gray-800">{selectedContract.contractNumber}</p>
                </div>

                <div>
                  <p className="text-gray-500">Contractor</p>
                  <p className="font-medium text-gray-800">{selectedContract.contractor}</p>
                </div>

                <div>
                  <p className="text-gray-500">Max Employees</p>
                  <p className="font-medium text-gray-800">{selectedContract.numberOfEmployees}</p>
                </div>
              </div>
            </div>
          )}

          {/* Employee Select */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              Employees <span className="text-red-500">*</span>
            </Label>

            <Select
              ref={selectRef}
              isMulti
              closeMenuOnSelect={false}
              value={selectedEmployees.filter((e) => e.value !== 'ALL')}
              onChange={handleEmployeeChange}
              options={[{ value: 'ALL', label: 'Select All Employees' }, ...employeeOptions]}
              placeholder="Search and select employees..."
              styles={customSelectStyles}
              formatOptionLabel={(option) => {
                if (option.value === 'ALL') {
                  return <div className="text-blue-600 font-semibold">Select All Employees</div>;
                }

                return (
                  <div className="flex flex-col py-1">
                    <span className="font-medium text-gray-800">{option.label}</span>
                    <span className="text-xs text-gray-500">
                      {option.empCode} • {option.department}
                    </span>
                  </div>
                );
              }}
            />

            {errors.employees && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                {errors.employees}
              </p>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end border-t pt-4">
            <ConfirmDialog
              triggerClassName="px-5 py-2 font-medium rounded-md bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
              description="Are you sure you want to assign these employees?"
              actionLabel="Confirm"
              triggerLabel="Assign Employees"
              beforeOpen={() => validateForm()}
              onConfirm={handleSubmit}
            />
          </div>
        </div>
      </DialogContent>

      {/* Limit Error Dialog */}
      <Dialog open={limitErrorOpen} onOpenChange={setLimitErrorOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Selection Limit Exceeded
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-gray-600 mt-2">{limitErrorMsg}</p>

          <div className="flex justify-end mt-4">
            <button className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition" onClick={() => setLimitErrorOpen(false)}>
              OK
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};
