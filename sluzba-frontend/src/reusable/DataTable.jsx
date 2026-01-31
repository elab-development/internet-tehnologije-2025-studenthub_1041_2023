
const DataTable = ({ columns, data, renderActions }) => (
  <table className="data-table">
    <thead>
      <tr>
        {columns.map(col => <th key={col.key}>{col.label}</th>)}
        {renderActions && <th></th>}
      </tr>
    </thead>

    <tbody>
      {data.length === 0 ? (
        <tr><td colSpan={columns.length + (renderActions ? 1 : 0)}
                style={{textAlign:'center'}}>Nema podataka</td></tr>
      ) : (
        data.map(row => (
          <tr key={row.id}>
            {columns.map(col => (
              <td key={col.key}>{row[col.key]}</td>
            ))}
            {renderActions && <td>{renderActions(row)}</td>}
          </tr>
        ))
      )}
    </tbody>
  </table>
);

export default DataTable;