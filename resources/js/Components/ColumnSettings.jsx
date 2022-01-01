import {
    DataType,
    EditingMode,
    ActionType,
} from "ka-table/enums";
import { Table } from "ka-table";
import CellEditorBoolean from "ka-table/Components/CellEditorBoolean/CellEditorBoolean";
import {
    hideColumn,
    showColumn,
} from "ka-table/actionCreators";
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

export default ColumnSettings
