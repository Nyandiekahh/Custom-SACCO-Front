// src/components/investments/InvestmentHistory.jsx
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Pagination,
  TextField,
  MenuItem,
  InputAdornment,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  VisibilityRounded,
  ImageRounded,
  SearchRounded,
  FilterListRounded,
  TrendingUpRounded,
  AccountBalanceWalletRounded,
  CloseRounded
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

import apiService from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import StatusBadge from '../common/UI/StatusBadge';
import LoadingSpinner from '../common/UI/LoadingSpinner';

const InvestmentHistory = ({ type = 'monthly' }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvestment, setSelectedInvestment] = useState(null);

  // Fetch investments
  const { data, isLoading, error } = useQuery({
    queryKey: ['investments', { type, page, status: statusFilter, search: searchTerm }],
    queryFn: () => apiService.get('/investments/', {
      type,
      page,
      page_size: 10,
      status: statusFilter || undefined,
      search: searchTerm || undefined
    })
  });

  const investments = data?.results || [];
  const totalPages = Math.ceil((data?.count || 0) / 10);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(1); // Reset to first page
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset to first page
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'VERIFIED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'REJECTED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getInvestmentIcon = () => {
    return type === 'share_capital' ? (
      <AccountBalanceWalletRounded color="primary" />
    ) : (
      <TrendingUpRounded color="success" />
    );
  };

  const renderMobileCard = (investment) => (
    <Card key={investment.id} sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ bgcolor: theme.palette.primary.main + '20' }}>
              {getInvestmentIcon()}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {formatCurrency(investment.amount)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {type === 'share_capital' ? 'Share Capital' : 
                  `${format(new Date(investment.investment_month), 'MMM yyyy')}`}
              </Typography>
            </Box>
          </Box>
          <StatusBadge status={investment.status} size="small" />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Payment Date
          </Typography>
          <Typography variant="body2">
            {formatDate(investment.payment_date)}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Reference
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
            {investment.reference_code}
          </Typography>
        </Box>

        {investment.verified_at && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Verified
            </Typography>
            <Typography variant="body2">
              {formatDate(investment.verified_at)}
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            size="small"
            startIcon={<VisibilityRounded />}
            onClick={() => setSelectedInvestment(investment)}
          >
            View Details
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  const renderDesktopTable = () => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Amount</TableCell>
            {type === 'monthly' && <TableCell>Month</TableCell>}
            <TableCell>Payment Date</TableCell>
            <TableCell>Reference</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Verified</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {investments.map((investment) => (
            <TableRow key={investment.id} hover>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatCurrency(investment.amount)}
                </Typography>
              </TableCell>
              {type === 'monthly' && (
                <TableCell>
                  <Typography variant="body2">
                    {format(new Date(investment.investment_month), 'MMM yyyy')}
                  </Typography>
                </TableCell>
              )}
              <TableCell>
                <Typography variant="body2">
                  {formatDate(investment.payment_date)}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {investment.reference_code}
                </Typography>
              </TableCell>
              <TableCell>
                <StatusBadge status={investment.status} size="small" />
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {investment.verified_at ? formatDate(investment.verified_at) : '-'}
                </Typography>
                {investment.verified_by_name && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    by {investment.verified_by_name}
                  </Typography>
                )}
              </TableCell>
              <TableCell align="center">
                <IconButton
                  size="small"
                  onClick={() => setSelectedInvestment(investment)}
                >
                  <VisibilityRounded />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="error">
          Failed to load investment history
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search by reference..."
          value={searchTerm}
          onChange={handleSearchChange}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRounded />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 200 }}
        />
        
        <TextField
          select
          label="Status"
          value={statusFilter}
          onChange={handleStatusFilterChange}
          size="small"
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="PENDING">Pending</MenuItem>
          <MenuItem value="VERIFIED">Verified</MenuItem>
          <MenuItem value="REJECTED">Rejected</MenuItem>
        </TextField>
      </Box>

      {/* Investment List */}
      {investments.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Avatar sx={{ mx: 'auto', mb: 2, bgcolor: 'grey.100', width: 64, height: 64 }}>
            {getInvestmentIcon()}
          </Avatar>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No {type === 'share_capital' ? 'Share Capital Payments' : 'Monthly Investments'} Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm || statusFilter ? 
              'Try adjusting your filters' : 
              'Start by recording your first investment'
            }
          </Typography>
        </Box>
      ) : (
        <>
          {isMobile ? (
            <Box>
              {investments.map(renderMobileCard)}
            </Box>
          ) : (
            <Card>
              {renderDesktopTable()}
            </Card>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      {/* Investment Details Modal */}
      <Dialog
        open={!!selectedInvestment}
        onClose={() => setSelectedInvestment(null)}
        maxWidth="sm"
        fullWidth
      >
        {selectedInvestment && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6">
                  Investment Details
                </Typography>
                <IconButton onClick={() => setSelectedInvestment(null)}>
                  <CloseRounded />
                </IconButton>
              </Box>
            </DialogTitle>
            
            <DialogContent dividers>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Amount */}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Amount
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(selectedInvestment.amount)}
                  </Typography>
                </Box>

                {/* Investment Month (for monthly investments) */}
                {type === 'monthly' && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Investment Month
                    </Typography>
                    <Typography variant="body1">
                      {format(new Date(selectedInvestment.investment_month), 'MMMM yyyy')}
                    </Typography>
                  </Box>
                )}

                {/* Reference Code */}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    M-Pesa Reference
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                    {selectedInvestment.reference_code}
                  </Typography>
                </Box>

                {/* Payment Date */}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Payment Date
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(selectedInvestment.payment_date)}
                  </Typography>
                </Box>

                {/* Status */}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <StatusBadge status={selectedInvestment.status} />
                </Box>

                {/* Verification Info */}
                {selectedInvestment.verified_at && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Verification
                    </Typography>
                    <Typography variant="body2">
                      Verified on {formatDate(selectedInvestment.verified_at)}
                      {selectedInvestment.verified_by_name && (
                        <> by {selectedInvestment.verified_by_name}</>
                      )}
                    </Typography>
                  </Box>
                )}

                {/* Rejection Reason */}
                {selectedInvestment.status === 'REJECTED' && selectedInvestment.rejection_reason && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Rejection Reason
                    </Typography>
                    <Typography variant="body2" color="error">
                      {selectedInvestment.rejection_reason}
                    </Typography>
                  </Box>
                )}

                {/* M-Pesa Message */}
                {selectedInvestment.mpesa_message && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      M-Pesa Message
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      backgroundColor: 'grey.50', 
                      p: 1, 
                      borderRadius: 1,
                      fontFamily: 'monospace',
                      fontSize: '0.875rem'
                    }}>
                      {selectedInvestment.mpesa_message}
                    </Typography>
                  </Box>
                )}

                {/* Receipt Image */}
                {selectedInvestment.receipt_image && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      Receipt Image
                    </Typography>
                    <Box
                      component="img"
                      src={selectedInvestment.receipt_image}
                      alt="Receipt"
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
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default InvestmentHistory;