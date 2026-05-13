import React from 'react';

export default function StandingTable({
  standings = [],
  checked = {},
  findById,
  columnName = '',
  isDriver,
  onCheckedChange = () => {},
}) {
  const getName = (entry) => {
    if (!entry) return '';
    return isDriver(entry) ? `${entry.FirstName} ${entry.LastName}` : entry.Name;
  };

  const getImg = (entry) => {
    if (!entry) return '';
    if (isDriver(entry)) {
      return entry.Images && entry.Images.length > 0 ? entry.Images[0].ImageUrl : '';
    } else {
      return entry.Logo ?? '';
    }
  };

  const getColor = (entry) => {
    if (!entry) return '';
    if (isDriver(entry)) {
      return '#000000';
    } else {
      return entry.Years[entry.Years.length - 1].Color ?? '#000000';
    }
  };

  const formatNumber = (value) => {
    return Number.isInteger(value) ? value.toString() : value.toFixed(2);
  };

  const getLengthOfChecked = () => {
    return Object.values(checked).filter(Boolean).length;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300 divide-y divide-gray-200 table-auto">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-1 py-2 text-left">Position</th>
            <th className="px-1 py-2 text-left">Name</th>
            {columnName && <th className="px-2 py-2 text-left">{columnName}</th>}

            <th className="px-1 py-2 text-center">Compare</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {standings.map((entry, i) => {
            return (
              <tr key={entry.id}>
                <td className="px-1 py-2">{i + 1}</td>
                <td className="px-1 py-2">
                  <div className="flex items-center">
                    <div
                      className="w-6 h-6 rounded-sm"
                      style={{
                        backgroundColor: getColor(findById(entry.id)) ?? 'rgba(27, 161, 72, 1)',
                      }}
                    ></div>
                    <p className="ml-1 mb-0">{getName(findById(entry.id))}</p>
                  </div>
                </td>
                {columnName && <td className="px-4 py-2">{formatNumber(entry.points)}</td>}
                {/* Itt javítjuk a hibát: <input> belül <td> */}
                <td className="px-1 py-2 text-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-blue-600"
                    checked={checked[entry.id] || false}
                    onChange={() => onCheckedChange(entry.id)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
