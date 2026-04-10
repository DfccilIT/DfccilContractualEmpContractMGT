import axiosInstance from '@/services/axiosInstance';
import { useEffect, useState } from 'react';

export const useContractors = () => {
  const [loading, setLoading] = useState(false);
  const [contractors, setContractors] = useState([]);
  const fetchContractorsData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/ContractManagement/get-contractors');
      setContractors(response.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContractorsData();
  }, []);

  return {
    contractors,
    loading
  }
};
