import * as FileSaver from "file-saver"
import * as XLSX from "xlsx"
import toast from "react-hot-toast"


const fileType =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8"
export const ExportReportWithoutTag = (apiData, fileName) => {
    const ws = XLSX.utils.json_to_sheet(Object.values(apiData.data), fileName)
    const secondData = Object.keys(apiData.data).length + 5
    const call_summary = []
    Object.keys(apiData.call_summary).forEach((cf) => {
        call_summary.push([cf, apiData.call_summary[cf]])
    })
    XLSX.utils.sheet_add_aoa(ws, call_summary, { origin: `C${secondData}` })
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] }
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" })
    const data = new Blob([excelBuffer], { type: fileType })
    FileSaver.saveAs(data, fileName + '.xlsx')
    toast.success("Report Generated Successfully")

}

export const ExportReportWithTag=(apiData, fileName)=>{
    const ws = XLSX.utils.json_to_sheet(apiData.data, fileName)
    const secondData = apiData.data.length + 5
    const call_summary = []
    call_summary.push(["Summary of Calls", ""])
    Object.keys(apiData.call_summary).forEach((cf) => {
      call_summary.push([cf, apiData.call_summary[cf]])
    })
    const thirdData = apiData.data.length + call_summary.length + 6
    const category = []
    category.push(["Category", "Total Calls", "Total Revenue"])
    Object.keys(apiData.tag_count).forEach((cat) => {
      category.push(Object.values(apiData.tag_count[cat]))
    })

    XLSX.utils.sheet_add_aoa(ws, call_summary, { origin: `C${secondData}` })
    XLSX.utils.sheet_add_aoa(ws, category, { origin: `C${thirdData}` })
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] }
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" })
    const data = new Blob([excelBuffer], { type: fileType })
    FileSaver.saveAs(data,  fileName + '.xlsx')
    toast.success("Report Generated Successfully")
}

export const exportReportEcommerce = (apiData, fileName,reportFor) => {
  const ws = XLSX.utils.json_to_sheet(apiData.data, fileName);
  const secondData = apiData.data.length + 5;
  const summary = [];
  summary.push(["Summary", ""]);
  Object.keys(apiData.summary).forEach((cf) => {
    summary.push([cf, apiData.summary[cf]]);
  });

  XLSX.utils.sheet_add_aoa(ws, summary, {
    origin:
      reportFor.reportFor === "sales" ? `E${secondData}` : `B${secondData}`,
  });
  const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const data = new Blob([excelBuffer], { type: fileType });
  FileSaver.saveAs(data, fileName + '.xlsx');
  toast.success("Report generated successfully");
};

export const exportReportAlreadyExist = (apiData) => {
  const ws = XLSX.utils.json_to_sheet(apiData, 'already_exists_sales');
  const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const data = new Blob([excelBuffer], { type: fileType });
  FileSaver.saveAs(data, 'already_exists_sales' + '.xlsx');
};


