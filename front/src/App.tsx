import React, { useState } from "react";
import "./App.css";
import { Button, Stack, TextField } from "@mui/material";
import DropDown from "./components/DropDown";
import Login from "./Login";
import { Pairs } from "./pair";
import { Reasons } from "./Reason";
import ResultTable from "./components/ResultTable.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [Ticket, setID] = useState("");
  const [lot, setLot] = useState("");
  const [tp, setTp] = useState("");
  const [sl, setSl] = useState("");
  const [closePrice, setClosePrice] = useState("");
  const [pair, setPair] = useState("");
  const [inputString, setInputString] = useState("");
  const [reason, setReason] = useState("");
  const [differenceValue, setDifferenceValue] = useState(0);
  const [totalPriceValue, setTotalPriceValue] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(10); // Assuming 10 results per page as an example
  const [results, setResults] = useState([]);

  const queryClient = new QueryClient();
  function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
  }
  const handleLogin = async (username, password) => {
    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (data.success) {
        setIsLoggedIn(true); // Update the login state
      } else {
        // Handle login failure
        alert(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred during login.");
    }
  };

  const handleSubmit = async () => {
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
    let conversionRate = 1;

    if (selectedPair.apiName) {
      try {
        const response = await fetch(
          `https://fcsapi.com/api-v3/forex/latest?symbol=${encodeURIComponent(
            selectedPair.apiName,
          )}&access_key=DsBQp33PeVHJfrWhP3chmSWWf`,
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
    let pip = 0;
    try {
      pip = selectedPair.contractSize * parseFloat(lot) * selectedPair.tickSize;
    } catch (error) {
      console.error("Error calculating pip:", error);
      return;
    }

    let pipUSDValue = pip;
    if (selectedPair.base === "USD" && selectedPair.quote !== "USD") {
      pipUSDValue = pip / conversionRate;
    } else if (selectedPair.quote === "USD") {
      pipUSDValue = pip;
    } else {
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
    const finalDifference = difference / selectedPair.tickSize;
    setDifferenceValue(finalDifference);
    setTotalPriceValue(finalDifference * pipUSDValue);

    try {
      const response = await fetch("http://localhost:3000/result", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticket: Ticket,
          tp: tp,
          sl: sl,
          pair: pair,
          lot: lot,
          closePrice: closePrice,
          reason: reason,
          difference: finalDifference,
          compensateInUsd: finalDifference * pipUSDValue,
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
    } catch (error) {
      alert("Failed to submit result:", error);
    }
  };

  const { data, isLoading, isError } = useQuery(["results"], fetchResults);

  // Set results once they are fetched
  useEffect(() => {
    if (data) {
      setResults(data);
    }
  }, [data]);
  function App() {
    return (
      <QueryClientProvider client={queryClient}>
        {/* The rest of your app goes here */}
      </QueryClientProvider>
    );
  }
  async function fetchResults(page = currentPage) {
    const response = await fetch(
      `http://localhost:3000/results?page=${page}&limit=${resultsPerPage}`,
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  }

  const handleInputStringChange = (input: string) => {
    const parts = input.split(/\s+/).filter(Boolean);
    if (parts.length < 9) {
      console.error("Invalid input format.");
      return;
    }

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
    <QueryClientProvider client={queryClient}>
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
              <DropDown
                name="Pair"
                options={Pairs}
                value={pair}
                onChange={setPair}
              />
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
              <DropDown
                name="Reason"
                options={Reasons}
                value={reason}
                onChange={setReason}
                required
              />
              <Button sx={{ mt: 2 }} variant="contained" onClick={handleSubmit}>
                Submit
              </Button>
            </Stack>
            <div>
              <p>Difference: {differenceValue.toFixed(2)}</p>
              <p>Compensate in USD: {totalPriceValue.toFixed(2)}</p>
            </div>
            <ResultTable results={results} isLoading={isLoading} />
          </>
        ) : (
          <Login onSuccessfulLogin={() => setIsLoggedIn(true)} />
        )}
      </div>
    </QueryClientProvider>
  );
}

export default App;
