import { useCallback, useEffect, useRef, useState } from 'react'
import addTableDetails from '@/Helpers/AddTableDetails'

const MIN_COLUMN_WIDTH = 120
const DEFAULT_COLUMN_WIDTH = 180

const useResizableTableColumns = ({
  columns,
  setColumns,
  columnDetails,
  setColumnDetails,
  optionKey,
}) => {
  const [activeResizeKey, setActiveResizeKey] = useState(null)
  const [hoveredResizeKey, setHoveredResizeKey] = useState(null)
  const columnsRef = useRef(columns)
  const columnDetailsRef = useRef(columnDetails)

  useEffect(() => {
    columnsRef.current = columns
  }, [columns])

  useEffect(() => {
    columnDetailsRef.current = columnDetails
  }, [columnDetails])

  const getNormalizedWidth = useCallback((column) => {
    return (
      Number(column.style?.width || column.width) ||
      Number.parseInt(column.style?.width || column.width, 10) ||
      DEFAULT_COLUMN_WIDTH
    )
  }, [])

  const handleColumnResize = useCallback(
    (columnKey, nextWidth) => {
      setColumns((prev) =>
        prev.map((column) => {
          if (column.key !== columnKey) {
            return column
          }

          return {
            ...column,
            width: nextWidth,
            style: { ...(column.style || {}), width: nextWidth },
          }
        })
      )
    },
    [setColumns]
  )

  const ResizableTitle = ({ children, width, columnKey, ...restProps }) => {
    if (!width || !columnKey) {
      return <th {...restProps}>{children}</th>
    }
    const isSeparatorVisible = activeResizeKey === columnKey || hoveredResizeKey === columnKey

    const startResize = (event) => {
      event.preventDefault()
      event.stopPropagation()
      setActiveResizeKey(columnKey)

      const startX = event.clientX
      const startWidth = Number(width) || Number.parseInt(width, 10) || MIN_COLUMN_WIDTH

      const onMouseMove = (moveEvent) => {
        const nextWidth = Math.max(MIN_COLUMN_WIDTH, startWidth + moveEvent.clientX - startX)
        handleColumnResize(columnKey, nextWidth)
      }

      const onMouseUp = () => {
        setActiveResizeKey(null)
        addTableDetails(columnDetailsRef.current, setColumnDetails, columnsRef.current, optionKey)
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
      }

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    }

    const mergedHeaderStyle = {
      ...(restProps.style || {}),
      position: 'relative',
      overflow: 'visible',
    }

    return (
      <th
        {...restProps}
        style={mergedHeaderStyle}
        onMouseEnter={() => setHoveredResizeKey(columnKey)}
        onMouseLeave={() => setHoveredResizeKey(null)}
      >
        {children}
        <div
          role="separator"
          aria-label={`Resize ${columnKey} column`}
          onMouseDown={startResize}
          onClick={(event) => event.stopPropagation()}
          onMouseEnter={() => setHoveredResizeKey(columnKey)}
          onMouseLeave={() => {
            if (activeResizeKey !== columnKey) {
              setHoveredResizeKey(null)
            }
          }}
          style={{
            position: 'absolute',
            top: 0,
            right: '-8px',
            width: '10px',
            height: '100%',
            cursor: 'col-resize',
            userSelect: 'none',
            zIndex: 5,
            backgroundColor:
              activeResizeKey === columnKey ? 'rgba(29, 78, 216, 0.06)' : 'transparent',
          }}
        >
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '50%',
              transform: 'translateY(-50%)',
              right: '5px',
              width: '2px',
              height: '16px',
              backgroundColor: activeResizeKey === columnKey ? '#1d4ed8' : '#8c8c8c',
              borderRadius: '4px',
              opacity: isSeparatorVisible ? 1 : 0,
              pointerEvents: 'none',
              transition: 'opacity 0.15s ease',
            }}
          />
        </div>
      </th>
    )
  }

  const withResizableColumns = useCallback(
    (tableColumns = []) => {
      return tableColumns.map((column) => {
        const normalizedWidth = getNormalizedWidth(column)
        return {
          ...column,
          width: normalizedWidth,
          onHeaderCell: () => ({
            width: normalizedWidth,
            columnKey: column.key,
          }),
        }
      })
    },
    [getNormalizedWidth]
  )

  return { ResizableTitle, withResizableColumns, getNormalizedWidth }
}

export default useResizableTableColumns
