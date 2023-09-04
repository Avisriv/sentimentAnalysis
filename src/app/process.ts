import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx'; 
import { HttpClient } from '@angular/common/http'; 
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FeedbackAnalysisService {
  private textAnalyticsEndpoint = 'https://exo-lang.cognitiveservices.azure.com';
  private sentimentEndpoint = '/text/analytics/v3.0/sentiment';
  private keyPhrasesEndpoint = '/text/analytics/v3.0/keyPhrases';
  private textAnalyticsKey = 'c23f4f17c4ae4e32b2cdafc296f431d1'; // Replace with your Azure Text Analytics key

  private headers = {
    'Content-Type': 'application/json',
    'Ocp-Apim-Subscription-Key': this.textAnalyticsKey,
    Accept: 'application/json',
  };

  constructor(private httpClient: HttpClient) {}

  analyzeFeedback(jsonData: any): Observable<any> {
    // Load the Excel file
 //   const workbook = XLSX.readFile(filePath);
//    const sheetName = workbook.SheetNames[0];
//    const worksheet = workbook.Sheets[sheetName];
  //  const jsonData = XLSX.utils.sheet_to_json(worksheet);

  console.log("json:"+jsonData);

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
          this.textAnalyticsEndpoint + this.sentimentEndpoint,
          { documents: [document] },
          requestOptions
        )
        .subscribe(
          (response) => {
            console.log(`Sentiment response for document ${index}:`, response);
            const sentiment = this.getSentiment(response);
            console.log(`Sentiment for document ${index}:`, sentiment);
            sentiments[index] = sentiment;
          },
          (error) => {
            console.error(error);
            sentiments.push('error');
          }
        );

      // Extract key phrases
      this.httpClient
        .post<any>(
          this.textAnalyticsEndpoint + this.keyPhrasesEndpoint,
          { documents: [document] },
          requestOptions
        )
        .subscribe(
          (response) => {
            console.log(`Key phrases response for document ${index}:`, response);
            const phrases = response.documents[0].keyPhrases;
            keyPhrases[index] = phrases.join(', ');
          },
          (error) => {
            console.error(error);
            keyPhrases[index] = 'error';
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
          row['Key Phrases'] = keyPhrases[index];
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
      }, 2000); // Adjust the timeout as needed
    });
  }

  private getSentiment(data: any) {
    let sentiment = data.documents[0].sentiment;
    // If mixed, get the highest score
    if (sentiment === 'mixed' && data.documents[0].confidenceScores) {
      const scores = data.documents[0].confidenceScores;
      const maxScore = Object.entries(scores).reduce((a, b) =>
        a > b ? a : b
      );
      sentiment = maxScore[0];
    }
    return sentiment;
  }
}
