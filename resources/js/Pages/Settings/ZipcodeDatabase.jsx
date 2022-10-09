import Layout from '../Layout/Layout'
import React, { useEffect, useState, useRef } from 'react'
import { kaReducer, Table } from 'ka-table'
import { DataType, SortingMode } from 'ka-table/enums'
import { usePage } from '@inertiajs/inertia-react'
import FilterControl from 'react-filter-control'
import 'ka-table/style.scss'
import { hideLoading, showLoading } from 'ka-table/actionCreators'
import Search from '@/Components/Icons/Search.jsx'
import Eye from '@/Components/Icons/Eye.jsx'
import Cancel from '@/Components/Icons/Cancel.jsx'
import {
  makeStyles,
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
import handleSelects from '@/Helpers/HandleSelects'

const useStyles = makeStyles(() => ({
  button: {
    width: 'auto',
    textTransform: 'capitalize',
    fontSize: '14px',
  },
}))

export const fields = [
  {
    caption: 'NPA',
    name: 'NPA',
    operators: [
      {
        caption: 'Contains',
        name: 'contains',
      },
      {
        caption: 'Not Contains',
        name: 'doesNotContain',
      },
      {
        caption: 'Is Empty',
        name: 'isEmpty',
      },
      {
        caption: 'Is Not Empty',
        name: 'isNotEmpty',
      },
      {
        caption: 'Starts With',
        name: 'startswith',
      },
      {
        caption: 'Ends With',
        name: 'endsWith',
      },
      {
        caption: 'Is',
        name: 'is',
      },
      {
        caption: 'Is Not',
        name: 'isnot',
      },
    ],
  },
  {
    caption: 'NXX',
    name: 'NXX',
    operators: [
      {
        caption: 'Contains',
        name: 'contains',
      },
      {
        caption: 'Not Contains',
        name: 'doesNotContain',
      },
      {
        caption: 'Is Empty',
        name: 'isEmpty',
      },
      {
        caption: 'Is Not Empty',
        name: 'isNotEmpty',
      },
      {
        caption: 'Starts With',
        name: 'startswith',
      },
      {
        caption: 'Ends With',
        name: 'endsWith',
      },
      {
        caption: 'Is',
        name: 'is',
      },
      {
        caption: 'Is Not',
        name: 'isnot',
      },
    ],
  },
  {
    caption: 'NPANXX',
    name: 'NPANXX',
    operators: [
      {
        caption: 'Contains',
        name: 'contains',
      },
      {
        caption: 'Not Contains',
        name: 'doesNotContain',
      },
      {
        caption: 'Is Empty',
        name: 'isEmpty',
      },
      {
        caption: 'Is Not Empty',
        name: 'isNotEmpty',
      },
      {
        caption: 'Starts With',
        name: 'startswith',
      },
      {
        caption: 'Ends With',
        name: 'endsWith',
      },
      {
        caption: 'Is',
        name: 'is',
      },
      {
        caption: 'Is Not',
        name: 'isnot',
      },
    ],
  },
  {
    caption: 'ZipCode',
    name: 'ZipCode',
    operators: [
      {
        caption: 'Contains',
        name: 'contains',
      },
      {
        caption: 'Not Contains',
        name: 'doesNotContain',
      },
      {
        caption: 'Is Empty',
        name: 'isEmpty',
      },
      {
        caption: 'Is Not Empty',
        name: 'isNotEmpty',
      },
      {
        caption: 'Starts With',
        name: 'startswith',
      },
      {
        caption: 'Ends With',
        name: 'endsWith',
      },
      {
        caption: 'Is',
        name: 'is',
      },
      {
        caption: 'Is Not',
        name: 'isnot',
      },
    ],
  },
  {
    caption: 'State',
    name: 'State',
    operators: [
      {
        caption: 'Contains',
        name: 'contains',
      },
      {
        caption: 'Not Contains',
        name: 'doesNotContain',
      },
      {
        caption: 'Is Empty',
        name: 'isEmpty',
      },
      {
        caption: 'Is Not Empty',
        name: 'isNotEmpty',
      },
      {
        caption: 'Starts With',
        name: 'startswith',
      },
      {
        caption: 'Ends With',
        name: 'endsWith',
      },
      {
        caption: 'Is',
        name: 'is',
      },
      {
        caption: 'Is Not',
        name: 'isnot',
      },
    ],
  },
  {
    caption: 'City',
    name: 'City',
    operators: [
      {
        caption: 'Contains',
        name: 'contains',
      },
      {
        caption: 'Not Contains',
        name: 'doesNotContain',
      },
      {
        caption: 'Is Empty',
        name: 'isEmpty',
      },
      {
        caption: 'Is Not Empty',
        name: 'isNotEmpty',
      },
      {
        caption: 'Starts With',
        name: 'startswith',
      },
      {
        caption: 'Ends With',
        name: 'endsWith',
      },
      {
        caption: 'Is',
        name: 'is',
      },
      {
        caption: 'Is Not',
        name: 'isnot',
      },
    ],
  },
  {
    caption: 'County',
    name: 'County',
    operators: [
      {
        caption: 'Contains',
        name: 'contains',
      },
      {
        caption: 'Not Contains',
        name: 'doesNotContain',
      },
      {
        caption: 'Is Empty',
        name: 'isEmpty',
      },
      {
        caption: 'Is Not Empty',
        name: 'isNotEmpty',
      },
      {
        caption: 'Starts With',
        name: 'startswith',
      },
      {
        caption: 'Ends With',
        name: 'endsWith',
      },
      {
        caption: 'Is',
        name: 'is',
      },
      {
        caption: 'Is Not',
        name: 'isnot',
      },
    ],
  },
  {
    caption: 'CountyPop',
    name: 'CountyPop',
    operators: [
      {
        caption: 'Contains',
        name: 'contains',
      },
      {
        caption: 'Not Contains',
        name: 'doesNotContain',
      },
      {
        caption: 'Is Empty',
        name: 'isEmpty',
      },
      {
        caption: 'Is Not Empty',
        name: 'isNotEmpty',
      },
      {
        caption: 'Starts With',
        name: 'startswith',
      },
      {
        caption: 'Ends With',
        name: 'endsWith',
      },
      {
        caption: 'Is',
        name: 'is',
      },
      {
        caption: 'Is Not',
        name: 'isnot',
      },
    ],
  },
  {
    caption: 'ZipCodeCount',
    name: 'ZipCodeCount',
    operators: [
      {
        caption: 'Contains',
        name: 'contains',
      },
      {
        caption: 'Not Contains',
        name: 'doesNotContain',
      },
      {
        caption: 'Is Empty',
        name: 'isEmpty',
      },
      {
        caption: 'Is Not Empty',
        name: 'isNotEmpty',
      },
      {
        caption: 'Starts With',
        name: 'startswith',
      },
      {
        caption: 'Ends With',
        name: 'endsWith',
      },
      {
        caption: 'Is',
        name: 'is',
      },
      {
        caption: 'Is Not',
        name: 'isnot',
      },
    ],
  },
  {
    caption: 'ZipCodeFreq',
    name: 'ZipCodeFreq',
    operators: [
      {
        caption: 'Contains',
        name: 'contains',
      },
      {
        caption: 'Not Contains',
        name: 'doesNotContain',
      },
      {
        caption: 'Is Empty',
        name: 'isEmpty',
      },
      {
        caption: 'Is Not Empty',
        name: 'isNotEmpty',
      },
      {
        caption: 'Starts With',
        name: 'startswith',
      },
      {
        caption: 'Ends With',
        name: 'endsWith',
      },
      {
        caption: 'Is',
        name: 'is',
      },
      {
        caption: 'Is Not',
        name: 'isnot',
      },
    ],
  },
  {
    caption: 'Latitude',
    name: 'Latitude',
    operators: [
      {
        caption: 'Contains',
        name: 'contains',
      },
      {
        caption: 'Not Contains',
        name: 'doesNotContain',
      },
      {
        caption: 'Is Empty',
        name: 'isEmpty',
      },
      {
        caption: 'Is Not Empty',
        name: 'isNotEmpty',
      },
      {
        caption: 'Starts With',
        name: 'startswith',
      },
      {
        caption: 'Ends With',
        name: 'endsWith',
      },
      {
        caption: 'Is',
        name: 'is',
      },
      {
        caption: 'Is Not',
        name: 'isnot',
      },
    ],
  },
  {
    caption: 'Longitude',
    name: 'Longitude',
    operators: [
      {
        caption: 'Contains',
        name: 'contains',
      },
      {
        caption: 'Not Contains',
        name: 'doesNotContain',
      },
      {
        caption: 'Is Empty',
        name: 'isEmpty',
      },
      {
        caption: 'Is Not Empty',
        name: 'isNotEmpty',
      },
      {
        caption: 'Starts With',
        name: 'startswith',
      },
      {
        caption: 'Ends With',
        name: 'endsWith',
      },
      {
        caption: 'Is',
        name: 'is',
      },
      {
        caption: 'Is Not',
        name: 'isnot',
      },
    ],
  },
  {
    caption: 'TimeZone',
    name: 'TimeZone',
    operators: [
      {
        caption: 'Contains',
        name: 'contains',
      },
      {
        caption: 'Not Contains',
        name: 'doesNotContain',
      },
      {
        caption: 'Is Empty',
        name: 'isEmpty',
      },
      {
        caption: 'Is Not Empty',
        name: 'isNotEmpty',
      },
      {
        caption: 'Starts With',
        name: 'startswith',
      },
      {
        caption: 'Ends With',
        name: 'endsWith',
      },
      {
        caption: 'Is',
        name: 'is',
      },
      {
        caption: 'Is Not',
        name: 'isnot',
      },
    ],
  },
  {
    caption: 'ObservesDST',
    name: 'ObservesDST',
    operators: [
      {
        caption: 'Contains',
        name: 'contains',
      },
      {
        caption: 'Not Contains',
        name: 'doesNotContain',
      },
      {
        caption: 'Is Empty',
        name: 'isEmpty',
      },
      {
        caption: 'Is Not Empty',
        name: 'isNotEmpty',
      },
      {
        caption: 'Starts With',
        name: 'startswith',
      },
      {
        caption: 'Ends With',
        name: 'endsWith',
      },
      {
        caption: 'Is',
        name: 'is',
      },
      {
        caption: 'Is Not',
        name: 'isnot',
      },
    ],
  },
  {
    caption: 'NXXUseType',
    name: 'NXXUseType',
    operators: [
      {
        caption: 'Contains',
        name: 'contains',
      },
      {
        caption: 'Not Contains',
        name: 'doesNotContain',
      },
      {
        caption: 'Is Empty',
        name: 'isEmpty',
      },
      {
        caption: 'Is Not Empty',
        name: 'isNotEmpty',
      },
      {
        caption: 'Starts With',
        name: 'startswith',
      },
      {
        caption: 'Ends With',
        name: 'endsWith',
      },
      {
        caption: 'Is',
        name: 'is',
      },
      {
        caption: 'Is Not',
        name: 'isnot',
      },
    ],
  },
  {
    caption: 'NXXIntroVersion',
    name: 'NXXIntroVersion',
    operators: [
      {
        caption: 'Contains',
        name: 'contains',
      },
      {
        caption: 'Not Contains',
        name: 'doesNotContain',
      },
      {
        caption: 'Is Empty',
        name: 'isEmpty',
      },
      {
        caption: 'Is Not Empty',
        name: 'isNotEmpty',
      },
      {
        caption: 'Starts With',
        name: 'startswith',
      },
      {
        caption: 'Ends With',
        name: 'endsWith',
      },
      {
        caption: 'Is',
        name: 'is',
      },
      {
        caption: 'Is Not',
        name: 'isnot',
      },
    ],
  },
  {
    caption: 'NPANew',
    name: 'NPANew',
    operators: [
      {
        caption: 'Contains',
        name: 'contains',
      },
      {
        caption: 'Not Contains',
        name: 'doesNotContain',
      },
      {
        caption: 'Is Empty',
        name: 'isEmpty',
      },
      {
        caption: 'Is Not Empty',
        name: 'isNotEmpty',
      },
      {
        caption: 'Starts With',
        name: 'startswith',
      },
      {
        caption: 'Ends With',
        name: 'endsWith',
      },
      {
        caption: 'Is',
        name: 'is',
      },
      {
        caption: 'Is Not',
        name: 'isnot',
      },
    ],
  },
  {
    caption: 'FIPS',
    name: 'FIPS',
    operators: [
      {
        caption: 'Contains',
        name: 'contains',
      },
      {
        caption: 'Not Contains',
        name: 'doesNotContain',
      },
      {
        caption: 'Is Empty',
        name: 'isEmpty',
      },
      {
        caption: 'Is Not Empty',
        name: 'isNotEmpty',
      },
      {
        caption: 'Starts With',
        name: 'startswith',
      },
      {
        caption: 'Ends With',
        name: 'endsWith',
      },
      {
        caption: 'Is',
        name: 'is',
      },
      {
        caption: 'Is Not',
        name: 'isnot',
      },
    ],
  },
  {
    caption: 'Status',
    name: 'Status',
    operators: [
      {
        caption: 'Contains',
        name: 'contains',
      },
      {
        caption: 'Not Contains',
        name: 'doesNotContain',
      },
      {
        caption: 'Is Empty',
        name: 'isEmpty',
      },
      {
        caption: 'Is Not Empty',
        name: 'isNotEmpty',
      },
      {
        caption: 'Starts With',
        name: 'startswith',
      },
      {
        caption: 'Ends With',
        name: 'endsWith',
      },
      {
        caption: 'Is',
        name: 'is',
      },
      {
        caption: 'Is Not',
        name: 'isnot',
      },
    ],
  },
  {
    caption: 'LATA',
    name: 'LATA',
    operators: [
      {
        caption: 'Contains',
        name: 'contains',
      },
      {
        caption: 'Not Contains',
        name: 'doesNotContain',
      },
      {
        caption: 'Is Empty',
        name: 'isEmpty',
      },
      {
        caption: 'Is Not Empty',
        name: 'isNotEmpty',
      },
      {
        caption: 'Starts With',
        name: 'startswith',
      },
      {
        caption: 'Ends With',
        name: 'endsWith',
      },
      {
        caption: 'Is',
        name: 'is',
      },
      {
        caption: 'Is Not',
        name: 'isnot',
      },
    ],
  },
  {
    caption: 'Overlay',
    name: 'Overlay',
    operators: [
      {
        caption: 'Contains',
        name: 'contains',
      },
      {
        caption: 'Not Contains',
        name: 'doesNotContain',
      },
      {
        caption: 'Is Empty',
        name: 'isEmpty',
      },
      {
        caption: 'Is Not Empty',
        name: 'isNotEmpty',
      },
      {
        caption: 'Starts With',
        name: 'startswith',
      },
      {
        caption: 'Ends With',
        name: 'endsWith',
      },
      {
        caption: 'Is',
        name: 'is',
      },
      {
        caption: 'Is Not',
        name: 'isnot',
      },
    ],
  },
  {
    caption: 'RateCenter',
    name: 'RateCenter',
    operators: [
      {
        caption: 'Contains',
        name: 'contains',
      },
      {
        caption: 'Not Contains',
        name: 'doesNotContain',
      },
      {
        caption: 'Is Empty',
        name: 'isEmpty',
      },
      {
        caption: 'Is Not Empty',
        name: 'isNotEmpty',
      },
      {
        caption: 'Starts With',
        name: 'startswith',
      },
      {
        caption: 'Ends With',
        name: 'endsWith',
      },
      {
        caption: 'Is',
        name: 'is',
      },
      {
        caption: 'Is Not',
        name: 'isnot',
      },
    ],
  },
  {
    caption: 'SwitchCLLI',
    name: 'SwitchCLLI',
    operators: [
      {
        caption: 'Contains',
        name: 'contains',
      },
      {
        caption: 'Not Contains',
        name: 'doesNotContain',
      },
      {
        caption: 'Is Empty',
        name: 'isEmpty',
      },
      {
        caption: 'Is Not Empty',
        name: 'isNotEmpty',
      },
      {
        caption: 'Starts With',
        name: 'startswith',
      },
      {
        caption: 'Ends With',
        name: 'endsWith',
      },
      {
        caption: 'Is',
        name: 'is',
      },
      {
        caption: 'Is Not',
        name: 'isnot',
      },
    ],
  },
  {
    caption: 'MSA_CBSA',
    name: 'MSA_CBSA',
    operators: [
      {
        caption: 'Contains',
        name: 'contains',
      },
      {
        caption: 'Not Contains',
        name: 'doesNotContain',
      },
      {
        caption: 'Is Empty',
        name: 'isEmpty',
      },
      {
        caption: 'Is Not Empty',
        name: 'isNotEmpty',
      },
      {
        caption: 'Starts With',
        name: 'startswith',
      },
      {
        caption: 'Ends With',
        name: 'endsWith',
      },
      {
        caption: 'Is',
        name: 'is',
      },
      {
        caption: 'Is Not',
        name: 'isnot',
      },
    ],
  },
  {
    caption: 'MSA_CBSA_CODE',
    name: 'MSA_CBSA_CODE',
    operators: [
      {
        caption: 'Contains',
        name: 'contains',
      },
      {
        caption: 'Not Contains',
        name: 'doesNotContain',
      },
      {
        caption: 'Is Empty',
        name: 'isEmpty',
      },
      {
        caption: 'Is Not Empty',
        name: 'isNotEmpty',
      },
      {
        caption: 'Starts With',
        name: 'startswith',
      },
      {
        caption: 'Ends With',
        name: 'endsWith',
      },
      {
        caption: 'Is',
        name: 'is',
      },
      {
        caption: 'Is Not',
        name: 'isnot',
      },
    ],
  },
  {
    caption: 'OCN',
    name: 'OCN',
    operators: [
      {
        caption: 'Contains',
        name: 'contains',
      },
      {
        caption: 'Not Contains',
        name: 'doesNotContain',
      },
      {
        caption: 'Is Empty',
        name: 'isEmpty',
      },
      {
        caption: 'Is Not Empty',
        name: 'isNotEmpty',
      },
      {
        caption: 'Starts With',
        name: 'startswith',
      },
      {
        caption: 'Ends With',
        name: 'endsWith',
      },
      {
        caption: 'Is',
        name: 'is',
      },
      {
        caption: 'Is Not',
        name: 'isnot',
      },
    ],
  },
  {
    caption: 'Company',
    name: 'Company',
    operators: [
      {
        caption: 'Contains',
        name: 'contains',
      },
      {
        caption: 'Not Contains',
        name: 'doesNotContain',
      },
      {
        caption: 'Is Empty',
        name: 'isEmpty',
      },
      {
        caption: 'Is Not Empty',
        name: 'isNotEmpty',
      },
      {
        caption: 'Starts With',
        name: 'startswith',
      },
      {
        caption: 'Ends With',
        name: 'endsWith',
      },
      {
        caption: 'Is',
        name: 'is',
      },
      {
        caption: 'Is Not',
        name: 'isnot',
      },
    ],
  },
  {
    caption: 'CoverageAreaName',
    name: 'CoverageAreaName',
    operators: [
      {
        caption: 'Contains',
        name: 'contains',
      },
      {
        caption: 'Not Contains',
        name: 'doesNotContain',
      },
      {
        caption: 'Is Empty',
        name: 'isEmpty',
      },
      {
        caption: 'Is Not Empty',
        name: 'isNotEmpty',
      },
      {
        caption: 'Starts With',
        name: 'startswith',
      },
      {
        caption: 'Ends With',
        name: 'endsWith',
      },
      {
        caption: 'Is',
        name: 'is',
      },
      {
        caption: 'Is Not',
        name: 'isnot',
      },
    ],
  },
  {
    caption: 'Flags',
    name: 'Flags',
    operators: [
      {
        caption: 'Contains',
        name: 'contains',
      },
      {
        caption: 'Not Contains',
        name: 'doesNotContain',
      },
      {
        caption: 'Is Empty',
        name: 'isEmpty',
      },
      {
        caption: 'Is Not Empty',
        name: 'isNotEmpty',
      },
      {
        caption: 'Starts With',
        name: 'startswith',
      },
      {
        caption: 'Ends With',
        name: 'endsWith',
      },
      {
        caption: 'Is',
        name: 'is',
      },
      {
        caption: 'Is Not',
        name: 'isnot',
      },
    ],
  },
  {
    caption: 'WeightedLat',
    name: 'WeightedLat',
    operators: [
      {
        caption: 'Contains',
        name: 'contains',
      },
      {
        caption: 'Not Contains',
        name: 'doesNotContain',
      },
      {
        caption: 'Is Empty',
        name: 'isEmpty',
      },
      {
        caption: 'Is Not Empty',
        name: 'isNotEmpty',
      },
      {
        caption: 'Starts With',
        name: 'startswith',
      },
      {
        caption: 'Ends With',
        name: 'endsWith',
      },
      {
        caption: 'Is',
        name: 'is',
      },
      {
        caption: 'Is Not',
        name: 'isnot',
      },
    ],
  },
  {
    caption: 'WeightedLon',
    name: 'WeightedLon',
    operators: [
      {
        caption: 'Contains',
        name: 'contains',
      },
      {
        caption: 'Not Contains',
        name: 'doesNotContain',
      },
      {
        caption: 'Is Empty',
        name: 'isEmpty',
      },
      {
        caption: 'Is Not Empty',
        name: 'isNotEmpty',
      },
      {
        caption: 'Starts With',
        name: 'startswith',
      },
      {
        caption: 'Ends With',
        name: 'endsWith',
      },
      {
        caption: 'Is',
        name: 'is',
      },
      {
        caption: 'Is Not',
        name: 'isnot',
      },
    ],
  },
]

export const groups = [
  {
    caption: 'And',
    name: 'and',
  },
  {
    caption: 'Or',
    name: 'or',
  },
]
export const filter = {
  groupName: 'and',
  items: [
    {
      field: 'ZipCode',
      operator: 'contains',
      value: '',
    },
  ],
}

const ZipcodeDatabase = () => {
  const classes = useStyles()
  const { allZipcodes, columnsData } = usePage().props
  const [showColumns, setShowColumns] = useState(false)
  const [selectedRowIds, setSelectedRowIds] = useState([])
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
  const [tableToolbar, setTableToolbar] = useState(false)

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

  const columns = [
    {
      key: 'NPA',
      title: 'NPA',
      dataType: DataType.Number,
      style: { width: 100 },
      visible: true,
    },
    {
      key: 'NXX',
      title: 'NXX',
      dataType: DataType.String,
      style: { width: 150 },
      visible: true,
    },
    {
      key: 'NPANXX',
      title: 'NPANXX',
      dataType: DataType.String,
      style: { width: 130 },
      visible: true,
    },
    {
      key: 'ZipCode',
      title: 'ZipCode',
      dataType: DataType.String,
      style: { width: 160 },
      visible: true,
    },
    {
      key: 'State',
      title: 'State',
      dataType: DataType.String,
      style: { width: 130 },
      visible: true,
    },
    {
      key: 'City',
      title: 'City',
      dataType: DataType.String,
      style: { width: 210 },
      visible: true,
    },
    {
      key: 'County',
      title: 'County',
      dataType: DataType.String,
      style: { width: 170 },
      visible: true,
    },
    {
      key: 'CountyPop',
      title: 'CountyPop',
      dataType: DataType.String,
      style: { width: 150 },
      visible: true,
    },
    {
      key: 'ZipCodeCount',
      title: 'ZipCodeCount',
      dataType: DataType.String,
      style: { width: 190 },
      visible: true,
    },
    {
      key: 'ZipCodeFreq',
      title: 'ZipCodeFreq',
      dataType: DataType.String,
      style: { width: 150 },
      visible: true,
    },
    {
      key: 'Latitude',
      title: 'Latitude',
      dataType: DataType.String,
      style: { width: 170 },
      visible: true,
    },
    {
      key: 'Longitude',
      title: 'Longitude',
      dataType: DataType.String,
      style: { width: 200 },
      visible: true,
    },
    {
      key: 'TimeZone',
      title: 'TimeZone',
      dataType: DataType.String,
      style: { width: 140 },
      visible: true,
    },
    {
      key: 'ObservesDST',
      title: 'ObservesDST',
      dataType: DataType.String,
      style: { width: 160 },
      visible: true,
    },
    {
      key: 'NXXUseType',
      title: 'NXXUseType',
      dataType: DataType.String,
      style: { width: 150 },
      visible: true,
    },
    {
      key: 'NXXIntroVersion',
      title: 'NXXIntroVersion',
      dataType: DataType.String,
      style: { width: 180 },
      visible: true,
    },
    {
      key: 'NPANew',
      title: 'NPANew',
      dataType: DataType.Number,
      style: { width: 130 },
      visible: true,
    },
    {
      key: 'FIPS',
      title: 'FIPS',
      dataType: DataType.String,
      style: { width: 160 },
      visible: true,
    },
    {
      key: 'LATA',
      title: 'LATA',
      dataType: DataType.String,
      style: { width: 130 },
      visible: true,
    },
    {
      key: 'Overlay',
      title: 'Overlay',
      dataType: DataType.String,
      style: { width: 160 },
      visible: true,
    },
    {
      key: 'RateCenter',
      title: 'RateCenter',
      dataType: DataType.String,
      style: { width: 180 },
      visible: true,
    },
    {
      key: 'SwitchCLLI',
      title: 'SwitchCLLI',
      dataType: DataType.String,
      style: { width: 130 },
      visible: true,
    },
    {
      key: 'MSA_CBSA',
      title: 'MSA_CBSA',
      dataType: DataType.String,
      style: { width: 400 },
      visible: true,
    },
    {
      key: 'MSA_CBSA_CODE',
      title: 'MSA_CBSA_CODE',
      dataType: DataType.String,
      style: { width: 190 },
      visible: true,
    },
    {
      key: 'OCN',
      title: 'OCN',
      dataType: DataType.String,
      style: { width: 180 },
      visible: true,
    },
    {
      key: 'Company',
      title: 'Company',
      dataType: DataType.String,
      style: { width: 360 },
      visible: true,
    },
    {
      key: 'CoverageAreaName',
      title: 'CoverageAreaName',
      dataType: DataType.String,
      style: { width: 240 },
      visible: true,
    },
    {
      key: 'Flags',
      title: 'Flags',
      dataType: DataType.String,
      style: { width: 200 },
      visible: true,
    },
    {
      key: 'WeightedLat',
      title: 'WeightedLat',
      dataType: DataType.String,
      style: { width: 200 },
      visible: true,
    },
    {
      key: 'WeightedLon',
      title: 'WeightedLon',
      dataType: DataType.String,
      style: { width: 180 },
      visible: true,
    },
  ]

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
    handleSelects({ action, selectedRowIds, setSelectedRowIds, tableProps, setTableToolbar })
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
            cell: {
              content: (props) => {
                switch (props.column.key) {
                  case 'drag':
                    return (
                      <img
                        style={{ cursor: 'move' }}
                        src="https://komarovalexander.github.io/ka-table/static/icons/draggable.svg"
                        alt="draggable"
                      />
                    )
                }
              },
            },
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
