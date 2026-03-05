import { Switch } from 'antd'

const ColumnSettings = ({ columns, onToggleColumn }) => {
  const hiddenColumns = ['sl', 'edit', 'selection-cell']

  const filteredColumns = columns.filter((c) => !hiddenColumns.includes(c.key))

  return (
    <div style={{ width: 200, marginBottom: 20 }}>
      {filteredColumns.map((col) => (
        <div
          key={col.key}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 7px',
            borderBottom: '1px solid #eaeaf1',
            cursor: 'pointer',
          }}
          onClick={() => onToggleColumn(col.key)}
        >
          <span style={{ fontSize: 13, color: '#4b5668' }}>{col.title || col.key}</span>
          <Switch size="small" checked={col.visible !== false} />
        </div>
      ))}
    </div>
  )
}

export default ColumnSettings
