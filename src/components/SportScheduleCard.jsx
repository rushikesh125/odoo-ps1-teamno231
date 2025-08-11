const SportScheduleCard = ({ schedule }) => {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-theme-purple/10">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-theme-purple uppercase tracking-wider">Day</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-theme-purple uppercase tracking-wider">Hours</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-theme-purple uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {days.map((day, index) => {
            const daySchedule = schedule?.[day];
            return (
              <tr key={day} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  {dayNames[index]}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {daySchedule?.isOpen 
                    ? `${daySchedule.open} - ${daySchedule.close}` 
                    : 'Closed'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    daySchedule?.isOpen 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {daySchedule?.isOpen ? 'Open' : 'Closed'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SportScheduleCard;