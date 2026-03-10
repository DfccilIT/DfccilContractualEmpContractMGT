import React, { useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
import { Button } from './button';

const SortingButton = ({ headerText, column }: { headerText: string; column: unknown }) => {
  const [buttonClicked, setbuttonClicked] = useState(false);
  return (
    <div className="flex items-center ">
      <Button
        variant="ghost"
        className="w-3 bg-transparent hover:text-white hover:bg-transparent"
        onClick={() => {
          column.toggleSorting(column.getIsSorted() === 'asc');
          setbuttonClicked((prev) => !prev);
        }}
      >
        <div className={buttonClicked ? 'text-yellow-300' : 'text-white'}>{headerText} </div>
      </Button>
    </div>
  );
};

export default SortingButton;
