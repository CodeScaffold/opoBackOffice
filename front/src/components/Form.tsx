import { Button, Stack, TextField } from "@mui/material";
import DropDown from "./DropDown.tsx";
import { Pairs } from "../pair.ts";
import { Commends, Reasons } from "../Reason.ts";
import ResultTable from "./ResultTable.tsx";
import { useState } from "react";
import { useSnackbar } from "notistack";

const Form = () => {
  const [Account, setAccount] = useState("");
  const [OpenPrice, setOpenPrice] = useState("");
  const [Ticket, setID] = useState("");
  const [lot, setLot] = useState("");
  const [tp, setTp] = useState("");
  const [sl, setSl] = useState("");
  const [closePrice, setClosePrice] = useState("");
  const [pair, setPair] = useState("");
  const [inputString, setInputString] = useState("");
  const [reason, setReason] = useState("");
  const [commend, setCommend] = useState("");
  const [differenceValue, setDifferenceValue] = useState(0);
  const [totalPriceValue, setTotalPriceValue] = useState(0);

  const { enqueueSnackbar } = useSnackbar();

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
          //'https://fcsapi.com/api-v3/forex/history?id=1&period=1h&access_key=access_key=DsBQp33PeVHJfrWhP3chmSWWf`,

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
          account: Account,
          ticket: Ticket,
          tp: tp,
          sl: sl,
          pair: pair,
          lot: lot,
          openPrice: OpenPrice,
          closePrice: closePrice,
          reason: reason,
          commend: commend,
          difference: finalDifference,
          compensateInUsd: finalDifference * pipUSDValue,
        }),
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message);
      }
      await response.json();
    } catch (error: any) {
      alert(error);
      enqueueSnackbar(error, { variant: "default" });
    }
  };

  const handleInputStringChange = (input: string) => {
    const parts = input.split(/\s+/).filter(Boolean);
    if (parts.length < 9) {
      console.error("Invalid input format.");
      return;
    }
    const parsedAccount = parts[12];
    const parsedID = parts[0];
    const parsedPair = parts[1].replace(/[\.\#\!]/g, ""); // Remove ., #, !
    const parsedLot = parts[3];
    const parsedOpenPrice = parts[6];
    const parsedTp = parts[7]; // Assuming the T/P and S/L values are the same in this format
    const parsedSl = parts[8]; // Duplicate of T/P for this example
    const parsedClosePrice = parts[11];

    // Update form fields
    setAccount(parsedAccount);
    setID(parsedID);
    setPair(parsedPair);
    setLot(parsedLot);
    setOpenPrice(parsedOpenPrice);
    setTp(parsedTp);
    setSl(parsedSl);
    setClosePrice(parsedClosePrice);
  };
  return (
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
          id="account"
          label="Account"
          variant="outlined"
          value={Account}
          onChange={(e) => setAccount(e.target.value)}
        />
        <TextField
          type="number"
          id="Ticket"
          label="Ticket"
          variant="outlined"
          value={Ticket}
          onChange={(e) => setID(e.target.value)}
        />
        <DropDown name="Pair" options={Pairs} value={pair} onChange={setPair} />
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
          id="openPrice"
          label="Open Price"
          variant="outlined"
          value={OpenPrice}
          onChange={(e) => setOpenPrice(e.target.value)}
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
        <DropDown
          name="Commend"
          options={Commends}
          value={commend}
          onChange={setCommend}
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
      <ResultTable />
    </>
  );
};

export default Form;
