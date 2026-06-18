// components/core/Table.tsx
export const Table = ({ headers = [], data = [], onDelete }: { headers?: string[], data?: any[], onDelete?: () => void }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50 uppercase font-medium text-gray-700">
          <tr>
            {headers?.map((h, i) => <th key={i} className="px-6 py-3">{h}</th>)}
            {onDelete && <th className="px-6 py-3">Amallar</th>}
          </tr>
        </thead>
        <tbody>
          {data?.length === 0 && <tr><td colSpan={headers.length + 1} className="p-4 text-center">Ma'lumot topilmadi</td></tr>}
          {/* Data bo'lsa bu yerga map yozasiz */}
        </tbody>
      </table>
    </div>
  );
};