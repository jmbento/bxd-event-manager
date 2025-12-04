import { toast, ToastOptions } from 'react-hot-toast';

const baseOptions: ToastOptions = {
  style: {
    fontSize: '14px',
  },
};

export const notifySuccess = (message: string, options?: ToastOptions) => {
  toast.success(message, { ...baseOptions, ...options });
};

export const notifyError = (message: string, options?: ToastOptions) => {
  toast.error(message, { ...baseOptions, ...options });
};

export const notifyInfo = (message: string, options?: ToastOptions) => {
  toast(message, { ...baseOptions, ...options });
};

export const notifyPromise = <T>(promise: Promise<T>, messages: { loading: string; success: string; error: string }) => {
  return toast.promise(promise, messages, baseOptions);
};
