import React from 'react';
import { useState, useEffect } from 'react';
import { Grid, Table, Icon } from 'tabler-react';
import { ClientStorage } from '../../ClientStorage/ClientStorage';
import { getTaskParamLabel } from '../../Task/Task';
import './ItemInCertifications.css';
import { GoBackOrHomeButton } from '../NaviButton';
import { pullSpecificFiles } from '../FileManagement/FileManagement';
import CacheManager from '../../CacheManager';

interface IItemProps {
  item: string;
}

const resume: {
  [key: string]: any;
} = {
  pass: <Icon prefix="fe" width="60" className="greenIcon" name="thumbs-up" />,
  fail: <Icon prefix="fe" width="60" className="redIcon" name="thumbs-down" />,
  partly: (
    <Icon prefix="fe" width="60" className="yellowIcon" name="alert-circle" />
  ),
};

function ItemInCertifications({ item }: IItemProps) {
  item = decodeURIComponent(item);
  const [tasks, setTasks] = useState<any>([]);

  useEffect(() => {
    ClientStorage.getSpecificItem(item, 'products')
      .then(({ tasks }: any) => {
        setTasks(tasks);
        return tasks;
      })
      .then((tasks) => CacheManager.updateItem(item, tasks))
      .then(({ tasks }: any) => {
        setTasks(tasks);
      });
  }, [item]);

  const parameters = [
    'pretreatment1',
    'standards',
    'price',
    'stage',
    'partNumber',
    'resume',
    'testReport',
    'certificate',
  ];

  return (
    <>
      <Grid.Col width="8" offset="2" className="my-4">
        <p className="text-center text-uppercase item-name">
          {item} in certifications
        </p>
      </Grid.Col>
      <Grid.Col width="8" offset="2" className="mb-2">
        <span className="itemsCommonParameters">
          <span className="font-weight-bold">Product: </span>
          {tasks.length ? tasks[0].state.product : ''}
        </span>
      </Grid.Col>
      <Grid.Col width="8" offset="2" className="mb-4">
        <span className="itemsCommonParameters">
          <span className="font-weight-bold">Code:</span>{' '}
          {tasks.length ? tasks[0].state.code : ''}
        </span>
      </Grid.Col>
      <Grid.Col className="mt-2">
        <Table highlightRowOnHover className="itemInCertificationsTable">
          <Table.Header>
            <Table.Row>
              <Table.ColHeader>Parameter</Table.ColHeader>
              {tasks.map((task: any, index: number) => (
                <Table.ColHeader key={index}>
                  <div className="d-flex justify-content-start">
                    <a href={`/edit/${task.id}`}>{task.title} </a>
                    &nbsp;|&nbsp;
                    <a
                      href={`https://xmtextiles.bitrix24.ru/company/personal/user/460/tasks/task/view/${task.id}/`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      B24
                    </a>
                  </div>
                </Table.ColHeader>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {parameters.map((param) => (
              <Table.Row key={param}>
                <Table.Col>{getTaskParamLabel(param)}</Table.Col>
                {tasks.map((task: any, index: number) => (
                  <Table.Col key={index}>{formatColumn(task, param)}</Table.Col>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Grid.Col>
      <Grid.Col width="8" offset="2">
        <div className="d-flex justify-content-center mt-3">
          <GoBackOrHomeButton />
        </div>
      </Grid.Col>
    </>
  );
}

function formatColumn(task: any, param: string): JSX.Element | string {
  switch (param) {
    case 'resume':
      return resume[task.state[param]];

    case 'testReport':
      const [, testReportFiles] = pullSpecificFiles(
        task.ufTaskWebdavFiles,
        'Test Report'
      );
      return (
        <>
          {testReportFiles.map((file) => (
            <div key={file.ATTACHMENT_ID}>
              <a href={'https://xmtextiles.bitrix24.ru' + file.DOWNLOAD_URL}>
                {file.NAME}
              </a>
            </div>
          ))}
        </>
      );
    case 'certificate':
      const [, certificateFiles] = pullSpecificFiles(
        task.ufTaskWebdavFiles,
        'Certificate'
      );
      return (
        <>
          {certificateFiles.map((file) => (
            <div key={file.ATTACHMENT_ID}>
              <a href={'https://xmtextiles.bitrix24.ru' + file.DOWNLOAD_URL}>
                {file.NAME}
              </a>
            </div>
          ))}
        </>
      );

    case 'price':
      return (+task.state.price || 0 + +task.state.price2 || 0).toLocaleString(
        'ru-RU',
        {
          style: 'currency',
          currency: 'EUR',
        }
      );
    default:
      return task.state[param];
  }
}

export { ItemInCertifications };
