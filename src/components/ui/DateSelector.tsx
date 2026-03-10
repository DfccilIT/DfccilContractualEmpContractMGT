import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CustomDatePickerButton from './CustomDatePickerButton';
import { toggleDateSelection } from '@/lib/dateUtils';

interface DateSelectorProps {
  selectedDates: Date[]; // Ensure it's always an array of Date objects
  onChange: (dates: Date[]) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({ selectedDates, onChange }) => {
  // Ensure selectedDates is always an array of valid Date objects
  const validSelectedDates = selectedDates.filter((date) => date instanceof Date && !isNaN(date.getTime()));

  return (
    <DatePicker
      selected={validSelectedDates.length > 0 ? validSelectedDates[0] : null} // Set the first date if valid
      onChange={(date: Date | null) => {
        if (date) {
          const updatedDates = toggleDateSelection(validSelectedDates, date);
          onChange(updatedDates);
        }
      }}
      customInput={<CustomDatePickerButton value="" onClick={() => {}} />} // Inject the custom button
      inline // Show the date picker inline for multi-select
      className="hidden" // Hide the default input box
    />
  );
};

export default DateSelector;
