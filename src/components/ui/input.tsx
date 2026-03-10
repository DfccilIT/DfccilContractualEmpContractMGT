import * as React from 'react';

import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  enableToggle?: boolean;
  prefix?: React.ReactNode;
  postfix?: React.ReactNode;
  prefixPadding?: string;
  postfixPadding?: string;
};
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, enableToggle = false, prefix, postfix, prefixPadding = 'pl-12', postfixPadding = 'pr-12', ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const togglePasswordVisibility = () => {
      setShowPassword((prev) => {
        //////console.log('Toggling password visibility:', !prev) // Debug log
        return !prev;
      });
    };

    const inputType = type === 'password' && showPassword ? 'text' : type;

    return (
      <div className="relative flex w-full items-center">
        {prefix && <span className="pointer-events-none absolute left-3 text-sm">{prefix}</span>}
        <input
          type={inputType}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
            prefix ? prefixPadding : '',
            postfix ? postfixPadding : '',
            className
          )}
          ref={ref}
          {...props}
        />
        {type === 'password' && enableToggle && (
          <button type="button" onClick={togglePasswordVisibility} className="absolute right-2 top-1/2 -translate-y-1/2 transform text-muted-foreground">
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
        {postfix && <span className="pointer-events-none absolute right-3 text-sm">{postfix}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';
export { Input };
