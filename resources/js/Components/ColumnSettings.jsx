import { Switch } from 'antd'

const ColumnSettings = ({ columns, onToggleColumn }) => {
  const hiddenColumns = ['sl', 'edit', 'selection-cell']

  const filteredColumns = columns.filter((c) => !hiddenColumns.includes(c.key))

  return (
    <div className="w-[200px] mb-5">
      {filteredColumns.map((col) => (
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

export default ColumnSettings
