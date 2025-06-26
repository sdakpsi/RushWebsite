import { toast, ToastOptions } from 'react-toastify';

const customToast = (
  message: string,
  type: 'success' | 'error' | 'info' | 'warning' = 'info'
) => {
  // Get CSS custom properties for theme colors
  const getThemeColor = (property: string) => {
    if (typeof window !== 'undefined') {
      return getComputedStyle(document.documentElement).getPropertyValue(property).trim();
    }
    return '';
  };

  // Base toast options with sleek styling
  const baseToastOptions: ToastOptions = {
    style: {
      background: `hsl(${getThemeColor('--background')})`,
      color: `hsl(${getThemeColor('--foreground')})`,
      border: `1px solid hsl(${getThemeColor('--border')})`,
      borderRadius: '0.75rem', // rounded-xl
      maxWidth: '420px',
      minHeight: '60px',
      whiteSpace: 'pre-wrap',
      overflow: 'hidden',
      lineHeight: '1.5',
      padding: '16px 20px',
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: `
        0 10px 15px -3px hsl(${getThemeColor('--shadow-color')} / 0.4),
        0 4px 6px -4px hsl(${getThemeColor('--shadow-color')} / 0.4)
      `,
      backdropFilter: 'blur(8px)',
      position: 'relative',
    },
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  };

  // Type-specific styling
  const getTypeSpecificOptions = (toastType: string): Partial<ToastOptions> => {
    switch (toastType) {
      case 'success':
        return {
          style: {
            ...baseToastOptions.style,
            borderLeft: `4px solid hsl(${getThemeColor('--success')})`,
          },
          progressStyle: { 
            background: `hsl(${getThemeColor('--success')})`,
            height: '3px',
          },
        };
      case 'error':
        return {
          style: {
            ...baseToastOptions.style,
            borderLeft: `4px solid hsl(${getThemeColor('--destructive')})`,
          },
          progressStyle: { 
            background: `hsl(${getThemeColor('--destructive')})`,
            height: '3px',
          },
        };
      case 'warning':
        return {
          style: {
            ...baseToastOptions.style,
            borderLeft: `4px solid hsl(${getThemeColor('--warning')})`,
          },
          progressStyle: { 
            background: `hsl(${getThemeColor('--warning')})`,
            height: '3px',
          },
        };
      default: // info
        return {
          style: {
            ...baseToastOptions.style,
            borderLeft: `4px solid hsl(${getThemeColor('--primary')})`,
          },
          progressStyle: { 
            background: `hsl(${getThemeColor('--primary')})`,
            height: '3px',
          },
        };
    }
  };

  // Merge base options with type-specific options
  const finalOptions = {
    ...baseToastOptions,
    ...getTypeSpecificOptions(type),
  };

  switch (type) {
    case 'success':
      toast.success(message, finalOptions);
      break;
    case 'error':
      toast.error(message, finalOptions);
      break;
    case 'warning':
      toast.warning(message, finalOptions);
      break;
    default:
      toast.info(message, finalOptions);
  }
};

export default customToast;
