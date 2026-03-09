import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "nav_features": "Features",
      "nav_pricing": "Pricing",
      "nav_abdm": "ABDM Compliance",
      "nav_get_started": "Get Started",
      "hero_title_1": "Transforming Indian",
      "hero_title_2": "Healthcare with",
      "hero_subtitle": "A Unified HMS Ecosystem",
      "hero_cta": "Log in or Sign Up",
      "hub_title": "Data Hub",
      "hub_subtitle": "(ABDM compliant)",
      "features_title": "Comprehensive Features for Indian Hospitals",
      "feat_scribe": "Doctor's Scribe",
      "feat_wallet": "Patient Wallet",
      "feat_inventory": "Staff Inventory",
      "feat_whatsapp": "WhatsApp Delivery",
      "feat_lab": "Lab & Diagnostics",
      "feat_billing": "GST Billing"
    }
  },
  hi: {
    translation: {
      "nav_features": "विशेषताएं",
      "nav_pricing": "मूल्य निर्धारण",
      "nav_abdm": "ABDM अनुपालन",
      "nav_get_started": "शुरू करें",
      "hero_title_1": "भारतीय स्वास्थ्य सेवा",
      "hero_title_2": "को बदल रहा है",
      "hero_subtitle": "एक एकीकृत HMS पारिस्थितिकी तंत्र",
      "hero_cta": "लॉग इन या साइन अप करें",
      "hub_title": "डेटा हब",
      "hub_subtitle": "(ABDM अनुपालन)",
      "features_title": "भारतीय अस्पतालों के लिए व्यापक विशेषताएं",
      "feat_scribe": "डॉक्टर का स्क्रिब",
      "feat_wallet": "पेशेंट वॉलेट",
      "feat_inventory": "स्टाफ इन्वेंटरी",
      "feat_whatsapp": "व्हाट्सएप डिलीवरी",
      "feat_lab": "लैब और डायग्नोस्टिक्स",
      "feat_billing": "GST बिलिंग"
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en", 
  interpolation: { escapeValue: false }
});

export default i18n;