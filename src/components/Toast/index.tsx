import { useCallback } from 'react';
import { Toast } from 'primereact/toast';

let toastReference: Toast;

function error(message: string) {
  toastReference.show({ severity: 'error', content: message });
}

function success(message: string) {
  toastReference.show({ severity: 'success', content: message });
}

function toast() {
  if (!toastReference) throw new Error('Should render <ConfigureToast />');
  return { ...toastReference, error, success };
}

export function ConfigureToast() {
  const onRef = useCallback((el: Toast | null) => {
    if (!el) return;

    toastReference = el;
    Object.freeze(toastReference);
  }, []);

  return <Toast ref={onRef} />;
}

export default toast;
