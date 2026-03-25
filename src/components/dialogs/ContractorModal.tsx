import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import Select from 'react-select';
import ConfirmDialog from '../common/ConfirmDialog';

const isEmpty = (v) => v === null || v === undefined || String(v).trim() === '';

function ErrorLine({ msg }) {
  if (!msg) return null;
  return <p className="text-xs text-red-600 mt-1">{msg}</p>;
}

type ContractForm = {
  contractorName: string;
  unit: string;
  departments: string[];
};
type Option = {
  value: string;
  label: string;
};
type FormErrors = {
  contractorName?: string;
  unit?: string;
  departments?: string;
};
type ContractModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: 'add' | 'edit';
  initialData?: any;
  onSave?: (data: ContractForm) => void;
  units?: Option[];
  departments?: Option[];
};

export function ContractorModal({ open, onOpenChange, mode = 'add', initialData, onSave, units = [], departments = [] }: ContractModalProps) {
  const empty = {
    contractorName: '',
    unit: '',
    departments: [],
  };
  const [form, setForm] = React.useState<ContractForm>(empty);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const isEdit = mode === 'edit';

  React.useEffect(() => {
    if (!open) return;
    if (initialData) {
      setForm({
        contractorName: initialData.contractor || '',
        unit: String(initialData.mappings?.[0]?.unitId || ''),
        departments: initialData.mappings?.filter((m) => m.departmentId)?.map((m) => String(m.departmentId)) || [],
      });
    } else {
      setForm(empty);
    }
    setErrors({});
  }, [open, mode, initialData]);

  const validate = () => {
    const e: FormErrors = {};

    if (isEmpty(form.contractorName)) {
      e.contractorName = 'Contractor name is required';
    }

    if (isEmpty(form.unit)) e.unit = 'Unit is required';
    if (!form.departments.length) e.departments = 'Select at least one department';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: '40px',
      height: '40px',
      borderRadius: '6px',
      borderColor: state.isFocused ? '#9ca3af' : '#d1d5db',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#9ca3af',
      },
    }),
    valueContainer: (provided) => ({
      ...provided,
      height: '40px',
      padding: '0 8px',
    }),
    input: (provided) => ({
      ...provided,
      margin: 0,
      padding: 0,
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      height: '40px',
    }),
    menuList: (provided) => ({
      ...provided,
      maxHeight: '200px', 
      paddingTop: 4,
      paddingBottom: 4,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#e5e7eb' : state.isFocused ? '#f3f4f6' : 'white',
      color: '#111827',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#111827',
    }),
  };

  const submit = async () => {
    if (!validate()) return;

    const payload = {
      contractorName: form.contractorName,
      unit: form.unit,
      departments: form.departments,
    };
    await onSave?.(payload);
  };

  const toggleDepartment = (dept) => {
    setForm((prev) => {
      const exists = prev.departments.includes(dept);

      return {
        ...prev,
        departments: exists ? prev.departments.filter((d) => d !== dept) : [...prev.departments, dept],
      };
    });
  };

  const sortedDepartments = React.useMemo(() => {
    const selected = departments.filter((d) => form.departments.includes(String(d.value)));

    const unselected = departments.filter((d) => !form.departments.includes(String(d.value)));

    return [...selected, ...unselected];
  }, [departments, form.departments]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="max-w-2xl max-h-[75vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Update Contractor' : 'Add Contractor'}</DialogTitle>
        </DialogHeader>

        <div className="flex gap-3 mt-4">
          {/* Contractor Name */}
          <div className="w-1/2">
            <p className="text-sm font-medium">Contractor Name</p>
            <Input
              className="mt-1"
              value={form.contractorName}
              onChange={(e) => setForm((p) => ({ ...p, contractorName: e.target.value }))}
              placeholder="Enter Contractor Name"
            />
            <ErrorLine msg={errors.contractorName} />
          </div>
          {/* Units */}
          <div className="w-1/2">
            <p className="text-sm font-medium">Units</p>
            <div className="mt-1">
              <Select
                options={units}
                value={units.find((u) => String(u.value) === form.unit) || null}
                onChange={(selected) =>
                  setForm((prev) => ({
                    ...prev,
                    unit: selected ? String(selected.value) : '',
                  }))
                }
                placeholder="Select Unit"
                isClearable
                styles={customSelectStyles}
              />
            </div>
            <ErrorLine msg={errors.unit} />
          </div>
        </div>
        {/* Departments Multi Select */}
        <div>
          <p className="text-sm font-medium">Departments</p>

          <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
            {/* Select All */}
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={form.departments.length === departments.length}
                onChange={(e) => {
                  if (e.target.checked) {
                    setForm({
                      ...form,
                      departments: departments.map((d) => String(d.value)),
                    });
                  } else {
                    setForm({
                      ...form,
                      departments: [],
                    });
                  }
                }}
              />
              Select All
            </label>

            {/* Departments */}
            {sortedDepartments.map((d) => (
              <label key={d.value} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.departments.includes(String(d.value))} onChange={() => toggleDepartment(String(d.value))} />
                {d.label}
              </label>
            ))}
          </div>

          <ErrorLine msg={errors.departments} />
        </div>

        <DialogFooter className="gap-2">
          <div className="pt-6 flex justify-end">
            <ConfirmDialog
              triggerClassName="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              description={isEdit ? 'Are you sure you want to update this contractor?' : 'Are you sure you want to add this contractor?'}
              actionLabel="Confirm"
              triggerLabel={isEdit ? 'Update' : 'Add'}
              beforeOpen={() => validate()}
              onConfirm={submit}
            />
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
