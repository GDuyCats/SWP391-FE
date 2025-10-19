{/* Toast */}
function Toast(type, msg) {
    return(
        
        <div
          className={`fixed top-4 right-4 px-4 py-2 rounded shadow text-white ${
            type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {msg}
        </div>
      
    );
}

export default Toast;
      