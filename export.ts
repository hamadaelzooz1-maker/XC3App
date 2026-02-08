
import { Employee } from '../types';

export const exportToCSV = (employees: Employee[]) => {
  const headers = ['الاسم', 'الرقم الوظيفي', 'المهنة', 'الفئة', 'رقم الهاتف'];
  const rows = employees.map(e => [
    e.name,
    e.employeeId,
    e.profession,
    e.category,
    e.phone
  ]);

  const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `XC3_Employees_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToDoc = (employees: Employee[]) => {
  const html = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>XC3 Employees</title></head>
    <body style="direction: rtl; font-family: 'Arial';">
      <h1>قائمة الموظفين - XC3</h1>
      <table border='1' style='border-collapse: collapse; width: 100%;'>
        <thead>
          <tr style='background-color: #f2f2f2;'>
            <th>الاسم</th>
            <th>الرقم الوظيفي</th>
            <th>المهنة</th>
            <th>الفئة</th>
            <th>رقم الهاتف</th>
          </tr>
        </thead>
        <tbody>
          ${employees.map(e => `
            <tr>
              <td>${e.name}</td>
              <td>${e.employeeId}</td>
              <td>${e.profession}</td>
              <td>${e.category}</td>
              <td>${e.phone}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([html], { type: 'application/msword' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `XC3_Employees.doc`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
