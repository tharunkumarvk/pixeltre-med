import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const PreviewRecord = () => {
    const { recordId } = useParams();

    const [record, setRecord] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecordPreview = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/records/${recordId}/preview/`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                    },
                });
                setRecord(response.data);
            } catch (err) {
                const errorMessage = err.response?.data?.error || "Record not found or deleted. Please check the record ID.";
                console.error("Error fetching record preview:", errorMessage);
                setError(errorMessage);
            }
        };

        fetchRecordPreview();
    }, [recordId]);

    if (error) {
        return <div className="error">Error: {error}</div>;
    }

    if (!record) {
        return <div>Loading...</div>;
    }

    return (
        <div className="preview-record">
            <h2>Record Preview</h2>
            <div className="metadata">
                <p><strong>Record ID:</strong> {record.record_id}</p>
                <p><strong>Patient ID:</strong> {record.patient}</p>
                <p><strong>Doctor ID:</strong> {record.doctor}</p>
                <p><strong>Description:</strong> {record.description}</p>
            </div>
            <div className="preview">
                <img src={record.preview_url} alt="Prescription Preview" />
            </div>
        </div>
    );
};

export default PreviewRecord;
