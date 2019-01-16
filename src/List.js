import React from 'react';
import Loader from 'react-loader-spinner';
import ReactTable from "react-table";
import { Link } from 'react-router-dom';
import { empty_state } from './defaults';
import B24 from './B24.js';
import './css/style.css';

// export default class List extends React.Component {
//     constructor (props) {
//       super(props);
//       this.state = {};
//     }
//     componentDidMount() {
//       B24.get_tasks().then(tasks => {
//         this.setState({ tasks: tasks.filter(task => task.CREATED_BY === '460') });
//       });
//     }
//     render (){
//         let position = 1;
//         return (this.state.tasks)
//         ? <table className="table table-bordered">
//             <thead className="thead-light">
//               <tr>
//                   <th scope="col">#</th>
//                   <th scope="col">##</th>
//                   <th scope="col">Brand</th>
//                   <th scope="col">Task name</th>
//                   <th scope="col">Created On</th>
//                   <th scope="col">Готовность</th>
//                   <th scope="col">Test-report</th>
//                   <th scope="col">Cert</th>
//                   <th scope="col">Ткань</th>
//                   <th scope="col">Стандарт</th>
//               </tr>
//             </thead>
//             <tbody>
//               {this.state.tasks.map(task => <Task key={task.ID} task={task} position={position++}/>)}
//             </tbody>
//           </table>
//         : <div className="loader-place row align-items-center">
//                 <div className="col row justify-content-center">
//                     <Loader type="ThreeDots" height="80" width="200"/>
//                 </div>
//           </div>
//     }
// }


export default class List extends React.Component {
    state = {};
    columns = [{
      Header: '#',
      accessor: 'position',
      maxWidth: 30
    },{
      Header: '##',
      accessor: 'state.serialNumber',
      width: 55,
      Cell: props => <a 
        href={`https://xmtextiles.bitrix24.ru/company/personal/user/460/tasks/task/view/${props.original.ID}/`}
        target="_blank" rel="noopener noreferrer"
        >
          { props.value }
        </a>
    }, {
      Header: 'Brand',
      id: 'brand',
      minWidth: 50,
      accessor: 'state.brand',
      Cell: props => props.value.length === 0 ? '' : props.value[0].label,
    },{
      Header: 'Task name',
      accessor: 'TITLE',
      minWidth: 550,
      Cell: props => {
        return props.original.state.serialNumber
        ? <Link to={{
            pathname: `/edit/${props.original.ID}`,
            state: {
              ...props.original.state,
              finishedOn: props.original.state.finishedOn ? props.original.state.finishedOn.valueOf() : null,
              sentOn: props.original.state.sentOn ? props.original.state.sentOn.valueOf() : null,
              receivedOn: props.original.state.receivedOn ? props.original.state.receivedOn.valueOf() : null,
              resultsReceived: props.original.state.resultsReceived ? props.original.state.resultsReceived.valueOf() : null,
              startedOn: props.original.state.startedOn ? props.original.state.startedOn.valueOf() : null,
              AUDITORS: props.original.AUDITORS,
              ACCOMPLICES: props.original.ACCOMPLICES,
              RESPONSIBLE_ID: props.original.RESPONSIBLE_ID
            }
          }}
          >{ props.value }</Link>
          : <Link to={{
            pathname: `/edit/${props.original.ID}`,
            state: { ...props.original.state }
          }}>{ props.value }</Link>
      }
    }, {
      Header: 'Sent On',
      accessor: 'state.sentOn',
      width: 95,
      Cell: props => props.value.length === 0 ? '' : props.value.format("DD MMM YYYY")
    }, {
      Header: 'Ткань',
      accessor: 'state.article',
      width: 100
    }, {
      Header: 'Стандарт',
      accessor: 'state.standard',
      minWidth: 100,
      Cell: props => props.value.length === 0 ? '' : props.value.map(el => `${el.label} `)
    }];

  componentDidMount() {
    let taskPositionInList = 1;
   
    B24.get_tasks()
      .then(tasks => {
        let filtered = {
          new: [],
          old: []
        };
        tasks.forEach(task => (task.CREATED_BY === '460') ? filtered.new.push(task) : filtered.old.push(task))
        return filtered;
      })
      .then(async filtered => {
        let task;
        let tasks = [];

        for (let i = 0; i < filtered.new.length; i++) {
          task = await B24.get_task(filtered.new[i].ID);
          tasks.push({ ...task, position: taskPositionInList++ });
        }
        
        filtered.old.forEach(task => {
          task.state = { ...empty_state };
          task.position = taskPositionInList++;
        });
        tasks = tasks.concat(filtered.old);
        return tasks;
      }).then(tasks => this.setState({ tasks }));
  }

  render (){
    if (this.state.tasks) {
      return <ReactTable
        data={ this.state.tasks } columns={ this.columns }
        defaultSorted={[
          {
            id: "position",
            asc: true
          }
        ]}
        defaultPageSize={ 20 } className="-striped -highlight table"/>;
    }
    return <div className="loader-place row align-items-center">
      <div className="col row justify-content-center">
        <Loader type="ThreeDots" height="80" width="200"/>
      </div>
    </div>
  }
}