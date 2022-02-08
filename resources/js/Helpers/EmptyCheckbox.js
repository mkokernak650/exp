 const emptyCheckbox = (storageName,tableProps,changeTableProps) => {
    const storedData = JSON.parse(localStorage.getItem(`${storageName}`));
    if(storedData?.selectedRows)  storedData.selectedRows= [];
    localStorage.setItem(storageName, JSON.stringify(storedData));
    let filteredData = { ...tableProps };
    if(filteredData?.selectedRows) filteredData.selectedRows = [];
    changeTableProps(filteredData);
};
export default emptyCheckbox