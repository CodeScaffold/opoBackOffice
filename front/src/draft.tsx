import React, { useState } from "react";
import "./App.css";
import { Button, Stack, TextField } from "@mui/material";
import DropDown from "./components/DropDown"; // Assuming you have this component
import Login from './Login';
import { Pairs } from "./pair";
import { Reasons } from "./Reason";


function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [Ticket, setID] = useState("");
    const [lot, setLot] = useState("");
    const [tp, setTp] = useState("");
    const [sl, setSl] = useState("");
    const [closePrice, setClosePrice] = useState("");
    const [pair, setPair] = useState("");
    const [inputString, setInputString] = useState("");
    const [Reason, setReason] = useState("");
    const [pipValue, setPipValue] = useState(0);
    const [differenceValue, setDifferenceValue] = useState(0);
    const [totalPriceValue, setTotalPriceValue] = useState(0);

    const handleSubmit = async () => {
        // Basic input validation
        if (!lot || !closePrice) {
            alert("Error: Lot and Close Price are required.");
            return;
        }
        if (!sl && !tp) {
            alert("Error: Either S/L or T/P must be provided.");
            return;
        }

        const selectedPair = Pairs.find((p) => p.name === pair);
        if (!selectedPair) {
            console.error("Selected pair not found.");
            return;
        }

        let conversionRate = 1; // Default conversion rate for pairs in USD
        {
            if (selectedPair.apiName) {
                try {
                    const response = await fetch(
                        `https://fcsapi.com/api-v3/forex/latest?symbol=${encodeURIComponent(
                            selectedPair.apiName
                        )}&access_key=DsBQp33PeVHJfrWhP3chmSWWf`
                    );
                    const data = await response.json();
                    if (
                        data.status &&
                        data.response &&
                        data.response[0] &&
                        data.response[0].c
                    ) {
                        conversionRate = parseFloat(data.response[0].c);
                    } else {
                        console.error("Failed to fetch conversion rate.");
                        return;
                    }
                } catch (error) {
                    console.error("Error fetching conversion rate:", error);
                    return;
                }
            }
            // Handle potential errors during calculations
            let pip = 0;
            try {
                pip = selectedPair.contractSize * parseFloat(lot) * selectedPair.tickSize;
            } catch (error) {
                console.error("Error calculating pip:", error);
                return;
            }

            let pipUSDValue = pip; // Assume pip value in USD by default
            if (selectedPair.base === 'USD' && selectedPair.quote !== 'USD') {
                // For USDJPY-like pairs, convert pip value from JPY (or respective currency) to USD
                pipUSDValue = pip / conversionRate;
            } else if (selectedPair.quote === 'USD') {
                // If USD is the quote currency (like in EURUSD), no conversion is needed
                pipUSDValue = pip;
            } else {
                // For pairs without USD, you might need to adjust based on your specific needs
                pipUSDValue = pip / conversionRate;
            }

            let difference = 0;
            try {
                if (closePrice) {
                    const closePriceValue = +closePrice;
                    if (sl) {
                        difference = Math.abs(closePriceValue - +sl);
                    } else if (tp) {
                        difference = Math.abs(closePriceValue - +tp);
                    }
                }
            } catch (error) {
                console.error("Error calculating difference:", error);
                return;
            }
            const calculatedPipValue = 10;
            const calculatedDifference = 50;
            const compensationAmount = calculatedDifference * calculatedPipValue;

            setPipValue(calculatedPipValue);
            setDifferenceValue(calculatedDifference);
            setTotalPriceValue(compensationAmount);
        }
        ;
    }
    const handleInputStringChange = (input) => {
        const parts = input.split(/\s+/).filter(Boolean);
        if (parts.length < 9) {
            console.error("Invalid input format.");
            return;
        }

        // Extract values based on the specified format
        const parsedID = parts[0];
        const parsedPair = parts[1].replace(/[\.\#\!]/g, ""); // Remove ., #, !
        const parsedLot = parts[3];
        const parsedTp = parts[7]; // Assuming the T/P and S/L values are the same in this format
        const parsedSl = parts[8]; // Duplicate of T/P for this example
        const parsedClosePrice = parts[11];

        // Update form fields
        setID(parsedID);
        setPair(parsedPair);
        setLot(parsedLot);
        setTp(parsedTp);
        setSl(parsedSl);
        setClosePrice(parsedClosePrice);
    };

    return (
        <div>
            {isLoggedIn ? (
                <>
                    <TextField
                        fullWidth
                        label="Input String"
                        variant="outlined"
                        value={inputString}
                        onChange={(e) => {
                            setInputString(e.target.value);
                            handleInputStringChange(e.target.value);
                        }}
                        sx={{ mb: 2 }}
                    />
                    <Stack direction="row" spacing={1}>
                        <TextField
                            type="number"
                            id="Ticket"
                            label="Ticket"
                            variant="outlined"
                            value={Ticket}
                            onChange={(e) => setID(e.target.value)}
                        />

                        <DropDown commend="Reason" options={Reasons} value={Reason} onChange={setReason} />
                        <TextField
                            type="number"
                            id="lot"
                            label="Lot"
                            variant="outlined"
                            value={lot}
                            onChange={(e) => setLot(e.target.value)}
                        />
                        <TextField
                            type="number"
                            id="tp"
                            label="T/P"
                            variant="outlined"
                            value={tp}
                            onChange={(e) => setTp(e.target.value)}
                        />
                        <TextField
                            type="number"
                            id="sl"
                            label="S/L"
                            variant="outlined"
                            value={sl}
                            onChange={(e) => setSl(e.target.value)}
                        />
                        <TextField
                            type="number"
                            id="closePrice"
                            label="Close Price"
                            variant="outlined"
                            value={closePrice}
                            onChange={(e) => setClosePrice(e.target.value)}
                        />
                        <DropDown commend="Reason" options={Reasons} value={Reason} onChange={setReason} />
                        <Button sx={{ mt: 2 }} variant="contained" onClick={handleSubmit}>
                            Submit
                        </Button>
                    </Stack>
                    <div>
                        <p>Difference: {differenceValue.toFixed(2)}</p>
                        <p>Compensate in USD: {totalPriceValue.toFixed(2)}</p>
                    </div>
                </>
            ) : (
                <Login onSuccessfulLogin={() => setIsLoggedIn(true)} />
            )}
        </div>
    );
}
export default App;