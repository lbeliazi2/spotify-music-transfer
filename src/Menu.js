import React, { useState } from 'react';
import { useLocation } from "react-router-dom";
import FileDrop from "./FileDrop";
import { XMLParser } from "fast-xml-parser";

const Menu = ({ route }) => {
    const location = useLocation();
    const { accessToken } = location.state;

    const [isTransferring, setIsTransferring] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [logs, setLogs] = useState([]);
    const [files, setFiles] = useState([]);
    const [parsedTracks, setParsedTracks] = useState([]);
    const [currentPlaylist, setCurrentPlaylist] = useState(null); // Track the current playlist being transferred
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0); // Track the current song in the playlist
    const [progress, setProgress] = useState(0); // Track the progress of the current playlist transfer
    const [transferTimeout, setTransferTimeout] = useState(null); // For pause/resume

    const parseAppleMusicXML = (file) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const xmlData = e.target.result;

            const parser = new XMLParser({ ignoreAttributes: false });
            const jsonObj = parser.parse(xmlData);

            const tracks = jsonObj.plist.dict.dict.dict;

            const parsed = tracks.map((track) => {
                const nameIndex = track.key.indexOf("Name");
                const artistIndex = track.key.indexOf("Artist");

                return {
                    name: nameIndex !== -1 ? track.string[nameIndex - 1] : "Unknown",
                    artist: artistIndex !== -1 ? track.string[artistIndex - 1] : "Unknown",
                };
            });

            setParsedTracks(parsed);
        };

        reader.readAsText(file);
    };

    const searchSong = async (name, artist, token, retries = 3) => {
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
    };

    const addTracksToPlaylist = async (playlistId, trackURIs, token) => {
        const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ uris: trackURIs }),
        });
        console.log("Tracks added successfully!");
    };

    const createPlaylist = async (name, token, description) => {
        const url = `https://api.spotify.com/v1/me/playlists`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ name, description, public: false }),
        });

        const data = await response.json();
        return data.id;
    };

    const startTransfer = async () => {
        setIsTransferring(true);
        setLogs([]); // Clear existing logs
        setProgress(0); // Reset progress

        // Simulate transferring each file (playlist)
        for (let i = 0; i < files.length; i++) {
            if (isPaused) {
                await new Promise((resolve) => {
                    setTransferTimeout(setTimeout(resolve, 1000));
                });
            }

            const file = files[i];
            setLogs((prevLogs) => [...prevLogs, `Transferring ${file.name}...`]);
            setCurrentPlaylist(file.name); // Set current playlist name
            setCurrentTrackIndex(0); // Reset track index for each playlist
            parseAppleMusicXML(file);

            const playlistId = await createPlaylist(file.name, accessToken, "");

            if (playlistId) {
                let trackURIs = [];
                const limit = 100;
                for (const track of parsedTracks) {
                    if (isPaused) {
                        await new Promise((resolve) => {
                            setTransferTimeout(setTimeout(resolve, 1000));
                        });
                    }

                    const trackURI = await searchSong(track.name, track.artist, accessToken);
                    if (trackURI) trackURIs.push(trackURI);
                    setCurrentTrackIndex((prev) => prev + 1); // Update track index

                    if (trackURIs.length === limit && parsedTracks.length > limit) {
                        setLogs((prevLogs) => [...prevLogs, `Adding ${trackURIs.length} tracks to playlist...`]);
                        await addTracksToPlaylist(playlistId, trackURIs, accessToken);
                        trackURIs = [];
                    }

                    setProgress((prevProgress) => Math.floor(((i + 1) / files.length) * 100)); // Update progress
                    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for a second
                }

                await addTracksToPlaylist(playlistId, trackURIs, accessToken);
                setLogs((prevLogs) => [...prevLogs, `✅ Import of playlist ${file.name} successful!`]);
            }
        }

        setIsTransferring(false); // Set transferring flag to false once done
    };

    const pauseTransfer = () => {
        setIsPaused(true);
        setLogs((prevLogs) => [...prevLogs, "Transfer paused."]);
    };

    const resumeTransfer = () => {
        setIsPaused(false);
        setLogs((prevLogs) => [...prevLogs, "Transfer resumed."]);
    };

    const stopTransfer = () => {
        setIsTransferring(false);
        setLogs((prevLogs) => [...prevLogs, "Transfer stopped."]);
    };

    return (
        <div className="App">
            <h1>Playlist Transfer</h1>
            <FileDrop files={files} setFiles={setFiles} />
            <div style={{ marginTop: '20px' }}>
                <button
                    onClick={startTransfer}
                    disabled={isTransferring || files.length === 0}
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        cursor: isTransferring || files.length === 0 ? 'not-allowed' : 'pointer',
                    }}
                >
                    {isTransferring ? 'Transferring...' : 'Start Transfer'}
                </button>
                {isTransferring && (
                    <>
                        <button onClick={pauseTransfer} style={{ marginLeft: '10px' }}>Pause</button>
                        <button onClick={resumeTransfer} style={{ marginLeft: '10px' }}>Resume</button>
                        <button onClick={stopTransfer} style={{ marginLeft: '10px' }}>Stop</button>
                    </>
                )}
            </div>

            {logs.length > 0 && (
                <div style={{ marginTop: '20px', textAlign: 'left' }}>
                    <h4>Transfer Logs:</h4>
                    <ul>
                        {logs.map((log, index) => (
                            <li key={index}>{log}</li>
                        ))}
                    </ul>
                </div>
            )}

            {isTransferring && (
                <div style={{ marginTop: '20px', fontSize: '18px', color: 'green' }}>
                    <h4>Currently Transferring:</h4>
                    <p>Playlist: {currentPlaylist}</p>
                    <p>Track {currentTrackIndex} of {parsedTracks.length}</p>
                    <div style={{ width: '100%', background: '#f3f3f3', borderRadius: '10px', height: '20px' }}>
                        <div
                            style={{
                                height: '100%',
                                width: `${progress}%`,
                                background: 'green',
                                borderRadius: '10px',
                            }}
                        ></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Menu;
