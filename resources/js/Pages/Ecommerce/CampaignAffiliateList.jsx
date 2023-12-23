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
import { Button, CircularProgress } from '@material-ui/core'
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
  const [orderByValue, setOrderByValue] = useState('affiliates.affiliate_name@ASC')

  const mapDataArr = (data) => {
    return data.data.map((item) => ({
      affiliate_name: item.affiliate_name,
      affiliate_fee_type: item.affiliate_fee_type,
      market: item.market,
      tv_households: item.tv_households,
      created_at: item.created_at,
      id: item.id,
    }))
  }

  const dataArray = mapDataArr(affiliateList)

  const optionKey = 'campaign-affiliate-list'
  const [columnDetails, setColumnDetails] = useState(
    columnsData.length ? JSON.parse(columnsData[0]) : {}
  )

  const tablePropsInit = {
    columns:
      // columnsData.length && JSON.parse(columnsData[0])?.[optionKey]
      //   ? JSON.parse(columnsData[0])?.[optionKey]
      //   : 
      columns,
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

  const orderByOptions = [
    { label: 'Affiliate Name (Ascending)', value: 'affiliates.affiliate_name@ASC' },
    { label: 'Affiliate Name (Descending)', value: 'affiliates.affiliate_name@DESC' },
    { label: 'TV Households (Ascending)', value: 'tv_households@ASC' },
    { label: 'TV Households (Descending)', value: 'tv_households@DESC' },
    { label: 'Created At (Ascending)', value: 'affiliates.created_at@ASC' },
    { label: 'Created At (Descending)', value: 'affiliates.created_at@DESC' }
  ]

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
        + '&orderBy=' + orderByValue
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
  }, [itemPerPage, orderByValue])

  const triggerExportLink = (link) => {
    return window.open(link)
  }

  const exportHandler = (e) => {
    e.preventDefault()
    setLoading(true)
    axios
      .get(`/ecommerce-campaigns-affiliates/export/${campaignId}`)
      .then((res) => {
        setLoading(false)
        if (res.status === 200) {
          triggerExportLink(res.request.responseURL)
        } else {
          toast.error('Error while exporting file')
        }
      })
      .catch((err) => {
        setLoading(false)
      })
  }

  return (
    <>
      <Helmet title="Campaign Affiliate List" />
      <div className="selection-demo">
        <div className="table-top-flex-start">
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
              disabled={campaignAffiliateList == ''}
            >
              {loading ? (
                <CircularProgress color="inherit" thickness={3} size="1.5rem" />
              ) : (
                'Export'
              )}
            </Button>
          </div>
          <div className="top-left">
            <MultiSelect
              options={orderByOptions}
              onChange={(value) => setOrderByValue(value)}
              placeholder="Order By"
              style={{ width: '280px' }}
              defaultValue={orderByValue}
              singleSelect
            />
          </div>
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
