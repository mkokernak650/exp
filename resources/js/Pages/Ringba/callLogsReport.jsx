import Layout from "../Layout/Layout";
import M from "materialize-css";
import React, { useEffect, useState, useRef } from "react";
import { kaReducer, Table } from "ka-table";
import {
  DataType,
  SortingMode,
  PagingPosition,
  EditingMode,
  ActionType,
} from "ka-table/enums";
import { kaPropsUtils } from "ka-table/utils";
import {
  deselectAllFilteredRows,
  deselectRow,
  selectAllFilteredRows,
  selectRow,
  selectRowsRange,
  hideColumn,
  showColumn,
} from "ka-table/actionCreators";
import CellEditorBoolean from "ka-table/Components/CellEditorBoolean/CellEditorBoolean";
import FilterControl from "react-filter-control";
import { filterData } from "../filterData";
import "ka-table/style.scss";
import { usePage } from "@inertiajs/inertia-react";
import search from "../../../images/search.svg";
import eyeIcon from "../../../images/eyeIcon.svg";
import closeNav from "../../../images/closeNav.svg";
import Edit from "../../../images/three-dots.svg";
import DeleteIcon from "@material-ui/icons/Delete";

import {
  Button,
  makeStyles,
  CircularProgress,
  IconButton,
  Checkbox,
  Tooltip,
} from "@material-ui/core";
import axios from "axios";
import { Helmet } from "react-helmet";
import ConfirmModal from "../../Shared/ConfirmModal";
import SnackBar from "../../Shared/SnackBar";
import PulseLoader from "react-spinners/PulseLoader";
import { emptyCheckbox } from "../../Helpers/emptyCheckbox";

const useStyles = makeStyles(() => ({
  button: {
    width: "auto",
    textTransform: "capitalize",
    fontSize: "14px",
  },
}));

export const fields = [
  {
    caption: "SN",
    name: "SN",
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
    caption: "Call Date",
    name: "Call_Date",
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
    caption: "Has Annotation",
    name: "Has_Annotation",
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
    caption: "Annotation Tag",
    name: "Annotation_Tag",
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
    caption: "Call Status",
    name: "Call_Status",
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
    caption: "Duplicate Call",
    name: "Duplicate_Call",
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
    caption: "Inbound Id",
    name: "Inbound_Id",
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
    caption: "Affiliate",
    name: "Affiliate",
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
    caption: "Market",
    name: "Market",
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
    caption: "Campaign",
    name: "Campaign",
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
    caption: "Inbound",
    name: "Inbound",
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
    caption: "Dialed",
    name: "Dialed",
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
    caption: "Type",
    name: "Type",
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
    caption: "Customer",
    name: "Customer",
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
    caption: "Target",
    name: "Target",
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
    caption: "Target Description",
    name: "Target_Description",
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
    caption: "Source Hangup",
    name: "Source_Hangup",
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
    caption: "Time To Call",
    name: "Time_To_Call",
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
    caption: "call Length In Seconds",
    name: "call_Length_In_Seconds",
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
    caption: "Revenue",
    name: "Revenue",
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
    caption: "Conn.Duration",
    name: "Conn_Duration",
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
    caption: "Time",
    name: "Call_Date_Time",
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
    caption: "Payout",
    name: "Payout",
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
    caption: "Total_Cost",
    name: "Total Cost",
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
    caption: "Profit",
    name: "Profit",
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
    caption: "Zipcode",
    name: "Zipcode",
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
];

export const groups = [
  {
    caption: "And",
    name: "and",
  },
  {
    caption: "Or",
    name: "or",
  },
];
export const filter = {
  groupName: "and",
  items: [
    {
      field: "SN",
      operator: "isNotEmpty",
    },
  ],
};

const CallLogsReport = () => {
  const classes = useStyles();
  const { allCallLogs } = usePage().props;
  const [showColumns, setShowColumns] = useState(false);
  const [tableToolbar, setTableToolbar] = useState(false);
  const [selectedRowIds, setselectedRowIds] = useState([]);
  const [inboundIds, setInbounIds] = useState([]);
  const [response, setResponse] = useState();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [annotationLoading, setAnnotationLoading] = useState(false);
  const [editData, setEditData] = useState([]);
  const [sn, setSn] = useState("");
  const [showRevenueClearModal, setShowRevenueClearModal] = useState({
    open: false,
  });
  const [showDeleteModal, setShowDeleteModal] = useState({ open: false });
  const [openRowFunctionalities, setOpenRowFunctionalities] = useState(false);
  const rowFunctionalitiesRef = useRef();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const showColumnRef = useRef();
  let [color, setColor] = useState("#36D7B7");

  const style = {
    top: position.y < 650 ? position.y - 79 : position.y - 275,
  };

  const rowFunctionalitiesPosition = (e) => {
    if (!openRowFunctionalities) {
      setPosition({ x: e.screenX, y: e.screenY });
    }
  };

  const dataArray = allCallLogs.map((item, index) => {
    return {
      edit: item.id,
      sl: index + 1,
      SN: item.SN,
      Call_Date: item.Call_Date_Time,
      Has_Annotation: item.Has_Annotation,
      Annotation_Tag: item.Annotation_Tag,
      Call_Status: item.call_Logs_status,
      Duplicate_Call: item.Duplicate_Call,
      Recording_Url: item.Recording_Url,
      Inbound_Id: item.Inbound_Id,
      Affiliate: item.Affiliate,
      Market: item.Market,
      Campaign: item.Campaign,
      Inbound: item.Inbound,
      Dialed: item.Dialed,
      Type: item.Type,
      Customer: item.Customer,
      Target: item.Target,
      Target_Description: item.Target_Description,
      Source_Hangup: item.Source_Hangup,
      Time_To_Call: item.Time_To_Call,
      Call_Length_In_Seconds: item.call_Length_In_Seconds,
      Revenue: item.Revenue,
      Conn_Duration: item.Conn_Duration,
      Time: item.Call_Date_Time,
      Payout: item.payoutAmount,
      Total_Cost: item.Total_Cost,
      Profit: item.Profit,
      City: item.City,
      State: item.State,
      Zipcode: item.Zipcode,
      id: item.id,
      key: index,
    };
  });

  const tablePropsInit = {
    columns: [
      {
        key: "edit",
        style: { width: 10 },
      },
      {
        key: "selection-cell",
        style: { width: 80 },
      },
      {
        key: "sl",
        title: "SL",
        dataType: DataType.Number,
        style: { width: 100 },
      },
      {
        key: "SN",
        title: "SN",
        dataType: DataType.String,
        style: { width: 130 },
      },
      {
        key: "Call_Date",
        title: "Call Date",
        dataType: DataType.String,
        style: { width: 200 },
      },
      {
        key: "Has_Annotation",
        title: "Has Annotation",
        dataType: DataType.String,
        style: { width: 160 },
      },
      {
        key: "Annotation_Tag",
        title: "Annotation Tag",
        dataType: DataType.String,
        style: { width: 350 },
      },
      {
        key: "Call_Status",
        title: "Call Status",
        dataType: DataType.String,
        style: { width: 130 },
      },
      {
        key: "Duplicate_Call",
        title: "Duplicate Call",
        dataType: DataType.String,
        style: { width: 150 },
      },
      {
        key: "Recording_Url",
        title: "Recording_Url",
        style: { width: 210 },
      },
      {
        key: "Inbound_Id",
        title: "Inbound Id",
        dataType: DataType.String,
        style: { width: 600 },
      },
      {
        key: "Affiliate",
        title: "Affiliate",
        dataType: DataType.String,
        style: { width: 240 },
      },
      {
        key: "Market",
        title: "Market",
        dataType: DataType.String,
        style: { width: 350 },
      },
      {
        key: "Campaign",
        title: "Campaign",
        dataType: DataType.String,
        style: { width: 200 },
      },
      {
        key: "Inbound",
        title: "Inbound",
        dataType: DataType.String,
        style: { width: 200 },
      },
      {
        key: "Dialed",
        title: "Dialed",
        dataType: DataType.String,
        style: { width: 200 },
      },
      {
        key: "Type",
        title: "Type",
        dataType: DataType.String,
        style: { width: 100 },
      },
      {
        key: "Customer",
        title: "Customer",
        dataType: DataType.String,
        style: { width: 240 },
      },
      {
        key: "Target",
        title: "Target",
        dataType: DataType.String,
        style: { width: 350 },
      },
      {
        key: "Target_Description",
        title: "Target Description",
        dataType: DataType.String,
        style: { width: 400 },
      },
      {
        key: "Source_Hangup",
        title: "Source/Hangup",
        dataType: DataType.String,
        style: { width: 240 },
      },
      {
        key: "Time_To_Call",
        title: "Time To Call",
        dataType: DataType.String,
        style: { width: 130 },
      },
      {
        key: "Call_Length_In_Seconds",
        title: "Call Length In Seconds",
        dataType: DataType.String,
        style: { width: 240 },
      },
      {
        key: "Revenue",
        title: "Revenue",
        dataType: DataType.String,
        style: { width: 120 },
      },
      {
        key: "Conn_Duration",
        title: "Conn.Duration",
        dataType: DataType.String,
        style: { width: 240 },
      },
      {
        key: "Time",
        title: "Time",
        dataType: DataType.String,
        style: { width: 220 },
      },
      {
        key: "Payout",
        title: "Payout",
        dataType: DataType.String,
        style: { width: 100 },
      },
      {
        key: "Total_Cost",
        title: "Total Cost",
        dataType: DataType.String,
        style: { width: 120 },
      },
      {
        key: "Profit",
        title: "Profit",
        dataType: DataType.String,
        style: { width: 120 },
      },
      {
        key: "City",
        title: "City",
        dataType: DataType.String,
        style: { width: 240 },
      },
      {
        key: "State",
        title: "State",
        dataType: DataType.String,
        style: { width: 240 },
      },
      {
        key: "Zipcode",
        title: "Zipcode",
        dataType: DataType.String,
        style: { width: 240 },
      },
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
          <div
            className="edit-icon"
            onClick={() => handleRowFunctionalities(value)}
          >
            <img src={Edit} alt="edit-icon"></img>
          </div>
        );
      }
      if (column.key === "Recording_Url") {
        return (
          <a target="_blank" href={value}>
            Recording URL
          </a>
        );
      }
    },
    // loading: {
    //   enabled: true,
    //   text: 'Loading data'
    // },
  };

  const OPTION_KEY = "call-logs-report";
  const stateStore = {
    ...tablePropsInit,
    ...JSON.parse(localStorage.getItem(OPTION_KEY) || "0"),
  };
  const [tableProps, changeTableProps] = useState(stateStore);

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
            dispatch(selectRowsRange(rowKeyValue, [...selectedRows].pop()));
          } else if (event.currentTarget.checked) {
            dispatch(selectRow(rowKeyValue));
            setTableToolbar(true);
            const id = parseInt(rowKeyValue);
            if (!selectedRowIds.includes(id)) {
              selectedRowIds.push(id);
            }
            const selectedRowData = tableProps.data.filter(
              (item) => item.id == id
            );
            inboundIds.push(selectedRowData[0].Inbound_Id);
          } else {
            dispatch(deselectRow(rowKeyValue));
            const id = parseInt(rowKeyValue);
            const itemIndx = selectedRowIds.indexOf(id);
            selectedRowIds.splice(itemIndx, 1);
            if (selectedRowIds.length < 1) {
              setTableToolbar(false);
            }
            const selectedRowData = tableProps.data.filter(
              (item) => item.id == id
            );
            const inboundIndx = selectedRowData.indexOf(
              selectedRowData.Inbound_Id
            );
            inboundIds.splice(inboundIndx, 1);
          }
        }}
      />
    );
  };
  const SelectionHeader = ({ dispatch, areAllRowsSelected }) => {
    return (
      <Checkbox
        checked={areAllRowsSelected}
        color="primary"
        onChange={(event) => {
          if (event.currentTarget.checked) {
            dispatch(selectAllFilteredRows()); // also available: selectAllVisibleRows(), selectAllRows()
            setTableToolbar(true);
            let i = 0;
            while (i < allCallLogs.length) {
              selectedRowIds.push(allCallLogs[i].id);
              inboundIds.push(allCallLogs[i].Inbound_Id);
              i++;
            }
          } else {
            dispatch(deselectAllFilteredRows()); // also available: deselectAllVisibleRows(), deselectAllRows()
            selectedRowIds.splice(0, selectedRowIds.length);
            inboundIds.splice(0, inboundIds.length);

            if (selectedRowIds.length < 1) {
              setTableToolbar(false);
            }
          }
        }}
      />
    );
  };

  const dispatch = (action) => {
    changeTableProps((prevState) => {
      const newState = kaReducer(prevState, action);
      const { data, ...settingsWithoutData } = newState;
      localStorage.setItem(OPTION_KEY, JSON.stringify(settingsWithoutData));
      return newState;
    });
  };
  const [filterValue, changeFilter] = useState(filter);
  const onFilterChanged = (newFilterValue) => {
    changeFilter(newFilterValue);
  };

  const [serachSidebar, setSearchSidebar] = useState(false);

  const handleSearch = () => {
    setSearchSidebar((prevState) => !prevState);
  };
  const handleColumns = () => {
    setShowColumns((prevState) => !prevState);
    setOpenRowFunctionalities(false);
  };
  const closeSidebar = () => {
    setSearchSidebar(false);
  };

  const deleteHandler = () => {
    axios
      .post("call-logs-delete", { selectedRowIds })
      .then((res) => {
        if (res.data.status_code === 200) {
          let filteredData = tableProps;
          const newData = filteredData.data.filter(
            (item) => !selectedRowIds.includes(item.id)
          );
          filteredData.data = newData;
          changeTableProps(filteredData);
          setselectedRowIds([]);
          setTableToolbar(false);
          setOpen(true);
          setResponse(res.data.msg);
          setShowDeleteModal({ open: false });
          emptyCheckbox("call-logs-report", tableProps, changeTableProps);
        } else {
          setOpen(true);
          setResponse(res.data.msg);
          setselectedRowIds([]);
          setInbounIds([]);
          setShowDeleteModal({ open: false });
          emptyCheckbox("call-logs-report", tableProps, changeTableProps);
        }
      })
      .catch((err) => {
        console.log(err);
        setTableToolbar(false);
        setselectedRowIds([]);
        setInbounIds([]);
        setShowDeleteModal({ open: false });
        emptyCheckbox("call-logs-report", tableProps, changeTableProps);
      });
  };

  const handlePending = (inboundIds) => {
    axios
      .post(route("add.pending.bill.call"), { inboundIds })
      .then((res) => {
        if (res.data.status_code === 200) {
          setResponse(res.data.msg);
          setOpen(true);
          let filteredData = tableProps;
          const newData = filteredData.data.filter(
            (item) => !inboundIds.includes(item.Inbound_Id)
          );
          filteredData.data = newData;
          changeTableProps(filteredData);
          setTableToolbar(false);
          setInbounIds([]);
          setselectedRowIds([]);
          setOpenRowFunctionalities(false);
        } else {
          setResponse(res.data.msg);
          setOpen(true);
          setInbounIds([]);
          setselectedRowIds([]);
          setOpenRowFunctionalities(false);
        }
      })
      .catch((err) => { });
  };

  const handleArchived = (inboundIds) => {
    axios
      .post(route("add.arichived.bill.call"), { inboundIds })
      .then((res) => {
        if (res.data.status_code === 200) {
          setResponse(res.data.msg);
          setOpen(true);
          let filteredData = tableProps;
          const newData = filteredData.data.filter(
            (item) => !inboundIds.includes(item.Inbound_Id)
          );
          filteredData.data = newData;
          changeTableProps(filteredData);
          setTableToolbar(false);
          setInbounIds([]);
          setselectedRowIds([]);
          setOpenRowFunctionalities(false);
        } else {
          setResponse(res.data.msg);
          setOpen(true);
          setInbounIds([]);
          setselectedRowIds([]);
        }
      })
      .catch((err) => { });
  };

  const handleUpdate = (inboundIds) => {
    setLoading(true);
    axios
      .post(route("update-data"), { inboundIds })
      .then((res) => {
        setLoading(false);
        if (res.status === 200) {
          setResponse("Successfully Updated");
          setOpen(true);
          let filteredData = tableProps;
          filterData.data = res.data;
          console.log(filteredData)
          changeTableProps(filteredData);
          setTableToolbar(false);
          setInbounIds([]);
          setselectedRowIds([]);
          setOpenRowFunctionalities(false);
          emptyCheckbox("call-logs-report", tableProps, changeTableProps);
        } else {
          setResponse(res.data.msg);
          setOpen(true);
          setInbounIds([]);
          setselectedRowIds([]);
          setOpenRowFunctionalities(false);
          emptyCheckbox("call-logs-report", tableProps, changeTableProps);
        }})

      .catch((err) => {
        emptyCheckbox("call-logs-report", tableProps, changeTableProps);
      });
  };
  const handleAnnotation = (inboundIds) => {
    setAnnotationLoading(true);
    axios
      .post(route("update.annotation"), { inboundIds })
      .then((res) => {
        setAnnotationLoading(false);
        if (res.status === 200) {
          setResponse("Successfully Updated");
          setOpen(true);
          let filteredData = tableProps;
          filterData.data = res.data;
          changeTableProps(filteredData);
          setTableToolbar(false);
          setInbounIds([]);
          setselectedRowIds([]);
          setOpenRowFunctionalities(false);
          emptyCheckbox("call-logs-report", tableProps, changeTableProps);
        } else {
          setResponse(res.data.msg);
          setOpen(true);
          setInbounIds([]);
          setselectedRowIds([]);
          emptyCheckbox("call-logs-report", tableProps, changeTableProps);
        }
      })
      .catch((err) => {
        emptyCheckbox("call-logs-report", tableProps, changeTableProps);
      });
  };

  const handleClear = (inboundIds) => {
    axios
      .post(route("calllogs.revenue.update"), { inboundIds })
      .then((res) => {
        if (res.status === 200) {
          setResponse("Successfully Updated");
          setOpen(true);
          let filteredData = tableProps;
          filteredData.data.filter((item, indx) => {
            if (item.Inbound_Id === editData[0]) {
              filteredData.data[indx].Revenue = "";
              filteredData.data[indx].Payout = "";
            }
          });
          setShowRevenueClearModal({ open: false });
          setOpenRowFunctionalities(false);
        } else {
          setResponse(res.data.msg);
          setOpen(true);
        }
      })
      .catch((err) => { });
  };
  const handleRevenueCloseModal = () => {
    setShowRevenueClearModal({ open: false });
    setOpenRowFunctionalities(false);
  };

  const handleRevenueOpenModal = () => {
    let filteredData = tableProps;
    filteredData.data.filter((item) => {
      if (item.Inbound_Id === editData[0]) {
        setSn(item.SN);
      }
    });
    setShowRevenueClearModal({ open: true });
  };
  const handleDeleteCloseModal = () => {
    setShowDeleteModal({ open: false });
    setOpenRowFunctionalities(false);
    setTableToolbar(false);
    setselectedRowIds([]);
    setInbounIds([]);
    emptyCheckbox("call-logs-report", tableProps, changeTableProps);
  };

  useEffect(() => {
    window.onload = function () {
      const storedData = JSON.parse(localStorage.getItem("call-logs-report"));
      if (storedData != null) {
        emptyCheckbox("call-logs-report", tableProps, changeTableProps);
      }
    };
  }, []);
  const handleDeleteOpenModal = () => {
    setShowDeleteModal({ open: true });
  };
  useEffect(() => M.AutoInit());

  const TableToolbar = () => {
    return (
      <div className="table-toolbar">
        <Tooltip title="Delete">
          <IconButton aria-label="delete" onClick={handleDeleteOpenModal}  >
            <DeleteIcon style={{ color: "#031b4e" }} />
          </IconButton>
        </Tooltip>

        <Button
          variant="contained"
          type="submit"
          color="primary"
          className={classes.button}
          onClick={() => handlePending(inboundIds)}
        >
          Pending
        </Button>
        <Button
          variant="contained"
          type="submit"
          color="primary"
          className={classes.button}
          onClick={() => handleArchived(inboundIds)}
        >
          Archived
        </Button>
        <Button
          variant="contained"
          type="submit"
          color="primary"
          className={classes.button}
          onClick={() => handleUpdate(inboundIds)}
        >
          {loading ? (
            <CircularProgress color="secondary" size="1.5rem" thickness={2.6} />
          ) : (
            "Update"
          )}
        </Button>
        <Button
          variant="contained"
          type="submit"
          color="primary"
          className={classes.button}
          onClick={() => handleAnnotation(inboundIds)}
        >
          {annotationLoading ? (
            <CircularProgress color="secondary" size="1.5rem" thickness={2.6} />
          ) : (
            "   Get Annotation"
          )}
        </Button>
      </div>
    );
  };

  useEffect(() => {
    const checkIfClickedOutside = (e) => {
      if (
        openRowFunctionalities &&
        rowFunctionalitiesRef.current &&
        !rowFunctionalitiesRef.current.contains(e.target)
      ) {
        setOpenRowFunctionalities(false);
      }
    };

    document.addEventListener("mousedown", checkIfClickedOutside);
    return () => {
      document.removeEventListener("mousedown", checkIfClickedOutside);
    };
  }, [openRowFunctionalities]);

  useEffect(() => {
    const checkIfClickedOutside = (e) => {
      console.log(showColumns);

      if (
        showColumns &&
        showColumnRef.current &&
        !showColumnRef.current.contains(e.target)
      ) {
        console.log("before", showColumns);
        setShowColumns(false);
        console.log("after", showColumns);
      }
    };

    document.addEventListener("mousedown", checkIfClickedOutside);
    return () => {
      document.removeEventListener("mousedown", checkIfClickedOutside);
    };
  }, [showColumns]);

  const RowFunctionalities = () => {
    return (
      <div
        className="row-functionalities"
        ref={rowFunctionalitiesRef}
        style={style}
      >
        <div>
          <span onClick={() => handlePending(editData)}>Pending </span>
          <span onClick={() => handleArchived(editData)}>Archived</span>
          <span onClick={() => handleUpdate(editData)}>
            Update <PulseLoader color={color} loading={loading} size={5} />
          </span>
          <span onClick={() => handleAnnotation(editData)}>
            Get Annotation{" "}
            <PulseLoader color={color} loading={annotationLoading} size={5} />
          </span>
          <span onClick={handleRevenueOpenModal}>Clear</span>
          {/* <span onClick={handleDeleteOpenModal}>Delete</span> */}
        </div>
      </div>
    );
  };

  const handleRowFunctionalities = (id) => {
    setOpenRowFunctionalities(true);
    setShowColumns(false);
    if (editData.length > 0) {
      const itemIndx = editData.indexOf(id);
      editData.splice(itemIndx, 1);
    }
    const tempData = tableProps.data.filter((item) => item.id == id);
    editData.push(tempData[0].Inbound_Id);
  };

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
    };
    const dispatchSettings = (action) => {
      if (action.type === ActionType.UpdateCellValue) {
        tableProps.dispatch(
          action.value
            ? showColumn(action.rowKeyValue)
            : hideColumn(action.rowKeyValue)
        );
      }
    };
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
                  return <CellEditorBoolean {...props} />;
              }
            },
          },
        }}
        dispatch={dispatchSettings}
      />
    );
  };
  return (
    <>
      <Helmet title="Call Logs Report" />
      <div className="selection-demo" onClick={rowFunctionalitiesPosition}>
        {openRowFunctionalities ? <RowFunctionalities /> : ""}
        {tableToolbar ? (
          <TableToolbar />
        ) : (
          <div className="table-top">
            <div className="columns-show-hide" onClick={handleColumns}>
              <img src={eyeIcon} alt="search"></img>
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
                  return <SelectionCell {...props} />;
                }
              },
            },
            filterRowCell: {
              content: (props) => {
                if (props.column.key === "selection-cell") {
                  return <></>;
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
                  );
                }
              },

              elementAttributes: (props) => {
                if (props.column.key === "edit") {
                  return {
                    style: {
                      ...props.column.style,
                      position: "sticky",
                      left: 0,
                      zIndex: 10,
                    },
                  };
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
                    );
                }
              },

              elementAttributes: (props) => {
                if (props.column.key === "edit") {
                  return {
                    style: {
                      ...props.column.style,
                      position: "sticky",
                      left: 0,
                      backgroundColor: "#fff",
                    },
                  };
                }
              },
            },
          }}
          dispatch={dispatch}
          extendedFilter={(data) => filterData(data, filterValue)}
        />

        <SnackBar open={open} setOpen={setOpen} response={response} />
      </div>

      <ConfirmModal
        open={showRevenueClearModal.open}
        setOpen={setShowRevenueClearModal}
        btnAction={handleClear}
        closeAction={handleRevenueCloseModal}
        editData={editData}
        width={"450px"}
        title={
          <>
            Do you want clear <b>revenue</b> and <b>payout</b> for - <b>{sn}</b>
          </>
        }
      ></ConfirmModal>

      <ConfirmModal
        open={showDeleteModal.open}
        setOpen={setShowDeleteModal}
        btnAction={deleteHandler}
        closeAction={handleDeleteCloseModal}
        width={"400px"}
        title={`${inboundIds.length > 1
          ? "Do you want to delete these records?"
          : "Do you want to delete this record?"
          }`}
      ></ConfirmModal>
    </>
  );
};

CallLogsReport.layout = (page) => (
  <Layout title="Call Logs Report">{page}</Layout>
);
export default CallLogsReport;
