const handleSelects = ({ selectedRowKeys, setSelectedRowIds, setTableToolbar, data, ...rest }) => {
  setSelectedRowIds(selectedRowKeys)
  setTableToolbar(selectedRowKeys.length > 0)

  if (rest?.setInbounIds && data) {
    const selectedRows = data.filter((item) => selectedRowKeys.includes(item.id))
    rest.setInbounIds(selectedRows.map((item) => item.Inbound_Id))
  }
}

export default handleSelects
