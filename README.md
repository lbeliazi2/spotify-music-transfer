# Description

This project allows you to:
✅ Authenticate with Spotify (OAuth 2.0)
✅ Obtain an access token
✅ Create a playlist on Spotify

---

# Installation

To get started, you first need to create an application in your Spotify developer dashboard: https://developer.spotify.com/documentation/web-api/concepts/apps

1. **Cloner the project**
```sh
git clone https://github.com/votre-utilisateur/spotify-playlist.git
cd spotify-playlist
```

2. **Install the dependencies**
```sh
npm install express node-fetch dotenv querystring
```
3. Configurate your environment variables
   In the .env, you will need to configure these variables :
```dotenv
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
```
Obtain your credentials here 👉 https://developer.spotify.com/dashboard
The client_id and client_secret are given to you by Spotify after having created your application.

# Setup
Inside the playlists folder, you can insert your playlists in XML format.
You’ll need to check how to export playlists from apps like iTunes, Deezer, etc.

# Launch the app
You can launch the app with :
```shell
node index.js
```
Then open your browser and visit:
http://localhost:3000/authorize
You will be able to log in to Spotify and obtain the permissions needed to create playlists and add tracks.

The application will automatically read all XML files in the playlists directory and transfer the contents to your Spotify account.




