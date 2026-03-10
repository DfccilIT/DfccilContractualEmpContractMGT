export interface TransferRequest {
  requestId: number;
  requestType: 'SENT' | 'RECEIVED' | string;
  otherEmployeeAutoId: number;
  otherEmployeeCode: string;
  otherEmployeeName: string;
  otherEmployeePost: string;
  otherEmployeeDepartment: string;
  otherEmployeeLocation: string;
  otherEmployeeStation: string;
  otherEmployeeGrade: string;
  statusCode: number;
  statusName: string;
  statusTrackValue: string;
  requestedDate: string;
  updatedDate: string | null;
  transferScope: string;
  transferType: string;
  isCancelledBySystem: boolean | null;
  cancellationReason: string | null;
  canAccept: boolean;
  canReject: boolean;
  canCancel: boolean;
}

export interface PaginatedTransferData {
  requests: TransferRequest[];
  totalRecords: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
