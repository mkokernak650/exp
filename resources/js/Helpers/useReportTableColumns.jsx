import { useMemo, useRef } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import useResizableTableColumns from '@/Helpers/useResizableTableColumns'
import useDragAndDropColumns from '@/Helpers/useDragAndDropColumns'

/**
 * Resizable + drag-to-reorder column headers for Ant Design Table, with persistence
 * via `addTableDetails` (same as {@link useResizableTableColumns}).
 *
 * Returns a stable header cell component and DnD props for {@link ReportTableDndShell}.
 */
const useReportTableColumns = ({
  columns,
  setColumns,
  columnDetails,
  setColumnDetails,
  optionKey,
  nonDraggableKeys = ['selection-cell', 'edit'],
}) => {
  const { ResizableTitle, withResizableColumns, getNormalizedWidth } = useResizableTableColumns({
    columns,
    setColumns,
    columnDetails,
    setColumnDetails,
    optionKey,
  })

  const { dndContextProps, sortableContextProps } = useDragAndDropColumns({
    columns,
    setColumns,
    columnDetails,
    setColumnDetails,
    optionKey,
    nonDraggableKeys,
  })

  const resizableTitleRef = useRef(null)
  resizableTitleRef.current = ResizableTitle

  const DraggableResizableHeader = useMemo(
    () =>
      function DraggableResizableHeader(props) {
        const { columnKey } = props
        const BaseCell = resizableTitleRef.current
        const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
          id: columnKey || '__non-sortable__',
          disabled: !columnKey,
        })

        if (!columnKey) {
          return <BaseCell {...props} />
        }

        const sortableStyle = {
          ...(transform
            ? { transform: `translate3d(${Math.round(transform.x)}px, 0, 0)`, transition }
            : {}),
          ...(isDragging ? { opacity: 0.6, zIndex: 100, background: '#fafafa' } : {}),
          cursor: isDragging ? 'grabbing' : 'grab',
        }

        return (
          <BaseCell
            {...props}
            style={{ ...(props.style || {}), ...sortableStyle }}
            sortableNodeRef={setNodeRef}
            {...attributes}
            {...listeners}
          />
        )
      },
    [],
  )

  return {
    withResizableColumns,
    getNormalizedWidth,
    DraggableResizableHeader,
    dndContextProps,
    sortableContextProps,
  }
}

export default useReportTableColumns
