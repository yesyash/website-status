import { FC, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from '@/components/head';
import Layout from '@/components/Layout';
import Card from '@/components/tasks/card';
import useFetch from '@/hooks/useFetch';
import classNames from '@/styles/tasks.module.scss';
import task from '@/interfaces/task.type';
import Accordion from '@/components/Accordion';
import fetch from '@/helperFunctions/fetch';
import { toast } from '@/helperFunctions/toast';

const TASKS_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/tasks`;
const SELF_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/users/ankush`;

async function updateCardContent(cardDetails: task) {
  try {
    const response = fetch({
      url: `${TASKS_URL}/${cardDetails.id}`,
      method: 'patch',
      params: null,
      data: cardDetails,
      headers: {
        'Content-type': 'application/json',
      },
    });
    // eslint-disable-next-line no-console
    console.log('Response', response);
  } catch (err:any) {
    // eslint-disable-next-line no-console
    console.log('Toast', toast);
  }
}

function renderCardList(tasks: task[], edit: boolean) {
  return tasks.map((item: task) => (
    <Card
      content={item}
      key={item.id}
      shouldEdit={edit}
      onContentChange={async (newDetails: any) => updateCardContent(newDetails)}
    />
  ));
}

const Index: FC = () => {
  const router = useRouter();
  const { query } = router;
  let tasks: task[] = [];
  const [filteredTask, setFilteredTask] = useState<any>([]);
  const { response, error, isLoading } = useFetch(TASKS_URL);
  const [roles, setRoles] = useState(false);
  const edit = !!query.edit && roles;
  useEffect(() => {
    if ('tasks' in response) {
      tasks = response.tasks;
      tasks.sort((a: task, b: task) => +a.endsOn - +b.endsOn);
      const taskMap: any = [];
      tasks.forEach((item) => {
        if (item.status in taskMap) {
          taskMap[item.status] = [...taskMap[item.status], item];
        } else {
          taskMap[item.status] = [item];
        }
      });
      setFilteredTask(taskMap);
    }
  }, [isLoading, response]);

  useEffect(() => {
    const url = SELF_URL;
    const fetchData = async () => {
      try {
        const r_esponse = fetch({ url });
        const fetchPromise = await r_esponse.requestPromise;
        const adminUser :boolean = fetchPromise.data.user.roles.admin;
        const superUser :boolean = fetchPromise.data.user.roles.super_user;
        if (adminUser || superUser === true) {
          setRoles(true);
        }
      } catch (error_) {
        // eslint-disable-next-line no-console
        console.log('error', error_);
      }
    };

    fetchData();
  }, []);
  return (
    <Layout>
      <Head title="Tasks" />

      <div className={classNames.container}>
        {!!error && <p>Something went wrong, please contact admin!</p>}
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <>
            {Object.keys(filteredTask).length > 0
              ? Object.keys(filteredTask).map((key) => (
                <Accordion open title={key} key={key}>
                  {renderCardList(filteredTask[key], edit)}
                </Accordion>
              ))
              : !error && 'No Tasks Found'}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Index;
