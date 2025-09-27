import {useEffect, useRef} from "react"

export default function Modal({open, title = "Dialog", onClose, children}){
    // ref to the <dialog> element
    const dialogRef = useRef(null)

    // open/close the dialog whenever  the `open` prop changes
    useEffect(() => {
        const dialog = dialogRef.current;
        if(!dialog) return;
        if(open && !dialog.open) dialog.showModal()
        if(!open && dialog.open) dialog.close()
    }, [open]);


    // handle the dialog's onClose event (Esc key or backdrop click)
    useEffect(() => {
        const dialog = dialogRef.current;
        if(!dialog) return;
        const onCancel = (e) => {
            e.preventDefault(); // prevent the dialog from closing automatically
            onClose?.() // call the provided onClose handler
        };
        dialog.addEventListener("cancel", onCancel) // Esc key trigger "cancel" event
        return () => dialog.removeEventListener("cancel", onCancel);
    }, [onClose]);

    // handle closing when clicking outside the dialog (backdrop)
    const onBackDrop = (e) =>{
        const dialog = dialogRef.current;
        const rect = dialog.getBoundingClientRect();
        const clickInDialog =
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width;
        if (!clickInDialog) onClose?.();
    };
    return (
        <dialog
        ref={dialogRef}
        aria-labelledby="modal-title"
        className="rounded-2xl backdrop:bg-black/40  p-0"
        onClick={onBackDrop}
        >
            <div className="relative z-10 max-w-lg w-[92vw] sm:w-[480px] p-4 sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h2 id="modal-title" className="text-base font-semibold">
                        {title}
                    </h2>
                    <button 
                    className="btn-ghost px-2 py-1"
                    onClick={onClose}
                    aria-label="Close modal"
                    >
                        x
                    </button>
                </div>
                {children}
            </div>
        </dialog>
    )

}