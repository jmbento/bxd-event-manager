import { useEffect } from 'react';

// Substitua por seu ID do Google Analytics
const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // Você vai criar isso no Google Analytics

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const GoogleAnalytics = () => {
  useEffect(() => {
    // Carrega o script do Google Analytics
    if (typeof window !== 'undefined' && !window.gtag) {
      const script1 = document.createElement('script');
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      document.head.appendChild(script1);

      const script2 = document.createElement('script');
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_MEASUREMENT_ID}', {
          page_path: window.location.pathname,
        });
      `;
      document.head.appendChild(script2);
    }
  }, []);

  return null;
};

// Funções helper para eventos customizados
export const trackEvent = (eventName: string, params?: any) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', eventName, params);
  }
};

// Eventos específicos do app
export const analytics = {
  // Autenticação
  signUp: (method: string) => trackEvent('sign_up', { method }),
  login: (method: string) => trackEvent('login', { method }),
  
  // Planos
  viewPricing: () => trackEvent('view_pricing'),
  selectPlan: (plan: string) => trackEvent('select_plan', { plan }),
  startTrial: (plan: string) => trackEvent('start_trial', { plan }),
  
  // Eventos
  createEvent: () => trackEvent('create_event'),
  viewEvent: (eventId: string) => trackEvent('view_event', { event_id: eventId }),
  
  // Módulos
  accessModule: (moduleName: string) => trackEvent('access_module', { module: moduleName }),
  
  // Conversões
  subscribe: (plan: string, value: number) => trackEvent('purchase', {
    currency: 'BRL',
    value: value,
    items: [{ item_name: plan }]
  }),
};
