import React, { useState, useEffect } from "react";
import { kaReducer, Table } from "ka-table";
import {
    DataType,
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
} from "ka-table/actionCreators";
import { hideColumn, showColumn } from "ka-table/actionCreators";
import CellEditorBoolean from "ka-table/Components/CellEditorBoolean/CellEditorBoolean";
import "ka-table/style.scss";
import search from "../../images/search.svg";
import eyeIcon from "../../images/eyeIcon.svg";
import closeNav from "../../images/closeNav.svg";
import Checkbox from "@material-ui/core/Checkbox";
import axios from "axios";
import CustomFilter from "./CustomFilter"


export default function MainTable(props) {
    const [searchSidebar, setSearchSidebar] = useState(false);
    const { TableToolbar, openTableToolbar, setOpenTableToolbar, selectedRowIds, handleColumns, showColumns, setShowColumns, showColumnRef, tableProps, filterValue, setFilterValue, fields, changeTableProps, columnDetails, optionKey,filteredData, setFilteredData,filterData
    } = props;


    const dispatch = (action) => {
        changeTableProps((prevState) => {
            const newState = kaReducer(prevState, action);
            const { data, ...settingsWithoutData } = newState;
            columnDetails[optionKey] = settingsWithoutData
            const finalData = JSON.stringify(columnDetails)
            axios.post(route('add.table.details'), { finalData })
                .then((res) => {
                    // console.log(res)
                })
                .catch((err) => {
                    console.log(err)
                })
            return newState;

        });
    };

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
                        setOpenTableToolbar(true);
                    } else {
                        dispatch(deselectRow(rowKeyValue));
                        const id = parseInt(rowKeyValue);
                        const itemIndx = selectedRowIds.indexOf(id);
                        selectedRowIds.splice(itemIndx, 1);
                        if (selectedRowIds.length < 1) {
                            setOpenTableToolbar(false);
                        }
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
                        dispatch(selectAllFilteredRows());
                        setOpenTableToolbar(true);
                    } else {
                        dispatch(deselectAllFilteredRows());
                        if (selectedRowIds) {
                            selectedRowIds.splice(0, selectedRowIds.length);
                        }
                        if (selectedRowIds.length < 1) {
                            setOpenTableToolbar(false);
                        }
                    }
                }}
            />
        );
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


    const handleSearch = () => {
        setSearchSidebar((prevState) => !prevState);
    };
    const closeSidebar = () => {
        setSearchSidebar(false)
    };

    useEffect(() => {
        const checkIfClickedOutside = (e) => {
            if (
                showColumns &&
                showColumnRef.current &&
                !showColumnRef.current.contains(e.target)
            ) {
                setShowColumns(false);
            }
        };

        document.addEventListener("mousedown", checkIfClickedOutside);
        return () => {
            document.removeEventListener("mousedown", checkIfClickedOutside);
        };
    }, [showColumns]);



    return (
        <>
            <div className="consumer-table">
                {openTableToolbar ? (
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

                        {searchSidebar ? (
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
                                    <CustomFilter mainData={tableProps.data} fields={fields} filterValue={filterValue} setFilterValue={setFilterValue} filteredData={filteredData} setFilteredData={setFilteredData} filterData={filterData}/>
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
                        },
                    }}
                    dispatch={dispatch}
                    extendedFilter={(data) => filterData(data, filterValue)}
                />
            </div>

        </>
    )
}
