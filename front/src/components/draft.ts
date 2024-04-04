ResultTable.tsx backup


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
import { useEffect, useState } from "react";

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
const ResultTable = () => {
    const [data, setData] = useState([]);
    const getFromApi = async () => {
        try {
            const response = await fetch(`http://localhost:3000/result`);
            const data = await response.json();
            setData(data);
        } catch (error) {
            console.error("Error fetching conversion rate:", error);
            return;
        }
    };

    useEffect(() => {
        getFromApi();
    }, []);

    const handleChangeCheck = () => {
        alert("kir");
    };

    if (data?.length === 0) return null;
    return (
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
    {data?.map(
        (row, index) =>
            row.compensate !== "0" && ( // Condition added here
                <TableRow key={index}>
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
                    defaultChecked={row.firstCheck}
    onChange={handleChangeCheck}
    />
    </TableCell>
    <TableCell>
    <Checkbox onChange={handleChangeCheck} />
    </TableCell>
    </TableRow>
),
)}
    </TableBody>
    </Table>
    </TableContainer>
);
};
export default ResultTable;
