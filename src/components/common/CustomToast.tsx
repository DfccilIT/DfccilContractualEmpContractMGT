import { X, CheckCircle2, AlertCircle, CheckCheck, CheckCheckIcon, CheckIcon } from 'lucide-react';
import toast from 'react-hot-toast';

type CustomToastProps = {
  t: any; // The toast instance is passed automatically by react-hot-toast
  title?: string;
  message: string;
  type?: 'success' | 'error';
};

const CustomToast = ({ t, title, message, type = 'success' }: CustomToastProps) => {
  const isSuccess = type === 'success';

  // Dismiss toast function
  const handleDismiss = () => {
    toast.dismiss(t.id); // Ensure the toast is dismissed correctly using the toast instance ID
  };

  return (
    <div
      className={`w-[400px] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-2 ${
        isSuccess ? 'border-green-100' : 'border-red-100'
      } p-3 relative backdrop-blur-sm`}
      style={{
        animation: 'slideInRight 0.3s ease-out',
      }}
    >
      {/* Colored accent bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl ${
          isSuccess ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-red-400 to-rose-500'
        }`}
      />

      {/* Close button */}
      <button onClick={handleDismiss} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors">
        <X size={20} />
      </button>

      {/* Content with icon */}
      <div className="flex items-center gap-4 pr-6">
        {/* Icon */}
        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${isSuccess ? 'bg-green-100' : 'bg-red-100'}`}>
          {isSuccess ? <CheckIcon className="text-green-600" size={30} /> : <X className="text-red-600" size={30} />}
        </div>

        {/* Text content */}
        <div className="flex-1 pt-1">
          {title && <h3 className="text-lg font-semibold text-gray-900 mb-1.5">{title}</h3>}
          <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default CustomToast;
