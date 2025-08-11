const SportCard = ({ sport, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200 hover:border-theme-purple group"
    >
      <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
        {sport.icon}
      </div>
      <h3 className="text-lg font-medium text-gray-900 group-hover:text-theme-purple transition-colors">
        {sport.name}
      </h3>
    </button>
  );
};

export default SportCard;