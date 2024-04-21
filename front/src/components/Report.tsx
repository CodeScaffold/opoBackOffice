import { useEffect, useState } from "react";
import {createRoot} from "react-dom/client";
import {AgGridReact} from "ag-grid-react";
import { ColDef, ColGroupDef } from "ag-grid-community";

interface ReportData {

}

let colDefs: (ColDef<any, any> | ColGroupDef<any>)[] | null | undefined;
let rowData: any[] | null | undefined;
const ReportSection = ({ reportFilter }: { reportFilter: string }) => {
    const [reportData, setReportData] = useState<ReportData | null>(null);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const response = await fetch(`http://localhost:3000/report?filter=${encodeURIComponent(reportFilter)}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setReportData(data);
            } catch (error) {
                enqueueSnackbar("Failed to fetch.", {
                    variant: "error",
                });
                return;
            }

        fetchReport();
    }, [reportFilter]);
    return (
        <div>
            className={"ag-theme-quartz-dark"}
            style={{ width: "100%", height: "100%" }}
            >
            <AgGridReact rowData={rowData} columnDefs={colDefs} />
        </div>
    );
};


const root = createRoot(document.getElementById("root")!);

export default ReportSection;
