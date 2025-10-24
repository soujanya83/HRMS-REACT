import axiosClient from "../axiosClient";


export const getEmployees = (params) => {
  return axiosClient.get("/employees", { params });
};


export const getEmployee = (id) => {

  if (!id || id === 'manage' || id === 'history') {
    throw new Error(`Invalid employee ID: ${id}`);
  }
  

  const cleanId = id.toString().replace('manage:', '').replace('edit:', '');
  console.log('EmployeeService - Fetching employee with cleaned ID:', cleanId);
  
  return axiosClient.get(`/employees/${cleanId}`);
};


export const createEmployee = (employeeData) => {
  return axiosClient.post("/employees", employeeData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};


export const updateEmployee = (id, employeeData) => {
  employeeData.append('_method', 'PUT');
  return axiosClient.post(`/employees/${id}`, employeeData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};


export const deleteEmployee = (id) => {
  return axiosClient.delete(`/employees/${id}`);
};



export const getTrashedEmployees = (params) => {
  return axiosClient.get('/employees/trashed', { params });
};

export const restoreEmployee = (id) => {
  return axiosClient.patch(`/employees/${id}/restore`);
};

export const forceDeleteEmployee = (id) => {
  return axiosClient.delete(`/employees/${id}/force`);
};


export const updateEmployeeStatus = (id, status) => {
    return axiosClient.patch(`/employees/${id}/status`, { status });
};

export const updateEmployeeManager = (id, managerId) => {
    return axiosClient.patch(`/employees/${id}/manager`, { reporting_manager_id: managerId });
};

export const getEmployeeProfile = (id) => {
  const cleanId = id.replace('manage:', '').replace('edit:', '');
  return axiosClient.get(`/employees/${cleanId}/profile`);
};

export const getEmployeeDocuments = (id) => {
  const cleanId = id.replace('manage:', '').replace('edit:', '');
  return axiosClient.get(`/employees/${cleanId}/documents`);
};
