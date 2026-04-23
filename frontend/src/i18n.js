import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          "welcome": "Welcome to the EDU-Revolution",
          "explore": "Explore Courses",
          "live_classes": "Live Classes",
          "pricing": "Pricing",
          "sign_in": "Sign In",
          "dashboard": "Dashboard",
          "forum": "Forum",
          "certificates": "Certificates",
          "referral": "Referral Program"
        }
      },
      es: {
        translation: {
          "welcome": "Bienvenido a la EDU-Revolución",
          "explore": "Explorar Cursos",
          "live_classes": "Clases en Vivo",
          "pricing": "Precios",
          "sign_in": "Iniciar Sesión",
          "dashboard": "Tablero",
          "forum": "Foro",
          "certificates": "Certificados",
          "referral": "Programa de Referidos"
        }
      }
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    }
  });

export default i18n;
