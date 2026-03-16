import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  saving?: boolean;
  units?: Option[];
  departments?: Option[];
};

export function ContractorModal({ open, onOpenChange, mode = 'add', initialData, onSave, saving = false, units = [], departments = [] }: ContractModalProps) {
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
      <DialogContent onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()} className="max-w-2xl max-h-[75vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Contractor' : 'Add Contractor'}</DialogTitle>
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
            <Select value={form.unit} onValueChange={(val) => setForm((p) => ({ ...p, unit: val }))}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select Unit" />
              </SelectTrigger>

              <SelectContent>
                {units.map((u) => (
                  <SelectItem key={u.value} value={String(u.value)}>
                    {u.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          {/* <Button variant="outline" type="button" onClick={() => onOpenChange?.(false)}>
            Cancel
          </Button>

          <Button type="button" onClick={submit} disabled={saving}>
            {saving ? (mode === 'edit' ? 'Updating...' : 'Creating...') : mode === 'edit' ? 'Update' : 'Create'}
          </Button> */}
          <div className="pt-6 flex justify-end">
            <ConfirmDialog
              triggerClassName="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              description={isEdit ? 'Are you sure you want to update this contract?' : 'Are you sure you want to create this contract?'}
              actionLabel="Confirm"
              triggerLabel={isEdit ? 'Update' : 'Create'}
              beforeOpen={() => validate()}
              onConfirm={submit}
            />
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
