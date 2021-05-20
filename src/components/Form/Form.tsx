import * as React from 'react';
import swal from 'sweetalert';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';
import * as B24 from '../../B24/B24';
import Notification, { Status } from '../Notification/Notification';
import { IState, emptyState } from '../../Task/emptyState';
import { DB } from '../../DBManager';
import { TabbedCard, Button, Icon } from 'tabler-react';
import CacheManager from '../../CacheManager';
import { GoBackOrHomeButton } from '../NaviButton';
import { renderDates } from './Tabs/Dates';
import { renderPayments } from './Tabs/Payments';
import { renderBasicInfo } from './Tabs/BasicInfo';
import { renderFiles } from './Tabs/Files';
import { renderCommentsNews } from './Tabs/CommentsNews';
import { renderFabricApplicationForm } from './Tabs/FabricApplicationForm';
import { renderStandards } from './Tabs/Standards';
import { getShippingLabelFile } from '../Export/PDF/ShippingLabelFile';

interface IFormState extends IState {
  requestStatus: Status;
  hasError?: boolean;
  existsInDB?: boolean;
}

class Form extends React.Component {
  task_id: string | undefined;
  state: IFormState;
  props: any;

  constructor(props: any) {
    super(props);
    this.task_id = props.match.params.id;
    this.state = {
      ...emptyState,
      requestStatus: Status.FillingForm,
    };
  }

  componentDidUpdate = () => {
    if (this.state.hasError) throw new Error('Task not found');
  };

  async componentDidMount() {
    if (this.task_id) {
      this.setState({ requestStatus: Status.Loading });
      const dataFromDB = await DB.getData(this.task_id).then(
        ({
          exists,
          rem,
          quoteNo1,
          quoteNo2,
          proformaInvoiceNo1,
          proformaInvoiceNo2,
          ...DBState
        }: any) => ({
          DBState,
          quoteNo1,
          quoteNo2,
          proformaInvoiceNo1,
          proformaInvoiceNo2,
          rem,
          exists,
        })
      );

      await B24.getTask(this.task_id)
        .then((r: any) => {
          this.setState({
            ...r.state,
            attachedFiles: r.ufTaskWebdavFiles,
            link: `[URL=certreport.xmtextiles.com/edit/${this.task_id}/]this task[/URL]`,
            DBState: dataFromDB.DBState,
            existsInDB: dataFromDB.exists,
            rem: dataFromDB.rem || emptyState.rem,
            quoteNo1: dataFromDB.quoteNo1 ?? emptyState.quoteNo1,
            quoteNo2: dataFromDB.quoteNo2 ?? emptyState.quoteNo2,
            proformaInvoiceNo1:
              dataFromDB.proformaInvoiceNo1 ?? emptyState.proformaInvoiceNo1,
            proformaInvoiceNo2:
              dataFromDB.proformaInvoiceNo2 ?? emptyState.proformaInvoiceNo2,
            requestStatus: Status.FillingForm,
          });
        })
        .catch((e) => this.setState({ hasError: true }));
    }
  }

  handleDateChange = (date: Date | null, prop: string): void =>
    this.setState({
      [prop]: date === null ? '' : dayjs(date).format('DDMMMYYYY'),
    });

  handleCheckboxChange = ({ currentTarget }: React.SyntheticEvent): void =>
    this.setState({
      [currentTarget.id]: (currentTarget as HTMLInputElement).checked,
    });

  handleSelectChange = (
    selected: {
      label: string;
      value: string;
    }[],
    id: string
  ) => {
    selected = Array.isArray(selected) ? selected : [selected];
    this.setState({
      [id]: selected.reduce(
        (endValue, currentValue, index) =>
          index === selected.length - 1
            ? `${endValue}${currentValue.label}`
            : `${endValue}${currentValue.label}, `,
        ''
      ),
    });
  };

  handleChange = (e: any) => this.setState({ [e.target.id]: e.target.value });

  handlePreTreatment1Change = (value: string) =>
    this.setState({ pretreatment1Result: value });

  async handleCert(e: any) {
    e.preventDefault();
    const OK = await swal({
      title: 'Are you sure?',
      icon: 'info',
      buttons: ['Cancel', 'OK'],
    });

    if (OK) {
      this.setState({ requestStatus: Status.Loading });
      // update in Bitrix
      const taskId = this.task_id
        ? await B24.updateTask(this.state, this.task_id)
            .then((_) => this.task_id)
            .catch(this.unsuccessfullySubmitted)
        : await B24.createTask(this.state).catch(this.unsuccessfullySubmitted);

      // update in indexedDB
      await CacheManager.updateTask(taskId);

      // update in FaunaDB
      this.state.existsInDB
        ? DB.updateInstance(taskId, {
            rem: this.state.rem,
            quoteNo1: this.state.quoteNo1,
            quoteNo2: this.state.quoteNo2,
            proformaInvoiceNo1: this.state.proformaInvoiceNo1,
            proformaInvoiceNo2: this.state.proformaInvoiceNo2,
            ...this.state.DBState,
          })
            .then(this.successfullySubmitted)
            .catch(this.unsuccessfullySubmitted)
        : DB.createInstance(taskId, this.state.DBState)
            .then(this.successfullySubmitted)
            .catch(this.unsuccessfullySubmitted);
    }
  }

  asSelectable = (value: string) => {
    if (value !== '') {
      const splitted: string[] = value.split(', ');
      return splitted.length === 1
        ? [{ label: value, value }]
        : splitted.map((label) => ({ label, value: label }));
    }
  };

  successfullySubmitted = () => {
    this.setState({ requestStatus: Status.Success });
    this.props.history.goBack();
  };

  unsuccessfullySubmitted = (error: any) => {
    console.log(error);
    this.setState({ requestStatus: Status.Failure });
    setTimeout(
      () =>
        this.setState({
          requestStatus: Status.FillingForm,
        }),
      1500
    );
  };

  render = () => (
    <div className="container mt-2">
      <Button
        RootComponent="a"
        href={`https://xmtextiles.bitrix24.ru/company/personal/user/460/tasks/task/view/${this.task_id}/`}
        target="_blank"
        rel="noopener noreferrer"
        link
        className="float-right"
      >
        Task in B24
      </Button>
      {this.state.requestStatus === Status.FillingForm && (
        <Button
          className="float-right"
          link
          onClick={(e: any) => {
            e.preventDefault();
            getShippingLabelFile(this.state);
          }}
        >
          Shipping label <Icon prefix="fe" name="download" />
        </Button>
      )}
      <Notification status={this.state.requestStatus} />
      <form onSubmit={(e) => this.handleCert(e)}>
        <TabbedCard initialTab="Basic Info">
          {renderBasicInfo.call(this)}
          {renderDates.call(this)}
          {renderPayments.call(this)}
          {renderStandards.call(this)}
          {renderFabricApplicationForm.call(this)}
          {renderCommentsNews.call(this)}
          {this.task_id && renderFiles.call(this)}
        </TabbedCard>
        <div className="d-flex justify-content-around">
          <button type="submit" className="col-2 btn btn-primary">
            Save changes
          </button>
          <GoBackOrHomeButton />
        </div>
      </form>
    </div>
  );

  updateAttachedFiles = () =>
    B24.getAttachedFiles(this.task_id as string).then((r: []) => {
      this.setState({ attachedFiles: r });
    });
}

export { Form };
