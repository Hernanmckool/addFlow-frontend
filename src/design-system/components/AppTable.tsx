interface Column<T> {
  key: string
  header: string
  render: (item: T) => React.ReactNode
  align?: 'left' | 'right'
}

interface AppTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (item: T) => string
  onRowClick?: (item: T) => void
}

export function AppTable<T>({ columns, data, keyExtractor, onRowClick }: AppTableProps<T>) {
  return (
    <div className="bg-white border border-[#E5E7EB]/80 rounded-[16px] overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#F3F4F6]">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-5 py-3 text-[12px] font-medium text-[#64748B] uppercase tracking-wide ${
                  col.align === 'right' ? 'text-right' : 'text-left'
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F9FAFB]">
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              className={`transition-colors ${onRowClick ? 'hover:bg-[#F9FAFB] cursor-pointer' : ''}`}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-5 py-3.5 text-[13px] ${
                    col.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  {col.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
