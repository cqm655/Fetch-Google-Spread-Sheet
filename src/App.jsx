import {useEffect, useState} from 'react'
import {Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography} from "@mui/material";


const SPREADSHEET_ID =  "1AN7cQZHWlfGCZhvCpnfDo6yDANaVHAJ8S7HbqmefJpg";
// const SHEET_ID = "627663737";
// const CLIENT_EMAIL = "iurie-balan@valid-expanse-450607-f7.iam.gserviceaccount.com";
// const PRIVATE_KEY = "MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCzF+Efb/Yl3tQ3";
const RANGE = "depozit!A1:B9";
const API_KEY= "AIzaSyCqz2k4QzvriUU7NyJlQDLufPQ21CEVvIk";

const noImage = 'https://static.vecteezy.com/system/resources/thumbnails/022/059/000/small_2x/no-image-available-icon-vector.jpg';

function App() {
    const [sheetsData, setSheetsData] = useState([]);

    useEffect(() => {
        const fetchAllSheetsData = async () => {
            try {
                // Step 1: Get all sheet names
                const metadataResponse = await fetch(
                    `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?key=${API_KEY}`
                );
                const metadataResult = await metadataResponse.json();

                if (!metadataResult.sheets) return;

                // Get all sheet names dynamically
                const sheetNames = metadataResult.sheets.map(sheet => sheet.properties.title);

                // Step 2: Fetch data from all sheets
                const sheetDataPromises = sheetNames.map(sheetName =>
                    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${sheetName}?key=${API_KEY}`)
                        .then(response => response.json())
                        .then(data => ({ sheetName, values: data.values || [],  headers: data.values?.[0] || [], }))
                );

                // Wait for all requests to complete
                const allSheetsData = await Promise.all(sheetDataPromises);

                setSheetsData(allSheetsData);
            } catch (error) {
                console.error("Error fetching sheets data:", error);
            }
        };

        fetchAllSheetsData();
    }, []);
    console.log(sheetsData)
  return (
      <Paper sx={{ width: '100%', borderRadius: '21px', backgroundColor:'gray', position: 'relative', paddingBottom: '20px' }}>
          <Typography variant="h4" sx={{ mb: 2,     marginLeft: '40%' }}>Google Sheets Data</Typography>
          {sheetsData.map((sheet, sheetIndex) => (
              <TableContainer component={Paper} sx={{ width: '97%', ml:3, borderRadius: '20px' }} key={sheetIndex}>
                  <Typography variant="h6" sx={{ p: 2, marginLeft: '45%' }}>Foaie: {sheet.sheetName}</Typography>
                  <Table>
                      <TableHead>
                          <TableRow>
                              {sheet.headers.length > 0 && sheet.headers.map((header, colIndex) => (
                                  <TableCell key={colIndex} sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                                      {colIndex === 1 ? "Image" : header || `Column ${colIndex + 1}`}
                                  </TableCell>
                              ))}
                          </TableRow>
                      </TableHead>
                      <TableBody>
                          {sheet.values.slice(1).map((row, rowIndex) => (
                              <TableRow key={rowIndex}>
                                  {row.map((cell, colIndex) => (
                                      <TableCell key={colIndex}>
                                          {colIndex === 1 && typeof cell === "string" ? (
                                              <img
                                                  src={cell.length > 0 ? cell : noImage}
                                                  alt="No image"
                                                  width="100"
                                                  loading="lazy"
                                                  style={{ borderRadius: 8 }}
                                              />
                                          ) : (
                                              cell || "N/A"
                                          )}
                                      </TableCell>
                                  ))}
                              </TableRow>
                          ))}
                      </TableBody>
                  </Table>
              </TableContainer>
          ))}
      </Paper>
  );
}

export default App
