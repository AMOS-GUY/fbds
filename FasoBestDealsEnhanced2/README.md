# FasoBestDeals — Documentation

> E-commerce premium ciblant le Burkina Faso, sourçage depuis la Chine.  
> Interface française · Paiements mobiles africains · Admin panel complet

---

## Structure du projet

```
FasoBestDeals/
├── index.html                  ← Point d'entrée (redirige vers home)
├── admin/
│   ├── login.html              ← Connexion admin sécurisée
│   └── dashboard.html          ← Tableau de bord complet
└── public/
    ├── css/
    │   └── design-system.css   ← Système de design unifié
    ├── scripts/
    │   └── core.js             ← Auth, Cart, Security, Toast, Products…
    ├── media/                  ← Images et assets
    └── pages/
        ├── home.html           ← Page d'accueil
        ├── products.html       ← Catalogue produits
        ├── orders.html         ← Checkout 4 étapes
        ├── account.html        ← Espace client
        ├── track-order.html    ← Suivi de commande
        ├── login.html          ← Connexion / Inscription
        ├── signup.html         ← Redirect → login (onglet inscription)
        ├── forgot-password.html← Réinitialisation mot de passe
        ├── blog.html           ← Blog
        ├── contact-us.html     ← Contact + FAQ rapide
        ├── faq.html            ← FAQ complète
        ├── shipping.html       ← Livraison & Retours
        ├── returns.html        ← Redirect → shipping
        ├── privacy.html        ← Politique de confidentialité
        ├── terms.html          ← Conditions d'utilisation
        └── 404.html            ← Page d'erreur
```

---

## Démarrage rapide

**Option 1 — Ouvrir directement dans le navigateur**
```
Ouvrez index.html dans votre navigateur.
```

**Option 2 — Serveur local (recommandé)**
```bash
# Python 3
python -m http.server 3000

# Node.js (npx)
npx serve .

# Puis ouvrez http://localhost:3000
```

---

## Admin Panel

**URL :** `/admin/login.html`

**Identifiants par défaut :**
- Utilisateur : `admin`
- Mot de passe : `FasoBest2026!`

> ⚠️ **Changez ces identifiants avant la mise en production !**

**Fonctionnalités admin :**
- 📊 Tableau de bord avec graphiques en temps réel
- 🛒 Gestion des commandes (statuts, export CSV, WhatsApp)
- 📦 Gestion des produits (CRUD complet, ajustement stock)
- 👥 Gestion des clients (fiches, tiers de fidélité, export)
- 📈 Analyses (revenus, conversions, top produits, paiements)
- 🔒 Journal d'audit + scan sécurité + backup/restauration
- ⚙️ Paramètres boutique, livraison, WhatsApp

---

## Architecture technique

### Frontend uniquement (static)
- HTML5 sémantique + CSS3 (variables custom, grid, flexbox)
- JavaScript vanilla ES6+ (aucune dépendance externe)
- Données stockées dans `localStorage` (démo)

### Modules JS (`core.js`)
| Module | Rôle |
|--------|------|
| `Security` | Sanitisation XSS, rate limiting, CSRF, audit |
| `Auth` | Inscription, connexion, session, remember me |
| `Cart` | Panier persistant, badges, événements |
| `Products` | CRUD produits, recherche, formatage |
| `Orders` | Création, suivi, historique |
| `Wishlist` | Favoris persistants |
| `Toast` | Notifications non-bloquantes |
| `PageTransition` | Animation entre pages |
| `Navbar` | Responsive, scroll behavior, auth state |

### Sécurité implémentée
- ✅ Content-Security-Policy (CSP) sur chaque page
- ✅ X-Content-Type-Options, X-XSS-Protection, X-Frame-Options
- ✅ Sanitisation XSS de toutes les entrées utilisateur
- ✅ Rate limiting (login, inscription, contact, réinitialisation)
- ✅ Protection CSRF (token de session)
- ✅ Verrouillage compte après 5 tentatives échouées (admin)
- ✅ Journal d'audit complet
- ✅ Validation email, mot de passe, téléphone côté client
- ✅ Mots de passe jamais stockés en clair

---

## Pages et fonctionnalités

### 🏠 Accueil (`home.html`)
- Hero animé avec float cards
- Compte à rebours promo en temps réel
- Produits vedettes avec wishlist et add-to-cart
- Grille de catégories avec effet hover
- Témoignages clients
- Newsletter avec validation

### 🛍️ Produits (`products.html`)
- Recherche en temps réel (debounced 280ms)
- Filtres par catégorie (chips cliquables)
- Tri : prix, nom, note
- Vue grille / liste toggle
- Modal détail produit avec sélecteur de taille & quantité
- Indicateur stock faible
- Animations d'entrée par Intersection Observer

### 🛒 Commande (`orders.html`)
- Checkout en 4 étapes avec barre de progression
- Étape 1 : Panier éditable
- Étape 2 : Informations livraison avec pré-remplissage
- Étape 3 : Paiement (Orange Money, MTN, Moov, livraison)
- Étape 4 : Récapitulatif + confirmation
- Page de succès avec numéro de commande

### 👤 Compte (`account.html`)
- Dashboard avec statistiques personnelles
- Historique des commandes
- Gestion de la wishlist
- Carnet d'adresses
- Modification du profil
- Changement de mot de passe
- Indicateurs de sécurité
- Zone de danger (suppression de compte)

### 📦 Suivi (`track-order.html`)
- Recherche par numéro de commande
- Timeline animée avec étape courante pulsante
- Support de l'URL param `?id=FBD-XXX`
- Récapitulatif commande détaillé

---

## Personnalisation

### Changer la palette de couleurs
Modifiez les variables CSS dans `design-system.css` :
```css
:root {
  --brand-gold: #c9952a;        /* Couleur principale */
  --brand-dark: #0f0e0b;        /* Couleur sombre */
  --brand-cream: #faf6ef;       /* Couleur claire */
}
```

### Ajouter des produits
Modifiez le tableau `DEFAULTS` dans `core.js` > module `Products` :
```js
{ id: 5, name: 'Nouveau produit', category: 'Maison',
  price: 8500, stock: 30, rating: 4.6, reviews: 12,
  description: 'Description…', image: '../media/image.jpg' }
```

### Configurer WhatsApp
Dans l'admin → Paramètres → WhatsApp, entrez votre numéro et clé API CallMeBot.

---

## Mise en production

Pour une vraie mise en production, il faudra :

1. **Backend API** (Node.js/Express recommandé) pour :
   - Authentification sécurisée (JWT + bcrypt)
   - Stockage en base de données (MongoDB)
   - Traitement des paiements (CinetPay / PawaPay API)
   - Envoi d'emails (Nodemailer / SendGrid)
   - Gestion des fichiers produits (Cloudinary)

2. **Sécurité renforcée** :
   - HTTPS obligatoire
   - Tokens CSRF côté serveur
   - Hachage bcrypt des mots de passe
   - Validation serveur de toutes les entrées

3. **Changements immédiats** :
   - Modifier les identifiants admin (`admin/login.html`)
   - Configurer les vraies API de paiement
   - Configurer les URLs de l'API backend

---

## Support

- WhatsApp : +226 XX XX XX XX
- Email : contact@fasobestdeals.com
- Suivi commande : `/public/pages/track-order.html`

---

*© 2026 FasoBestDeals. Conçu avec ❤️ pour le Burkina Faso.*
