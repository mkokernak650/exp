export const emptyCheckbox = (storageName,tableProps,changeTableProps) => {
    const storedData = JSON.parse(localStorage.getItem(`${storageName}`));
    storedData.selectedRows = [];
    localStorage.setItem("call-logs-report", JSON.stringify(storedData));
    let filteredData = { ...tableProps };
    filteredData.selectedRows = [];
    changeTableProps(filteredData);
};