import {useEffect, useState} from 'react'
import {
    Box,
    Input,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import React from 'react';


const SPREADSHEET_ID =  "1AN7cQZHWlfGCZhvCpnfDo6yDANaVHAJ8S7HbqmefJpg";
// const SHEET_ID = "627663737";
// const CLIENT_EMAIL = "iurie-balan@valid-expanse-450607-f7.iam.gserviceaccount.com";
// const PRIVATE_KEY = "MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCzF+Efb/Yl3tQ3";
const RANGE = "depozit!A1:B9";
const API_KEY= "AIzaSyCqz2k4QzvriUU7NyJlQDLufPQ21CEVvIk";

const noImage = 'https://static.vecteezy.com/system/resources/thumbnails/022/059/000/small_2x/no-image-available-icon-vector.jpg';

function App() {
    const [sheetsData, setSheetsData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [data, setData] = useState(sheetsData);

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

    //search data
    const filteredData = sheetsData.map((sheet) => ({
        ...sheet,
        values: sheet.values.filter(
            (row, index) =>
                index === 0 || // Păstrăm header-ul
                (row[2] &&
                    row[2].toLowerCase().includes(searchTerm.toLowerCase())) // Căutăm în prima coloană (nume)
        ),
    }));

    console.log(filteredData)
  return (
      <Paper
          sx={{
              width: "100%",
              borderRadius: "21px",
              backgroundColor: "gray",
              position: "relative",
              paddingBottom: "20px",
          }}
      >
          <Typography variant="h4" sx={{ mb: 2, marginLeft: "40%" }}>
              Google Sheets Data
          </Typography>
          <Box
              sx={{
                  marginBottom: "20px",
                  ml: "40px",
                  backgroundColor: "#fff",
                  borderRadius: "10px",
                  width: "200px",
                  height: "40px",
              }}
          >
              <Input
                  sx={{ ml: 3, mr: 3 }}
                  placeholder={"Căutare..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
          </Box>
          {filteredData.map((sheet, sheetIndex) => (
              <TableContainer
                  component={Paper}
                  sx={{ width: "97%", ml: 3, borderRadius: "20px" }}
                  key={sheetIndex}
              >
                  <Typography variant="h6" sx={{ p: 2, marginLeft: "45%" }}>
                      Foaie: {sheet.sheetName}
                  </Typography>
                  <Table>
                      <TableHead>
                          <TableRow>
                              {sheet.headers.length > 0 &&
                                  sheet.headers.map((header, colIndex) => (
                                      <TableCell
                                          key={colIndex}
                                          sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                                      >
                                          {colIndex === 1 ? "Image" : header || `Column ${colIndex + 1}`}
                                      </TableCell>
                                  ))}
                          </TableRow>
                      </TableHead>
                      <TableBody>
                          {sheet.values.length > 1 ? (
                              sheet.values.slice(1).map((row, rowIndex) => (
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
                              ))
                          ) : (
                              <TableRow>
                                  <TableCell colSpan={sheet.headers.length} sx={{ textAlign: "center", color: "red" }}>
                                      Nicio potrivire găsită!
                                  </TableCell>
                              </TableRow>
                          )}
                      </TableBody>
                  </Table>
              </TableContainer>
          ))}
      </Paper>
  );
}

export default App
