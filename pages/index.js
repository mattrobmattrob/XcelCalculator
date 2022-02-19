import Head from 'next/head'

export default function Home() {
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

  function createHTMLFromCSVData(csvData) {
      var data = document.createElement('table');

      // Table headers
      var tableHeaders = document.createElement('tr');
      var labels = csvData[0]
      for (let i = 0; i < labels.length; i++) {
          var header = document.createElement('th');
          if (labels[i] == "Category") {
              header.textContent = "Day"
          } else {
              header.textContent = labels[i]
          }
          tableHeaders.appendChild(header)
      }
      // Add Total Energy
      var totalEnergyHeader = document.createElement('th');
      totalEnergyHeader.textContent = "Total Energy (kWh)"
      tableHeaders.appendChild(totalEnergyHeader)
      data.appendChild(tableHeaders)

      // Table rows
      for (let i = 1; i < csvData.length; i++) { 
          var tableRow = document.createElement('tr');
          var labels = csvData[i]
          for (let ii = 0; ii < labels.length; ii++) {
              var column = document.createElement('td');
              column.textContent = labels[ii]
              tableRow.appendChild(column)
          }

          // Add Total Energy
          var totalEnergy = +(labels[1]) + +(labels[2]) + +(labels[3])
          var totalEnergyColumn = document.createElement('td');
          totalEnergyColumn.textContent = totalEnergy.toFixed(2)
          tableRow.appendChild(totalEnergyColumn)

          data.appendChild(tableRow)
      }

      document.body.appendChild(data);
  }

  function fileUploaded() {
      console.log("FILE UPLOADED")
      const reader = new FileReader();
      reader.onload = function(event) {
          console.log('File content:', event.target.result);

          var content = CSVToArray(event.target.result, ",")
          console.log(content)

          createHTMLFromCSVData(content)
      };
      reader.readAsText(document.getElementById("myFile").files[0]);
  };

  return <>
    <div className='text-3xl font-bold text-red-500 pb-4'>Xcel Energy Time of Use (TOU) Calculator</div>

    <div className='pb-3'>Upload CSV file from Xcel with daily data:</div>
    <input type="file" id="myFile" name="myFile" onChange={fileUploaded}></input>
  </>
}
