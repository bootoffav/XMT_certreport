import { select_options, emptyState, IState } from '../defaults';

interface ITask {
  state: {}
  position?: number;
  determineStage: () => string;
}

const dataSeparator = '-------------------------------------------------';

export enum Stage {
  '0. Sample to be prepared',
  '1. Sample Sent',
  '2. Sample Arrived',
  '3. PI Issued',
  '4. Payment Done',
  '5. Testing is started',
  '6. Pre-treatment done',
  '7. Test-report ready',
  '8. Certificate ready'
}

class Task implements ITask {
  state: IState;
  position?: number;

  constructor(props: {
    DESCRIPTION: string;
    UF_CRM_TASK: string[]
  }) {
    Object.assign(this, props);
    this.state = this.parse(props.DESCRIPTION, props.UF_CRM_TASK);
    if (!this.state.stage) {
      this.state.stage = this.determineStage();
    }
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
    } = { ...emptyState };

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
      'Stage': 'stage',
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

    if (parsedState.standards) {
      [
        parsedState.standards,
        parsedState.standardsResult
      ] = this.parseStandardResults(parsedState.standards.split(', '));
    }

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
    
    if (parsedState.pretreatment1) {
      [
        parsedState.pretreatment1,
        parsedState.pretreatment1Result = ''
      ] = parsedState.pretreatment1.split(', ');
    }

    if (parsedState.testFinishedOn) {
      [
        parsedState.testFinishedOnPlanDate,
        parsedState.testFinishedOnRealDate = ''
      ] = parsedState.testFinishedOn.split(', ')
      delete parsedState.testFinishedOn;
    }
    
    if (parsedState.certReceivedOn) {
      [
        parsedState.certReceivedOnPlanDate,
        parsedState.certReceivedOnRealDate = ''
      ] = parsedState.certReceivedOn.split(', ')
      delete parsedState.certReceivedOn;
    }
    
    parsedState.brand = uf_crm_task.filter((v : any) => ['C_10033', 'C_10035', 'C_10037', 'C_10041'].includes(v)).join();
    parsedState.brand = select_options.brand.find(el => el.value === parsedState.brand).label;
    parsedState.otherTextInDescription = otherTextInDescription;
    parsedState.UF_CRM_TASK = uf_crm_task;

    return parsedState as IState;
  }
  
  /**
   * Create object for managing Standard results, cleans up standards from pass/fail
   * @param standards Array of standards as strings
   * @returns [ standards for state, object with Standard Results]
   */
  parseStandardResults(standards: string[]): [string, {}] {
    let standardsResults: {
      [k: string]: string;
    } = {};
    let parsedStandards = '';

    for (let st of standards) {
      const reqRes = /pass|fail/.exec(st);
      if (reqRes !== null) {
        const prop = reqRes.input.slice(0, reqRes.index-2);
        const value = reqRes[0];
        standardsResults[prop] = value;
        parsedStandards += `${prop}, `;
      } else {
        parsedStandards += `${st}, `;
      }
    }

    return [parsedStandards.slice(0, -2), standardsResults];
  }

  determineStage(): string {
    if (this.state.readyOn && !this.state.sentOn) return '0. Sample to be prepared';
    if (this.state.sentOn && !this.state.receivedOn) return '1. Sample Sent';
    if (!this.state.proformaReceived && !this.state.paid && this.state.resume) return '8. Certificate ready';
    if (this.state.receivedOn && !this.state.proformaReceived && !this.state.startedOn) return '2. Sample Arrived';
    if (this.state.proformaReceived && !this.state.paid) return '3. PI Issued';
    if (this.state.paid && !this.state.testFinishedOnPlanDate) return '4. Payment Done';
    
    // if (this.state.startedOn && !this.state.paid && !this.state.proformaReceived) {
    //   if (new Date(this.state.startedOn) < new Date) {
    //     return Stage['Testing is started'];
    //   }
    // }
    
    if (this.state.testFinishedOnPlanDate && !this.state.testFinishedOnRealDate) return '5. Testing is started';
    if (this.state.testFinishedOnRealDate && !this.state.certReceivedOnRealDate) return '6. Test-report ready';
    if (this.state.certReceivedOnRealDate) return '8. Certificate ready';
    
    return '0. Sample to be prepared'; //default clause if no other case triggered;
  }
}

export { dataSeparator, Task as default };