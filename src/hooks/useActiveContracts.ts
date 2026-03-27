import { useEffect, useState } from 'react';
import axiosInstance from '@/services/axiosInstance';
import { useAppSelector } from '@/app/hooks';
export interface ActiveContract {
  contractId: number;
  contractNumber: string;
  contractUnitMappingId: number;
  contractMasterId: number;
  contractorName: string;
  unitId: number;
  departmentId: number;
  startDate: string; // ISO string
  endDate: string;
  numberOfEmployees: number;
  approvedCount: number;
  remainingSlots: number;
}

export interface ContractorGroup {
  contractorId: number;
  contractorName: string;
  contracts: ActiveContract[];
}

export interface ActiveContractsResponse {
  statusCode: number;
  message: string;
  data: ContractorGroup[];
  dataLength: number;
  totalRecords: number;
  error: boolean;
  errorDetail: string | null;
}


export const useActiveContracts = () => {
  const [data, setData] = useState<ContractorGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { Roles } = useAppSelector((state) => state.user);
  const fetchContracts = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axiosInstance.get<ActiveContractsResponse>(`/ModuleManagement/GetActiveContracts`);

      if (!res.data.error) {
        setData(res.data.data);
      } else {
        setError(res.data.errorDetail || 'API Error');
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchContracts,
  };
};
