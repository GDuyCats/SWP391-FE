const EditButton = ({ onClick, children = "Edit", className = "" }) => {
  return (
    <button
      onClick={onClick}
      className={`bg-black border-4 border-black-600 text-white rounded-full w-20 h-10 transition duration-300 ease-in-out transform hover:scale-105 active:scale-95 hover:bg-green-600 hover:text-white ${className}`}
    >
      {children}
    </button>
  );
};
export default EditButton;
