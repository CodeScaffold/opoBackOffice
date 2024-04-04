import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

interface Row {
  id: number;
  ticket: string;
  pair: string;
  lot: number;
  tp: number;
  sl: number;
  closePrice: number;
  reason: string;
  difference: number;
  compensate: number;
  firstCheck: boolean;
  secondCheck: boolean;
}

async function fetchResults(page) {
  const response = await fetch(`http://localhost:3000/result?page=${page}`);
  if (!response.ok) throw new Error("Network response was not ok");
  return response.json();
}
function ResultTable({ results, isLoading }) {
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!results) {
    return <div>No results found.</div>;
  }
  const ResultTable = () => {
    const [page, setPage] = useState(1);
    const { isLoading, error, data } = useQuery({
      queryKey: ["results", page],
      queryFn: () => fetchResults(page),
    });

    const handleChangeCheck = async (
      id: number,
      field: "firstCheck" | "secondCheck",
    ) => {
      // Optimistically update the UI
      const newData = data.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: !item[field] };
        }
        return item;
      });
    };
    if (isLoading) return <p>Loading...</p>;
    if (error instanceof Error)
      return <p>An error has occurred: {error.message}</p>;

    setData(newData);
    try {
      await fetch(`http://localhost:3000/result/${id}`, {
        method: "PATCH", // Assuming your backend supports PATCH requests
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [field]: newData.find((item) => item.id === id)[field],
        }),
      });
      // Optionally, refetch data here to ensure UI consistency
    } catch (error) {
      console.error("Error updating item:", error);
      // Rollback in case of error
      setData(data);
    }
  };

  if (data?.length === 0) return null;
  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ticket</TableCell>
              <TableCell>Pair</TableCell>
              <TableCell>Lot</TableCell>
              <TableCell>T/P</TableCell>
              <TableCell>S/L</TableCell>
              <TableCell>Close Price</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Difference</TableCell>
              <TableCell>Compensate in USD</TableCell>
              <TableCell>First Check</TableCell>
              <TableCell>Second Check</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow
                key={row.id}
                style={{
                  display: row.firstCheck && row.secondCheck ? "none" : "",
                }}
              >
                <TableCell>{row.ticket}</TableCell>
                <TableCell>{row.pair}</TableCell>
                <TableCell>{row.lot}</TableCell>
                <TableCell>{row.tp}</TableCell>
                <TableCell>{row.sl}</TableCell>
                <TableCell>{row.closePrice}</TableCell>
                <TableCell>{row.reason}</TableCell>
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
          Previous Page
        </button>
        <button onClick={() => setPage((old) => old + 1)}>Next Page</button>
      </div>
    </>
  );
}
export default ResultTable;
