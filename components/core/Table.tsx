import React from 'react';

export const Table = ({ headers, data, onDelete }: { headers: string[], data: any[][], onDelete?: (index: number) => void }) => {
  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="w-full text-left text-sm text-gray-600">
        <thead className="bg-gray-50 uppercase font-medium text-gray-700">
          <tr>
            {headers.map((h, i) => <th key={i} className="px-6 py-3">{h}</th>)}
            {onDelete && <th className="px-6 py-3">Amallar</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50">
              {row.map((cell, j) => <td key={j} className="px-6 py-4">{cell}</td>)}
              {onDelete && (
                <td className="px-6 py-4">
                  <button onClick={() => onDelete(i)} className="text-red-600 hover:text-red-800 font-bold">
                    O'chirish
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};