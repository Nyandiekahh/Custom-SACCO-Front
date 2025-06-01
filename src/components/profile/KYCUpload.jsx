// src/components/profile/KYCUpload.jsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  Grid,
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  useTheme
} from '@mui/material';
import {
  VerifiedUserRounded,
  UploadFileRounded,
  ImageRounded,
  CheckCircleRounded,
  PendingRounded,
  ErrorRounded,
  CloseRounded,
  CameraAltRounded,
  BadgeRounded
} from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import apiService from '../../services/api';
import FileUpload from '../common/UI/FileUpload';
import StatusBadge from '../common/UI/StatusBadge';

const KYC_DOCUMENT_TYPES = {
  ID_FRONT: { label: 'ID Front', description: 'Clear photo of the front of your national ID' },
  ID_BACK: { label: 'ID Back', description: 'Clear photo of the back of your national ID' },
  SELFIE_WITH_ID: { label: 'Selfie with ID', description: 'Photo of yourself holding your ID next to your face' }
};

const KYCUpload = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // Fetch KYC documents
  const { data: kycDocuments = [], isLoading } = useQuery({
    queryKey: ['kycDocuments'],
    queryFn: () => apiService.get('/auth/kyc/documents/')
  });

  // Upload KYC document mutation
  const uploadMutation = useMutation({
    mutationFn: (formData) => apiService.uploadFile('/auth/kyc/upload/', formData),
    onSuccess: () => {
      toast.success('Document uploaded successfully!');
      queryClient.invalidateQueries(['kycDocuments']);
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to upload document');
    }
  });

  const handleUploadClick = (type) => {
    setSelectedType(type);
    setUploadDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setUploadDialogOpen(false);
    setSelectedType(null);
    setSelectedFile(null);
    setPreviewImage(null);
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    
    // Create preview
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!selectedFile || !selectedType) return;

    const formData = new FormData();
    formData.append('document_type', selectedType);
    formData.append('document_file', selectedFile);

    uploadMutation.mutate(formData);
  };

  const getDocumentStatus = (type) => {
    const doc = kycDocuments.find(d => d.document_type === type);
    return doc ? doc.status : null;
  };

  const getDocumentInfo = (type) => {
    return kycDocuments.find(d => d.document_type === type);
  };

  const getOverallStatus = () => {
    const statuses = Object.keys(KYC_DOCUMENT_TYPES).map(type => getDocumentStatus(type));
    
    if (statuses.every(status => status === 'APPROVED')) {
      return { status: 'APPROVED', text: 'Fully Verified', color: 'success' };
    }
    
    if (statuses.some(status => status === 'REJECTED')) {
      return { status: 'REJECTED', text: 'Verification Issues', color: 'error' };
    }
    
    if (statuses.some(status => status === 'PENDING')) {
      return { status: 'PENDING', text: 'Under Review', color: 'warning' };
    }
    
    const uploadedCount = statuses.filter(status => status !== null).length;
    return { 
      status: 'INCOMPLETE', 
      text: `${uploadedCount}/3 Documents Uploaded`, 
      color: 'info' 
    };
  };

  const overallStatus = getOverallStatus();
  const totalDocs = Object.keys(KYC_DOCUMENT_TYPES).length;
  const uploadedDocs = kycDocuments.length;
  const progress = (uploadedDocs / totalDocs) * 100;

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>KYC Verification</Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <VerifiedUserRounded sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" sx={{ fontWeight: 600, flexGrow: 1 }}>
          KYC Verification
        </Typography>
        <Chip
          label={overallStatus.text}
          color={overallStatus.color}
          icon={
            overallStatus.status === 'APPROVED' ? <CheckCircleRounded /> :
            overallStatus.status === 'PENDING' ? <PendingRounded /> :
            overallStatus.status === 'REJECTED' ? <ErrorRounded /> :
            <UploadFileRounded />
          }
        />
      </Box>

      {/* Progress */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Verification Progress
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {uploadedDocs}/{totalDocs} documents
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          color={overallStatus.color}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>

      {/* Status Alert */}
      {overallStatus.status === 'APPROVED' && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="body2">
            🎉 Your identity has been verified! You now have full access to all SACCO features.
          </Typography>
        </Alert>
      )}

      {overallStatus.status === 'REJECTED' && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Some of your documents were rejected. Please review the feedback and re-upload the required documents.
          </Typography>
        </Alert>
      )}

      {overallStatus.status === 'PENDING' && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Your documents are being reviewed. This usually takes 1-2 business days.
          </Typography>
        </Alert>
      )}

      {/* Document Cards */}
      <Grid container spacing={2}>
        {Object.entries(KYC_DOCUMENT_TYPES).map(([type, info]) => {
          const documentInfo = getDocumentInfo(type);
          const status = getDocumentStatus(type);

          return (
            <Grid item xs={12} md={4} key={type}>
              <Card
                sx={{
                  height: '100%',
                  border: status === 'APPROVED' ? `2px solid ${theme.palette.success.main}` :
                         status === 'REJECTED' ? `2px solid ${theme.palette.error.main}` :
                         status === 'PENDING' ? `2px solid ${theme.palette.warning.main}` :
                         `1px solid ${theme.palette.divider}`
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <BadgeRounded sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, flexGrow: 1 }}>
                      {info.label}
                    </Typography>
                    {status && <StatusBadge status={status} size="small" />}
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {info.description}
                  </Typography>

                  {documentInfo && documentInfo.document_file && (
                    <Box
                      component="img"
                      src={documentInfo.document_file}
                      alt={info.label}
                      sx={{
                        width: '100%',
                        height: 120,
                        objectFit: 'cover',
                        borderRadius: 1,
                        mb: 2,
                        border: `1px solid ${theme.palette.divider}`
                      }}
                    />
                  )}

                  {status === 'REJECTED' && documentInfo?.rejection_reason && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      <Typography variant="caption">
                        {documentInfo.rejection_reason}
                      </Typography>
                    </Alert>
                  )}

                  <Button
                    fullWidth
                    variant={status ? "outlined" : "contained"}
                    startIcon={<UploadFileRounded />}
                    onClick={() => handleUploadClick(type)}
                    color={status === 'REJECTED' ? 'error' : 'primary'}
                  >
                    {status ? 'Re-upload' : 'Upload'}
                  </Button>

                  {documentInfo && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Uploaded: {new Date(documentInfo.uploaded_at).toLocaleDateString()}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Upload Dialog */}
      <Dialog
        open={uploadDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              Upload {selectedType ? KYC_DOCUMENT_TYPES[selectedType].label : ''}
            </Typography>
            <IconButton onClick={handleCloseDialog}>
              <CloseRounded />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {selectedType && (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {KYC_DOCUMENT_TYPES[selectedType].description}
              </Typography>

              <FileUpload
                onFileSelect={handleFileSelect}
                acceptedTypes={['image/*']}
                maxSizeMB={5}
                helperText="Upload a clear photo (JPG, PNG - Max 5MB)"
              />

              {previewImage && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Preview:
                  </Typography>
                  <Box
                    component="img"
                    src={previewImage}
                    alt="Preview"
                    sx={{
                      width: '100%',
                      maxHeight: 300,
                      objectFit: 'contain',
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 1
                    }}
                  />
                </Box>
              )}

              {/* Guidelines */}
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                  Photo Guidelines:
                </Typography>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  <li>Ensure the document is clearly visible and readable</li>
                  <li>Take the photo in good lighting</li>
                  <li>Avoid glare, shadows, or blurry images</li>
                  <li>Include all four corners of the document</li>
                  {selectedType === 'SELFIE_WITH_ID' && (
                    <li>Your face and ID should both be clearly visible</li>
                  )}
                </ul>
              </Alert>
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!selectedFile || uploadMutation.isLoading}
            startIcon={uploadMutation.isLoading ? <LinearProgress /> : <UploadFileRounded />}
          >
            {uploadMutation.isLoading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Information */}
      <Box sx={{ 
        mt: 4, 
        p: 2, 
        backgroundColor: 'info.main' + '10', 
        border: '1px solid',
        borderColor: 'info.main' + '30',
        borderRadius: 2 
      }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Why do we need KYC verification?
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Know Your Customer (KYC) verification helps us:
          • Comply with financial regulations and prevent fraud
          • Ensure the security of your account and transactions
          • Provide you with the full range of SACCO services
          • Maintain the trust and safety of our community
        </Typography>
      </Box>
    </Box>
  );
};

export default KYCUpload;