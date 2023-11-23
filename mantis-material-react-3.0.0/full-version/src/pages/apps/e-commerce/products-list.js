import PropTypes from 'prop-types';
import { Fragment, useMemo, useState } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';

// material-ui
import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Button,
  Chip,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from '@mui/material';

// third-party
import { NumericFormat } from 'react-number-format';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getExpandedRowModel,
  useReactTable
} from '@tanstack/react-table';

// third-party
import { rankItem } from '@tanstack/match-sorter-utils';

// project-import
import ScrollX from 'components/ScrollX';
import MainCard from 'components/MainCard';
import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';

import {
  CSVExport,
  DebouncedInput,
  HeaderSort,
  IndeterminateCheckbox,
  RowSelection,
  SelectColumnSorting,
  TablePagination
} from 'components/third-party/react-table';

import ProductView from 'sections/apps/e-commerce/product-list/ProductView';

// assets
import { EyeOutlined, PlusOutlined } from '@ant-design/icons';

const productImage = require.context('assets/images/e-commerce', true);

export const fuzzyFilter = (row, columnId, value, addMeta) => {
  // rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // store the ranking info
  addMeta(itemRank);

  // return if the item should be filtered in/out
  return itemRank.passed;
};

// ==============================|| REACT TABLE - LIST ||============================== //

function ReactTable({ data, columns }) {
  const theme = useTheme();

  const [sorting, setSorting] = useState([
    {
      id: 'name',
      desc: false
    }
  ]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      rowSelection,
      globalFilter
    },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getRowCanExpand: () => true,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    globalFilterFn: fuzzyFilter,
    debugTable: true
  });

  const backColor = alpha(theme.palette.primary.lighter, 0.1);
  let headers = [];
  columns.map(
    (columns) =>
      // @ts-ignore
      columns.accessorKey &&
      headers.push({
        label: typeof columns.header === 'string' ? columns.header : '#',
        // @ts-ignore
        key: columns.accessorKey
      })
  );

  const history = useNavigate();

  const handleAddProduct = () => {
    history(`/apps/e-commerce/add-new-product`);
  };

  return (
    <MainCard content={false}>
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ padding: 2 }}>
        <DebouncedInput
          value={globalFilter ?? ''}
          onFilterChange={(value) => setGlobalFilter(String(value))}
          placeholder={`Search ${data.length} records...`}
        />

        <Stack direction="row" spacing={2} alignItems="center">
          <SelectColumnSorting {...{ getState: table.getState, getAllColumns: table.getAllColumns, setSorting }} />
          <Button variant="contained" startIcon={<PlusOutlined />} onClick={handleAddProduct}>
            Add Product
          </Button>
          <CSVExport
            {...{
              data:
                table.getSelectedRowModel().flatRows.map((row) => row.original).length === 0
                  ? data
                  : table.getSelectedRowModel().flatRows.map((row) => row.original),
              headers,
              filename: 'product-list.csv'
            }}
          />
        </Stack>
      </Stack>
      <ScrollX>
        <Stack>
          <RowSelection selected={Object.keys(rowSelection).length} />
          <TableContainer>
            <Table>
              <TableHead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      if (header.column.columnDef.meta !== undefined && header.column.getCanSort()) {
                        Object.assign(header.column.columnDef.meta, {
                          className: header.column.columnDef.meta.className + ' cursor-pointer prevent-select'
                        });
                      }

                      return (
                        <TableCell
                          key={header.id}
                          {...header.column.columnDef.meta}
                          onClick={header.column.getToggleSortingHandler()}
                          {...(header.column.getCanSort() &&
                            header.column.columnDef.meta === undefined && {
                              className: 'cursor-pointer prevent-select'
                            })}
                        >
                          {header.isPlaceholder ? null : (
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Box>{flexRender(header.column.columnDef.header, header.getContext())}</Box>
                              {header.column.getCanSort() && <HeaderSort column={header.column} />}
                            </Stack>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHead>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <Fragment key={row.id}>
                    <TableRow>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} {...cell.column.columnDef.meta}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                    {row.getIsExpanded() && (
                      <TableRow sx={{ bgcolor: backColor, '&:hover': { bgcolor: `${backColor} !important` } }}>
                        <TableCell colSpan={row.getVisibleCells().length}>
                          <ProductView data={row.original} />
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <>
            <Divider />
            <Box sx={{ p: 2 }}>
              <TablePagination
                {...{
                  setPageSize: table.setPageSize,
                  setPageIndex: table.setPageIndex,
                  getState: table.getState,
                  getPageCount: table.getPageCount,
                  initialPageSize: 5
                }}
              />
            </Box>
          </>
        </Stack>
      </ScrollX>
    </MainCard>
  );
}

ReactTable.propTypes = {
  columns: PropTypes.array,
  data: PropTypes.array
};

// ==============================|| PRODUCT LIST ||============================== //

const ProductList = () => {
  const theme = useTheme();

  const products = useLoaderData();

  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <IndeterminateCheckbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler()
            }}
          />
        ),
        cell: ({ row }) => (
          <IndeterminateCheckbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler()
            }}
          />
        )
      },
      {
        header: '#',
        accessorKey: 'id',
        meta: {
          className: 'cell-center'
        }
      },
      {
        header: 'Product Detail',
        accessorKey: 'name',
        cell: ({ row, getValue }) => (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              variant="rounded"
              alt={getValue()}
              color="secondary"
              size="sm"
              src={productImage(`./thumbs/${!row.original.image ? 'prod-11.png' : row.original.image}`)}
            />
            <Stack spacing={0}>
              <Typography variant="subtitle1">{getValue()}</Typography>
              <Typography variant="caption" color="textSecondary">
                {row.original.description}
              </Typography>
            </Stack>
          </Stack>
        )
      },
      {
        header: 'Categories',
        accessorKey: 'categories',
        cell: ({ row }) => {
          return row.original.categories ? (
            <Stack direction="row" spacing={0.25}>
              {row.original?.categories.map((item, index) => (
                <Typography variant="h6" key={index} sx={{ textTransform: 'capitalize' }}>
                  {item}
                  {row.original.categories.length > index + 1 ? ',' : ''}
                </Typography>
              ))}
            </Stack>
          ) : (
            <Typography variant="h6">-</Typography>
          );
        }
      },
      {
        header: 'Price',
        accessorKey: 'offerPrice',
        cell: ({ getValue }) => <NumericFormat value={getValue()} displayType="text" thousandSeparator prefix="$" />,
        meta: {
          className: 'cell-right'
        }
      },
      {
        header: 'Qty',
        accessorKey: 'quantity',
        meta: {
          className: 'cell-right'
        }
      },
      {
        header: 'Status',
        accessorKey: 'isStock',
        cell: ({ getValue }) => (
          <Chip color={getValue() ? 'success' : 'error'} label={getValue() ? 'In Stock' : 'Out of Stock'} size="small" variant="light" />
        )
      },
      {
        header: 'Actions',
        className: 'cell-center',
        disableSortBy: true,
        cell: ({ row }) => {
          const collapseIcon =
            row.getCanExpand() && row.getIsExpanded() ? (
              <PlusOutlined style={{ color: theme.palette.error.main, transform: 'rotate(45deg)' }} />
            ) : (
              <EyeOutlined />
            );
          return (
            <Tooltip title="View">
              <IconButton color="secondary" onClick={row.getToggleExpandedHandler()}>
                {collapseIcon}
              </IconButton>
            </Tooltip>
          );
        }
      }
    ],
    // eslint-disable-next-line
    [theme]
  );

  return <ReactTable {...{ data: products, columns }} />;
};

export default ProductList;
