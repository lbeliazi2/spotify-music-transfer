import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleMinus } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

const FileDrop = ({ files, setFiles, startTransfer, isTransferring, showPopup, logs }) => {
    const [error, setError] = useState('');

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        processFiles(e.dataTransfer.files);
    };

    const handleChange = (e) => {
        processFiles(e.target.files);
    };

    const processFiles = (selectedFiles) => {
        const validFiles = [];
        const invalidFiles = [];

        Array.from(selectedFiles).forEach((file) => {
            if (file.type === 'text/xml') {
                validFiles.push(file);
            } else {
                invalidFiles.push(file.name);
            }
        });

        if (invalidFiles.length > 0) {
            setError(`Fichiers non XML détectés : ${invalidFiles.join(', ')}`);
        } else {
            setError('');
        }

        setFiles([...files, ...validFiles]);
    };

    const deleteFile = (index) => {
        setFiles(files.filter((_, i) => i !== index));
    };


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
                initial={{opacity: 0, scale: 0.9}}
                animate={{opacity: 1, scale: 1}}
                transition={{duration: 0.5}}
                className="relative bg-white shadow-xl rounded-2xl p-8 flex flex-col items-center"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
            >
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Déposez vos fichiers XML ici</h3>

                <div
                    className="w-full h-32 border-2 border-dashed border-gray-400 rounded-lg flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-200 transition-all cursor-pointer">
                    <p className="text-gray-600 text-sm mb-2">Glissez-déposez vos fichiers</p>
                    <label
                        className="cursor-pointer bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-all">
                        Cliquez ici pour importer
                        <input type="file" accept=".xml" multiple onChange={handleChange} className="hidden"/>
                    </label>
                </div>

                {/* Liste des fichiers sélectionnés */}
                {files.length > 0 && (
                    <div className="mt-4 w-full">
                        <h4 className="text-lg font-medium text-gray-600 mb-2">Fichiers sélectionnés :</h4>
                        <ul className="space-y-2">
                            {files.map((file, index) => (
                                <li key={index}
                                    className="flex items-center justify-between p-2 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-all">
                                    <span className="text-sm text-gray-700">{file.name}</span>
                                    <FontAwesomeIcon
                                        icon={faCircleMinus}
                                        className="text-red-500 cursor-pointer hover:text-red-700"
                                        onClick={() => deleteFile(index)}
                                    />
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {files.length > 0 && (
                    <button
                        onClick={startTransfer}
                        disabled={isTransferring}
                        className={`mt-4 px-6 py-3 text-white font-bold rounded-xl transition-all duration-300 ${
                            isTransferring ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 shadow-lg"
                        }`}
                    >
                        {isTransferring ? "Transferring..." : "Start Transfer"}
                    </button>
                )}

                {showPopup && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed top-10 right-10 bg-white shadow-2xl p-6 rounded-2xl w-96 border border-gray-200"
                    >
                        <h4 className="font-semibold text-lg mb-4 text-gray-800">Transfer Progress</h4>

                        {logs.map((log, index) => (
                            <div
                                key={index}
                                className="mb-4 p-4 border rounded-xl shadow-sm bg-gray-50"
                            >
                                <h5 className="font-medium text-gray-900 truncate">{log.file}</h5>
                                <p className="text-xs text-gray-500 mt-1">{log.status}</p>

                                <p className="text-sm text-gray-700 mt-2">
                                    Tracks imported:
                                    <span className="font-semibold text-blue-600"> {log.progress} </span>
                                    out of <span className="font-semibold">{log.tracks}</span>
                                </p>

                                <div className="w-full bg-gray-200 h-2.5 rounded-full mt-3 overflow-hidden">
                                    <progress
                                        value={log.progress}
                                        max={log.tracks}
                                        className="w-full h-2.5 bg-blue-500"
                                    />
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}


                {/* Message d'erreur */}
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </motion.div>
        </div>
    );
};

export default FileDrop;
