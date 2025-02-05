import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleMinus } from '@fortawesome/free-solid-svg-icons';  // Import the icon you want to use

const FileDrop = ({files, setFiles}) => {
    const [error, setError] = useState('');

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const droppedFiles = e.dataTransfer.files;
        const validFiles = [];
        const invalidFiles = [];

        // Filter valid .xml files
        Array.from(droppedFiles).forEach((file) => {
            if (file.type === 'text/xml') {
                validFiles.push(file);
            } else {
                invalidFiles.push(file.name);
            }
        });

        if (invalidFiles.length > 0) {
            setError(`These files are not XML: ${invalidFiles.join(', ')}`);
        } else {
            setError('');
        }

        setFiles([...files, ...validFiles]);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };



        const deleteFile = (index) => {
            const updatedFiles = files.filter((_, i) => i !== index);
            setFiles(updatedFiles);
        };

    const handleChange = (e) => {
        const selectedFiles = e.target.files;
        const validFiles = [];
        const invalidFiles = [];

        // Filter valid .xml files
        Array.from(selectedFiles).forEach((file) => {
            if (file.type === 'text/xml') {
                validFiles.push(file);
            } else {
                invalidFiles.push(file.name);
            }
        });

        if (invalidFiles.length > 0) {
            setError(`These files are not XML: ${invalidFiles.join(', ')}`);
        } else {
            setError('');
        }

        setFiles([...files, ...validFiles]);
    };



    return (
        <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            style={{
                border: '2px dashed #ccc',
                padding: '20px',
                textAlign: 'center',
                cursor: 'pointer',
            }}
        >
            <h3>Drop your XML files here</h3>
            {files.length > 0 && (
                <div>
                    <h4>Selected Files:</h4>
                    <ul>
                        {files.map((file, index) => (
                            <li key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                <FontAwesomeIcon onClick={() => deleteFile(index)} icon={faCircleMinus} style={{ marginRight: '10px' }} />
                                {file.name}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <input
                type="file"
                accept=".xml"
                multiple
                onChange={handleChange}
                style={{ display: 'block', marginTop: '10px' }}
            />
        </div>
    );
};

export default FileDrop;
