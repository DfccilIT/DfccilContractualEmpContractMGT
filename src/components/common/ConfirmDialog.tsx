import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  triggerLabel: string;
  triggerClassName?: string;
  disabled?: boolean;
  title?: string;
  description?: string;
  actionLabel?: string;
  onConfirm: () => void;
  beforeOpen?: () => boolean;
}

export default function ConfirmDialog({
  triggerLabel,
  triggerClassName = '',
  disabled = false,
  title = 'Confirm',
  description = 'This action cannot be undone.',
  actionLabel = 'Confirm',
  onConfirm,
  beforeOpen,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);

  const handleTriggerClick = () => {
    if (beforeOpen) {
      const shouldOpen = beforeOpen();
      if (!shouldOpen) return;
    }

    setOpen(true);
  };

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };

  return (
    <>
      <Button disabled={disabled} className={triggerClassName} onClick={handleTriggerClick}>
        {triggerLabel}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button onClick={handleConfirm}>{actionLabel}</Button>

            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
