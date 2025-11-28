import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Info } from 'lucide-react';
import dataIntegrationService from '../services/dataIntegrationService';

const DataImportPanel = ({ onDataImported }) => {
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setImporting(true);
        setImportResult(null);

        try {
            // Determine file type
            const fileType = file.name.endsWith('.csv') ? 'csv' : 'json';

            // Import and process data
            const result = await dataIntegrationService.importData(file, fileType);

            setImportResult(result);

            if (result.success && onDataImported) {
                onDataImported(result.data, result.metadata);
            }
        } catch (error) {
            setImportResult({
                success: false,
                error: error.message
            });
        }

        setImporting(false);
    };

    const handleDrop = async (event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file) {
            // Simulate file input change
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInputRef.current.files = dataTransfer.files;
            handleFileSelect({ target: fileInputRef.current });
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    return (
        <div className="data-import-panel" style={{
            backgroundColor: '#16213e',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px'
        }}>
            <h4 style={{ color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Upload size={20} />
                Import Data
            </h4>

            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                style={{
                    border: '2px dashed #3b82f6',
                    borderRadius: '8px',
                    padding: '32px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: '#0f1729',
                    transition: 'all 0.3s'
                }}
                onClick={() => fileInputRef.current?.click()}
            >
                <FileText size={48} style={{ color: '#3b82f6', margin: '0 auto 16px' }} />
                <p style={{ color: '#999', marginBottom: '8px' }}>
                    {importing ? 'Processing...' : 'Drop CSV or JSON file here, or click to browse'}
                </p>
                <p style={{ color: '#666', fontSize: '12px' }}>
                    Supports district metrics, time-series data, and distribution data
                </p>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.json"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                />
            </div>

            {importResult && (
                <div style={{
                    marginTop: '16px',
                    padding: '16px',
                    borderRadius: '8px',
                    backgroundColor: importResult.success ? '#10b98120' : '#ef444420',
                    border: `1px solid ${importResult.success ? '#10b981' : '#ef4444'}`
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        {importResult.success ? (
                            <CheckCircle size={20} style={{ color: '#10b981' }} />
                        ) : (
                            <AlertCircle size={20} style={{ color: '#ef4444' }} />
                        )}
                        <strong style={{ color: importResult.success ? '#10b981' : '#ef4444' }}>
                            {importResult.success ? 'Import Successful' : 'Import Failed'}
                        </strong>
                    </div>

                    {importResult.success && importResult.metadata && (
                        <div style={{ color: '#999', fontSize: '14px' }}>
                            <p>• Records: {importResult.metadata.recordCount}</p>
                            <p>• Type: {importResult.metadata.dataType}</p>
                            <p>• Imported: {new Date(importResult.metadata.importedAt).toLocaleString()}</p>

                            {importResult.quality && (
                                <div style={{ marginTop: '12px' }}>
                                    <p style={{ color: '#fff', marginBottom: '4px' }}>Data Quality:</p>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                        <div>
                                            <span style={{ color: '#666' }}>Completeness:</span>
                                            <span style={{ color: '#3b82f6', marginLeft: '4px', fontWeight: '600' }}>
                                                {importResult.quality.completeness.toFixed(1)}%
                                            </span>
                                        </div>
                                        <div>
                                            <span style={{ color: '#666' }}>Accuracy:</span>
                                            <span style={{ color: '#10b981', marginLeft: '4px', fontWeight: '600' }}>
                                                {importResult.quality.accuracy.toFixed(1)}%
                                            </span>
                                        </div>
                                        <div>
                                            <span style={{ color: '#666' }}>Overall:</span>
                                            <span style={{ color: '#f59e0b', marginLeft: '4px', fontWeight: '600' }}>
                                                {importResult.quality.overall.toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>

                                    {importResult.quality.issues.length > 0 && (
                                        <div style={{ marginTop: '8px' }}>
                                            <p style={{ color: '#f59e0b', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Info size={14} />
                                                Issues detected:
                                            </p>
                                            <ul style={{ marginLeft: '20px', fontSize: '12px', color: '#999' }}>
                                                {importResult.quality.issues.map((issue, idx) => (
                                                    <li key={idx}>{issue}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {!importResult.success && (
                        <p style={{ color: '#ef4444', fontSize: '14px' }}>
                            {importResult.error}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default DataImportPanel;
