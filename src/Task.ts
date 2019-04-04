import { select_options, emptyState, IState } from './defaults';

interface ITask {
  state: {}
  position?: number;
  determineStage: () => Stage;
}

const dataSeparator = '-------------------------------------------------';

export enum Stage {
  'Preparing Sample',
  'Sample Sent',
  'Sample Arrived',
  'PI Issued',
  'Payment Done',
  'Tests are In Progress',
  'Results Ready'
}

class Task implements ITask {
  state: IState;
  position?: number;
  stage: Stage;

  constructor(props: {
    DESCRIPTION: string;
    UF_CRM_TASK: string[]
  }) {
    Object.assign(this, props);
    this.state = this.parse(props.DESCRIPTION, props.UF_CRM_TASK);
    this.stage = this.determineStage();
  }

  parseable_description = (desc: string) => desc.startsWith('[B]Applicant name:[/B]');

  separateParseableDataAndOtherTextOfDescription = (desc: string) => ({
    unParsedTaskState: desc.slice(0, desc.indexOf(dataSeparator)).trim(),
    otherTextInDescription: desc.slice(desc.indexOf(dataSeparator) + dataSeparator.length)
  });

  parse(description: string, uf_crm_task: string[]) {
    if (!this.parseable_description(description)) {
      return {
        ...emptyState,
        otherTextInDescription: description,
        UF_CRM_TASK: uf_crm_task
      };
    }

    let { unParsedTaskState, otherTextInDescription } = this.separateParseableDataAndOtherTextOfDescription(description);

    let parsedState: {
      [k: string]: any;
    } = emptyState;

    const prop_map: {
      [k: string]: any;
    } = {
      'Applicant name': 'applicantName',
      'Product': 'product',
      'Code': 'code',
      'Article': 'article',
      'Colour': 'colour',
      'Serial number': 'serialNumber',
      'Length of sample, meters': 'length',
      'Width of sample, meters': 'width',
      'Part number': 'partNumber',
      'Roll number': 'rollNumber',
      'Standard': 'standards',
      'Test report': 'testReport',
      'Certificate': 'certificate',
      'Price': 'price',
      'Payment date': 'paymentDate',
      'Proforma': 'proforma',
      'Testing company': 'testingCompany',
      'Material needed': 'materialNeeded',
      'Testing time, days': 'testingTime',
      'Pre-treatment 1': 'pretreatment1',
      'Pre-treatment 2': 'pretreatment2',
      'Pre-treatment 3': 'pretreatment3',
      'Sample ready on': 'readyOn',
      'to be sent on': 'sentOn',
      'to be received on': 'receivedOn',
      'tests to be started on': 'startedOn',
      'tests to be finished on': 'testFinishedOn',
      'results to be received on': 'certReceivedOn',
      'Resume': 'resume',
      'Comments': 'comments',
      'Edit': 'link',
      'Second payment': 'secondPayment'
    }

    unParsedTaskState = unParsedTaskState.replace(/:/g, '');

    let matched: string[] = unParsedTaskState.match(/\[B\].+\[\/B\]/gm) || [];
    const props: string[] = matched.map(prop => prop.slice(3, -4)) || [];

    const vals = unParsedTaskState.split(/\[B\].+\[\/B\]/g)
      .map(item => item.trim())
      .slice(1);

    
    for (let i = 0; i < props.length; i++) parsedState[prop_map[props[i]]] = vals[i];
    // parsedState = props.reduce((obj, k: string, i: number) => ({ ...obj, [prop_map[k]]: vals[i] }), {});

    if (parsedState.proforma) {
      [ parsedState.proformaReceivedDate, parsedState.proformaNumber ] = parsedState.proforma.split(', ');
      parsedState.proformaReceived = true;
      delete parsedState.proforma;
    }

    parsedState.price = parsedState.price ? parsedState.price.split(' ')[0] : '';
    parsedState.paid = parsedState.paymentDate ? true : false;

    if (parsedState.secondPayment) {
      [
        parsedState.price2,
        parsedState.paymentDate2,
        parsedState.proformaReceivedDate2,
        parsedState.proformaNumber2
      ] = parsedState.secondPayment.split(', ');

      parsedState.price2 = parsedState.price2 ? parsedState.price2.split(' ')[0] : '';
      
      parsedState.paymentDate2 = parsedState.paymentDate2 || '';
      parsedState.paid2 = parsedState.paymentDate2 ? true : false;
      
      parsedState.proformaReceivedDate2 = parsedState.proformaReceivedDate2 || '';
      parsedState.proformaNumber2 = parsedState.proformaNumber2 || '';
      parsedState.proformaReceived2 = parsedState.proformaReceivedDate2 ? true : false;
      
      delete parsedState.secondPayment;
    }
    
    if (parsedState.testFinishedOn) {
      [parsedState.testFinishedOnPlanDate, parsedState.testFinishedOnRealDate] = parsedState.testFinishedOn.split(', ')
      delete parsedState.testFinishedOn;
    }
    
    if (parsedState.certReceivedOn) {
      [parsedState.certReceivedOnPlanDate, parsedState.certReceivedOnRealDate] = parsedState.certReceivedOn.split(', ')
      delete parsedState.certReceivedOn;
    }
    
    parsedState.brand = uf_crm_task.filter((v : any) => ['C_10033', 'C_10035', 'C_10037', 'C_10041'].includes(v)).join();
    parsedState.brand = select_options.brand.find(el => el.value === parsedState.brand).label;
    parsedState.otherTextInDescription = otherTextInDescription;
    parsedState.UF_CRM_TASK = uf_crm_task;

    return parsedState as IState;
};

  determineStage() : Stage {
    if (this.state.readyOn && !this.state.sentOn) return Stage['Preparing Sample'];
    if (this.state.sentOn && !this.state.receivedOn) return Stage['Sample Sent'];
    if (this.state.receivedOn && !this.state.proformaReceived) return Stage['Sample Arrived'];
    if (this.state.proformaReceived && !this.state.paid) return Stage['PI Issued'];
    if (this.state.paid && !this.state.testFinishedOnPlanDate) return Stage['Payment Done'];
    if (this.state.testFinishedOnPlanDate && !this.state.certReceivedOnRealDate) return Stage['Tests are In Progress'];
    if (this.state.certReceivedOnRealDate) return Stage['Results Ready'];
    
    return Stage['Preparing Sample']; //default clause if no other case triggered;
  }
}

export { dataSeparator, Task as default };