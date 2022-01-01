 const emptyCheckbox = (storageName,tableProps,changeTableProps) => {
    const storedData = JSON.parse(localStorage.getItem(`${storageName}`));
    storedData.selectedRows = [];
    localStorage.setItem(storageName, JSON.stringify(storedData));
    let filteredData = { ...tableProps };
    filteredData.selectedRows = [];
    changeTableProps(filteredData);
};
export default emptyCheckbox