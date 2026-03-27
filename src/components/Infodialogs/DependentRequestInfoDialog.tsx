import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Users, User, FileText, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { useAppDispatch } from '@/app/hooks';
import { proceedDependentListUpdateRequests } from '@/features/profilechangeslices/proceedDependentListrequestslice';
import { fetchDependentListUpdateRequests } from '@/features/profilechangeslices/dependentListRequestslice';
import AcceptDialog from '../alertboxes/AcceptDialog';
import RejectDialog from '../alertboxes/RejectDialog';
import { Button } from '../ui/button';
import { useSearchParams } from 'react-router';
import { ExternalLink } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

type Dependent = {
  dName?: string;
  relation?: string;
  gender?: string;
  age?: number | string;
  documentList?: any[];
  // status?: number; // if you later have a status per dependent
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedRequest: Dependent[]; // array of dependents
  employeeCode: string | number;
}

const DependentRequestInfoDialog: React.FC<Props> = ({ isOpen, onClose, selectedRequest, employeeCode }) => {
  const [isAcceptAlertOpenDependentList, setIsAcceptAlertOpenDependentList] = useState(false);
  const [isRejectOpenDependentList, setIsRejectOpenDependentList] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [searchParams] = useSearchParams();
  const subTabFromUrl = searchParams.get('status') || 'pending';
  const dispatch = useAppDispatch();
console.log(selectedRequest,"selectedRequest")
  const handleAcceptClick = () => setIsAcceptAlertOpenDependentList(true);
  const handleRejectClick = () => setIsRejectOpenDependentList(true);

  const HandleProceedDependentListUpdateRequestAccept = async () => {
    try {
      await dispatch(
        proceedDependentListUpdateRequests({
          employeeCode,
          isApproved: true,
          remarks: '',
        })
      ).unwrap();

      dispatch(fetchDependentListUpdateRequests());
      setIsAcceptAlertOpenDependentList(false);
      onClose();
    } catch (error) {
      console.error('Error accepting dependent list update request:', error);
    }
  };

  const HandleProceedDependentListUpdateRequestReject = async () => {
    try {
      await dispatch(
        proceedDependentListUpdateRequests({
          employeeCode,
          isApproved: false,
          remarks,
        })
      ).unwrap();

      dispatch(fetchDependentListUpdateRequests());
      setRemarks('');
      setIsRejectOpenDependentList(false);
      onClose();
    } catch (error) {
      console.error('Error rejecting dependent list update request:', error);
    }
  };

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          onPointerDownOutside={(e) => e.preventDefault()} // Prevents closing on outside click
          onEscapeKeyDown={(e) => e.preventDefault()}
          className="max-w-5xl"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">Dependents Information</DialogTitle>
          </DialogHeader>

          {/* table */}
          <div className="border rounded-lg overflow-hidden">
            {Array.isArray(selectedRequest) && selectedRequest.length > 0 ? (
              <div className="max-h-[60vh] overflow-auto">
                <table className="w-full table-fixed text-sm">
                  <thead>
                    <tr className="text-left">
                      <th className="sticky top-0 z-10 bg-gray-50 px-4 py-3 w-16">#</th>
                      <th className="sticky top-0 z-10 bg-gray-50 px-4 py-3">Name</th>
                      <th className="sticky top-0 z-10 bg-gray-50 px-4 py-3">Relation</th>
                      {/* <th className="sticky top-0 z-10 bg-gray-50 px-4 py-3">Gender</th> */}
                      <th className="sticky top-0 z-10 bg-gray-50 px-4 py-3">Age</th>
                      <th className="sticky top-0 z-10 bg-gray-50 px-4 py-3 w-[260px]">Documents</th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedRequest.map((d, idx) => {
                      const documents = Array.isArray(d?.documentList) ? d.documentList : [];
                      const docsCount = documents?.length;

                      return (
                        <tr key={idx} className={idx % 2 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-3 whitespace-nowrap w-[60px]">{idx + 1}</td>

                          {/* Name */}
                          <td className="px-4 py-3 font-medium max-w-[200px] break-words">{d?.dName || '—'}</td>

                          {/* Relation */}
                          <td className="px-4 py-3 whitespace-nowrap">{d?.relation || '—'}</td>

                          {/* <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <span className="whitespace-nowrap">{d?.gender || '—'}</span>
                            </div>
                          </td> */}

                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span className="whitespace-nowrap">{d?.age != null && d?.age !== '' ? `${d.age} years` : '—'}</span>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            {docsCount > 0 ? (
                              <Popover modal={true}>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 rounded-xl text-xs font-semibold border-slate-200 text-slate-600 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 hover:shadow-[0_0_0_3px_rgba(99,102,241,0.08)] transition-all duration-150 gap-1.5"
                                  >
                                    <FileText className="h-3.5 w-3.5" />
                                    {docsCount} document{docsCount > 1 ? 's' : ''}
                                    <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white">
                                      {docsCount}
                                    </span>
                                  </Button>
                                </PopoverTrigger>

                                <PopoverContent align="start" className="w-[390px] p-0 rounded-2xl overflow-hidden shadow-xl border border-slate-200">
                                  {/* Header */}
                                  <div className="bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-3 flex items-center justify-between">
                                    <div>
                                      <p className="text-sm font-bold text-white tracking-tight">Documents</p>
                                    </div>
                                    <span className="rounded-full bg-white/20 border border-white/30 px-2.5 py-0.5 text-[11px] font-bold text-white backdrop-blur-sm">
                                      {docsCount} file{docsCount > 1 ? 's' : ''}
                                    </span>
                                  </div>

                                  {/* Document list */}
                                  <div className="max-h-[360px] overflow-y-auto p-2.5 space-y-2 scrollbar-thin scrollbar-thumb-slate-200">
                                    {documents?.map((doc: any, docIdx: number) => {
                                      const isImage = doc?.filePath && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(doc.filePath);
                                      const isPdf = doc?.filePath && /\.pdf$/i.test(doc.filePath);

                                      return (
                                        <div
                                          key={doc.documentId ?? docIdx}
                                          className="group rounded-xl border border-slate-100 bg-slate-50 overflow-hidden hover:border-slate-200 hover:shadow-sm transition-all duration-150"
                                        >
                                          {/* Image Preview */}

                                          {/* Info Row */}
                                          <div className="flex items-center gap-3 px-3 py-2.5">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 border border-indigo-200 text-[10px] font-bold text-indigo-600 font-mono">
                                              {isImage && (
                                                <div className="relative w-full h-8 bg-slate-100 overflow-hidden">
                                                  <img
                                                    src={doc.filePath}
                                                    alt={doc?.documentType || 'Document preview'}
                                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                  />
                                                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                                                  <a
                                                    href={doc.filePath}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                                                  ></a>
                                                </div>
                                              )}

                                              {/* PDF Preview */}
                                              {isPdf && (
                                                <div className="relative w-full h-36 bg-slate-100 overflow-hidden">
                                                  <iframe
                                                    src={`${doc.filePath}#toolbar=0&navpanes=0&scrollbar=0`}
                                                    className="w-full h-full pointer-events-none"
                                                    title={doc?.documentType || 'PDF preview'}
                                                  />
                                                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                                  <a
                                                    href={doc.filePath}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                                                  ></a>
                                                </div>
                                              )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                              <p className="text-sm font-semibold text-slate-800 truncate leading-tight">{doc?.documentType || 'Document'}</p>
                                              {doc?.remarks && <p className="text-[11.5px] text-slate-500 mt-1 line-clamp-2 leading-snug">{doc.remarks}</p>}
                                            </div>

                                            {doc?.filePath ? (
                                              <a href={doc.filePath} target="_blank" rel="noopener noreferrer">
                                                <Button
                                                  type="button"
                                                  variant="outline"
                                                  size="sm"
                                                  className="h-7 px-2.5 text-[11.5px] font-semibold rounded-lg border-slate-200 text-indigo-500 hover:bg-indigo-50 hover:border-indigo-300 hover:shadow-[0_2px_8px_rgba(99,102,241,0.15)] transition-all"
                                                >
                                                  <ExternalLink className="h-3 w-3 mr-1" />
                                                  Open
                                                </Button>
                                              </a>
                                            ) : (
                                              <span className="text-[11px] text-slate-300 font-medium whitespace-nowrap border border-dashed border-slate-200 rounded-md px-2 py-1 bg-white">
                                                No file
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </PopoverContent>
                              </Popover>
                            ) : (
                              <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50">
                                  <FileText className="h-3.5 w-3.5 text-slate-300" />
                                </div>
                                <span className="text-sm text-slate-400 font-medium">No documents</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No dependents found</p>
              </div>
            )}
          </div>
          {/* actions */}
          {subTabFromUrl === 'pending' && (
            <div className="mt-4 flex justify-end gap-2">
              <Button onClick={handleAcceptClick} className="bg-green-600 hover:bg-green-700 text-white">
                <CheckCircle className="w-4 h-4 mr-1" />
                Accept
              </Button>
              <Button onClick={handleRejectClick} className="bg-red-600 hover:bg-red-700 text-white">
                <XCircle className="w-4 h-4 mr-1" />
                Reject
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AcceptDialog
        isOpen={isAcceptAlertOpenDependentList}
        onOpenChange={setIsAcceptAlertOpenDependentList}
        HandleProceedProfileChangeRequest={HandleProceedDependentListUpdateRequestAccept}
        isEmployeeApprovalPage={false}
      />
      <RejectDialog
        isOpen={isRejectOpenDependentList}
        onOpenChange={setIsRejectOpenDependentList}
        setRemarks={setRemarks}
        remarks={remarks}
        HandleProceedProfileChangeRequestReject={HandleProceedDependentListUpdateRequestReject}
      />
    </div>
  );
};

export default DependentRequestInfoDialog;
