import React, { useCallback, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  Alert,
  IconButton,
  useTheme
} from '@mui/material';
import {
  CloudUploadRounded,
  DeleteRounded,
  ImageRounded,
  DescriptionRounded
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';

import { FILE_UPLOAD } from '../../../utils/constants';
import { formatFileSize } from '../../../utils/formatters';

const FileUpload = ({
  onFileSelect,
  acceptedTypes = FILE_UPLOAD.ALLOWED_TYPES,
  maxSizeMB = FILE_UPLOAD.MAX_SIZE / (1024 * 1024),
  multiple = false,
  helperText,
  error,
  disabled = false
}) => {
  const theme = useTheme();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadError, setUploadError] = useState('');

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setUploadError('');

    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        setUploadError(`File is too large. Maximum size is ${maxSizeMB}MB`);
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setUploadError('Invalid file type. Please upload an image or PDF file.');
      } else {
        setUploadError('File upload failed. Please try again.');
      }
      return;
    }

    // Handle accepted files
    if (acceptedFiles.length > 0) {
      const files = acceptedFiles.map(file => ({
        file,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        name: file.name,
        size: file.size,
        type: file.type
      }));

      if (multiple) {
        setUploadedFiles(prev => [...prev, ...files]);
        onFileSelect([...uploadedFiles.map(f => f.file), ...acceptedFiles]);
      } else {
        setUploadedFiles(files);
        onFileSelect(acceptedFiles[0]);
      }
    }
  }, [onFileSelect, multiple, uploadedFiles, maxSizeMB]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {}),
    maxSize: maxSizeMB * 1024 * 1024,
    multiple,
    disabled
  });

  const removeFile = (index) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    
    if (multiple) {
      onFileSelect(newFiles.map(f => f.file));
    } else {
      onFileSelect(null);
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) {
      return <ImageRounded />;
    }
    return <DescriptionRounded />;
  };

  return (
    <Box>
      {/* Upload Area */}
      <Box
        {...getRootProps()}
        sx={{
          border: `2px dashed ${
            isDragActive 
              ? theme.palette.primary.main 
              : error || uploadError 
                ? theme.palette.error.main 
                : theme.palette.divider
          }`,
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          cursor: disabled ? 'default' : 'pointer',
          backgroundColor: isDragActive 
            ? theme.palette.primary.main + '10' 
            : disabled 
              ? theme.palette.action.disabledBackground
              : 'transparent',
          transition: 'all 0.2s ease',
          '&:hover': disabled ? {} : {
            borderColor: theme.palette.primary.main,
            backgroundColor: theme.palette.primary.main + '05'
          }
        }}
      >
        <input {...getInputProps()} />
        
        <CloudUploadRounded 
          sx={{ 
            fontSize: 48, 
            color: disabled 
              ? theme.palette.action.disabled 
              : theme.palette.primary.main,
            mb: 1 
          }} 
        />
        
        <Typography variant="h6" sx={{ mb: 1 }}>
          {isDragActive ? 'Drop files here' : 'Upload Files'}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {isDragActive 
            ? 'Release to upload'
            : `Drag and drop ${multiple ? 'files' : 'a file'} here, or click to browse`
          }
        </Typography>
        
        <Button
          variant="outlined"
          disabled={disabled}
          sx={{ mb: 1 }}
        >
          Choose {multiple ? 'Files' : 'File'}
        </Button>
        
        {helperText && (
          <Typography variant="caption" color="text.secondary" display="block">
            {helperText}
          </Typography>
        )}
      </Box>

      {/* Error Display */}
      {(error || uploadError) && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error || uploadError}
        </Alert>
      )}

      {/* Uploaded Files Display */}
      {uploadedFiles.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Uploaded {multiple ? 'Files' : 'File'}:
          </Typography>
          
          {uploadedFiles.map((fileData, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 2,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                mb: 1,
                backgroundColor: theme.palette.background.paper
              }}
            >
              {/* File Icon/Preview */}
              <Box sx={{ mr: 2 }}>
                {fileData.preview ? (
                  <Box
                    component="img"
                    src={fileData.preview}
                    alt="Preview"
                    sx={{
                      width: 40,
                      height: 40,
                      objectFit: 'cover',
                      borderRadius: 1
                    }}
                  />
                ) : (
                  getFileIcon(fileData.type)
                )}
              </Box>

              {/* File Info */}
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
                  {fileData.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatFileSize(fileData.size)}
                </Typography>
              </Box>

              {/* Remove Button */}
              <IconButton
                size="small"
                onClick={() => removeFile(index)}
                sx={{ ml: 1 }}
              >
                <DeleteRounded />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default FileUpload;