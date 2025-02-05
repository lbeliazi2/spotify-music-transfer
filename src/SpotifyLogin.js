import React, { useEffect, useState } from 'react';
import { Buffer } from 'buffer';
import querystring from 'querystring';
import { useNavigate } from "react-router-dom";

function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

const SpotifyAuth = () => {
    const [authCode, setAuthCode] = useState(null);
    const navigate = useNavigate();

    const loginSpotify = async () => {
        const state = generateRandomString(16);
        const scope = 'playlist-modify-public playlist-modify-private';

        window.location.href = 'https://accounts.spotify.com/authorize?' + querystring.stringify({
            response_type: 'code',
            client_id: process.env.REACT_APP_SPOTIFY_CLIENT_ID,
            scope: scope,
            redirect_uri: process.env.REACT_APP_SPOTIFY_REDIRECT_URI,
            state: state,
        });
    };

    const getAccessToken = async (code) => {
        const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: "Basic " + Buffer.from(process.env.REACT_APP_SPOTIFY_CLIENT_ID + ":" + process.env.REACT_APP_SPOTIFY_CLIENT_SECRET).toString("base64"),
            },
            body: querystring.stringify({
                grant_type: "authorization_code",
                code: code,
                redirect_uri: process.env.REACT_APP_SPOTIFY_REDIRECT_URI,
            }),
        });

        return await tokenResponse.json();
    };

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code');

        if (code) {
            setAuthCode(code);
        }
    }, []);

    useEffect(() => {
        if (authCode) {
            getAccessToken(authCode).then((data) => {
                navigate('/menu', { state: { accessToken: data.access_token } });
            }).catch(err => {
                console.error("Error fetching token", err);
            });
        }
    }, [authCode, navigate]);

    // Fonction déclenchée lors du clic sur le bouton pour lancer l'authentification
    const handleLogin = () => {
        loginSpotify();
    };

    return (
        <div className="App">
            <h1>Spotify Authentication</h1>
            <button onClick={handleLogin}>
                Se connecter à Spotify
            </button>
        </div>
    );
};

export default SpotifyAuth;
