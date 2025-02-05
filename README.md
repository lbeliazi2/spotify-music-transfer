# Description

Ce projet permet de :
✅ S'authentifier auprès de Spotify (OAuth 2.0)  
✅ Obtenir un token d'accès  
✅ Créer une playlist sur Spotify

---

# Installation

Pour commencer ce projet, il faut d'abord créer une application dans votre dashboard Spotify: https://developer.spotify.com/documentation/web-api/concepts/apps

1. **Cloner le projet**
```sh
git clone https://github.com/votre-utilisateur/spotify-playlist.git
cd spotify-playlist
```

2. **Installer les dépendances**
```sh
npm install express node-fetch dotenv querystring
```
3. Configuration de vos variables d'environnement
   Dans le .env, il vous faudra configurer ces valeurs :
```dotenv
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
```
Obtiens tes identifiants ici 👉 https://developer.spotify.com/dashboard
Le client_id et client_secret vous sont donné par Spotify après avoir crée votre application dans les paramètres.

# Mise en place
Dans le dossier playlists, vous pouvez insérer vos playlist en XML.
Vous pouvez vous renseigner comment procéder pour chaque application (iTunes, Deezer...).

# Lancement
Vous pouvez lancer l'application avec :
```shell
node index.js
```
Vous pouvez aller sur ce lien : http://localhost:3000/authorize
Vous pourrez vous connecter à Spotify pour avoir les accès pour ajouter des musiques / des playlists.

L'application va procéder tout seul à lire tous les XML dans le dossier playlists et les transférer sur ton compte Spotify. 




