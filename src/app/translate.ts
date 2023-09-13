import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class FeedbackAnalysisService {
  private textAnalyticsEndpoint = 'https://translateflask.azurewebsites.net';
  private translationEndpoint = '/api/exodusTranslate';
  private keyPhrasesEndpoint = '/text/analytics/v3.0/keyPhrases';
  private textAnalyticsKey = ''; // Replace with your Azure Text Analytics key

  private headers = {
    'Content-Type': 'application/json',
    'Ocp-Apim-Subscription-Key': this.textAnalyticsKey,
    'Accept': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  constructor(private httpClient: HttpClient) { }

  analyzeFeedback(jsonData: any): Observable<any> {
    // Load the Excel file
    //   const workbook = XLSX.readFile(filePath);
    //    const sheetName = workbook.SheetNames[0];
    //    const worksheet = workbook.Sheets[sheetName];
    //  const jsonData = XLSX.utils.sheet_to_json(worksheet);

    console.log("json:" + jsonData);

    const sentiments: string[] = [];
    const keyPhrases: string[] = [];

    // Define the HTTP options for the requests
    const requestOptions = {
      headers: this.headers,
    };

    // Iterate over the rows in the Excel data
    jsonData.forEach((row: any, index: number) => {
      const document = {
        id: index.toString(),
        text: row.Text, // Replace 'your_column_name' with the name of your column
      };

      // Analyze sentiment
      this.httpClient
        .post<any>(
          this.textAnalyticsEndpoint + this.translationEndpoint,
          JSON.stringify({
            "text": row.Text
          }),
          requestOptions
        )
        .subscribe(
          (response) => {
            console.log(`Translation response for document ${index}:`, response);
            const sentiment = response['translations']
            console.log(`Sentiment for document ${index}:`, sentiment);
            sentiments[index] = sentiment;
          },
          (error) => {
            console.error(error);
            sentiments.push('error');
          }
        );
    });


      // Return an observable with the results
      return new Observable((observer) => {
        // Wait for all asynchronous operations to complete
        setTimeout(() => {
          // Add the results to the data
          jsonData.forEach((row: any, index: number) => {
            row.Sentiment = sentiments[index];
            row['Translations'] = keyPhrases[index];
          });

          // Create a new worksheet with the updated data
          const updatedWorksheet = XLSX.utils.json_to_sheet(jsonData);

          // Save the new worksheet to a new Excel file
          const newWorkbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(newWorkbook, updatedWorksheet, 'mySheet');

          // Write the workbook to a file
          const outputFile = 'Feedback_Analyzed.xlsx';
          XLSX.writeFile(newWorkbook, outputFile);

          observer.next(outputFile); // Emit the file path when done
          observer.complete();
        }, 4000); // Adjust the timeout as needed
      });
    }
  }
