'use client';

// material-ui
import { Autocomplete, Chip, TextField } from '@mui/material';

// project import
import MainCard from 'components/MainCard';
import data from 'data/movies';

// ==============================|| AUTOCOMPLETE - LIMIT ||============================== //

export default function LimitAutocomplete() {
  return (
    <MainCard title="Limit Tags">
      <Autocomplete
        multiple
        limitTags={2}
        id="multiple-limit-tags"
        options={data}
        getOptionLabel={(option) => option.label}
        defaultValue={[data[13], data[12], data[11]]}
        renderOption={(props, option) => {
          return (
            <li {...props} key={option.key}>
              {option.label}
            </li>
          );
        }}
        renderTags={(tagValue, getTagProps) => {
          return tagValue.map((option, index) => <Chip {...getTagProps({ index })} key={option.key} label={option.label} />);
        }}
        renderInput={(params) => <TextField {...params} placeholder="Limit Tags" />}
        sx={{
          '& .MuiOutlinedInput-root': {
            p: 1
          },
          '& .MuiAutocomplete-tag': {
            bgcolor: 'primary.lighter',
            border: '1px solid',
            borderRadius: 1,
            height: 32,
            pl: 1.5,
            pr: 1.5,
            lineHeight: '32px',
            borderColor: 'primary.light',
            '& .MuiChip-label': {
              paddingLeft: 0,
              paddingRight: 0
            },
            '& .MuiSvgIcon-root': {
              color: 'primary.main',
              ml: 1,
              mr: -0.75,
              '&:hover': {
                color: 'primary.dark'
              }
            }
          }
        }}
      />
    </MainCard>
  );
}