import React, { forwardRef } from 'react';
import { TextField, InputAdornment } from '@mui/material';
import { CURRENCY } from '../../../utils/constants';

const CurrencyInput = forwardRef(({ value, onChange, ...props }, ref) => {
  const handleChange = (event) => {
    const inputValue = event.target.value;
    
    // Remove all non-numeric characters except decimal point
    const numericValue = inputValue.replace(/[^\d.]/g, '');
    
    // Ensure only one decimal point
    const parts = numericValue.split('.');
    const formattedValue = parts.length > 2 
      ? parts[0] + '.' + parts.slice(1).join('')
      : numericValue;
    
    // Limit to 2 decimal places
    const finalValue = parts[1] && parts[1].length > 2
      ? parts[0] + '.' + parts[1].substring(0, 2)
      : formattedValue;
    
    onChange(finalValue);
  };

  return (
    <TextField
      {...props}
      ref={ref}
      value={value}
      onChange={handleChange}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            {CURRENCY.SYMBOL}
          </InputAdornment>
        ),
        ...props.InputProps,
      }}
      inputProps={{
        inputMode: 'decimal',
        pattern: '[0-9]*[.]?[0-9]*',
        ...props.inputProps,
      }}
    />
  );
});

CurrencyInput.displayName = 'CurrencyInput';

export default CurrencyInput;