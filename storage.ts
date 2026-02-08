
import { Employee } from '../types';

const STORAGE_KEY = 'xc3_employees';

export const getEmployees = (): Employee[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveEmployees = (employees: Employee[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
};

export const addEmployee = (employee: Employee): void => {
  const employees = getEmployees();
  saveEmployees([...employees, employee]);
};

export const updateEmployee = (updatedEmployee: Employee): void => {
  const employees = getEmployees();
  saveEmployees(employees.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp));
};

export const deleteEmployee = (id: string): void => {
  const employees = getEmployees();
  saveEmployees(employees.filter(emp => emp.id !== id));
};
