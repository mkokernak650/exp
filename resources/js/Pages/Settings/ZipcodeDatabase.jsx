import Layout from '../Layout/Layout'
import React, { useEffect, useState, useRef } from 'react'
import { kaReducer, Table } from 'ka-table'
import { SortingMode } from 'ka-table/enums'
import { usePage } from '@inertiajs/inertia-react'
import FilterControl from 'react-filter-control'
import 'ka-table/style.scss'
import { hideLoading, showLoading } from 'ka-table/actionCreators'
import Search from '@/Components/Icons/Search.jsx'
import Eye from '@/Components/Icons/Eye.jsx'
import Cancel from '@/Components/Icons/Cancel.jsx'
import {
  Button,
  CircularProgress,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormLabel,
} from '@material-ui/core'
import NormalModal from '@/Shared/NormalModal'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import { Pagination } from 'react-laravel-paginex'
import ColumnSettings from '@/Components/ColumnSettings'
import addTableDetails from '@/Helpers/AddTableDetails'
import { useStyles, fields, groups, filter, columns } from './Helpers/ZipcodeDatabaseProps'

const ZipcodeDatabase = () => {
  const classes = useStyles()
  const { allZipcodes, columnsData } = usePage().props
  const [showColumns, setShowColumns] = useState(false)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [importModal, setImportModal] = useState({ open: false })
  const [exportModal, setExportModal] = useState({ open: false })
  const [selectedFile, setSelectedFile] = useState(null)
  const [type, setType] = useState('xlsx')
  const showColumnRef = useRef()
  const [zipCodeData, setZipcodeData] = useState(allZipcodes)
  const [itemPerPage, setItemPerPage] = useState(10)
  const [curerentPage, setCurerentPage] = useState(1)
  const [searchedData, setSearchData] = useState([])

  const mapDataArr = (data) => {
    return data.data.map((item, index) => ({
      sl: index + 1,
      NPA: item.NPA,
      NXX: item.NXX,
      NPANXX: item.NPANXX,
      ZipCode: item.ZipCode,
      State: item.State,
      City: item.City,
      County: item.County,
      CountyPop: item.CountyPop,
      ZipCodeCount: item.ZipCodeCount,
      ZipCodeFreq: item.ZipCodeFreq,
      Latitude: item.Latitude,
      Longitude: item.Longitude,
      TimeZone: item.TimeZone,
      ObservesDST: item.ObservesDST,
      NXXUseType: item.NXXUseType,
      NXXIntroVersion: item.NXXIntroVersion,
      NPANew: item.NPANew,
      FIPS: item.FIPS,
      Status: item.Status,
      LATA: item.LATA,
      Overlay: item.Overlay,
      RateCenter: item.RateCenter,
      SwitchCLLI: item.SwitchCLLI,
      MSA_CBSA: item.MSA_CBSA,
      MSA_CBSA_CODE: item.MSA_CBSA_CODE,
      OCN: item.OCN,
      Company: item.Company,
      CoverageAreaName: item.CoverageAreaName,
      Flags: item.Flags,
      WeightedLat: item.WeightedLat,
      WeightedLon: item.WeightedLon,
      id: item.id,
      key: index,
    }))
  }

  const dataArray = mapDataArr(allZipcodes)

  const optionKey = 'zipcode-database'
  const [columnDetails, setColumnDetails] = useState(
    columnsData.length ? JSON.parse(columnsData[0]) : {}
  )

  const tablePropsInit = {
    columns:
      columnsData.length && JSON.parse(columnsData[0])?.[optionKey]
        ? JSON.parse(columnsData[0])?.[optionKey]
        : columns,
    loading: {
      enabled: false,
      text: 'Loading...',
    },
    data: dataArray,
    rowKeyField: 'id',
    sortingMode: SortingMode.Single,
    columnResizing: true,
    columnReordering: true,
  }

  const [tableProps, changeTableProps] = useState(tablePropsInit)

  const dispatch = (action) => {
    changeTableProps((prevState) => {
      const newState = kaReducer(prevState, action)
      const { data, ...settingsWithoutData } = newState
      if (action?.type === 'ReorderColumns') {
        addTableDetails(columnDetails, setColumnDetails, settingsWithoutData, optionKey)
      }
      return newState
    })
  }
  const [filterValue, changeFilter] = useState(filter)

  const [serachSidebar, setSearchSidebar] = useState(false)

  const handleSearch = () => {
    setSearchSidebar((prevState) => !prevState)
  }

  const handleColumns = () => {
    setShowColumns(true)
  }

  const hideCoumnSettings = () => {
    setShowColumns(false)
  }

  const closeSidebar = () => {
    setSearchSidebar(false)
  }

  const handleImportChange = (e) => {
    setSelectedFile(e.target.files[0])
  }

  const handleExportChange = (e) => {
    setType(e.target.value)
  }

  const importHandler = (e) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData()
    formData.append('importfile', selectedFile)
    axios
      .post(route('zipcode.data.import'), formData)
      .then((res) => {
        setSelectedFile(null)
        setLoading(false)
        if (res.status === 200) {
          setMainData(res.data)
          setImportModal({ open: false })
          toast.success('Imported Successfully')
        } else {
          toast.error('Import failed')
        }
      })
      .catch((err) => {})
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

  const getSearchingData = async (data) => {
    setCurerentPage(data)
    dispatch(showLoading())
    await axios
      .get(
        'telephone-and-zip-codes?page=' +
          data.page +
          '&itemPerPage=' +
          itemPerPage +
          '&filteredValue=' +
          JSON.stringify(filterValue)
      )
      .then((res) => {
        setZipcodeData(res.data)
        dispatch(hideLoading())
        setSearchData(res.data.data)
      })
  }

  const onFilterChanged = (newFilterValue) => {
    changeFilter(newFilterValue)
  }

  const itemPerPageHandleChange = (e) => {
    setItemPerPage(e.target.value)
  }

  useEffect(() => {
    getSearchingData(curerentPage)
  }, [itemPerPage])

  useEffect(() => {
    getSearchingData(curerentPage)
  }, [filterValue])

  const triggerExportLink = (link) => {
    return window.open(link)
  }

  const exportHandler = (e) => {
    e.preventDefault()
    setLoading(true)
    axios
      .get('zipcode-data-export?filterValue=' + JSON.stringify(filterValue))
      .then((res) => {
        setLoading(false)
        if (res.status === 200) {
          triggerExportLink(res.request.responseURL)
          setOpen(true)
        } else {
          toast.error('Error while importing file')
        }
      })
      .catch((err) => {
        setLoading(false)
      })
  }

  return (
    <>
      <Helmet title="ZipCode Database" />
      <div className="selection-demo">
        <div className="table-top">
          <div className="top-left">
            <div className="columns-show-hide" onClick={handleColumns}>
              <Eye />
            </div>
            <Button
              variant="contained"
              type="submit"
              color="primary"
              className={classes.button}
              onClick={exportHandler}
              disabled={zipCodeData == ''}
            >
              {loading ? (
                <CircularProgress color="inherit" thickness={3} size="1.5rem" />
              ) : (
                'Searched Export'
              )}
            </Button>
          </div>

          <div className="search-icon" onClick={handleSearch}>
            <span>Search Here</span>
            <Search />
          </div>

          {serachSidebar ? (
            <div className="search-sidebar">
              <div className="search-top">
                <div className="title">
                  <span>Search</span>
                </div>
                <a className="close-nav" onClick={closeSidebar}>
                  <Cancel />
                </a>
              </div>

              <div className="top-element">
                <FilterControl
                  {...{
                    fields,
                    groups,
                    filterValue,
                    onFilterValueChanged: onFilterChanged,
                  }}
                />
              </div>
            </div>
          ) : (
            ''
          )}
          {showColumns ? (
            <div className="column-settings" ref={showColumnRef}>
              <ColumnSettings {...tableProps} dispatch={dispatch} />
            </div>
          ) : (
            ''
          )}
        </div>
        <Table
          {...tableProps}
          childComponents={{
            noDataRow: {
              content: () => 'No Data Found',
            },
          }}
          dispatch={dispatch}
          extendedFilter={(data) => searchedData}
        />
        <div className="table-bottom">
          <select
            name="item-per-page"
            id="item-per-page"
            value={itemPerPage}
            onChange={(e) => itemPerPageHandleChange(e)}
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <Pagination changePage={getSearchingData} data={zipCodeData} />
        </div>

        <NormalModal open={importModal.open} setOpen={setImportModal} width={'500px'} title={''}>
          <div className={classes.import}>
            <input id="importfile" type="file" name="importfile" onChange={handleImportChange} />
            <Button
              variant="contained"
              color="primary"
              onClick={importHandler}
              disabled={!selectedFile}
            >
              {loading ? <CircularProgress color="inherit" thickness={3} size="1.5rem" /> : 'Next'}
            </Button>
          </div>
        </NormalModal>

        <NormalModal open={exportModal.open} setOpen={setExportModal} width={'500px'} title={''}>
          <div className={classes.import}>
            <FormLabel component="legend">Select Type</FormLabel>
            <RadioGroup aria-label="type" name="type" value={type} onChange={handleExportChange}>
              <FormControlLabel value="xlsx" control={<Radio />} label="XLSX" />
              <FormControlLabel value="csv" control={<Radio />} label="CSV" />
              <FormControlLabel value="xls" control={<Radio />} label="XLS" />
              <FormControlLabel value="tsv" control={<Radio />} label="TSV" />
            </RadioGroup>
            <Button variant="contained" color="primary" onClick={exportHandler}>
              {loading ? <CircularProgress color="inherit" thickness={3} size="1.5rem" /> : 'Next'}
            </Button>
          </div>
        </NormalModal>
      </div>
    </>
  )
}

ZipcodeDatabase.layout = (page) => <Layout title="Zipcode Database">{page}</Layout>
export default ZipcodeDatabase
