import { Component, ViewChild, ElementRef } from "@angular/core";
import { FeedbackAnalysisService } from "./process";
import * as XLSX from 'xlsx';

type AOA = any[][];


@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  @ViewChild("fileDropRef", { static: false }) fileDropEl: ElementRef;
  files: any[] = [];
  selecetdFile : File;
  data: AOA = [[1, 2], [3, 4]];
  wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };

  constructor(private feedbackService: FeedbackAnalysisService) {}

  /**
   * on file drop handler
   */
  onFileDropped($event: any) {
    this.prepareFilesList($event);
  }

  /**
   * handle file from browsing
   */
  fileBrowseHandler(evt: any) {
    this.prepareFilesList(evt.target.files);
    /* wire up file reader */
    const target: DataTransfer = <DataTransfer>(evt.target);
    if (target.files.length !== 1) throw new Error('Cannot use multiple files');
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      /* read workbook */
      const bstr: string = e.target.result;
      const workbook: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

      /* grab first sheet */
      const wsname: string = workbook.SheetNames[0];
      const ws: XLSX.WorkSheet = workbook.Sheets[wsname];

       //   const workbook = XLSX.readFile(filePath);
//    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[wsname];
    this.data = XLSX.utils.sheet_to_json(worksheet);

      /* save data */
   //   this.data = <AOA>(XLSX.utils.sheet_to_json(ws, { header: 1 }));
      console.log("data:",this.data);
      this.data.map(res=>{
        if(res[0] === "no"){
          console.log(res[0]);
        }else{
          console.log(res[0]);
        }
      })
    };
    reader.readAsBinaryString(target.files[0]);
  }

  /**
   * Delete file from files list
   * @param index (File index)
   */
  deleteFile(index: number) {
    if (this.files[index].progress < 100) {
      console.log("Upload in progress.");
      return;
    }
    this.files.splice(index, 1);
  }

  /**
   * Simulate the upload process
   */
  uploadFilesSimulator(index: number) {
    setTimeout(() => {
      if (index === this.files.length) {
        return;
      } else {
        const progressInterval = setInterval(() => {
          if (this.files[index].progress === 100) {
            console.log(this.files[index]);
            clearInterval(progressInterval);
            this.uploadFilesSimulator(index + 1);
          } else {
            this.files[index].progress += 5;
          }
        }, 200);
      }
    }, 1000);
  }

  /**
   * Convert Files list to normal array list
   * @param files (Files List)
   */
  prepareFilesList(files: Array<any>) {
    for (const item of files) {
      item.progress = 0;
      this.files.push(item);
    }
    this.fileDropEl.nativeElement.value = "";
    this.uploadFilesSimulator(0);
  }

  /**
   * format bytes
   * @param bytes (File size in bytes)
   * @param decimals (Decimals point)
   */
  formatBytes(bytes: any, decimals = 2) {
    if (bytes === 0) {
      return "0 Bytes";
    }
    const k = 1024;
    const dm = decimals <= 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  submitClick() {
    console.log('submit');
    this.inputFiles(this.data);
  }

  inputFiles(filePath: AOA) {
    this.feedbackService.analyzeFeedback(filePath).subscribe(
      (outputFile) => {
        console.log(`Analysis completed. Results saved to ${outputFile}`);
      },
      (error) => {
        console.error('Error during analysis:', error);
      }
    );
  }
}
