export default function DescriptionModal({
    isOpen,
    onClose,
    title,
    children,
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-md">
                <div className="p-4 border-b">
                    <h3 className="text-lg font-semibold">{title}</h3>
                </div>
                <div className="p-4">{children}</div>
                <div className="p-4 border-t flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
