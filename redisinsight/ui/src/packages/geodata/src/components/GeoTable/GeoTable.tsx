import React from 'react'

interface GeoTableProps {
  columns: string[]
  rows: Array<Array<React.ReactNode>>
}

export const GeoTable = ({ columns, rows }: GeoTableProps) => (
  <div className="geodata-table-wrap">
    <table className="geodata-table">
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column} scope="col">
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={`${rowIndex}-${row.length}`}>
            {row.map((cell, cellIndex) => (
              <td key={`${rowIndex}-${cellIndex}`}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)
