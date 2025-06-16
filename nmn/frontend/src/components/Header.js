import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Header = () => {
    const [storageDetails, setStorageDetails] = useState({
        maxStorage: 0,
        usedStorage: 0,
        availableStorage: 0
    });

    useEffect(() => {
        const fetchStorageDetails = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const response = await axios.get('/api/storage-details', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setStorageDetails({
                    maxStorage: response.data.max_storage_mb,
                    usedStorage: response.data.used_storage_mb,
                    availableStorage: response.data.available_storage_mb
                });
            } catch (error) {
                console.error('Error fetching storage details:', error);
            }
        };

        fetchStorageDetails();
    }, []);

    return (
        <header>
            <h1>Welcome to PixelTre Med</h1>
            <div className="storage-info">
                <p>Max Storage: {storageDetails.maxStorage} MB</p>
                <p>Used Storage: {storageDetails.usedStorage} MB</p>
                <p>Available Storage: {storageDetails.availableStorage} MB</p>
            </div>
        </header>
    );
};

export default Header;
