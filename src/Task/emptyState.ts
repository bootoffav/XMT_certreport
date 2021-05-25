import { TaskState } from './Task.interface';

const emptyState: TaskState = {
  standardsResult: {},
  DBState: {
    testRequirement: [[], [], [], [], [], [], [], [], []],
    washPreTreatment: [[], []],
    footer: [[], []],
    cycles: ['5', ''],
    washTemp: '60',
    otherStandard1: 'According to Standard Mandotory Test Requirement',
    otherStandard2: 'According to Standard Mandotory Test Requirement',
  },
  attachedFiles: [],
  resume: undefined,
  link: '',
  paid: false,
  proforma: '',
  paid2: false,
  news: '',
  length: '1',
  stage: '',
  testingTime: '21',
  width: '1.5',
  proformaReceivedDate: '',
  proformaReceivedDate2: '',
  pausedUntil: '',
  readyOn: '',
  sentOn: '',
  receivedOn: '',
  repeatReceivedOn: '',
  startedOn: '',
  repeatStartedOn: '',
  testFinishedOnPlanDate: '',
  repeatTestFinishedOnPlanDate: '',
  testFinishedOnRealDate: '',
  repeatTestFinishedOnRealDate: '',
  certReceivedOnPlanDate: '',
  repeatCertReceivedOnPlanDate: '',
  certReceivedOnRealDate: '',
  repeatCertReceivedOnRealDate: '',
  paymentDate1: '',
  paymentDate2: '',
  proformaReceived: '',
  proformaReceived2: '',
  proformaNumber: '',
  proformaNumber2: '',
  applicantName: '',
  product: '',
  code: '',
  article: '',
  colour: '',
  partNumber: '',
  rollNumber: '',
  serialNumber: '',
  materialNeeded: '',
  standards: '',
  testingCompany: '',
  brand: '',
  price1: '',
  price2: '',
  comments: '',
  testReport: '',
  certificate: '',
  pretreatment1: '',
  pretreatment1Result: '',
  pretreatment2: '',
  pretreatment3: '',
  otherTextInDescription: '',
  rem: '',
  quoteNo1: `OF.${new Date().getFullYear().toString().slice(2)}-`,
  quoteNo2: `OF.${new Date().getFullYear().toString().slice(2)}-`,
  proformaInvoiceNo1: `FPRO.${new Date().getFullYear().toString().slice(2)}-`,
  proformaInvoiceNo2: `FPRO.${new Date().getFullYear().toString().slice(2)}-`,
};

const brand = [
  { value: 'C_10033', label: 'XMT' },
  { value: 'C_10035', label: 'XMF' },
  { value: 'C_10037', label: 'XMS' },
  { value: 'C_10041', label: 'XMG' },
  { value: '', label: 'No brand' },
];

export { emptyState, brand };
