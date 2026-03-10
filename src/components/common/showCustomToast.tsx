import toast from 'react-hot-toast';
import CustomToast from './CustomToast';

type ShowToastProps = {
  title?: string;
  message: string;
  type?: any;
};

export const showCustomToast = ({ title, message, type }: ShowToastProps) => {
  toast.custom((t) => <CustomToast t={t} title={title} type={type} message={message} />);
};
