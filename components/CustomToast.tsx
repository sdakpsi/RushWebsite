import { bonVivant } from '@/fonts/fonts';
import { toast, ToastOptions } from 'react-toastify';

const customToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const toastOptions: ToastOptions = {
        style: {
            background: '#0f172a', // Darker blue background (Tailwind's slate-900)
            color: '#ffffff', // white text
            border: '1px solid #3b82f6', // Light blue border (Tailwind's blue-500)
            borderRadius: '6px', // Rounded corners
            maxWidth: '400px', // Limit the maximum width
            whiteSpace: 'nowrap', // Prevent text wrapping
            overflow: 'hidden', // Hide overflow
            textOverflow: 'ellipsis', // Add ellipsis for overflowing text
        },
        className: `${bonVivant.className} bon-vivant-text-regular`,
        progressStyle: { background: '#3b82f6' }, // light blue progress bar
    };
    switch (type) {
        case 'success':
            toast.success(message, toastOptions);
            break;
        case 'error':
            toast.error(message, toastOptions);
            break;
        case 'warning':
            toast.warning(message, toastOptions);
            break;
        default:
            toast.info(message, toastOptions);
    }
};

export default customToast;
