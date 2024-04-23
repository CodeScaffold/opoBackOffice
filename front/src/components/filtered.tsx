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
  Typography,
} from "@mui/material";
import { Commends, Reasons } from "../Reason.ts";
import { exportToCSV } from "../utils/utils";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import moment from "moment";

function getNameFromValue(value, Array) {
  const item = Array.find((reason) => reason.value === value);
  return item ? item.name : "Unknown Reason"; // Returns "Unknown Reason" if no match is found
}
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
  closeTimeDate: number;
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
    try {
      const allData = await fetchAllFilteredResults();
      const updatedResults = allData.results.map((result) => {
        const foundReason = Reasons.find(
          (reason) => reason.value === result.reason,
        );
        return {
          ...result,
          reason: foundReason ? foundReason.name : "Unknown Reason",
        };
      });

      exportToCSV(updatedResults, "FilteredResults");
    } catch (error) {
      console.error("Failed to fetch all results for export:", error);
    }
  };

  useEffect(() => {
    if (data?.results) {
      setResults(data.results);
      setTotalResultsCount(data.totalResultsCount);
      const total = data.results.reduce(
        (acc, curr) => acc + (curr.compensate || 0),
        0,
      );
      setTotalCompensation(total);
    }
  }, [data]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const handleDateChange = (newValue: Dayjs | null) => {
    const formattedDate = newValue ? newValue.format("YYYY/MM/DD") : "";
    setFilters((prev) => ({ ...prev, closeTimeDate: formattedDate, page: 1 }));
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <p>An error has occurred: {error.message}</p>;
  if (results.length === 0) return <p>No data found.</p>;

  return (
    <>
      <Card raised sx={{ margin: 2 }}>
        <CardContent>
          {/* Display the total compensation */}
          <Typography variant="h6" gutterBottom>
            Total Compensation: {totalCompensation.toFixed(2)} USD
          </Typography>
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
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Date"
                        value={filters.date}
                        onChange={handleDateChange}
                        name="date"
                        TextField={(params) => <TextField {...params} />}
                      />
                    </LocalizationProvider>
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
                        <MenuItem key={reason.name} value={reason.value}>
                          {reason.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" style={{ paddingTop: 8 }}>
                      Total: {totalCompensation.toFixed(2)} $
                    </Typography>
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
                        <TableCell>
                          {row.closeTimeDate
                            ? moment(row.closeTimeDate).format("YYYY/MM/DD")
                            : "No Date Available"}
                        </TableCell>
                        <TableCell>
                          {getNameFromValue(row.reason, Reasons)}
                        </TableCell>
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
