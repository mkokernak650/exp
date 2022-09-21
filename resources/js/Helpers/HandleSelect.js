const handleSelects = ({action,selectedRowIds,setselectedRowIds,tableProps,setTableToolbar,...rest}) => {
    const tmpRowIds = [...selectedRowIds]
    switch (action?.type) {
      case 'SelectRow':
        tmpRowIds.push(action?.rowKeyValue)
        setTableToolbar(true)
        break
      case 'DeselectRow':
        const itemIndx = tmpRowIds.indexOf(action?.rowKeyValue)
        tmpRowIds.splice(itemIndx, 1)
        setTableToolbar(false)
        break
      case 'SelectAllFilteredRows':
        let i = 0
        while (i < tableProps.data.length) {
          if (!tmpRowIds.includes(tableProps.data[i].id)) {
            tmpRowIds.push(tableProps.data[i].id)
            continue
          }
          i++
        }
        setTableToolbar(true)
        break
      case 'DeselectAllFilteredRows':
        tmpRowIds.splice(0, tmpRowIds.length)
        setTableToolbar(false)
    }
    setselectedRowIds(tmpRowIds)
  }

  export default handleSelects