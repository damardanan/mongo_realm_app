import React, {useContext, useState, useEffect, useRef} from 'react';
import Realm, {Object} from 'realm';
import {useAuth} from './AuthProvider';
import {Task, User, Department, TaskTemp} from './schemas';
import {ObjectId} from 'bson';

// Create the context that will be provided to descendants of TasksProvider via
// the useTasks hook.
const TasksContext = React.createContext(null);

const TasksProvider = ({children, projectId}) => {
  // Get the user from the AuthProvider context.
  const {user} = useAuth();

  // The tasks list will contain the tasks in the realm when opened.
  const [tasks, setTasks] = useState([]);
  // const [oldTasks, setOldTasks] = useState({time: '', task: []});
  const [department, setDepartment] = useState([]);
  const [member, setMember] = useState([]);

  // This realm does not need to be a state variable, because we don't re-render
  // on changing the realm.
  const realmRef = useRef(null);

  // The effect hook replaces lifecycle methods such as componentDidMount. In
  // this effect hook, we open the realm that contains the tasks and fetch a
  // collection of tasks.
  useEffect(() => {
    // Check that the user is logged in. You must authenticate to open a synced
    // realm.
    if (user == null) {
      console.warn('TasksView must be authenticated!');
      return;
    }
    // Define the configuration for the realm to use the Task schema. Base the
    // sync configuration on the user settings and use the project ID as the
    // partition value. This will open a realm that contains all objects where
    // object._partition == projectId.
    const config = {
      schema: [Task.schema, Department.schema, User.schema, TaskTemp.schema],
      sync: {
        user,
        partitionValue: projectId,
      },
    };

    console.log(
      `Attempting to open Realm ${projectId} for user ${user.identity} ${
        user.account
      } with config: ${JSON.stringify(config)}...`,
    );

    // Set this flag to true if the cleanup handler runs before the realm open
    // success handler, e.g. because the component unmounted.
    let canceled = false;

    // Now open the realm asynchronously with the given configuration.
    Realm.open(config)
      .then((openedRealm) => {
        // If this request has been canceled, we should close the realm.
        if (canceled) {
          openedRealm.close();
          return;
        }

        console.log(`Realm ${projectId} opened for user ${user.identity}.`);

        // Update the realmRef so we can use this opened realm for writing.
        realmRef.current = openedRealm;

        // Read the collection of all Tasks in the realm. Again, thanks to our
        // configuration above, the realm only contains tasks where
        // task._partition == projectId.
        const syncTasks = openedRealm.objects('Task');
        const syncDept = openedRealm.objects('Department');
        const asyncMember = openedRealm.objects('User');

        // Watch for changes to the tasks collection.
        openedRealm.addListener('change', () => {
          // On change, update the tasks state variable and re-render.
          setTasks([...syncTasks]);
          // setOldTasks({time: new Date().getTime(), task: taskOld});
          setDepartment([...syncDept]);
          setMember([...asyncMember]);
        });

        // Set the tasks state variable and re-render.
        setTasks([...syncTasks]);
        setDepartment([...syncDept]);
        setMember([...asyncMember]);
      })
      .catch((error) => console.warn('Failed to open realm:', error));

    // Return the cleanup function to be called when the component is unmounted.
    return () => {
      // Update the canceled flag shared between both this callback and the
      // realm open success callback above in case this runs first.
      canceled = true;

      // If there is an open realm, we must close it.
      const realm = realmRef.current;
      if (realm != null) {
        realm.removeAllListeners();
        realm.close();
        realmRef.current = null;
      }
    };
  }, [user, projectId]); // Declare dependencies list in the second parameter to useEffect().

  // useEffect(() => {
  //   console.log('TASK OLD', oldTasks.task);
  //   if (oldTasks.task.length > 0) {
  //     console.log('TRIGGER CREATE TASK OLD');
  //     let realm = realmRef.current;
  //     const syncTasks = realm.objects('Task');

  //     realm.write(() => {
  //       oldTasks.task.forEach((item) => {
  //         console.log('DO WRITE');

  //         realm.create('Task_Temp', item, true);
  //       });
  //     });

  //     setTasks([...syncTasks]);
  //   }
  // }, [oldTasks.time, oldTasks.task]);

  // Define our create, update, and delete functions that users of the
  // useTasks() hook can call.
  const createTask = async (newTaskName, userId, deptId) => {
    const realm = realmRef.current;
    // let department = realm.objects('Department');
    // console.log('========DEPT========');
    // console.log(department);
    let _dept = department.find((el) => el._id.valueOf().toString() === deptId);

    // SAMPLE USING EXTEDS CLASS
    // let _task = new TaskTemp({
    //   name: newTaskName || 'New Task',
    //   partition: projectId,
    //   assignee: new ObjectId(userId),
    //   department: new Department({
    //     id: _dept._id,
    //     name: _dept.name,
    //     partition: projectId,
    //   }),
    // });

    // console.log('_task');
    // console.log(_task);

    // Open a write transaction.

    realm.write(() => {
      // Create a new task in the same partition -- that is, in the same project.
      // realm.create(
      //   'Task',
      //   new Task({
      //     name: newTaskName || 'New Task',
      //     partition: projectId,
      //     assignee: new User({
      //       user_id: user.identity,
      //       name: 'BOY',
      //       partition: projectId,
      //     }),
      //     department: new Department({
      //       id: department[0]._id,
      //       name: department[0].name,
      //       partition: projectId,
      //     }),
      //   }),
      //   true,
      // );
      //USED
      realm.create(
        'Task',
        new Task({
          name: newTaskName || 'New Task',
          partition: projectId,
          assignee: new ObjectId(userId),
          version: 0,
          department: new Department({
            id: _dept._id,
            name: _dept.name,
            partition: projectId,
          }),
        }),
        true,
      );
    });
  };

  // Define the function for updating a task's status.
  const setTaskStatus = async (task, status) => {
    // One advantage of centralizing the realm functionality in this provider is
    // that we can check to make sure a valid status was passed in here.
    if (
      ![
        Task.STATUS_OPEN,
        Task.STATUS_IN_PROGRESS,
        Task.STATUS_COMPLETE,
      ].includes(status)
    ) {
      throw new Error(`Invalid Status ${status}`);
    }
    const realm = realmRef.current;
    // let _oldTasks = JSON.parse(JSON.stringify(task)); // spread dont work
    // console.log('old task', task);
    // console.log('old task', _oldTasks);
    realm.write(() => {
      // task.status = status;
      realm.create(
        'Task',
        new Task({
          name: task.name,
          partition: projectId,
          assignee: task.assignee,
          status: status,
          version: task.version + 1,
          department: new Department({
            id: task.department._id,
            name: task.department.name,
            partition: projectId,
          }),
        }),
        true,
      );
    });

    // setOldTasks({time: new Date().getTime(), task: _oldTasks});
  };

  const getOldTask = () => {
    let realm = realmRef.current;
    let _tasks = realm.objects('Task');
    return _tasks;
  };

  // Define the function for deleting a task.
  const deleteTask = (task) => {
    const realm = realmRef.current;
    realm.write(() => {
      realm.delete(task);
    });
  };

  const AddMember = (name) => {
    const realm = realmRef.current;

    // Open a write transaction.
    realm.write(() => {
      realm.create('User', new User({name: name, partition: projectId}), true);
    });
  };

  // Render the children within the TaskContext's provider. The value contains
  // everything that should be made available to descendants that use the
  // useTasks hook.
  return (
    <TasksContext.Provider
      value={{
        createTask,
        deleteTask,
        setTaskStatus,
        AddMember,
        tasks,
        // oldTasks,
        department,
        member,
        projectId,
      }}>
      {children}
    </TasksContext.Provider>
  );
};

// The useTasks hook can be used by any descendant of the TasksProvider. It
// provides the tasks of the TasksProvider's project and various functions to
// create, update, and delete the tasks in that project.
const useTasks = () => {
  const value = useContext(TasksContext);
  if (value == null) {
    throw new Error('useTasks() called outside of a TasksProvider?');
  }
  return value;
};

export {TasksProvider, useTasks};
