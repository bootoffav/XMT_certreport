import jsPDF from 'jspdf';
// eslint-disable-next-line
import autoTable from 'jspdf-autotable';
import StateAdapter from '../../StateAdapter';



class PDFExport {
  pdf : jsPDF;
  data : StateAdapter;

  constructor(data : any, pdf: jsPDF = new jsPDF('l')) {
    this.data = data;
    this.pdf = pdf;
  }
  
  output() {
    return this.pdf.output();
  }

  more() {
    let thead = [
      '#', 'Article', 'Product', 'Code', 
      'Colour', 'Length of sample, meters',
      'Width of sample', 'Part number', 'Roll Number'
    ];
  
    let rows = [
      [1, this.data.st.article, this.data.st.product, this.data.st.code, this.data.st.colour,
        this.data.st.length, this.data.st.width, this.data.st.partNumber, this.data.st.rollNumber],
      ];
      
    let table_options = {
      margin: {
        left: 15,
        width: 15
      },
      styles: {
        fontSize: 8
      },
      headerStyles: {
        halign: 'center',
        fillColor: '#fff251',
        textColor: '#000000',
        fontStyle: 'bold'
      },
      startY: 50,
      tableLineWidth: 0.3,
    };

    this.pdf.setFont('Calibri', 'normal');
    this.pdf.text(`NAME OF APPLICANT: ${this.data.st.applicantName}`, 60, 30);
    this.pdf.setFontSize(12);
    this.pdf.text(`Standards: ${this.data.st.standards}`, 15, 80);
    this.pdf.text(`Testing company: ${this.data.st.testingCompany}`, 15, 85);
    this.pdf.text(`Materials needed: ${this.data.st.materialNeeded}`, 15, 90);
    this.pdf.text(`Testing Time: ${this.data.st.testingTime}`, 15, 95);
    this.pdf.text(`Sent on: ${this.data.formatDate(this.data.st.sentOn)}`, 15, 100);
    this.pdf.text(`Received on: ${this.data.formatDate(this.data.st.receivedOn)}`, 15, 105);
    this.pdf.text(`Started on: ${this.data.formatDate(this.data.st.startedOn)}`, 15, 110);
    this.pdf.text(`Finished on: ${this.data.formatDate(this.data.st.finishedOn)}`, 15, 115);
    this.pdf.text(`Results received on: ${this.data.formatDate(this.data.st.resultsReceived)}`, 15, 120);
    this.pdf.addImage('data:image/jpeg;base64,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TbjvjIa/evrjeJ2XHt5W6KIOOd9w67jL8VfFL7dIiI1+DKTGshdkLEa86FP8CKsWzNbhbJgNeliJNAde9SokW7Rd78om+k1bolkar/3Bc137xH2f1tqnT2D407ffppy3h6XQt+6ndqXv0X0ybDrFkT7L10ic1xmmglSunYqFw7Fx5pgxl6dkJhtjrMf+HE4LM2+JhTTMOSw65rzJFQLdodfZX8KKt7u4Wb8YQij9ZFYe5X7Ad7+ZXpb7Pb7fbK26DFbjxypWlQaHauVjGE2HHp7k62xahIMdCMirVTfFd0Sv2jktuwHeqqn2jkrD8oe8VOZBsLJdDNOa6PxeH+9b2Yux7fwSiw7S+D7VXAaecbLcOveKhf2KwMhwjHb7dAuNxg0dkCNKa66bv1rpuY/aCstbN6AwMHbpyaB0qM4VjO7TPJVPTrptueW+qNIKj4cWLArrhTDt5KMUsKnzqk+QEPUXlLyqVWSbhWN2a5XWwRAcahjShvt7j31r4RMlts8KsPbd3jBcKuu7aTpbf3KUhZrY1a62sYLAwqjsq1QOnRToxXReIiSzFwrKlXVYiYjkrkoFo4h4i7frvFZgyh30aeZLQhGnm965X5Ozd2pLn15plaadPV3SP4VOGuGeMNFWjbckWSPmVZ9ILZWv6lLIMOLAhjFhstR2G+wQAdKUXiYrtZFj8x/ue14Dtclz9pj49zcREWyNwEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQH//2Q==', 'jpg', 220, 0);
    // @ts-ignore
    this.pdf.autoTable(thead, rows, table_options);
  }
}

export default PDFExport;