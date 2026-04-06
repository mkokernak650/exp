import { DndContext } from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'

/**
 * Stable wrapper so the DnD provider identity does not change every render.
 * Use with {@link useReportTableColumns} (dndContextProps + sortableContextProps).
 */
const ReportTableDndShell = ({ dndContextProps, sortableContextProps, children }) => (
  <DndContext {...dndContextProps}>
    <SortableContext {...sortableContextProps}>{children}</SortableContext>
  </DndContext>
)

export default ReportTableDndShell
