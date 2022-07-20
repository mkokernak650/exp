import Layout from "../Layout/Layout"
import React, { useEffect, useState, useRef } from "react"
import { kaReducer, Table } from "ka-table"
import {
  DataType,
  SortingMode,
  PagingPosition,
  EditingMode,
  ActionType,
} from "ka-table/enums"
import { kaPropsUtils } from "ka-table/utils"
import { usePage } from "@inertiajs/inertia-react"
import {
  deselectAllFilteredRows,
  deselectRow,
  selectAllFilteredRows,
  selectRow,
  selectRowsRange,
} from "ka-table/actionCreators"
import FilterControl from "react-filter-control"
import { filterData } from "../filterData"
import "ka-table/style.scss"
import search from "../../../images/search.svg"
import eyeIcon from "../../../images/eyeIcon.svg"
import closeNav from "../../../images/closeNav.svg"
import Cancel from "../../../images/cancel.svg"
import { hideColumn, showColumn } from "ka-table/actionCreators"
import CellEditorBoolean from "ka-table/Components/CellEditorBoolean/CellEditorBoolean"
import Tooltip from "@material-ui/core/Tooltip"
import DeleteIcon from "@material-ui/icons/Delete"
import IconButton from "@material-ui/core/IconButton"
import Edit from "../../../images/edit1.svg"
import Checkbox from "@material-ui/core/Checkbox"
import {
  Button,
  TextField,
  makeStyles,
  CircularProgress,
} from "@material-ui/core"
import Grid from "@material-ui/core/Grid"
import axios from "axios"
import { Helmet } from "react-helmet"
import SnackBar from "../../Shared/SnackBar"
import ConfirmModal from "../../Shared/ConfirmModal"
import NormalModal from "../../Shared/NormalModal"
import toast from "react-hot-toast"
import * as FileSaver from "file-saver"
import * as XLSX from "xlsx"

const useStyles = makeStyles(() => ({
  topBtn: {
    display: "flex",
    gap: "10px",
    marginLeft: "10px",
  },
  button: {
    width: 130,
    textTransform: "capitalize",
    fontSize: "14px",
  },
  editButton: {
    marginTop: "15px",
  },
  import: {
    display: "flex",
    alignItems: "center",
  },
  importFile: {
    flex: "1",
    background: "#eee",
    padding: "7px",
    borderRadius: "5px",
    marginRight: "6px",
  },
}))

const operators = [
  {
    caption: "Contains",
    name: "contains",
  },
  {
    caption: "Not Contains",
    name: "doesNotContain",
  },
  {
    caption: "Is Empty",
    name: "isEmpty",
  },
  {
    caption: "Is Not Empty",
    name: "isNotEmpty",
  },
  {
    caption: "Starts With",
    name: "startswith",
  },
  {
    caption: "Ends With",
    name: "endsWith",
  },
  {
    caption: "Is",
    name: "is",
  },
  {
    caption: "Is Not",
    name: "isnot",
  },
]

export const fields = [
  {
    caption: "Campaign",
    name: "campaign",
    operators,
  },
  {
    caption: "Customer",
    name: "customer",
    operators,
  },
  {
    caption: "Affiliate",
    name: "affiliate",
    operators,
  },
  {
    caption: "Order Type",
    name: "order_type",
    operators,
  },
  {
    caption: "Coupon Code",
    name: "coupon_code",
    operators,
  },
  {
    caption: "Dialed Phone",
    name: "dialed",
    operators,
  },
  {
    caption: "Affiliate Fee",
    name: "affiliate_fee",
    operators,
  },
  {
    caption: "Commission",
    name: "percentage",
    operators,
  },
  // {
  //   caption: "status",
  //   name: "status",
  //   operators,
  // },
]

export const groups = [
  {
    caption: "And",
    name: "and",
  },
  {
    caption: "Or",
    name: "or",
  },
]

export const filter = {
  groupName: "and",
  items: [
    {
      field: "coupon_code",
      operator: "isNotEmpty",
    },
  ],
}

const AffiliateIndex = () => {
  const defaultState = {
    revenue: "",
    order_type: "",
    coupon_code: "",
    dialed: "",
    campaign_id: "",
    customer_id: "",
    affiliate_id: "",
    affiliate_fee: "",
    consumerExp_fee: "",
  }
  const classes = useStyles()
  const { ecommerceAffiliates, affiliates, campaigns, customers } =
    usePage().props
  const [showColumns, setShowColumns] = useState(false)
  const [tableToolbar, setTableToolbar] = useState(false)
  const [selectedRowIds, setSelectedRowIds] = useState([])
  const [open, setOpen] = useState(false)
  const [response, setResponse] = useState()
  const [responseType, setResponseType] = useState("success")
  const [showEditModal, setShowEditModal] = useState({ open: false })
  const [editData, setEditData] = useState(defaultState)
  const [showDeleteModal, setShowDeleteModal] = useState({ open: false })
  const showColumnRef = useRef()
  const [importModal, setImportModal] = useState({ open: false })
  const [exportModal, setExportModal] = useState({ open: false })
  const [selectedFile, setSelectedFile] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleEditChange = ({ target: { name, value } }) => {
    setEditData((oldEditData) => ({ ...oldEditData, [name]: value }))
  }

  const headers = {
    headers: { Accept: "application/json" },
  }

  const getCustomerNameById = (id) => {
    const customer = customers.find((customer) => customer.id == id)
    return customer ? customer.customer_name : ""
  }

  const getCampaignNameById = (id) => {
    const campaign = campaigns.find((campaign) => campaign.id == id)
    return campaign ? campaign.campaign_name : ""
  }

  const getAffiliateNameById = (id) => {
    const affiliate = affiliates.find((affiliate) => affiliate.id == id)
    return affiliate ? affiliate.affiliate_name : ""
  }
  console.log(editData)

  const handleEditSubmit = () => {

    axios
      .put(route("ecommerce-affiliates.update", editData.id), editData, headers)
      .then((res) => {
        let campaignName = getCampaignNameById(editData.campaign_id)
        let customerName = getCustomerNameById(editData.customer_id)
        let affiliateName = getAffiliateNameById(editData.affiliate_id)
        let filteredData = tableProps
        filteredData.data[editData.sl - 1] = {
          ...editData,
          campaign: campaignName,
          customer: customerName,
          affiliate: affiliateName,
          percentage: editData.revenue - editData.affiliate_fee,
          coupon_code: res.data.data.coupon_code,
          dialed: res.data.data.dialed,
        }

        setEditData()
        setShowEditModal({ open: false })
        toast.success(res.data.msg)
      })
      .catch((err) => {
        let errors = ""
        if (err.response.data?.errors) {
          Object.values(err.response.data?.errors).map((error) => {
            errors += error[0] + "\n"
          })
        } else if (err.response.data?.msg) {
          errors = err.response.data.msg
        }
        toast.error(errors)
      })
  }

  const handleImportChange = (e) => {
    setSelectedFile(e.target.files[0])
  }

  const openImportModal = () => {
    setImportModal({ open: true })
  }


  const importHandler = (e) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData()
    formData.append("importFile", selectedFile)
    axios
      .post(route("ecommerce-affiliates.import"), formData)
      .then((res) => {
        setSelectedFile(null)
        setImportModal({ open: false })
        setLoading(false)
        setResponseType("success")
        setResponse(res.data.msg)
        setOpen(true)
      })
      .catch((err) => {
        setLoading(false)
        setResponseType("error")
        setResponse("Import failed")
        setOpen(true)
      })
  }

  console.log('ecommerceAffiliates', ecommerceAffiliates)

  const dataArray = ecommerceAffiliates.map((item, index) => ({
    edit: item.id,
    sl: index + 1,
    campaign_id: item?.campaign_id,
    customer_id: item?.customer_id,
    affiliate_id: item?.affiliate_id,
    campaign: item?.campaign?.campaign_name,
    customer: item?.customer?.customer_name,
    affiliate: item?.affiliate?.affiliate_name,
    order_type: item?.order_type,
    coupon_code: item?.coupon_code,
    dialed: item?.dialed,
    revenue: item?.revenue,
    affiliate_fee: item?.affiliate_fee,
    percentage: item?.percentage,
    // status: item.status,
    id: item.id,
    key: index,
  }))

  const SelectionCell = ({
    rowKeyValue,
    dispatch,
    isSelectedRow,
    selectedRows,
  }) => {
    return (
      <Checkbox
        checked={isSelectedRow}
        color="primary"
        onChange={(event) => {
          if (event.nativeEvent.shiftKey) {
            dispatch(selectRowsRange(rowKeyValue, [...selectedRows].pop()))
          } else if (event.currentTarget.checked) {
            dispatch(selectRow(rowKeyValue))
            setTableToolbar(true)
            const id = parseInt(rowKeyValue)
            if (!selectedRowIds.includes(id)) {
              selectedRowIds.push(id)
            }
          } else {
            dispatch(deselectRow(rowKeyValue))
            const id = parseInt(rowKeyValue)
            const itemIndx = selectedRowIds.indexOf(id)
            selectedRowIds.splice(itemIndx, 1)
            if (selectedRowIds.length < 1) {
              setTableToolbar(false)
            }
          }
        }}
      />
    )
  }
  const SelectionHeader = ({ dispatch, areAllRowsSelected }) => {
    return (
      <Checkbox
        checked={areAllRowsSelected}
        color="primary"
        onChange={(event) => {
          if (event.currentTarget.checked) {
            dispatch(selectAllFilteredRows()) // also available: selectAllVisibleRows(), selectAllRows()
            setTableToolbar(true)
            let i = 0
            while (i < tableProps.data.length) {
              if (!selectedRowIds.includes(tableProps.data[i].id)) {
                selectedRowIds.push(tableProps.data[i].id)
                continue
              }
              i++
            }
          } else {
            dispatch(deselectAllFilteredRows()) // also available: deselectAllVisibleRows(), deselectAllRows()
            if (selectedRowIds) {
              selectedRowIds.splice(0, selectedRowIds.length)
            }
            if (selectedRowIds.length < 1) {
              setTableToolbar(false)
            }
          }
        }}
      />
    )
  }

  const handleEdit = (itemId) => {
    tableProps.data.filter((item) => {
      if (item.id == itemId) {
        setEditData(item)
      }
    })
    setShowEditModal({ open: true })
  }

  const tablePropsInit = {
    columns: [
      {
        key: "edit",
        style: { width: 20 },
      },
      {
        key: "selection-cell",
        style: { width: 60 },
      },
      {
        key: "sl",
        title: "SL",
        dataType: DataType.Number,
        style: { width: 40 },
      },
      {
        key: "campaign",
        title: "Campaign",
        dataType: DataType.String,
        style: { width: 150 },
      },
      {
        key: "customer",
        title: "Customer",
        dataType: DataType.String,
        style: { width: 150 },
      },
      {
        key: "affiliate",
        title: "Affiliate",
        dataType: DataType.String,
        style: { width: 150 },
      },
      {
        key: "order_type",
        title: "Order Type",
        dataType: DataType.String,
        style: { width: 150 },
      },
      {
        key: "coupon_code",
        title: "Coupon Code",
        dataType: DataType.String,
        style: { width: 150 },
      },
      {
        key: "dialed",
        title: "Dialed",
        dataType: DataType.String,
        style: { width: 150 },
      },
      {
        key: "revenue",
        title: "Payout",
        dataType: DataType.String,
        style: { width: 100 },
      },
      {
        key: "affiliate_fee",
        title: "Affiliate Fee",
        dataType: DataType.String,
        style: { width: 100 },
      },
      {
        key: "percentage",
        title: "Commission",
        dataType: DataType.String,
        style: { width: 100 },
      }
    ],
    paging: {
      enabled: true,
      pageIndex: 0,
      pageSize: 10,
      pageSizes: [10, 20, 50, 100],
      position: PagingPosition.Bottom,
    },
    data: dataArray,
    rowKeyField: "id",
    sortingMode: SortingMode.Single,
    columnResizing: true,
    columnReordering: true,
    format: ({ column, value }) => {
      if (column.key === "edit") {
        return (
          <div className="edit-icon" onClick={() => handleEdit(value)}>
            <img src={Edit} alt="edit-icon"></img>
          </div>
        )
      }
      if (column.key === "status") {
        return value == 1 ? "Active" : "Inactive"
      }
      if (column.key === "order_type") {
        return value == 1 ? "E-commerce" : "Phone"
      }
    },
  }

  const OPTION_KEY = "affiliate-index"
  const stateStore = {
    ...tablePropsInit,
    ...JSON.parse(localStorage.getItem(OPTION_KEY) || "0"),
  }
  const [tableProps, changeTableProps] = useState(stateStore)

  const dispatch = (action) => {
    changeTableProps((prevState) => {
      const newState = kaReducer(prevState, action)
      const { data, ...settingsWithoutData } = newState
      localStorage.setItem(OPTION_KEY, JSON.stringify(settingsWithoutData))
      return newState
    })
  }
  const [filterValue, changeFilter] = useState(filter)
  const onFilterChanged = (newFilterValue) => {
    changeFilter(newFilterValue)
  }

  const exportHandler = () => {
    const apiData = filterData(tableProps.data, filterValue)
    const filterdData = apiData.map((item) => {
      delete item.affiliate_id
      delete item.campaign_id
      delete item.customer_id
      delete item.edit
      delete item.id
      delete item.key
      delete item.sl
      item.order_type = item.order_type == 1 ? "E-commerce" : "Phone"
      return item
    })
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8"
    const ws = XLSX.utils.json_to_sheet(filterdData, 'Ecommerce Affiliates')
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] }
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" })
    const data = new Blob([excelBuffer], { type: fileType })
    FileSaver.saveAs(data, 'Ecommerce Affiliates' + '.xlsx')
    toast.success("Report Generated Successfully")


  }
  const [serachSidebar, setSearchSidebar] = useState(false)

  const handleSearch = () => {
    setSearchSidebar((prevState) => !prevState)
  }

  const handleColumns = () => {
    setShowColumns(true)
  }
  const closeSidebar = () => {
    setSearchSidebar(false)
  }

  const deleteHandler = () => {
    axios
      .post(route("ecommerce-affiliates.deleteSelected"), { selectedRowIds })
      .then((res) => {
        if (res.data.status_code === 200) {
          let filteredData = tableProps
          const newData = filteredData.data.filter(
            (item) => !selectedRowIds.includes(item.id)
          )
          filteredData.data = newData
          changeTableProps(filteredData)
          setSelectedRowIds([])
          setTableToolbar(false)
          setResponseType("success")
          setOpen(true)
          setResponse(res.data.msg)
          setShowDeleteModal({ open: false })
          emptyCheckbox()
        } else {
          setOpen(true)
          setResponseType("error")
          setResponse(res.data.msg)
          setShowDeleteModal({ open: false })
          emptyCheckbox()
        }
      })
      .catch((err) => {
        setShowDeleteModal({ open: false })
        emptyCheckbox()
      })
  }

  const handleCloseModal = (setOpenModal) => {
    setOpenModal({ open: false })
    setTableToolbar(false)
    setSelectedRowIds([])
    emptyCheckbox()
  }

  const handleOpenModal = (setOpenModal) => {
    setOpenModal({ open: true })
  }

  useEffect(() => {
    const checkIfClickedOutside = (e) => {
      if (
        showColumns &&
        showColumnRef.current &&
        !showColumnRef.current.contains(e.target)
      ) {
        setShowColumns(false)
      }
    }

    document.addEventListener("mousedown", checkIfClickedOutside)
    return () => {
      // Cleanup the event listener
      document.removeEventListener("mousedown", checkIfClickedOutside)
    }
  }, [showColumns])

  const emptyCheckbox = () => {
    const storedData = JSON.parse(localStorage.getItem("affiliate-index"))
    storedData.selectedRows = []
    localStorage.setItem("affiliate-index", JSON.stringify(storedData))
    let filteredData = { ...tableProps }
    filteredData.selectedRows = []
    changeTableProps(filteredData)
  }

  useEffect(() => {
    window.onload = function () {
      const storedData = JSON.parse(localStorage.getItem("affiliate-index"))
      if (storedData != null) {
        emptyCheckbox()
      }
    }
  }, [])


  const TableToolbar = () => {
    return (
      <div className="table-toolbar">
        <Tooltip title="Delete">
          <IconButton
            aria-label="delete"
            onClick={() => handleOpenModal(setShowDeleteModal)}
          >
            <DeleteIcon style={{ color: "#031b4e" }} />
          </IconButton>
        </Tooltip>
        <div className="selection-rows">
          {selectedRowIds.length} Row Selected
        </div>
      </div>
    )
  }

  const ColumnSettings = (tableProps) => {
    const columnsSettingsProps = {
      data: tableProps.columns.map((c) => ({
        ...c,
        visible: c.visible !== false,
      })),
      rowKeyField: "key",
      columns: [
        {
          key: "visible",
          title: "Visible",
          isEditable: false,
          style: { textAlign: "center" },
          width: 80,
          dataType: DataType.Boolean,
        },
        {
          key: "title",
          isEditable: false,
          title: "Fields",
          dataType: DataType.String,
        },
      ],
      editingMode: EditingMode.None,
    }
    const dispatchSettings = (action) => {
      if (action.type === ActionType.UpdateCellValue) {
        tableProps.dispatch(
          action.value
            ? showColumn(action.rowKeyValue)
            : hideColumn(action.rowKeyValue)
        )
      }
    }
    return (
      <Table
        {...columnsSettingsProps}
        childComponents={{
          rootDiv: {
            elementAttributes: () => ({
              style: { width: 400, marginBottom: 20 },
            }),
          },
          cell: {
            content: (props) => {
              switch (props.column.key) {
                case "visible":
                  return <CellEditorBoolean {...props} />
              }
            },
          },
        }}
        dispatch={dispatchSettings}
      />
    )
  }

  return (
    <>
      <Helmet title="E-commerce Affiliate Index" />

      <div className="selection-demo">
        {tableToolbar ? (
          <TableToolbar />
        ) : (
          <div className="table-top">
            <div className="top-left">
              <div className="columns-show-hide" onClick={handleColumns}>
                <img src={eyeIcon} alt="search"></img>
              </div>
              <Button
                variant="contained"
                type="submit"
                color="primary"
                className={classes.button}
                onClick={openImportModal}
              >
                Import
              </Button>
              <Button
                variant="contained"
                type="submit"
                color="primary"
                className={classes.button}
                onClick={exportHandler}
              >
                Export
              </Button>
            </div>
            <div className="search-icon" onClick={handleSearch}>
              <span>Search Here</span>
              <img src={search} alt="search"></img>
            </div>

            {serachSidebar ? (
              <div className="search-sidebar">
                <div className="search-top">
                  <div className="title">
                    <span>Search</span>
                  </div>
                  <a className="close-nav" onClick={closeSidebar}>
                    <img src={closeNav} alt="file not found"></img>
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
              ""
            )}
            {showColumns ? (
              <div className="column-settings" ref={showColumnRef}>
                <ColumnSettings {...tableProps} dispatch={dispatch} />
              </div>
            ) : (
              ""
            )}
          </div>
        )}
        <Table
          {...tableProps}
          childComponents={{
            cellText: {
              content: (props) => {
                if (props.column.key === "selection-cell") {
                  return <SelectionCell {...props} />
                }
              },
            },
            filterRowCell: {
              content: (props) => {
                if (props.column.key === "selection-cell") {
                  return <></>
                }
              },
            },
            headCell: {
              content: (props) => {
                if (props.column.key === "selection-cell") {
                  return (
                    <SelectionHeader
                      {...props}
                      areAllRowsSelected={kaPropsUtils.areAllFilteredRowsSelected(
                        tableProps
                      )}
                    // areAllRowsSelected={kaPropsUtils.areAllVisibleRowsSelected(tableProps)}
                    />
                  )
                }
              },
            },
            cell: {
              content: (props) => {
                switch (props.column.key) {
                  case "drag":
                    return (
                      <img
                        style={{ cursor: "move" }}
                        src="https://komarovalexander.github.io/ka-table/static/icons/draggable.svg"
                        alt="draggable"
                      />
                    )
                }
              },
            },
          }}
          dispatch={dispatch}
          extendedFilter={(data) => filterData(data, filterValue)}
        />
      </div>

      <NormalModal
        open={showEditModal.open}
        setOpen={setShowEditModal}
        width={"600px"}
        title={"Edit E-commerce Affiliate"}
      >
        <div className="edit_target">
          <form className={classes.form}>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <TextField
                  value={editData?.campaign_id}
                  select
                  name="campaign_id"
                  onChange={handleEditChange}
                  fullWidth
                  required={false}
                >
                  <option value="">Select Campaign</option>
                  {campaigns.map((option, indx) => (
                    <option key={indx + `-1`} value={option.id}>
                      {option.campaign_name}
                    </option>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  value={editData?.customer_id}
                  select
                  name="customer_id"
                  onChange={handleEditChange}
                  fullWidth
                  required={true}
                >
                  <option value="">Select Customer</option>
                  {customers.map((option, indx) => (
                    <option key={indx + `-2`} value={option.id}>
                      {option.customer_name}
                    </option>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  value={editData?.affiliate_id}
                  select
                  name="affiliate_id"
                  onChange={handleEditChange}
                  fullWidth
                  required={true}
                >
                  <option value="">Select Affiliate</option>
                  {affiliates.map((option, indx) => (
                    <option key={indx + `-3`} value={option.id}>
                      {option.affiliate_name}
                    </option>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  required={true}
                  name="order_type"
                  onChange={handleEditChange}
                  value={editData?.order_type}
                >
                  <option value="">Select Order Type</option>
                  <option value="1">E-commerce</option>
                  <option value="2">Phone</option>
                </TextField>
              </Grid>

              {editData?.order_type && editData.order_type == 1 && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="text"
                    required={true}
                    name="coupon_code"
                    label="Coupon Code"
                    onChange={handleEditChange}
                    placeholder="Exp: #CX12345"
                    value={editData?.coupon_code}
                  />
                </Grid>
              )}

              {editData?.order_type && editData.order_type == 2 && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="text"
                    name="dialed"
                    required={true}
                    label="Dialed Phone"
                    placeholder="123123123"
                    onChange={handleEditChange}
                    value={editData?.dialed}
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <TextField
                  value={editData?.revenue}
                  label="Revenue"
                  type="text"
                  name="revenue"
                  placeholder="Exp: 100"
                  onChange={handleEditChange}
                  fullWidth
                  required={true}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  value={editData?.affiliate_fee}
                  label="Affiliate Fee"
                  type="text"
                  name="affiliate_fee"
                  placeholder="Exp: 100"
                  onChange={handleEditChange}
                  fullWidth
                  required={true}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleEditSubmit}
                  className={classes.editButton}
                >
                  Update
                </Button>
              </Grid>
            </Grid>
          </form>

          <div
            onClick={() => handleCloseModal(setShowEditModal)}
            className="close-modal-icon"
          >
            <img src={Cancel} alt="close-modal-icon"></img>
          </div>
        </div>
      </NormalModal>

      <NormalModal
        open={importModal.open}
        setOpen={setImportModal}
        width={"500px"}
        title={""}
      >
        <form onSubmit={importHandler}>
          <div className={classes.import}>
            <input
              id="importFile"
              type="file"
              name="importFile"
              onChange={handleImportChange}
              className={classes.importFile}
            />
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={!selectedFile}
            >
              {loading ? (
                <CircularProgress color="inherit" thickness={3} size="1.5rem" />
              ) : (
                "Next"
              )}
            </Button>
          </div>
        </form>
      </NormalModal>

      <SnackBar
        open={open}
        setOpen={setOpen}
        severity={responseType}
        response={response}
      />
      <ConfirmModal
        open={showDeleteModal.open}
        setOpen={setShowDeleteModal}
        btnAction={deleteHandler}
        closeAction={() => handleCloseModal(setShowDeleteModal)}
        width={"400px"}
        title={`${selectedRowIds.length > 1
          ? "Do you want to delete these records?"
          : "Do you want to delete this record?"
          }`}
      ></ConfirmModal>
    </>
  )
}

AffiliateIndex.layout = (page) => (
  <Layout title="E-commerce Affiliate Index">{page}</Layout>
)
export default AffiliateIndex
