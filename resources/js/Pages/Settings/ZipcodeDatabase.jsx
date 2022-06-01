import Layout from "../Layout/Layout"
import React, { useEffect, useState, useRef } from "react"
import { kaReducer, Table } from "ka-table"
import {
  DataType,
  SortingMode,
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
import "ka-table/style.scss"
import search from "../../../images/search.svg"
import eyeIcon from "../../../images/eyeIcon.svg"
import closeNav from "../../../images/closeNav.svg"
import { hideColumn, showColumn, hideLoading, showLoading } from "ka-table/actionCreators"
import CellEditorBoolean from "ka-table/Components/CellEditorBoolean/CellEditorBoolean"
import Checkbox from "@material-ui/core/Checkbox"
import {
  makeStyles,
  Button,
  Snackbar,
  CircularProgress,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormLabel,
} from "@material-ui/core"
import MuiAlert from "@material-ui/lab/Alert"
import NormalModal from "../../Shared/NormalModal"
import axios from "axios"
import { Helmet } from "react-helmet"
import { Pagination } from 'react-laravel-paginex'
const useStyles = makeStyles(() => ({
  button: {
    width: "auto",
    textTransform: "capitalize",
    fontSize: "14px",
  },
}))

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />
}

export const fields = [
  {
    caption: "NPA",
    name: "NPA",
    operators: [
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
    ],
  },
  {
    caption: "NXX",
    name: "NXX",
    operators: [
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
    ],
  },
  {
    caption: "NPANXX",
    name: "NPANXX",
    operators: [
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
    ],
  },
  {
    caption: "ZipCode",
    name: "ZipCode",
    operators: [
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
    ],
  },
  {
    caption: "State",
    name: "State",
    operators: [
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
    ],
  },
  {
    caption: "City",
    name: "City",
    operators: [
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
    ],
  },
  {
    caption: "County",
    name: "County",
    operators: [
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
    ],
  },
  {
    caption: "CountyPop",
    name: "CountyPop",
    operators: [
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
    ],
  },
  {
    caption: "ZipCodeCount",
    name: "ZipCodeCount",
    operators: [
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
    ],
  },
  {
    caption: "ZipCodeFreq",
    name: "ZipCodeFreq",
    operators: [
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
    ],
  },
  {
    caption: "Latitude",
    name: "Latitude",
    operators: [
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
    ],
  },
  {
    caption: "Longitude",
    name: "Longitude",
    operators: [
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
    ],
  },
  {
    caption: "TimeZone",
    name: "TimeZone",
    operators: [
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
    ],
  },
  {
    caption: "ObservesDST",
    name: "ObservesDST",
    operators: [
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
    ],
  },
  {
    caption: "NXXUseType",
    name: "NXXUseType",
    operators: [
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
    ],
  },
  {
    caption: "NXXIntroVersion",
    name: "NXXIntroVersion",
    operators: [
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
    ],
  },
  {
    caption: "NPANew",
    name: "NPANew",
    operators: [
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
    ],
  },
  {
    caption: "FIPS",
    name: "FIPS",
    operators: [
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
    ],
  },
  {
    caption: "Status",
    name: "Status",
    operators: [
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
    ],
  },
  {
    caption: "LATA",
    name: "LATA",
    operators: [
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
    ],
  },
  {
    caption: "Overlay",
    name: "Overlay",
    operators: [
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
    ],
  },
  {
    caption: "RateCenter",
    name: "RateCenter",
    operators: [
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
    ],
  },
  {
    caption: "SwitchCLLI",
    name: "SwitchCLLI",
    operators: [
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
    ],
  },
  {
    caption: "MSA_CBSA",
    name: "MSA_CBSA",
    operators: [
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
    ],
  },
  {
    caption: "MSA_CBSA_CODE",
    name: "MSA_CBSA_CODE",
    operators: [
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
    ],
  },
  {
    caption: "OCN",
    name: "OCN",
    operators: [
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
    ],
  },
  {
    caption: "Company",
    name: "Company",
    operators: [
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
    ],
  },
  {
    caption: "CoverageAreaName",
    name: "CoverageAreaName",
    operators: [
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
    ],
  },
  {
    caption: "Flags",
    name: "Flags",
    operators: [
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
    ],
  },
  {
    caption: "WeightedLat",
    name: "WeightedLat",
    operators: [
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
    ],
  },
  {
    caption: "WeightedLon",
    name: "WeightedLon",
    operators: [
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
    ],
  },
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
      field: "ZipCode",
      operator: "contains",
      value: ""
    }
  ]
}


const ZipcodeDatabase = () => {
  const classes = useStyles()
  const { allZipcodes } = usePage().props
  const [showColumns, setShowColumns] = useState(false)
  const [selectedRowIds, setselectedRowIds] = useState([])
  const [response, setResponse] = useState()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [importModal, setImportModal] = useState({ open: false })
  const [exportModal, setExportModal] = useState({ open: false })
  const [selectedFile, setSelectedFile] = useState(null)
  const [type, setType] = useState("xlsx")
  const showColumnRef = useRef()
  const [zipCodeData, setZipcodeData] = useState(allZipcodes)
  const [itemPerPage, setItemPerPage] = useState(10)
  const [curerentPage, setCurerentPage] = useState(1)
  const [searchedData, setSearchData] = useState([])


  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return
    }
    setOpen(false)
  }

  const mapDataArr = data => {
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

  const tablePropsInit = {
    columns: [
      {
        key: "selection-cell",
        style: { width: 80 },
      },
      {
        key: "NPA",
        title: "NPA",
        dataType: DataType.Number,
        style: { width: 100 },
      },
      {
        key: "NXX",
        title: "NXX",
        dataType: DataType.String,
        style: { width: 150 },
      },
      {
        key: "NPANXX",
        title: "NPANXX",
        dataType: DataType.String,
        style: { width: 130 },
      },
      {
        key: "ZipCode",
        title: "ZipCode",
        dataType: DataType.String,
        style: { width: 160 },
      },
      {
        key: "State",
        title: "State",
        dataType: DataType.String,
        style: { width: 130 },
      },
      {
        key: "City",
        title: "City",
        dataType: DataType.String,
        style: { width: 210 },
      },
      {
        key: "County",
        title: "County",
        dataType: DataType.String,
        style: { width: 170 },
      },
      {
        key: "CountyPop",
        title: "CountyPop",
        dataType: DataType.String,
        style: { width: 150 },
      },
      {
        key: "ZipCodeCount",
        title: "ZipCodeCount",
        dataType: DataType.String,
        style: { width: 190 },
      },
      {
        key: "ZipCodeFreq",
        title: "ZipCodeFreq",
        dataType: DataType.String,
        style: { width: 150 },
      },
      {
        key: "Latitude",
        title: "Latitude",
        dataType: DataType.String,
        style: { width: 170 },
      },
      {
        key: "Longitude",
        title: "Longitude",
        dataType: DataType.String,
        style: { width: 200 },
      },
      {
        key: "TimeZone",
        title: "TimeZone",
        dataType: DataType.String,
        style: { width: 140 },
      },
      {
        key: "ObservesDST",
        title: "ObservesDST",
        dataType: DataType.String,
        style: { width: 160 },
      },
      {
        key: "NXXUseType",
        title: "NXXUseType",
        dataType: DataType.String,
        style: { width: 150 },
      },
      {
        key: "NXXIntroVersion",
        title: "NXXIntroVersion",
        dataType: DataType.String,
        style: { width: 180 },
      },
      {
        key: "NPANew",
        title: "NPANew",
        dataType: DataType.Number,
        style: { width: 130 },
      },
      {
        key: "FIPS",
        title: "FIPS",
        dataType: DataType.String,
        style: { width: 160 },
      },
      {
        key: "LATA",
        title: "LATA",
        dataType: DataType.String,
        style: { width: 130 },
      },
      {
        key: "Overlay",
        title: "Overlay",
        dataType: DataType.String,
        style: { width: 160 },
      },
      {
        key: "RateCenter",
        title: "RateCenter",
        dataType: DataType.String,
        style: { width: 180 },
      },
      {
        key: "SwitchCLLI",
        title: "SwitchCLLI",
        dataType: DataType.String,
        style: { width: 130 },
      },
      {
        key: "MSA_CBSA",
        title: "MSA_CBSA",
        dataType: DataType.String,
        style: { width: 400 },
      },
      {
        key: "MSA_CBSA_CODE",
        title: "MSA_CBSA_CODE",
        dataType: DataType.String,
        style: { width: 190 },
      },
      {
        key: "OCN",
        title: "OCN",
        dataType: DataType.String,
        style: { width: 180 },
      },
      {
        key: "Company",
        title: "Company",
        dataType: DataType.String,
        style: { width: 360 },
      },
      {
        key: "CoverageAreaName",
        title: "CoverageAreaName",
        dataType: DataType.String,
        style: { width: 240 },
      },
      {
        key: "Flags",
        title: "Flags",
        dataType: DataType.String,
        style: { width: 200 },
      },
      {
        key: "WeightedLat",
        title: "WeightedLat",
        dataType: DataType.String,
        style: { width: 200 },
      },
      {
        key: "WeightedLon",
        title: "WeightedLon",
        dataType: DataType.String,
        style: { width: 180 },
      },
    ],
    loading: {
      enabled: false,
      text: 'Loading...'
    },
    data: dataArray,
    rowKeyField: "id",
    sortingMode: SortingMode.Single,
    columnResizing: true,
    columnReordering: true,
  }





  const OPTION_KEY = "zipcode-database"
  const stateStore = {
    ...tablePropsInit,
    ...JSON.parse(localStorage.getItem(OPTION_KEY) || "0"),
  }
  const [tableProps, changeTableProps] = useState(stateStore)

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
            // if (selectedRowIds) {
            selectedRowIds.splice(0, selectedRowIds.length)
            // }
            if (selectedRowIds.length < 1) {
            }
          }
        }}
      />
    )
  }
  const dispatch = (action) => {
    changeTableProps((prevState) => {
      const newState = kaReducer(prevState, action)
      const { data, ...settingsWithoutData } = newState
      localStorage.setItem(OPTION_KEY, JSON.stringify(settingsWithoutData))
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

  // const openImportModal = () => {
  //   setImportModal({ open: true })
  // }
  // const openExportModal = () => {
  //   setExportModal({ open: true })
  // }

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
    formData.append("importfile", selectedFile)
    axios
      .post(route("zipcode.data.import"), formData)
      .then((res) => {
        setSelectedFile(null)
        setLoading(false)
        if (res.status === 200) {
          setMainData(res.data)
          setImportModal({ open: false })
          setResponse("Imported Successfully")
          setOpen(true)
        } else {
          setResponse("Import failed")
        }
      })
      .catch((err) => { })
  }

  const triggerExportLink = (link) => {
    return window.open(link)
  }

  const baseUrl = window.location.origin
  const exportHandler = (e) => {
    e.preventDefault()
    setLoading(true)
    axios
      .get(`${baseUrl}/zipcode-data-export/${type}`)
      .then((res) => {
        setLoading(false)
        if (res.status === 200) {
          setExportModal({ open: false })
          triggerExportLink(res.request.responseURL)
          setResponse("Exported Successfully")
          setOpen(true)
        } else {
          setResponse("Exporting failed")
        }
      })
      .catch((err) => {
        setLoading(false)
      })
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
      document.removeEventListener("mousedown", checkIfClickedOutside)
    }
  }, [showColumns])


console.log(tableProps)
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

  const getSearchingData = async (data) => {
    setCurerentPage(data)
    dispatch(showLoading())
    await axios.get('zipcode-data?page=' + data.page + '&itemPerPage=' + itemPerPage + '&filteredValue=' + JSON.stringify(filterValue)).then(res => {
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


  return (
    <>
      <Helmet title="ZipCode Database" />
      <div className="selection-demo">
        <div className="table-top">
          <div className="top-left">
            <div className="columns-show-hide" onClick={handleColumns}>
              <img
                src={eyeIcon}
                alt="search"
                onBlur={hideCoumnSettings}
              ></img>
            </div>
            {/* <Button
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
              onClick={openExportModal}
              disabled={allZipcodes == ""}
            >
              Export
            </Button> */}
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
            noDataRow: {
              content: () => 'No Data Found'
            }
          }}
          dispatch={dispatch}
          extendedFilter={(data) => searchedData}
        />
        <div className="table-bottom">
        {console.log('tableProps',tableProps)}
        {console.log('zipCodeData',zipCodeData)}
          <select
            name="item-per-page"
            id="item-per-page"
            onChange={(e) => itemPerPageHandleChange(e)}
          >
            <option value="10" selected="">10</option>
            <option value="20" selected="">20</option>
            <option value="50" selected="">50</option>
            <option value="100" selected="">100</option>
          </select>
          <Pagination changePage={getSearchingData} data={zipCodeData} />
        </div>

        <Snackbar
          open={open}
          autoHideDuration={3000}
          onClose={handleClose}
          className={classes.snackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert severity="success">{response}</Alert>
        </Snackbar>

        <NormalModal
          open={importModal.open}
          setOpen={setImportModal}
          width={"500px"}
          title={""}
        >
          <div className={classes.import}>
            <input
              id="importfile"
              type="file"
              name="importfile"
              onChange={handleImportChange}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={importHandler}
              disabled={!selectedFile}
            >
              {loading ? (
                <CircularProgress color="inherit" thickness={3} size="1.5rem" />
              ) : (
                "Next"
              )}
            </Button>
          </div>
        </NormalModal>

        <NormalModal
          open={exportModal.open}
          setOpen={setExportModal}
          width={"500px"}
          title={""}
        >
          <div className={classes.import}>
            <FormLabel component="legend">Select Type</FormLabel>
            <RadioGroup
              aria-label="type"
              name="type"
              value={type}
              onChange={handleExportChange}
            >
              <FormControlLabel value="xlsx" control={<Radio />} label="XLSX" />
              <FormControlLabel value="csv" control={<Radio />} label="CSV" />
              <FormControlLabel value="xls" control={<Radio />} label="XLS" />
              <FormControlLabel value="tsv" control={<Radio />} label="TSV" />
            </RadioGroup>
            <Button variant="contained" color="primary" onClick={exportHandler}>
              {loading ? (
                <CircularProgress color="inherit" thickness={3} size="1.5rem" />
              ) : (
                "Next"
              )}
            </Button>
          </div>
        </NormalModal>
      </div>
    </>
  )
}

ZipcodeDatabase.layout = (page) => (
  <Layout title="Zipcode Database">{page}</Layout>
)
export default ZipcodeDatabase
