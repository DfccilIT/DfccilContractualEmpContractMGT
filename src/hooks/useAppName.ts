import { environment } from '@/config';
import { useSelector } from 'react-redux';

export const useAppName = () => {
  const applications = useSelector((state: any) => state.applications.applications);
  const currentApplication = applications.find((app) => app.id === environment.applicationId) ?? {
    name: '',
    hindiName: '',
    description: '',
  };

  return {
    name: currentApplication.name,
    hindiName: currentApplication.hindiName,
    description: currentApplication.description,
    fullName: `${currentApplication.hindiName} / ${currentApplication.name}`,
    fullDescription: `${currentApplication.hindiName} / ${currentApplication.name} || DFCCIL`,
  };
};
