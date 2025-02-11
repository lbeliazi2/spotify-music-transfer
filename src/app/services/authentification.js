import axios from "axios";
import querystring from "querystring";
import {Buffer} from "buffer";

export const redirectLoginSotify = (state) => {
    const scope = "playlist-modify-public playlist-modify-private";

    return window.location.href =
        "https://accounts.spotify.com/authorize?" +
        querystring.stringify({
            response_type: "code",
            client_id: process.env.REACT_APP_SPOTIFY_CLIENT_ID,
            scope: scope,
            redirect_uri: process.env.REACT_APP_SPOTIFY_REDIRECT_URI,
            state: state,
        });
};

export const getAccessToken = (code) => {
    const tokenResponse =  axios.post("https://accounts.spotify.com/api/token", {
        grant_type: "authorization_code",
        code: code,
        redirect_uri: process.env.REACT_APP_SPOTIFY_REDIRECT_URI
    }, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization:
                "Basic " +
                Buffer.from(
                    process.env.REACT_APP_SPOTIFY_CLIENT_ID +
                    ":" +
                    process.env.REACT_APP_SPOTIFY_CLIENT_SECRET
                ).toString("base64"),
        }
    })
    return tokenResponse
}
