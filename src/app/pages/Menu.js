import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import FileDrop from "../components/FileDrop";
import { XMLParser } from "fast-xml-parser";

const Menu = () => {
    const location = useLocation();
    const accessToken = location.state?.accessToken || "";

    const [isTransferring, setIsTransferring] = useState(false);
    const [files, setFiles] = useState([]);
    const [logs, setLogs] = useState([]);
    const [progress, setProgress] = useState(0);
    const [showPopup, setShowPopup] = useState(false);

    async function searchSong(name, artist, token, retries = 3) {
        const query = encodeURIComponent(`${name} ${artist}`);
        const url = `https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`;

        let response;
        for (let attempt = 1; attempt <= retries; attempt++) {
            response = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 429) {
                const retryAfter = response.headers.get("Retry-After");
                console.warn(`429 Too Many Requests - Retrying in ${retryAfter} seconds...`);
                await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
            } else {
                break;
            }
        }

        if (!response.ok) {
            console.error(`Error: ${response.status} - ${response.statusText}`);
            return null;
        }

        const data = await response.json();
        return data.tracks.items.length > 0 ? data.tracks.items[0].uri : null;
    }

    async function addTracksToPlaylist(playlistId, trackURIs, token) {
        const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ uris: trackURIs }),
        });

    }

    async function createPlaylist(name, token, description) {
        const url = `https://api.spotify.com/v1/me/playlists`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ name, description, public: false }),
        });
        setLogs((prev) => prev.map(log => log.file === name ? { ...log, status: "Playlist creating", progress: 0} : log));

        const data = await response.json();
        return data.id;
    }

    const parseAppleMusicXML = async (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const parser = new XMLParser({ ignoreAttributes: false });
                const jsonObj = parser.parse(e.target.result);
                const tracks = jsonObj.plist?.dict?.dict?.dict || [];

                resolve(tracks.map(track => ({
                    name: track?.string?.find((_, index) => track?.key[index] === "Name") || "Unknown",
                    artist: track?.string?.find((_, index) => track?.key[index] === "Artist") || "Unknown",
                })));
            };
            reader.readAsText(file);
        });
    };

    const startTransfer = async () => {
        if (files.length === 0) return;
        setIsTransferring(true);
        setLogs([]);
        setProgress(0);
        setShowPopup(true);

        for (const file of files) {
            setLogs((prev) => [...prev, { file: file.name, status: "Processing", progress: 0, tracks: 0 }]);

            const parsed = await parseAppleMusicXML(file);
            const playlistId = await createPlaylist(file.name, accessToken, "");
            if (playlistId) {
                const trackUris = [];
                setLogs((prev) => prev.map(log => log.file === file.name ? { ...log, status: "Playlist created", progress: 0, tracks: parsed.length } : log));
                for (const song of parsed) {
                    const index = parsed.indexOf(song);
                    console.log(song);
                    const songFound = await searchSong(song.name, song.artist, accessToken, 3);
                    if (!songFound) {
                        setLogs((prev) => prev.map(log => log.file === file.name ? { ...log, status: "Error whilst searching for a song", progress: parsed.indexOf(song) } : log));
                    }
                    if(!trackUris.includes(songFound)) {
                        trackUris.push(songFound)
                    }
                    setLogs((prev) => prev.map(log => log.file === file.name ? { ...log, progress: parsed.indexOf(song), tracks: parsed.length } : log));
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                }
                setLogs((prev) => prev.map(log => log.file === file.name ? { ...log, status: "All songs were found", progress: parsed.length, tracks: parsed.length } : log));
                await addTracksToPlaylist(playlistId, trackUris, accessToken);
                setLogs((prev) => prev.map(log => log.file === file.name ? { ...log, status: "✅ Done", progress: 100 } : log));
            }


        }

        setIsTransferring(false);
        setTimeout(() => setShowPopup(false), 2000);
    };

    return (
        <div className="flex flex-col items-center bg-gray-100 min-h-screen">
            <FileDrop files={files} setFiles={setFiles} startTransfer={startTransfer} isTransferring={isTransferring} showPopup={showPopup} logs={logs}/>
        </div>
    );
};

export default Menu;