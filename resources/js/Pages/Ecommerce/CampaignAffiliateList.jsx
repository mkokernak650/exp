import Layout from '../Layout/Layout'
import React, { useEffect, useState, useRef } from 'react'
import { kaReducer, Table } from 'ka-table'
import { SortingMode } from 'ka-table/enums'
import { usePage } from '@inertiajs/inertia-react'
import 'ka-table/style.scss'
import { hideLoading, showLoading } from 'ka-table/actionCreators'
import Eye from '@/Components/Icons/Eye.jsx'
import axios from 'axios'
import { Helmet } from 'react-helmet'
import { Pagination } from 'react-laravel-paginex'
import ColumnSettings from '@/Components/ColumnSettings'
import addTableDetails from '@/Helpers/AddTableDetails'
import { useStyles, columns } from './Helpers/CampaignAffiliateListProps'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'

const CampaignAffiliateList = () => {
  const classes = useStyles()
  const { affiliateList, campaignId, columnsData } = usePage().props
  const [showColumns, setShowColumns] = useState(false)
  const [loading, setLoading] = useState(false)
  const showColumnRef = useRef()
  const [campaignAffiliateList, setCampaignAffiliateList] = useState(affiliateList)
  const [itemPerPage, setItemPerPage] = useState(10)
  const [curerentPage, setCurerentPage] = useState(1)
  const [searchedData, setSearchData] = useState([])

  const mapDataArr = (data) => {
    return data.data.map((item) => ({
      affiliate_name: item.affiliate_name,
      affiliate_fee_type: item.affiliate_fee_type,
      market: item.market,
      created_at: item.created_at,
    }))
  }

  const dataArray = mapDataArr(affiliateList)

  const optionKey = 'campaign-affiliate-list'
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
    format: ({ column, value }) => {
      if (column.key === 'affiliate_fee_type') {
        return (value == 1 ? 'Payout Per Order' : 'Cash Buy')
      }
    }
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

  const handleColumns = () => {
    setShowColumns(true)
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
        `/ecommerce-campaigns-affiliates/${campaignId}?page=` +
        data.page +
        '&itemPerPage=' +
        itemPerPage
      )
      .then((res) => {
        setCampaignAffiliateList(res.data)
        dispatch(hideLoading())
        setSearchData(res.data.data)
      })
  }

  const itemPerPageHandleChange = (e) => {
    setItemPerPage(e.target.value)
  }

  useEffect(() => {
    getSearchingData(curerentPage)
  }, [itemPerPage])

  const triggerExportLink = (link) => {
    return window.open(link)
  }

  // const exportHandler = (e) => {
  //   e.preventDefault()
  //   setLoading(true)
  //   axios
  //     .get('zipcode-data-export')
  //     .then((res) => {
  //       setLoading(false)
  //       if (res.status === 200) {
  //         triggerExportLink(res.request.responseURL)
  //       } else {
  //         toast.error('Error while importing file')
  //       }
  //     })
  //     .catch((err) => {
  //       setLoading(false)
  //     })
  // }

  return (
    <>
      <Helmet title="Campaign Affiliate List" />
      <div className="selection-demo">
        <div className="table-top-flex-start">
          <div className="top-left">
            <div className="columns-show-hide" onClick={handleColumns}>
              <Eye />
            </div>
            {/* <Button
              variant="contained"
              type="submit"
              color="primary"
              className={classes.button}
              onClick={exportHandler}
              disabled={campaignAffiliateList == ''}
            >
              {loading ? (
                <CircularProgress color="inherit" thickness={3} size="1.5rem" />
              ) : (
                'Export'
              )}
            </Button> */}
          </div>
          {/* <div className="top-left" style={{ gap: '5px' }}>
            <MultiSelect
              options={statesOptions}
              placeholder="State"
              style={{ width: '180px' }}
              onChange={(value) => setFilterByState(value)}
              defaultValue={filterByState}
            />
            <MultiSelect
              options={TimeZoneOptions}
              placeholder="Time Zone"
              style={{ width: '180px' }}
              onChange={(value) => setFilterByTimeZone(value)}
              defaultValue={filterByTimeZone}
            />
            <TextField
              id="county"
              name="county"
              label="County"
              variant="outlined"
              size="small"
              style={{ width: '180px' }}
              value={filterBySearchBoxValue.county}
              onChange={handleSearchBoxChange}
            />
            <TextField
              id="city"
              name="city"
              label="City"
              variant="outlined"
              size="small"
              style={{ width: '180px' }}
              value={filterBySearchBoxValue.city}
              onChange={handleSearchBoxChange}
            />
            <TextField
              id="zipCode"
              name="zipCode"
              label="Zip Code"
              variant="outlined"
              size="small"
              type="number"
              style={{ width: '180px' }}
              value={filterBySearchBoxValue.zipCode}
              onChange={handleSearchBoxChange}
            />
            <TextField
              id="npa"
              name="npa"
              label="NPA"
              variant="outlined"
              size="small"
              type="number"
              style={{ width: '180px' }}
              value={filterBySearchBoxValue.npa}
              onChange={handleSearchBoxChange}
            />
            <TextField
              id="nxx"
              name="nxx"
              label="NXX"
              variant="outlined"
              size="small"
              type="number"
              style={{ width: '180px' }}
              value={filterBySearchBoxValue.nxx}
              onChange={handleSearchBoxChange}
            />
          </div> */}
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
          <Pagination changePage={getSearchingData} data={campaignAffiliateList} />
        </div>
      </div>
    </>
  )
}

CampaignAffiliateList.layout = (page) => <Layout title="Campaign Affiliate List">{page}</Layout>
export default CampaignAffiliateList
