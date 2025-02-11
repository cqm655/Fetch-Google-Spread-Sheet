import {useEffect, useState} from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { GoogleSpreadsheet } from "google-spreadsheet";

const SPREADSHEET_ID =  "1WKGHtLI2KQ0l5mEVxsKX__vOaPhh85Yx8uea5yWTrCo";
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
      <div>
          <h2>Google Sheets Data</h2>
          {sheetsData.map((sheet, sheetIndex) => (
              <div key={sheetIndex}>
                  <h3>Sheet: {sheet.sheetName}</h3>
                  <table border="1">
                      <thead>
                      <tr>
                          {sheet.headers.length > 0
                              ? sheet.headers.map((header, colIndex) => (
                                  <th key={colIndex}>
                                      {colIndex === 1 ? "Image" : header || `Column ${colIndex + 1}`}
                                  </th>
                              ))
                              : null}
                      </tr>
                      </thead>
                      <tbody>
                      {sheet.values.slice(1).map((row, rowIndex) => (
                          <tr key={rowIndex}>
                              {row.map((cell, colIndex) => (
                                  <td key={colIndex}>
                                      {/* Only column 2 (B) is treated as an image */}
                                      {colIndex === 1 && typeof cell === "string" ? (
                                          <img
                                              src={cell}
                                              alt={`Image ${rowIndex}`}
                                              width="100"
                                              loading="lazy"
                                          />
                                      ) : (
                                          cell || "N/A"
                                      )}
                                  </td>
                              ))}
                          </tr>
                      ))}
                      </tbody>
                  </table>
              </div>
          ))}
      </div>
  );
}

export default App
