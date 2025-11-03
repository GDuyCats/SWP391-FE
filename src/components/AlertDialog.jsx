import React from "react";
import { X, AlertTriangle } from "lucide-react";

export default function AlertDialog({ open, onClose, handleDelete }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white rounded-2xl shadow-lg w-[90%] max-w-md p-6 relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                >
                    <X size={20} />
                </button>

                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle className="text-red-500" size={28} />
                    <h2 className="text-lg font-semibold text-gray-800">
                        Xác nhận xóa
                    </h2>
                </div>

                {/* Body */}
                <p className="text-gray-600 mb-6">
                    Bạn có chắc chắn muốn xóa mục này không? Hành động này không thể hoàn tác.
                </p>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={() => {
                            handleDelete();
                            onClose();
                        }}
                        className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                    >
                        Xóa
                    </button>
                </div>
            </div>
        </div>
    );
}
