import { useCallback, useEffect, useMemo, useRef } from 'react'
import { closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { horizontalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import addTableDetails from '@/Helpers/AddTableDetails'

const useDragAndDropColumns = ({
  columns,
  setColumns,
  columnDetails,
  setColumnDetails,
  optionKey,
  nonDraggableKeys = ['selection-cell', 'edit'],
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const columnsRef = useRef(columns)
  useEffect(() => {
    columnsRef.current = columns
  }, [columns])

  const columnDetailsRef = useRef(columnDetails)
  useEffect(() => {
    columnDetailsRef.current = columnDetails
  }, [columnDetails])

  const handleDragEnd = useCallback(
    ({ active, over }) => {
      if (!over || active.id === over.id) return

      const prev = columnsRef.current
      const oldIndex = prev.findIndex((c) => c.key === active.id)
      const newIndex = prev.findIndex((c) => c.key === over.id)
      if (oldIndex === -1 || newIndex === -1) return

      const reordered = arrayMove(prev, oldIndex, newIndex)
      setColumns(reordered)
      addTableDetails(columnDetailsRef.current, setColumnDetails, reordered, optionKey)
    },
    [setColumns, setColumnDetails, optionKey]
  )

  const sortableKeys = useMemo(
    () =>
      columns
        .filter((c) => c.visible !== false && !nonDraggableKeys.includes(c.key))
        .map((c) => c.key),
    [columns, nonDraggableKeys]
  )

  return {
    sensors,
    handleDragEnd,
    sortableKeys,
    dndContextProps: {
      sensors,
      collisionDetection: closestCenter,
      onDragEnd: handleDragEnd,
    },
    sortableContextProps: {
      items: sortableKeys,
      strategy: horizontalListSortingStrategy,
    },
  }
}

export default useDragAndDropColumns
