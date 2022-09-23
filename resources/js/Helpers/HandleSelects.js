const handleSelects = ({
  action,
  selectedRowIds,
  setSelectedRowIds,
  tableProps,
  setTableToolbar,
  ...rest
}) => {
  const tmpRowIds = [...selectedRowIds]
  const id = action?.rowKeyValue

  switch (action?.type) {
    case 'SelectRow':
      tmpRowIds.push(id)
      setTableToolbar(true)
      if (rest?.inboundIds) {
        const tmpInboundIds = [...rest.inboundIds]
        const selectedRowData = tableProps.data.filter((item) => item.id == id)
        tmpInboundIds.push(selectedRowData[0].Inbound_Id)
        rest.setInbounIds(tmpInboundIds)
      }
      break
    case 'DeselectRow':
      const itemIndx = tmpRowIds.indexOf(id)
      tmpRowIds.splice(itemIndx, 1)
      setTableToolbar(false)
      if (rest?.inboundIds) {
        const tmpInboundIds = [...rest.inboundIds]
        const selectedRowData = tableProps.data.filter((item) => item.id == id)
        const inboundIndx = selectedRowData.indexOf(selectedRowData.Inbound_Id)
        tmpInboundIds.splice(inboundIndx, 1)
        rest.setInbounIds(tmpInboundIds)
      }
      break
    case 'SelectAllFilteredRows':
      let i = 0
      while (i < tableProps.data.length) {
        if (!tmpRowIds.includes(tableProps.data[i].id)) {
          tmpRowIds.push(tableProps.data[i].id)
          if (rest?.inboundIds) {
            rest.setInbounIds(tableProps.data.map((item) => item.Inbound_Id))
          }
          continue
        }
        i++
      }
      setTableToolbar(true)
      break
    case 'DeselectAllFilteredRows':
      tmpRowIds.splice(0, tmpRowIds.length)
      if (rest?.inboundIds) {
        const tmpInboundIds = [...rest.inboundIds]
        tmpInboundIds.splice(0, rest.inboundIds.length)
        rest.setInbounIds(tmpInboundIds)
      }
      setTableToolbar(false)
  }
  setSelectedRowIds(tmpRowIds)
}

export default handleSelects
