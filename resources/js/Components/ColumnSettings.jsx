import { useCallback, useMemo } from 'react'
import { Switch } from 'antd'
import { HolderOutlined } from '@ant-design/icons'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'

const SortableColumnItem = ({ col, onToggleColumn }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: col.key,
  })

  const style = {
    transform: transform
      ? `translate3d(0, ${Math.round(transform.y)}px, 0)`
      : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 'auto',
    background: isDragging ? '#f5f5ff' : 'transparent',
    position: 'relative',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between px-[7px] py-[6px] border-b border-[#eaeaf1]"
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-[#9ca3af] hover:text-[#4b5668] flex-shrink-0"
        >
          <HolderOutlined />
        </span>
        <span
          className="text-[13px] text-[#4b5668] cursor-pointer truncate"
          onClick={() => onToggleColumn(col.key)}
        >
          {col.title || col.key}
        </span>
      </div>
      <Switch
        size="small"
        checked={col.visible !== false}
        onChange={() => onToggleColumn(col.key)}
      />
    </div>
  )
}

const ColumnSettings = ({ columns, onToggleColumn, onReorderColumns }) => {
  const hiddenColumns = ['sl', 'edit', 'selection-cell']

  const filteredColumns = columns.filter((c) => !hiddenColumns.includes(c.key))

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const sortableKeys = useMemo(
    () => filteredColumns.map((c) => c.key),
    [filteredColumns]
  )

  const handleDragEnd = useCallback(
    ({ active, over }) => {
      if (!over || active.id === over.id || !onReorderColumns) return

      const oldIndex = columns.findIndex((c) => c.key === active.id)
      const newIndex = columns.findIndex((c) => c.key === over.id)
      if (oldIndex === -1 || newIndex === -1) return

      onReorderColumns(arrayMove(columns, oldIndex, newIndex))
    },
    [columns, onReorderColumns]
  )

  return (
    <div className="w-[200px] mb-5">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sortableKeys} strategy={verticalListSortingStrategy}>
          {filteredColumns.map((col) => (
            <SortableColumnItem key={col.key} col={col} onToggleColumn={onToggleColumn} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  )
}

export default ColumnSettings
