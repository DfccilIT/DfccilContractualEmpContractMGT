import React from 'react';
import Select from 'react-select';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export const CreateContractDialog = ({
  open,
  onOpenChange,
  formData,
  setFormData,
  mode = 'add',
  units,
  filteredContractors,
  filteredDepartments,
  errors,
  clearError,
  customSelectStyles,
  validateForm,
  handleSubmit,
}) => {
  const isEdit = mode === 'edit';

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
            onConfirm={handleSubmit}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
