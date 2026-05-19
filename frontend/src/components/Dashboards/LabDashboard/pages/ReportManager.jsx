import React, { useState } from 'react';
import { FileUp, FileText, X, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const ReportManager = ({ sampleId, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const onDrop = (acceptedFiles, fileRejections) => {
    if (fileRejections.length > 0) {
      setError("Invalid file format. Please upload a PDF.");
      return;
    }
    setError(null);
    setIsSuccess(false);
    setFile(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false
  });

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post(
        `http://localhost:8000/api/v1/lab/requests/${sampleId}/upload-report`, 
        formData, 
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      
      setIsSuccess(true);
      setFile(null);
      
      // Trigger callback to refresh parent list
      if (onUploadSuccess) onUploadSuccess();
      
      // Reset success message after 3 seconds
      setTimeout(() => setIsSuccess(false), 3000);
      
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed. Please check server connection.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>Upload Lab Report</h3>
      
      {!file ? (
        <div {...getRootProps()} style={{ 
          border: `2px dashed ${isDragActive ? '#10b981' : '#cbd5e1'}`,
          padding: '30px', borderRadius: '12px', textAlign: 'center', cursor: 'pointer',
          backgroundColor: isDragActive ? '#ecfdf5' : '#f8fafc',
          transition: 'all 0.2s'
        }}>
          <input {...getInputProps()} />
          <FileUp size={32} color={isDragActive ? '#10b981' : '#94a3b8'} style={{ margin: '0 auto 10px' }} />
          <p style={{ color: '#64748b', fontSize: '13px' }}>Click or drag PDF report here</p>
        </div>
      ) : (
        <div style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            <FileText size={20} color="#10b981" />
            <span style={{ fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</span>
          </div>
          <button onClick={() => setFile(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={16} color="#64748b" />
          </button>
        </div>
      )}

      {error && (
        <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {isSuccess && (
        <div style={{ color: '#10b981', fontSize: '12px', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <CheckCircle2 size={14} /> Report uploaded successfully!
        </div>
      )}
      
      <button 
        onClick={handleUpload}
        disabled={!file || uploading} 
        style={{ 
          width: '100%', marginTop: '16px', padding: '10px', 
          backgroundColor: file && !uploading ? '#10b981' : '#e2e8f0', 
          color: 'white', border: 'none', borderRadius: '8px', cursor: file && !uploading ? 'pointer' : 'not-allowed',
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontWeight: '600'
        }}
      >
        {uploading ? <Loader2 size={16} className="animate-spin" /> : 'Upload Report'}
      </button>
    </div>
  );
};

export default ReportManager;