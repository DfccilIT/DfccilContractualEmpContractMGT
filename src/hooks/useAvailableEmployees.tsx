import { useAppSelector } from '@/app/hooks';
import { RootState } from '@/app/store';
import axiosInstance from '@/services/axiosInstance';
import { useEffect, useState } from 'react';

export const useAvailableEmployees = () => {
  const [loading, setLoading] = useState(false);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const userDetails = useAppSelector((state: RootState) => state.user);

const fetchEmployees = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get('/ContractManagement/employees-available');

      const isSuperAdmin = userDetails?.Roles?.includes('SuperAdmin');

      let employees = res.data.data;

      if (!isSuperAdmin) {
        employees = employees.filter((emp) => emp.location === userDetails.Unit);
      }

      const formatted = employees.map((emp) => ({
        value: emp.employeeId,
        label: emp.userName,
        empCode: emp.employeeCode,
        department: emp.deptDFCCIL,
      }));

      setEmployeeOptions(formatted);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return {
    employeeOptions,
    loading
  }
};