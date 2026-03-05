import i18n from "i18next";
import { initReactI18next, Translation, useTranslation } from "react-i18next";

const resources = {
    en:{
        translation: {
            "Homepage" : "Homepage",
            "Non hai un account?" : "Don't have an account?",
            "Aggiungi Prodotto" : "Add product"
        }
    },
    it:{
        translation: {
            "Homepage" : "Homepage",
            "Non hai un account?" : "Non hai un account?",
            "Aggiungi Prodotto" : "Aggiungi prodotto"
        }
    },
    
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "it",

        interpolation: {
            escapeValue: false
        }
    });

export default i18n;