import Head from 'next/head'
import { useState } from 'react'
const lodash = require("lodash");


export default function Home() {
    const [csvData, setCsvData] = useState([[]]);

    // Source: https://stackoverflow.com/a/1293163/856336
    function CSVToArray( strData, strDelimiter ){
        // Check to see if the delimiter is defined. If not,
        // then default to comma.
        strDelimiter = (strDelimiter || ",");
        // Create a regular expression to parse the CSV values.
        var objPattern = new RegExp(
            (
                // Delimiters.
                "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

                // Quoted fields.
                "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

                // Standard fields.
                "([^\"\\" + strDelimiter + "\\r\\n]*))"
            ),
            "gi"
            );
        // Create an array to hold our data. Give the array
        // a default empty first row.
        var arrData = [[]];
        // Create an array to hold our individual pattern
        // matching groups.
        var arrMatches = null;
        // Keep looping over the regular expression matches
        // until we can no longer find a match.
        while (arrMatches = objPattern.exec( strData )){
            // Get the delimiter that was found.
            var strMatchedDelimiter = arrMatches[ 1 ];
            // Check to see if the given delimiter has a length
            // (is not the start of string) and if it matches
            // field delimiter. If id does not, then we know
            // that this delimiter is a row delimiter.
            if (
                strMatchedDelimiter.length &&
                strMatchedDelimiter !== strDelimiter
                ){
                // Since we have reached a new row of data,
                // add an empty row to our data array.
                arrData.push( [] );
            }
            var strMatchedValue;
            // Now that we have our delimiter out of the way,
            // let's check to see which kind of value we
            // captured (quoted or unquoted).
            if (arrMatches[ 2 ]){
                // We found a quoted value. When we capture
                // this value, unescape any double quotes.
                strMatchedValue = arrMatches[ 2 ].replace(
                    new RegExp( "\"\"", "g" ),
                    "\""
                    );
            } else {
                // We found a non-quoted value.
                strMatchedValue = arrMatches[ 3 ];
            }
            // Now that we have our value string, let's add
            // it to the data array.
            arrData[ arrData.length - 1 ].push( strMatchedValue );
        }

        // Return the parsed data.
        return( arrData );
    }

    function fileUploaded() {
        console.log("FILE UPLOADED");

        var reader = new FileReader();
        reader.onload = function(event) {
            console.log('File content:', event.target.result);

            var content = CSVToArray(event.target.result, ",");
            
            var tableData = [[]];
            content[0].push.apply(content[0], [
                'Total Energy (kWh)',
                'TOU Cost',
                'Opt-Out Cost',
                'Savings',
            ])
            tableData.push(content[0]);
            for (let i = 1; i < content.length; i++) {
                // Table rows
                const rowData = content[i];
                const date = rowData[0];
                const dateString = date.split(" 00:00:00")[0];
                const onPeak = +(rowData[1]);
                const midPeak = +(rowData[2]);
                const offPeak = +(rowData[3]);

                // Add Total Energy
                const totalEnergy = (onPeak + midPeak + offPeak);

                // Add TOU cost
                //
                // Times (weekdays, non-holidays):
                //   On-Peak is 3 p.m. -7 p.m.
                //   Mid-Peak is 1 p.m.-3 p.m.
                //   Off-Peak is 7 p.m.- 1 p.m.
                // Winter Prices:
                //   On-Peak = 17 cents per kWh
                //   Mid-Peak = 14 cents per kWh
                //   Off-Peak = 10 cents per kWh
                // Summer Prices:
                //   On-Peak = 28 cents per kWh
                //   Mid-Peak = 19 cents per kWh
                //   Off-Peak = 10 cents per kWh
                const touCost = (onPeak * 0.17) + (midPeak * 0.14) + (offPeak * 0.10);

                // Add Smart Meter opt-out cost
                // 
                // Winter = 12 cents per kWh
                // Summer = 14 cents per kWh
                const optOutCost = totalEnergy * 0.14;

                // TOU vs. Opt-Out
                const savings = touCost - optOutCost;
                var savingsColumn = '';
                if (savings < 0) {
                    savingsColumn = "-$" + (savings.toFixed(2) * -1);
                } else {
                    savingsColumn = "$" + savings.toFixed(2);
                }

                tableData.push([
                    dateString,
                    onPeak.toFixed(2),
                    midPeak.toFixed(2),
                    offPeak.toFixed(2),
                    totalEnergy.toFixed(2),
                    "$" + touCost.toFixed(2),
                    "$" + optOutCost.toFixed(2),
                    savingsColumn,
                ]);
            }

            setCsvData(tableData);
        };
        reader.readAsText(document.getElementById("myFile").files[0]);
    };

    return (
        <div className='p-4'>
            <div className='text-3xl font-bold text-red-500 pb-4'>
            Xcel Energy Time of Use (TOU) Calculator
            </div>

            <div className='pb-3'>
                This will parse the CSV file downloaded from <a className='text-blue-500' href="https://myenergy.xcelenergy.com/myenergy/usage-history">Xcel Energy's MyEnergy</a> that contains the daily usage information split out by time-of-use buckets (peak, mid-peak, and off-peak).
            </div>

            <div className='flex'>
                <div className='text-xl font-bold pb-3 pr-3'>
                    Upload CSV file from Xcel with daily data:
                </div>
                <input type="file" id="myFile" name="myFile" onChange={fileUploaded} />
            </div>

            <table>
                {lodash.map(csvData, (row, row_idx) => {
                    return (
                        <tr key={row_idx}>
                            {lodash.map(csvData[row_idx], (cell, cell_idx) => {
                                if (row_idx == 1) {
                                    return <th
                                        key={cell_idx}
                                        className='text-left p-1 border-b-2 border-black'
                                    >
                                        {cell}
                                    </th>
                                } else {
                                    return <td
                                        key={cell_idx}
                                        className='p-1 border-2 border-gray-200'
                                    >
                                        {cell}
                                    </td>
                                }
                            })}
                        </tr>
                    )
                })}
            </table>
        </div>
    )
}
