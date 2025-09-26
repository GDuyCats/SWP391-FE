function InputField({ id, label, type, ...props }) {
    return (
        <div className="relative w-full">
            <input
                type={type}
                id={id}
                placeholder=" "
                className="peer w-full border border-gray-300 rounded-full px-3 py-2
                   focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                {...props}

            />
            <label
                htmlFor={id}
                className="absolute left-3 -top-3 rounded-full
                   bg-white px-1 text-sm text-gray-600 transition-all pointer-events-none
                   peer-placeholder-shown:top-2      
                   peer-placeholder-shown:text-base
                   peer-placeholder-shown:text-gray-400
                   peer-focus:-top-3 peer-focus:text-sm peer-focus:text-blue-600"
            >
            {label}
        </label>
        </div >
    )
}

export default InputField
