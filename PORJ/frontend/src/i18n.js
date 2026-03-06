import i18n from "i18next";
import { initReactI18next, Translation, useTranslation } from "react-i18next";

const resources = {
    en:{
        translation: {
  "header": {
    "addProduct": "Add Product",
    "welcome": "Welcome",
    "logout": "Logout",
    "login": "Login",
    "signup": "Sign Up",
    "newAuction": "New Auction",
    "tags": "Tags",
    "favorites": "Favorites",
    "cart": "Cart",
    "chat": "Chat",
    "settings": "Settings"
  },

  "footer": {
    "home": "Homepage",
    "catalog": "Catalog",
    "auctions": "Auctions",
    "swagger": "API Documentation",
    "school": "AMETI Professional Center",
    "rights": "All rights reserved"
  }
}
    },
    it:{
        translation: {
  "header": {
    "addProduct": "Aggiungi prodotto",
    "welcome": "Benvenuto/a",
    "logout": "Logout",
    "login": "Login",
    "signup": "Registrati",
    "newAuction": "Nuova asta",
    "tags": "Tag",
    "favorites": "Preferiti",
    "cart": "Carrello",
    "chat": "Chat",
    "settings": "Impostazioni"
  },

  "footer": {
    "home": "Homepage",
    "catalog": "Catalogo",
    "auctions": "Aste",
    "swagger": "Documentazione API",
    "school": "Centro Professionale AMETI",
    "rights": "Tutti i diritti riservati"
  }
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