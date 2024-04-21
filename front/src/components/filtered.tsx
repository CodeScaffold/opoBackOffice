import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import "../App.css";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Card,
  CardContent,
  Skeleton,
  MenuItem,
  select,
} from "@mui/material";
import { Reasons } from "../Reason.ts";
import { exportToCSV } from "../utils/utils";

interface ResultDataType {
  id: number;
  account: number;
  ticket: string;
  pair: string;
  lot: number;
  openPrice: number;
  tp: number;
  sl: number;
  closePrice: number;
  closeTimeDate: string;
  reason: string;
  commend: string;
  difference: number;
  compensate: number;
  firstCheck: boolean;
  secondCheck: boolean;
  archivedAt?: string;
}

interface ApiResponse {
  results: ResultDataType[];
  totalResultsCount: number;
}

interface FetchFilters {
  page?: number;
  includeArchived: boolean;
  paginate?: boolean;
  [key: string]: any;
}

const fetchFilteredResults = async (
  filters: Record<string, any>,
): Promise<{ results: ResultDataType[]; totalResultsCount: number }> => {
  const queryParams = new URLSearchParams(filters).toString();
  const response = await fetch(`http://localhost:3000/result?${queryParams}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

const fetchAllFilteredResults = async (
  filters: FetchFilters,
): Promise<ApiResponse> => {
  const exportFilters: FetchFilters = { ...filters, paginate: false };
  const queryParams = new URLSearchParams(exportFilters as any).toString();
  const response = await fetch(`http://localhost:3000/result?${queryParams}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data: ApiResponse = await response.json();
  return data;
};

const Filtered = () => {
  const [filters, setFilters] = useState({ page: 1, includeArchived: true });
  const [totalCompensation, setTotalCompensation] = useState(0);

  const { data, error, isLoading } = useQuery({
    queryKey: ["filteredResults", filters],
    queryFn: () => fetchAllFilteredResults(filters),
  });

  useEffect(() => {
    if (data?.results) {
      const total = data.results.reduce(
        (acc, curr) => acc + (curr.compensate || 0),
        0,
      );
      setTotalCompensation(total);
    }
  }, [data]);

  const [results, setResults] = useState<ResultDataType[]>([]);
  const [totalResultsCount, setTotalResultsCount] = useState(0);

  const handleExportToCSV = async () => {
    const allData = await fetchAllFilteredResults(filters);
    exportToCSV(allData.results, "FilteredResults");
  };

  useEffect(() => {
    if (data?.results) {
      setResults(data.results);
      setTotalResultsCount(data.totalResultsCount);
    }
  }, [data]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <p>An error has occurred: {error.message}</p>;
  if (results.length === 0) return <p>No data found.</p>;

  return (
    <>
      <Card raised sx={{ margin: 2 }}>
        <CardContent>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Account</TableCell>
                  <TableCell>Ticket</TableCell>
                  <TableCell>Pair</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Compensate</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <TextField
                      size="small"
                      variant="outlined"
                      name="account"
                      value={filters.account || ""}
                      onChange={handleFilterChange}
                      placeholder="Filter Account"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      variant="outlined"
                      name="ticket"
                      value={filters.ticket || ""}
                      onChange={handleFilterChange}
                      placeholder="Filter Ticket"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      variant="outlined"
                      name="pair"
                      value={filters.pair || ""}
                      onChange={handleFilterChange}
                      placeholder="Filter Pair"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      variant="outlined"
                      name="Date"
                      value={filters.closeTimeDate || ""}
                      onChange={handleFilterChange}
                      placeholder="Filter Date"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      select
                      size="small"
                      variant="outlined"
                      name="reason"
                      value={filters.reason || ""}
                      onChange={handleFilterChange}
                      label="Filter Reason"
                      fullWidth
                    >
                      <MenuItem value="" disabled>
                        Choose a reason
                      </MenuItem>
                      {Reasons.map((reason) => (
                        <MenuItem key={reason.name} value={reason.name}>
                          {reason.value}
                        </MenuItem>
                      ))}
                    </TextField>
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading
                  ? Array.from(new Array(5)).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Skeleton variant="text" width="100%" />
                        </TableCell>
                        <TableCell>
                          <Skeleton variant="text" width="100%" />
                        </TableCell>
                        <TableCell>
                          <Skeleton variant="text" width="100%" />
                        </TableCell>
                        <TableCell>
                          <Skeleton variant="text" width="100%" />
                        </TableCell>
                        <TableCell>
                          <Skeleton variant="text" width="60%" />
                        </TableCell>
                      </TableRow>
                    ))
                  : data.results.map((row: ResultDataType) => (
                      <TableRow
                        key={row.id}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                          "&:hover": {
                            backgroundColor: "rgba(255, 255, 255, 0.08)",
                          },
                        }}
                      >
                        <TableCell component="th" scope="row">
                          {row.account}
                        </TableCell>
                        <TableCell>{row.ticket}</TableCell>
                        <TableCell>{row.pair}</TableCell>
                        <TableCell>{row.closeTimeDate}</TableCell>
                        <TableCell>{row.reason}</TableCell>
                        <TableCell>{`${row.compensate.toFixed(2)} USD`}</TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </TableContainer>
          <div style={{ marginTop: "20px" }}>
            <Button
              onClick={() =>
                setFilters((old) => ({
                  ...old,
                  page: Math.max(old.page - 1, 1),
                }))
              }
              disabled={filters.page === 1}
            >
              Previous
            </Button>
            <Button
              onClick={() =>
                setFilters((old) => ({
                  ...old,
                  page: Math.min(
                    old.page + 1,
                    Math.ceil(data.totalResultsCount / 10),
                  ),
                }))
              }
              disabled={filters.page === Math.ceil(data.totalResultsCount / 10)}
            >
              Next
            </Button>
          </div>
        </CardContent>
        <Button
          onClick={handleExportToCSV}
          variant="contained"
          color="primary"
          startIcon={<CloudDownloadIcon style={{ fontSize: "1.25rem" }} />}
          style={{
            margin: "10px",
            padding: "10px 20px",
          }}
        >
          CSV
        </Button>
      </Card>
    </>
  );
};

export default Filtered;
