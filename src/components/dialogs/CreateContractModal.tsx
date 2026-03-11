import React, { useEffect, useMemo, useState } from 'react';
import Select from 'react-select';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import axiosInstance from '@/services/axiosInstance';

export const CreateContractDialog = ({ open, onOpenChange, mode = 'add', units, initialData, Contractors, Departments, onSave }) => {
  const [formData, setFormData] = useState({
    unit: null,
    contractor: null,
    department: null,
    contractNo: '',
    startDate: '',
    endDate: '',
    noOfEmployees: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const isEdit = mode === 'edit';
  const emptyForm = {
    unit: null,
    contractor: null,
    department: null,
    contractNo: '',
    startDate: '',
    endDate: '',
    noOfEmployees: '',
  };

  useEffect(() => {
    if (!open) return;

    if (initialData) {
      console.log(initialData);
      console.log(units);
      console.log(Contractors);

      const selectedUnit = units?.find((u) => u.label === initialData.unit);

      const selectedContractor = Contractors?.find((c) => c.contractor === initialData.contractor);

      const selectedDepartment = selectedContractor?.mappings?.find((m) => m.unitName === initialData.unit && m.departmentName === initialData.department);

      setFormData({
        unit: selectedUnit ? { value: selectedUnit.value, label: selectedUnit.label } : null,

        contractor: selectedContractor ? { value: selectedContractor.contractorId, label: selectedContractor.contractor } : null,

        department: selectedDepartment ? { value: selectedDepartment.departmentId, label: selectedDepartment.departmentName } : null,

        contractNo: initialData.contractNumber,
        startDate: initialData.startDate?.split('T')[0],
        endDate: initialData.endDate?.split('T')[0],
        noOfEmployees: initialData.numberOfEmployees,
      });
    } else {
      if (units?.length === 1) {
        setFormData({
          ...emptyForm,
          unit: units[0],
        });
      } else {
        setFormData(emptyForm);
      }
    }
  }, [open, initialData, units, Contractors]);

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

  const filteredDepartments = useMemo(() => {
    if (!formData.contractor || !formData.unit) return [];

    const contractor = Contractors.find((c) => c.contractorId === formData.contractor?.value);

    return (
      contractor?.mappings
        ?.filter((m) => Number(m.unitId) === Number(formData.unit.value))
        ?.map((m) => ({
          label: m.departmentName,
          value: m.departmentId,
        })) || []
    );
  }, [formData.contractor, formData.unit, Contractors]);

  const filteredContractors = useMemo(() => {
    if (!formData.unit) return [];

    return Contractors?.filter((c) => c.mappings?.some((m) => Number(m.unitId) === Number(formData.unit.value)))?.map((c) => ({
      label: c.contractor,
      value: c.contractorId,
    }));
  }, [Contractors, formData.unit]);

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

  const submit = async () => {
    if (!validateForm()) return;
    const mappingId = await fetchMappingId();
    const payload = {
      contractUnitMappingId: mappingId,
      contractNumber: formData.contractNo,
      startDate: formData.startDate,
      endDate: formData.endDate,
      numberOfEmployees: formData.noOfEmployees,
    };
    await onSave?.(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{isEdit ? 'Update Contract' : 'Add Contract'}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {/* Unit */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              Unit <span className="text-red-500">*</span>
            </Label>

            <Select
              value={formData.unit}
              onChange={(val) => {
                setFormData((prev) => ({ ...prev, unit: val }));
                clearError('unit');
              }}
              options={units}
              placeholder="Select Unit"
              isClearable
              styles={customSelectStyles}
            />

            {errors.unit && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.unit}
              </p>
            )}
          </div>

          {/* Contractor */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              Contractor <span className="text-red-500">*</span>
            </Label>

            <Select
              value={formData.contractor}
              onChange={(val) => {
                setFormData((prev) => ({
                  ...prev,
                  contractor: val,
                  department: null,
                }));
                clearError('contractor');
              }}
              options={filteredContractors}
              placeholder="Select Contractor"
              isClearable
              styles={customSelectStyles}
            />

            {errors.contractor && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.contractor}
              </p>
            )}
          </div>

          {/* Department */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              Department <span className="text-red-500">*</span>
            </Label>

            <Select
              value={formData.department}
              onChange={(val) => {
                setFormData((prev) => ({ ...prev, department: val }));
                clearError('department');
              }}
              options={filteredDepartments}
              placeholder="Select Department"
              isClearable
              styles={customSelectStyles}
            />

            {errors.department && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.department}
              </p>
            )}
          </div>

          {/* Contract No */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              Contract No <span className="text-red-500">*</span>
            </Label>

            <input
              type="text"
              value={formData.contractNo}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  contractNo: e.target.value,
                }));
                clearError('contractNo');
              }}
              placeholder="Enter Contract Number"
              className="w-full border rounded-md px-3 py-2 text-sm"
            />

            {errors.contractNo && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.contractNo}
              </p>
            )}
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              Start Date <span className="text-red-500">*</span>
            </Label>

            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  startDate: e.target.value,
                }));
                clearError('startDate');
              }}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />

            {errors.startDate && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.startDate}
              </p>
            )}
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              End Date <span className="text-red-500">*</span>
            </Label>

            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  endDate: e.target.value,
                }));
                clearError('endDate');
              }}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />

            {errors.endDate && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.endDate}
              </p>
            )}
          </div>

          {/* No of Employees */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              No of Employees <span className="text-red-500">*</span>
            </Label>

            <input
              type="number"
              value={formData.noOfEmployees}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  noOfEmployees: Number(e.target.value),
                }));
                clearError('noOfEmployees');
              }}
              placeholder="Enter number"
              className="w-full border rounded-md px-3 py-2 text-sm"
            />

            {errors.noOfEmployees && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.noOfEmployees}
              </p>
            )}
          </div>
        </div>

        <div className="pt-6 flex justify-end">
          <ConfirmDialog
            triggerClassName="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            description={isEdit ? 'Are you sure you want to update this contract?' : 'Are you sure you want to create this contract?'}
            actionLabel="Confirm"
            triggerLabel={isEdit ? 'Update' : 'Create'}
            beforeOpen={() => validateForm()}
            onConfirm={submit}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
