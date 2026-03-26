import React, { useState, useEffect } from 'react'
import { Table } from 'antd'
import { Switch } from 'antd'
import search from '../../images/search.svg'
import eyeIcon from '../../images/eyeIcon.svg'
import closeNav from '../../images/closeNav.svg'
import CustomFilter from './CustomFilter'

export default function MainTable(props) {
  const [searchSidebar, setSearchSidebar] = useState(false)
  const {
    TableToolbar,
    openTableToolbar,
    selectedRowKeys,
    handleColumns,
    showColumns,
    setShowColumns,
    showColumnRef,
    columns,
    data,
    loading,
    rowSelection,
    filterValue,
    setFilterValue,
    fields,
    onToggleColumn,
    filteredData,
    setFilteredData,
    filterData,
    currentPage,
    getSearchingData,
  } = props

  const hiddenColumns = ['sl', 'edit', 'selection-cell']

  const ColumnSettings = () => {
    const filteredCols = columns.filter((c) => !hiddenColumns.includes(c.key))
    return (
      <div className="w-[200px] mb-5">
        {filteredCols.map((col) => (
          <div
            key={col.key}
            className="flex items-center justify-between px-[7px] py-[6px] border-b border-[#eaeaf1] cursor-pointer"
            onClick={() => onToggleColumn(col.key)}
          >
            <span className="text-[13px] text-[#4b5668]">{col.title || col.key}</span>
            <Switch size="small" checked={col.visible !== false} />
          </div>
        ))}
      </div>
    )
  }

  const handleSearch = () => {
    setSearchSidebar((prevState) => !prevState)
  }
  const closeSidebar = () => {
    setSearchSidebar(false)
  }

  useEffect(() => {
    const checkIfClickedOutside = (e) => {
      if (showColumns && showColumnRef.current && !showColumnRef.current.contains(e.target)) {
        setShowColumns(false)
      }
    }

    document.addEventListener('mousedown', checkIfClickedOutside)
    return () => {
      document.removeEventListener('mousedown', checkIfClickedOutside)
    }
  }, [showColumns])

  const antdColumns = columns
    .filter((c) => c.visible !== false && c.key !== 'selection-cell')
    .map((col) => ({
      key: col.key,
      dataIndex: col.key,
      title: col.title || '',
      width: col.style?.width || col.width,
      sorter:
        col.dataType === 'number'
          ? (a, b) => (a[col.key] ?? 0) - (b[col.key] ?? 0)
          : col.dataType === 'string'
            ? (a, b) => (a[col.key] || '').localeCompare(b[col.key] || '')
            : undefined,
      render: col.render,
    }))

  return (
    <>
      <div className="consumer-table">
        {openTableToolbar ? (
          <TableToolbar />
        ) : (
          <div className="table-top">
            <div className="columns-show-hide" onClick={handleColumns}>
              <img src={eyeIcon} alt="search" />
            </div>
            <div className="search-icon" onClick={handleSearch}>
              <span>Search Here</span>
              <img src={search} alt="search" />
            </div>

            {searchSidebar ? (
              <div className="search-sidebar">
                <div className="search-top">
                  <div className="title">
                    <span>Search</span>
                  </div>
                  <a className="close-nav" onClick={closeSidebar}>
                    <img src={closeNav} alt="close" />
                  </a>
                </div>

                <div className="top-element">
                  <CustomFilter
                    mainData={data}
                    fields={fields}
                    filterValue={filterValue}
                    setFilterValue={setFilterValue}
                    filteredData={filteredData}
                    setFilteredData={setFilteredData}
                    filterData={filterData}
                    currentPage={currentPage}
                    getSearchingData={getSearchingData}
                  />
                </div>
              </div>
            ) : (
              ''
            )}
            {showColumns ? (
              <div className="column-settings" ref={showColumnRef}>
                <ColumnSettings />
              </div>
            ) : (
              ''
            )}
          </div>
        )}
        <Table
          columns={antdColumns}
          dataSource={data}
          rowKey="id"
          rowSelection={rowSelection}
          loading={loading}
          pagination={false}
          scroll={{ y: 'calc(100vh - 217px)' }}
          size="small"
        />
      </div>
    </>
  )
}
