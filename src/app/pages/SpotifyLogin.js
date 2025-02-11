import React, { useEffect, useState } from "react";
import { Buffer } from "buffer";
import querystring from "querystring";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {getAccessToken, redirectLoginSotify} from "../services/authentification";

function generateRandomString(length) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

const SpotifyAuth = () => {
    const [authCode, setAuthCode] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const loginSpotify = () => {
        setLoading(true);
        const state = generateRandomString(16);
        redirectLoginSotify(state);
    };

    const setAccessToken = (code) => {
        getAccessToken(code).then((accessToken) => {
            if (accessToken.data.access_token) {
                navigate("/menu", { state: { accessToken: accessToken.data.access_token } });
            } else {
                console.error("Access token not received");
                setLoading(false);
            }
        })
    };

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get("code");

        if (code) {
            setAuthCode(code);
        }
    }, []);

    useEffect(() => {
        if (authCode) {
            setAccessToken(authCode)
        }
    }, [authCode]);

    return (
        <div className="relative w-screen h-screen flex justify-center items-center bg-gradient-to-r from-purple-600 to-blue-500">
            <div className="absolute w-full h-full overflow-hidden">
                <motion.div
                    animate={{ y: [-100, 100, -100] }}
                    transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                    className="absolute w-[600px] h-[600px] bg-white opacity-20 rounded-full blur-3xl"
                    style={{ left: "30%", top: "10%" }}
                />
                <motion.div
                    animate={{ x: [-50, 50, -50] }}
                    transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
                    className="absolute w-[500px] h-[500px] bg-pink-300 opacity-30 rounded-full blur-3xl"
                    style={{ right: "20%", bottom: "10%" }}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative bg-white shadow-xl rounded-2xl p-8 flex flex-col items-center"
            >
                <h1 className="red-500 p-4 text-green-600 font-bold">Music transfer to Spotify</h1>

                {loading ? (
                    <div className="flex flex-col items-center">
                        <div className="w-10 h-10 border-t-4 border-green-500 border-solid rounded-full animate-spin"></div>
                        <p className="mt-3 text-gray-700">Connexion en cours...</p>
                    </div>
                ) : authCode ? (
                    <p className="text-green-600 font-medium">Déjà connecté à Spotify !</p>
                ) : (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={loginSpotify}
                        className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg"
                    >
                        Se connecter à Spotify
                    </motion.button>
                )}
            </motion.div>
        </div>
    );
};

export default SpotifyAuth;
