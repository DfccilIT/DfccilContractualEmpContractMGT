import React, { forwardRef } from 'react';
import { Button } from '../ui/button';

interface CustomDatePickerButtonProps {
  value: string;
  onClick: () => void;
}

const CustomDatePickerButton = forwardRef<HTMLButtonElement, CustomDatePickerButtonProps>(({ value, onClick }, ref) => (
  <Button onClick={onClick} ref={ref} variant="outline">
    {value || 'Select Dates'}
  </Button>
));

CustomDatePickerButton.displayName = 'CustomDatePickerButton';

export default CustomDatePickerButton;
