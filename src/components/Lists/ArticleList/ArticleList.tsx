import { useEffect, useState } from 'react';
import ReactTable, { CellInfo } from 'react-table';
import { ColumnFilter } from '../Filters/ColumnFilter';
import type { ProductType, taskOfProduct } from '../../../Product/Product';
import { Grid, Tooltip } from 'tabler-react';

const columns = [
  {
    // 0
    Header: '#',
    id: 'position',
    accessor: 'position',
    width: 40,
  },
  {
    // 1
    Header: 'Item',
    id: 'article',
    accessor: 'article',
    Cell: ({ original }: CellInfo) => (
      <Tooltip content="Article's relevant certs" placement="right">
        <a href={`/article/${original.article}/`}>{original.article}</a>
      </Tooltip>
    ),
    width: 150,
  },
  {
    // 2
    Header: 'Brand',
    id: 'brand',
    accessor: 'brand',
    width: 50,
  },
  {
    // 3
    Header: 'Standards',
    id: 'standards',
    accessor: 'standards',
    width: 450,
    Cell: ({ value }: CellInfo) => value.join(', '),
  },
  {
    // 4
    Header: 'Certifications',
    id: 'tasks',
    accessor: 'tasks',
    Cell: ({ value: taskList }: CellInfo) => (
      <Tooltip content="links to B24 tasks" placement="left">
        <div>
          {taskList.map(({ id, title }: taskOfProduct, index: number) => (
            <span key={id}>
              &nbsp;
              <a
                href={`https://xmtextiles.bitrix24.ru/company/personal/user/460/tasks/task/view/${id}/`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {title}
                {taskList.length !== index + 1 && ','}
              </a>
            </span>
          ))}
        </div>
      </Tooltip>
    ),
  },
];

interface ArticleListProps {
  products: ProductType[];
}

const ArticleList = ({ products }: ArticleListProps) => {
  const [visibleData, setVisibleData] = useState<ProductType[]>();

  useEffect(() => {
    setVisibleData(products);
  }, [products]);

  return (
    <Grid.Row>
      <Grid.Col width="8" offset="2">
        <ColumnFilter
          dataToFilter={products}
          update={setVisibleData}
          filteringDataType="products"
        />
        <ReactTable
          data={visibleData}
          columns={columns}
          resolveData={(data: ProductType[], i = 1) =>
            data.map((row: ProductType) => ({ ...row, position: i++ }))
          }
          className="-highlight table"
          defaultPageSize={20}
        />
      </Grid.Col>
    </Grid.Row>
  );
};

export { ArticleList };
