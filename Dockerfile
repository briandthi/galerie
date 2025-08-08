# Multi-stage build pour optimiser la taille de l'image
FROM node:22-alpine as builder

# Définir le répertoire de travail
WORKDIR /build

# Copier les fichiers de dépendances depuis ./frontend
COPY frontend/package*.json ./

# Installer les dépendances
# RUN npm ci --only=production
RUN npm ci

# Copier le code source depuis ./frontend
COPY frontend/ .

# Build de l'application
RUN npm run build

# Stage de production avec Nginx
FROM nginx:alpine

# Copier les fichiers buildés
COPY --from=builder /build/dist /usr/share/nginx/html

# Copier la configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/nginx.conf

# Exposer le port 80
EXPOSE 80

# Commande par défaut
CMD ["nginx", "-g", "daemon off;"]