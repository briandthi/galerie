# Galerie d'Images de Vacances - Spécifications Techniques

## Vue d'ensemble
Application web de galerie d'images personnelles optimisée pour l'affichage et la navigation d'photos de vacances, avec un focus sur les performances et l'expérience utilisateur.

## Fonctionnalités principales

### 1. Affichage en grille (Pinterest-style)
- **Grille masonry** : disposition des images avec des hauteurs variables
- **Pas d'espaces blancs** : ajustement automatique pour une présentation harmonieuse
- **Responsive design** : adaptation selon la taille d'écran
- **Images de tailles différentes** : gestion automatique des ratios

### 2. Effets de scroll
- **Smooth scroll** : défilement fluide avec effets GSAP
- **Animations au scroll** : effets visuels lors du défilement de la page
- **Parallaxe légère** : effet de profondeur sur les images (optionnel)

### 3. Visualisation d'image (lightbox)
- **Clic pour agrandir** : ouverture en plein écran/modal
- **Navigation** : flèches gauche/droite pour passer d'une image à l'autre
- **Fermeture** : croix en haut à droite ou clic en dehors de l'image
- **Ordre séquentiel** : navigation dans l'ordre d'affichage de la grille

### 4. Organisation temporelle (Feature future - V2)
- **Version 1** : Pas de timeline, affichage simple de toutes les images
- **Version future** : Structure de dossiers par date + timeline interactive

### 5. Optimisations des performances
- **Lazy loading** : chargement progressif des images lors du scroll
- **Compression d'images** : plusieurs tailles (thumbnail, medium, full)
- **Mise en cache** : stratégie de cache pour éviter les rechargements
- **Chargement initial rapide** : affichage prioritaire des premières images visibles

## Interface utilisateur

### Layout principal
- **Grille centrale** : zone principale d'affichage des images en masonry
- **Header minimaliste** : titre de la galerie
- **Design épuré** : focus sur les images sans distractions

### États de l'interface
- **Chargement** : indicateurs de progression/skeleton
- **Vide** : message si aucune image pour une période
- **Erreur** : gestion des images non chargées

### Interactions
- **Hover effects** : effets au survol des images
- **Transitions fluides** : animations entre les états
- **Feedback utilisateur** : indications visuelles des actions possibles

## Organisation des données

### Structure des fichiers (Version simplifiée - V1)
```
/var/www/images/          # Volume Docker persistant
├── IMG_001.jpg
├── IMG_002.jpg
├── IMG_003.jpg
├── vacation_001.png
└── ...
```

### Configuration Docker
- **Volume persistant** : `/var/www/images` monté depuis l'hôte
- **Accès Nginx** : Configuration pour servir depuis `/var/www/images`
- **Persistance** : Les images survivent aux redémarrages de conteneurs

### Métadonnées requises
- **Liste des images** : récupérée via l'API de listing Nginx
- **Dimensions** : largeur/hauteur calculées côté client pour la grille
- **Formats supportés** : .jpg, .jpeg, .png, .webp
- **Ordre d'affichage** : ordre alphabétique des noms de fichiers

## Défis techniques identifiés

### 1. Performance du rendu
- **Challenge** : Affichage fluide d'une grande quantité d'images
- **Solutions** : 
  - Virtualisation de la grille (affichage uniquement des éléments visibles)
  - Web Workers pour le traitement des métadonnées
  - Optimisation du DOM (éviter les reflows/repaints)

### 2. Calcul de la grille masonry
- **Challenge** : Disposition optimale sans espaces blancs avec des images de tailles variables
- **Solutions** :
  - Algorithme de placement intelligent (bin packing)
  - Pré-calcul des positions selon la largeur de viewport
  - Mise à jour dynamique lors du redimensionnement

### 3. Gestion mémoire
- **Challenge** : Éviter la surcharge mémoire avec beaucoup d'images
- **Solutions** :
  - Déchargement des images hors viewport
  - Limitation du nombre d'images en cache
  - Compression et redimensionnement côté client si nécessaire

### 4. Synchronisation avec le serveur de fichiers
- **Challenge** : Récupérer efficacement la liste des images depuis Nginx
- **Solutions** :
  - Parse du JSON retourné par `autoindex_format json`
  - Filtrage côté client des extensions d'images valides
  - Gestion des erreurs si certaines images ne se chargent pas

### 5. Pas de métadonnées serveur
- **Challenge** : Calculer les dimensions et métadonnées côté client
- **Solutions** :
  - Utilisation de `Image()` JavaScript pour récupérer les dimensions
  - Cache des métadonnées dans localStorage/sessionStorage
  - Chargement progressif des métadonnées avec les images

## Critères de succès

### Performance
- **First Contentful Paint** < 1.5s
- **Time to Interactive** < 3s
- **Scroll fluide** : 60fps maintenu
- **Chargement d'images** : < 500ms par batch

### Expérience utilisateur
- **Navigation intuitive** : compréhension immédiate des interactions
- **Feedback instantané** : réactivité des animations et transitions
- **Accessibilité** : navigation clavier et lecteurs d'écran
- **Mobile-friendly** : adaptation tactile optimisée

## Technologies recommandées

### Frontend
- **React** + **TanStack Query** pour la gestion d'état et cache
- **Tailwind** + **shadcn** pour le design system  
- **GSAP** pour les animations de scroll
- **Intersection Observer API** pour le lazy loading

### Backend
- **Nginx** avec configuration `autoindex` pour lister et servir les images
- **Volume Docker** : Images stockées dans `/var/www/images` (persistant)
- **Configuration** :
```nginx
server {
    listen 80;
    server_name localhost;
    
    location /images/ {
        alias /var/www/images/;
        autoindex on;
        autoindex_format json;
        
        expires 30d;
        add_header Access-Control-Allow-Origin "*";
        add_header Cache-Control "public, immutable";
    }
    
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }
}
```

### Docker Compose
```yaml
version: '3.8'
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf
      - ./frontend/dist:/var/www/html
      - /var/www/images:/var/www/images:ro  # Volume persistant
```

### API simplicité
- **GET /images/** : Liste tous les fichiers images (JSON automatique)
- **GET /images/{filename}** : Retourne l'image demandée
- **Pas de base de données** : système de fichiers comme source de vérité

### Optimisations
- **Service Worker** pour la mise en cache des images
- **Formats d'images optimisés** : WebP/AVIF en priorité  
- **Cache navigateur** géré automatiquement par Nginx