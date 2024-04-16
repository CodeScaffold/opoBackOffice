import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Checkbox,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

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
  reason: string;
  commend: string;
  difference: number;
  compensate: number;
  firstCheck: boolean;
  secondCheck: boolean;
  archivedAt?: string;
}

const fetchResults = async (page: number): Promise<ResultDataType[]> => {
  const response = await fetch(`http://localhost:3000/result?page=${page}`);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return await response.json();
};

const ResultTable = () => {
  const [page, setPage] = useState(1);
  const { data, error, isLoading } = useQuery({
    queryKey: ["results", page],
    queryFn: () => fetchResults(page),
  });
  const [results, setResults] = useState<ResultDataType[]>([]);
  const [totalResultsCount, setTotalResultsCount] = useState(0);

  useEffect(() => {
    if (data?.results) {
      setResults(data.results);
      setTotalResultsCount(data.totalResultsCount);
    }
  }, [data]);

  const handleChangeCheck = async (
    id: number,
    field: "firstCheck" | "secondCheck",
  ) => {
    const updatedResults = results.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: !item[field] };
      }
      return item;
    });
    setResults(updatedResults);
    try {
      await fetch(`http://localhost:3000/result/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [field]: updatedResults.find((item) => item.id === id)[field],
        }),
      });
      if (!response.ok) throw new Error("Failed to update the item");
    } catch (error) {
      console.error("Error updating item:", error);
      // Optionally, revert changes on error
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <p>An error has occurred: {error.message}</p>;
  if (results.length === 0) return <p>No data found.</p>;

  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Account</TableCell>
              <TableCell>Ticket</TableCell>
              <TableCell>Pair</TableCell>
              <TableCell>Lot</TableCell>
              <TableCell>Open Price</TableCell>
              <TableCell>T/P</TableCell>
              <TableCell>S/L</TableCell>
              <TableCell>Close Price</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>commend</TableCell>
              <TableCell>Difference</TableCell>
              <TableCell>Compensate in USD</TableCell>
              <TableCell>First Check</TableCell>
              <TableCell>Second Check</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results.map((row: ResultDataType) => (
              <TableRow
                key={row.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.account}
                </TableCell>
                <TableCell>{row.ticket}</TableCell>
                <TableCell>{row.pair}</TableCell>
                <TableCell>{row.lot}</TableCell>
                <TableCell>{row.openPrice}</TableCell>
                <TableCell>{row.tp}</TableCell>
                <TableCell>{row.sl}</TableCell>
                <TableCell>{row.closePrice}</TableCell>
                <TableCell>{row.reason}</TableCell>
                <TableCell>{row.commend}</TableCell>
                <TableCell>{row.difference.toFixed(2)}</TableCell>
                <TableCell>{row.compensate.toFixed(2)}</TableCell>
                <TableCell>
                  <Checkbox
                    checked={row.firstCheck}
                    onChange={() => handleChangeCheck(row.id, "firstCheck")}
                  />
                </TableCell>
                <TableCell>
                  <Checkbox
                    checked={row.secondCheck}
                    onChange={() => handleChangeCheck(row.id, "secondCheck")}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <div style={{ marginTop: "20px" }}>
        <button
          onClick={() => setPage((old) => Math.max(old - 1, 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        <button
          onClick={() =>
            setPage((old) =>
              Math.min(old + 1, Math.ceil(totalResultsCount / 10)),
            )
          }
          disabled={page === Math.ceil(totalResultsCount / 10)}
        >
          Next
        </button>
      </div>
    </>
  );
};
export default ResultTable;
