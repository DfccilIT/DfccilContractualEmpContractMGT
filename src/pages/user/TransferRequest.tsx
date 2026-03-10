import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { AlertCircle, AlertTriangle} from 'lucide-react';
import Select from 'react-select';
import { useAppSelector } from '@/app/hooks';
import { RootState } from '@/app/store';
import axiosInstance from '@/services/axiosInstance';
import { showCustomToast } from '@/components/common/showCustomToast';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Loader from '@/components/ui/loader';
const unitTypes = [
  { value: 'WITHINUNIT', label: 'WithIn Jurisdiction' },
  { value: 'OUTSIDEUNIT', label: 'Outside Jurisdiction' },
];
const requestTypes = [
  { value: 'MUTUAL', label: 'Mutual Transfer' },
  { value: 'ONREQUEST', label: 'On Request' },
];

const TransferRequest = () => {
  const userDetails = useAppSelector((state: RootState) => state.user);
  const { units, employees } = useAppSelector((state: RootState) => state.masterData.data);
  const [errors, setErrors] = useState<Record<string, any>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [options, setOptions] = useState({
    stations: [],
    employees: [],
  });
  const [loading, setLoading] = useState({
    stations: false,
    employees: false,
    requestSubmitting: false,
    units: false,
  });

  const [formData, setFormData] = useState({
    name: userDetails.name,
    empCode: userDetails.EmpCode,
    unitName: userDetails.Unit,
    department: userDetails.Department,
    post: userDetails.Designation,
    reportingManager: userDetails.reportingOfficer,
    contactNumber: userDetails.Mobile,
    currentStation: userDetails.personnelSubArea,
    requestType: '',
    unitType: '',
    selectedUnit: null,
    selectedStation: null,
    selectedEmployee: null,
  });

  const filteredUnitTypes = useMemo(() => {
    if (userDetails?.Unit?.toLowerCase() === 'corporate office') {
      return unitTypes.filter((ut) => ut.value === 'OUTSIDEUNIT');
    }
    return unitTypes;
  }, [userDetails?.Unit]);

  const fetchStations = async (unitId) => {
    setLoading((prev) => ({ ...prev, stations: true }));

    try {
      const response = await axiosInstance.get(`/Util/stations?unitId=${unitId}`);

      const stationsRaw = response?.data?.data || [];

      if (formData.requestType === 'ONREQUEST') {
        const allStations = stationsRaw.map((station) => ({
          ...station,
          label: station.nameofStation,
          value: station.pkUnitStationId,
        }));

        setOptions((prev) => ({
          ...prev,
          stations: allStations,
        }));

        return;
      }

      if (formData.requestType === 'MUTUAL') {
        const stationsWithEmployees = await Promise.all(
          stationsRaw.map(async (station) => {
            try {
              const empRes = await axiosInstance.get(`/Util/Mutual-Emp?StationId=${station.pkUnitStationId}&UnitId=${unitId}`);

              if (empRes.data.success && empRes.data.data.length > 0) {
                return {
                  ...station,
                  label: station.nameofStation,
                  value: station.pkUnitStationId,
                };
              }

              return null;
            } catch {
              return null;
            }
          })
        );

        const filteredStations = stationsWithEmployees.filter(Boolean);

        setOptions((prev) => ({
          ...prev,
          stations: filteredStations,
        }));
      }
    } catch (error) {
      console.error('Error fetching stations:', error);
    } finally {
      setLoading((prev) => ({ ...prev, stations: false }));
    }
  };
  const fetchEmployees = async (stationId = null, unitId = null) => {
    setLoading((prev) => ({ ...prev, employees: true }));
    let url = '/Util/Mutual-Emp';

    if (stationId) {
      url += `?StationId=${stationId}`;
    }

    if (unitId) {
      url += stationId ? `&UnitId=${unitId}` : `?UnitId=${unitId}`;
    }
    try {
      const response = await axiosInstance.get(url);
      if (response.data.success) {
        const Employees = response.data.data.map((ele) => ({
          ...ele,
          label: ele.userName,
          value: ele.employeeMasterAutoId,
        }));
        setOptions((prev) => ({ ...prev, employees: Employees }));
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading((prev) => ({ ...prev, employees: false }));
    }
  };

  const handleRequestTypeChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      requestType: selectedOption?.value || '',
      unitType: '',
      selectedUnit: null,
      selectedStation: null,
      selectedEmployee: null,
    }));
    setOptions((prev) => ({ ...prev, stations: [], employees: [] }));
    if (errors.requestType) {
      setErrors((prev) => ({ ...prev, requestType: '' }));
    }
  };

  const handleUnitTypeChange = (selectedOption) => {
    const unitTypeValue = selectedOption?.value || '';
    setFormData((prev) => ({
      ...prev,
      unitType: unitTypeValue,
      selectedUnit: null,
      selectedStation: null,
      selectedEmployee: null,
    }));
    setOptions((prev) => ({ ...prev, stations: [], employees: [] }));
    if (unitTypeValue === 'WITHINUNIT') {
      fetchStations(userDetails?.unitId);
    }
    if (errors.unitType) {
      setErrors((prev) => ({ ...prev, unitType: '' }));
    }
  };

  const handleUnitChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      selectedUnit: selectedOption,
      selectedStation: null,
      selectedEmployee: null,
    }));
    setOptions((prev) => ({ ...prev, employees: [] }));
    if (selectedOption) {
      fetchStations(selectedOption.value);
    }
    if (errors.selectedUnit) {
      setErrors((prev) => ({ ...prev, selectedUnit: '' }));
    }
  };

  const handleStationChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      selectedStation: selectedOption,
      selectedEmployee: null,
    }));
    if (selectedOption) {
      if (formData.requestType === 'MUTUAL') {
        fetchEmployees(selectedOption.value, formData.unitType === 'OUTSIDEUNIT' ? formData.selectedUnit?.value : userDetails.unitId);
      }
    }
    if (errors.selectedStation) {
      setErrors((prev) => ({ ...prev, selectedStation: '' }));
    }
  };

  const handleEmployeeChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      selectedEmployee: selectedOption,
    }));

    if (errors.selectedEmployee) {
      setErrors((prev) => ({ ...prev, selectedEmployee: '' }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, any> = {};
    if (!formData.unitName.trim()) newErrors.unitName = 'Unit Name is required';
    if (!formData.reportingManager.trim()) newErrors.reportingManager = 'Reporting Manager is required';
    const phoneRegex = /^[0-9]{10}$/;
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact Number is required';
    } else if (!phoneRegex.test(formData.contactNumber)) {
      newErrors.contactNumber = 'Please enter a valid 10-digit phone number';
    }
    if (!formData.requestType) newErrors.requestType = 'Request type is required';
    if (!formData.unitType) newErrors.unitType = 'Unit type is required';
    // Validation based on request type and unit type
    if (formData.requestType === 'MUTUAL') {
      if (formData.unitType === 'WITHINUNIT') {
        if (!formData.selectedStation) newErrors.selectedStation = 'Station is required';
        if (!formData.selectedEmployee) newErrors.selectedEmployee = 'Employee is required';
      } else if (formData.unitType === 'OUTSIDEUNIT') {
        if (!formData.selectedUnit) newErrors.selectedUnit = 'Unit is required';
        if (!formData.selectedStation) newErrors.selectedStation = 'Station is required';
        if (!formData.selectedEmployee) newErrors.selectedEmployee = 'Employee is required';
      }
    } else if (formData.requestType === 'ONREQUEST') {
      if (formData.unitType === 'WITHINUNIT') {
        if (!formData.selectedStation) newErrors.selectedStation = 'Station is required';
      } else if (formData.unitType === 'OUTSIDEUNIT') {
        if (!formData.selectedUnit) newErrors.selectedUnit = 'Unit is required';
        if (!formData.selectedStation) newErrors.selectedStation = 'Station is required';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleMutualSubmit = async () => {
    if (validateForm()) {
      setLoading((prev) => ({ ...prev, requestSubmitting: true }));
      try {
        const payload = {
          employeeCode: userDetails.EmpCode,
          autoId: userDetails.employeeMasterAutoId,
          requestUnitId: formData?.selectedUnit?.value ?? userDetails.unitId,
          requestStationId: formData?.selectedStation?.pkUnitStationId,
          otherUserAutoId: formData?.selectedEmployee?.value,
          nocRefId: 0,
          awardDetails: 'string',
          reportingAutoId: employees?.find((ele) => Number(ele?.employeeCode) === Number(formData?.reportingManager))?.employeeMasterAutoId,
          transferScope: formData.unitType,
          transferType: formData.requestType,
        };
        const response = await axiosInstance.post('/User/Transfer/Mutual', payload);
        if (response.data.success) {
          showCustomToast({
            title: 'Request Submitted',
            type: 'success',
            message: 'Your transfer request has been successfully submitted.',
          });
          setFormData({
            name: userDetails.name,
            empCode: userDetails.EmpCode,
            unitName: userDetails.Unit,
            department: userDetails.Department,
            post: userDetails.Designation,
            reportingManager: userDetails.reportingOfficer,
            contactNumber: userDetails.Mobile,
            requestType: '',
            unitType: '',
            selectedUnit: null,
            selectedStation: null,
            selectedEmployee: null,
            currentStation: '',
          });
          setOptions({ stations: [], employees: [] });
        } else {
          if (response.data.errorMessage === 'ALREADY_PENDING_REQUESTBYYOU') {
            showCustomToast({
              title: 'Request Already raised',
              type: 'error',
              message: 'You already have a raised request. Please wait for it to be processed.',
            });
          } else if (response.data.errorMessage === 'ALREADY_PENDING_REQUEST') {
            showCustomToast({
              title: 'Request Already Raised',
              type: 'error',
              message: 'You already have a raised request. Please wait for it to be processed.',
            });
          } else if (response.data.errorMessage === 'OTHER_USER_APPLIED_TRANSFER') {
            showCustomToast({
              title: 'Transfer Request Conflict',
              type: 'error',
              message: 'Another employee has already applied for a transfer for the selected employee. Please wait until the existing request is processed',
            });
          }
        }
      } catch (err) {
        setLoading((prev) => ({ ...prev, requestSubmitting: false }));
        showCustomToast({
          title: 'Request Failed',
          type: 'error',
          message: 'You Transfer request has been failed.',
        });
      } finally {
        setLoading((prev) => ({ ...prev, requestSubmitting: false }));
      }
    }
  };

  const handleOnRequestSubmit = async () => {
    if (validateForm()) {
      setLoading((prev) => ({ ...prev, requestSubmitting: true }));
      try {
        const payload = {
          employeeCode: userDetails.EmpCode,
          autoId: userDetails.employeeMasterAutoId,
          fkRequestedUnitId: formData?.selectedUnit?.value ?? userDetails.unitId,
          fkRequestedStationId: formData?.selectedStation?.pkUnitStationId,
          nocRefId: 0,
          awardDetails: 'string',
          reportingAutoId: employees?.find((ele) => Number(ele?.employeeCode) === Number(formData?.reportingManager))?.employeeMasterAutoId,
          transferScope: formData.unitType,
          transferType: formData.requestType,
        };
        const response = await axiosInstance.post('/User/Transfer/OnRequest', payload);
        if (response.data.success) {
          showCustomToast({
            title: 'Request Submitted',
            type: 'success',
            message: 'You Transfer request has been successfully submitted.',
          });
          setFormData({
            name: userDetails.name,
            empCode: userDetails.EmpCode,
            unitName: userDetails.Unit,
            department: userDetails.Department,
            post: userDetails.Designation,
            reportingManager: userDetails.reportingOfficer,
            contactNumber: userDetails.Mobile,
            requestType: '',
            unitType: '',
            selectedUnit: null,
            selectedStation: null,
            selectedEmployee: null,
            currentStation: '',
          });
          setOptions({ stations: [], employees: [] });
        } else {
          if (response.data.errorCode === 'ALREADY_PENDING_REQUESTBYYOU') {
            showCustomToast({
              title: 'Request Already Raised',
              type: 'error',
              message: 'You already have a raised request. Please wait for it to be processed.',
            });
          } else if (response.data.errorCode === 'ALREADY_PENDING_REQUEST') {
            showCustomToast({
              title: 'Request Already Raised',
              type: 'error',
              message: 'A request for the selected user is already raised. Please try again later.',
            });
          } else if (response.data.errorCode === 'OTHER_USER_APPLIED_TRANSFER') {
            showCustomToast({
              title: 'Transfer Request Conflict',
              type: 'error',
              message: 'Another employee has already applied for a transfer for the selected employee. Please wait until the existing request is processed',
            });
          }
        }
      } catch (err) {
        setLoading((prev) => ({ ...prev, requestSubmitting: false }));
        showCustomToast({
          title: 'Request Failed',
          type: 'error',
          message: 'You Transfer request has been failed.',
        });
      } finally {
        setLoading((prev) => ({ ...prev, requestSubmitting: false }));
      }
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (formData.requestType === 'MUTUAL') {
      await handleMutualSubmit();
    } else if (formData.requestType === 'ONREQUEST') {
      await handleOnRequestSubmit();
    } else {
      showCustomToast({
        title: 'Invalid Request Type',
        type: 'error',
        message: 'Please select a valid request type.',
      });
    }
  };

  const customSelectStyles = {
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? '#e1e7eb' 
        : state.isFocused
          ? '#f0f4f6' 
          : 'white',
      color: '#111827', 
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#111827', 
    }),
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? '#9ca3af' : '#d1d5db',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#9ca3af',
      },
    }),
  };

  const reportingOptions = useMemo(
    () =>
      employees.map((emp) => ({
        value: emp.employeeCode ?? '',
        label: emp.userName,
        empName: emp.userName,
        designation: emp.deptDfccil,
        positionGrade: emp.positionGrade,
        department: emp.post,
        dob: emp.dob,
        dojdfccil: emp.dojdfccil,
        doretirement: emp.doretirement,
        employeeMasterAutoId: emp.employeeMasterAutoId,
      })),
    [employees]
  );

  const employeeOptions = useMemo(
    () =>
      options.employees
        ?.filter((ele) => Number(ele?.employeeCode) !== Number(userDetails?.EmpCode))
        ?.sort((a, b) => (a.userName || '').localeCompare(b.userName || ''))
        ?.map((emp) => ({
          value: emp.employeeMasterAutoId ?? '',
          label: emp.userName,
          empName: emp.userName,
          empCode: emp.employeeCode,
          designation: emp.deptDfccil,
          positionGrade: emp.positionGrade,
          department: emp.post,
          dob: emp.dob,
          dojdfccil: emp.dojdfccil,
          doretirement: emp.doretirement,
        })),
    [options?.employees, userDetails?.EmpCode]
  );
  const showUnitTypeSelect = !!formData.requestType;

  const showUnitSelect = formData.requestType && formData.unitType === 'OUTSIDEUNIT';

  const showStationSelect = !!formData.requestType;

  const showEmployeeSelect = formData.requestType === 'MUTUAL';

  const isWithinUnit = formData.unitType === 'WITHINUNIT';

  const isRequestTypeSelected = !!formData.requestType;

  const isUnitTypeSelected = !!formData.unitType;

  const isUnitSelected = formData.unitType === 'WITHINUNIT' ? true : !!formData.selectedUnit;

  const isStationSelected = !!formData.selectedStation;

  const hasReportingOfficer = formData.reportingManager && formData.reportingManager !== 'null' && formData.reportingManager.trim() !== '';

  const visibleStations = useMemo(() => {
    if (!Array.isArray(options.stations)) return [];

    return options.stations.filter((station) => station.label !== formData.currentStation && station.value !== formData.currentStation);
  }, [options.stations, formData.currentStation]);

  const showNoStationForWithinUnit =
    formData.requestType === 'MUTUAL' &&
    formData.unitType === 'WITHINUNIT' &&
    !loading.stations &&
    Array.isArray(options.stations) &&
    visibleStations.length === 0;

  const showNoStationForOutsideUnit =
    formData.requestType === 'MUTUAL' &&
    formData.unitType === 'OUTSIDEUNIT' &&
    formData.selectedUnit &&
    !loading.stations &&
    Array.isArray(options.stations) &&
    visibleStations.length === 0;

  const noStationsAvailable = !loading.stations && isUnitSelected && visibleStations.length === 0;

  return (
    <div className="min-h-screen  p-4 md:p-8">
      {!hasReportingOfficer && (
        <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white shadow-2xl border border-red-200 rounded-xl p-6 max-w-md w-full mx-4 text-center animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center gap-3">
              <AlertTriangle className="w-10 h-10 text-red-600" />

              <h2 className="text-xl font-semibold text-red-700">Reporting Officer Not Assigned</h2>

              <p className="text-sm text-gray-600 leading-relaxed">
                Please update your reporting officer in your profile before submitting a transfer request.
              </p>

              <button
                onClick={() => {
                  window.location.href = 'https://uatlogin.dfccil.com/my-profile';
                }}
                className="mt-4 px-5 py-2.5 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition"
              >
                Go to Profile
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="mx-auto">
        {loading?.requestSubmitting && <Loader />}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
          <CardHeader className="space-y-1 rounded-t-lg">
            <CardTitle className="text-2xl font-bold">Transfer Request Form</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="requestType" className="text-sm font-semibold text-gray-700">
                    Transfer Request <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    id="transferRequest"
                    value={requestTypes.find((rt) => rt.value === formData.requestType) || null}
                    onChange={handleRequestTypeChange}
                    options={requestTypes}
                    placeholder="Select request type"
                    isClearable
                    styles={customSelectStyles}
                    className={errors.requestType ? 'border-red-500' : ''}
                  />
                  {errors.requestType && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.requestType}
                    </p>
                  )}
                </div>
                {showUnitTypeSelect && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-5 duration-500">
                    <Label htmlFor="unitType" className="text-sm font-semibold text-gray-700">
                      Request Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      id="requestType"
                      value={filteredUnitTypes.find((ut) => ut.value === formData.unitType) || null}
                      onChange={handleUnitTypeChange}
                      options={filteredUnitTypes}
                      placeholder="Select request type"
                      isClearable
                      styles={customSelectStyles}
                      className={errors.unitType ? 'border-red-500' : ''}
                      isDisabled={!isRequestTypeSelected}
                    />
                    {errors.unitType && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.unitType}
                      </p>
                    )}
                    {showNoStationForWithinUnit && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        No stations available with employees in this unit.
                      </p>
                    )}
                  </div>
                )}
                {showUnitSelect && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-5 duration-500">
                    <Label htmlFor="selectedUnit" className="text-sm font-semibold text-gray-700">
                      Unit <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      id="selectedUnit"
                      value={formData.selectedUnit}
                      onChange={handleUnitChange}
                      options={units
                        ?.filter((ele) => Number(ele.unitid) !== Number(userDetails.unitId))
                        ?.sort((a, b) => Number(a.unitid) - Number(b.unitid))
                        ?.map((ele) => ({
                          label: ele.unitName,
                          value: ele.unitid,
                        }))}
                      placeholder="Select unit"
                      isClearable
                      isLoading={loading.units}
                      styles={customSelectStyles}
                      className={errors.selectedUnit ? 'border-red-500' : ''}
                      isDisabled={!isUnitTypeSelected}
                    />
                    {errors.selectedUnit && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.selectedUnit}
                      </p>
                    )}

                    {showNoStationForOutsideUnit && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        No stations available with employees in this unit.
                      </p>
                    )}
                  </div>
                )}
                {showStationSelect && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-5 duration-500">
                    <Label htmlFor="selectedStation" className="text-sm font-semibold text-gray-700">
                      Station <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      id="selectedStation"
                      value={formData.selectedStation}
                      onChange={handleStationChange}
                      options={visibleStations}
                      placeholder="Select station"
                      isClearable
                      isLoading={loading.stations}
                      styles={customSelectStyles}
                      className={errors.selectedStation ? 'border-red-500' : ''}
                      isDisabled={!isUnitSelected || noStationsAvailable}
                    />
                    {errors.selectedStation && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.selectedStation}
                      </p>
                    )}
                  </div>
                )}
                {showEmployeeSelect && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-5 duration-500">
                    <Label htmlFor="selectedEmployee" className="text-sm font-semibold text-gray-700">
                      Employee <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      id="selectedEmployee"
                      value={formData.selectedEmployee}
                      onChange={handleEmployeeChange}
                      options={employeeOptions}
                      placeholder="Select employee"
                      isClearable
                      isLoading={loading.employees}
                      styles={customSelectStyles}
                      formatOptionLabel={(option: any) => (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full font-bold uppercase">
                            {option?.empName?.[0]}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-800">{option?.empName}</div>
                            <div className="text-xs text-gray-500">
                              {option?.empCode} | {option?.department} | {option?.designation}
                            </div>
                          </div>
                        </div>
                      )}
                      filterOption={(option, inputValue) => {
                        const search = inputValue.toLowerCase();
                        return (
                          option.data.empName?.toLowerCase().includes(search) ||
                          option.data.empCode?.toLowerCase().includes(search) ||
                          option.data.designation?.toLowerCase().includes(search) ||
                          option.data.department?.toLowerCase().includes(search)
                        );
                      }}
                      className={errors.selectedEmployee ? 'border-red-500' : ''}
                      isDisabled={!isStationSelected}
                    />
                    {errors.selectedEmployee && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.selectedEmployee}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className="pt-6 border-t flex justify-end">
                <ConfirmDialog
                  triggerClassName="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  description="Are you sure you want to raise this transfer request?"
                  actionLabel="Confirm"
                  triggerLabel="Submit"
                  beforeOpen={() => validateForm()}
                  onConfirm={handleSubmit}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TransferRequest;
