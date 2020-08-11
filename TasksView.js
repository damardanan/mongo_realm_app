import React, {useEffect} from 'react';
import {View, ScrollView, FlatList} from 'react-native';
import {Text, Button} from 'react-native-elements';
import {useAuth} from './AuthProvider';
import {useTasks} from './TasksProvider';
import {useMember} from './MemberProvider';
import {TaskItem} from './TaskItem';
import {AddTaskView} from './AddTaskView';
import {AddMemberView} from './AddMemberView';

// The Tasks View displays the list of tasks of the parent TasksProvider.
// It has a button to log out and a button to add a new task.
export function TasksView() {
  // Get the logOut function from the useAuth hook.
  const {logOut, user} = useAuth();

  // Get the list of tasks and the projectId from the useTasks hook.

  const {tasks, projectId, member, oldTasks} = useTasks();
  // const {member} = useMember();

  useEffect(() => {
    callFuntions();
  }, []);

  const callFuntions = async () => {
    // console.log('[FUNCTIONS] sum', await user.functions.sum(3, 2));
    // console.log('[FUNCTIONS] substract', await user.functions.substract(3, 2));
    // // console.log('FUNCTIONS 2', await user.callFunction('sum', [2, 3]));
    // console.log(
    //   '[FUNCTIONS] GetUSerCount',
    //   await user.functions.getUserCount(),
    // );
    // console.log('[FUNCTIONS] getTheme', await user.functions.getTheme());
    // console.log('[FUNCTIONS] userData', await user.functions.userData());
    // console.log('[FUNCTIONS] userData', user.identity);
    // console.log('[FUNCTIONS] userData', user.token);
  };

  // useEffect(() => {
  //   console.log('=======OLDDATA=========');
  //   console.log(oldTasks.task);
  // }, [oldTasks.time]);

  return (
    <View style={{height: '100%'}}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <Button type="outline" title="Log Out" onPress={logOut} />
        <AddMemberView />
        <AddTaskView />
      </View>
      <Text h2>{projectId}</Text>
      <Text h4>Member : </Text>
      <FlatList
        style={{backgroundColor: 'teal'}}
        contentContainerStyle={{padding: 10}}
        data={member}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => (
          <Text style={{color: 'white', fontSize: 18, marginBottom: 5}}>
            {item.name}
          </Text>
        )}
      />
      <View style={{flex: 5}}>
        <ScrollView>
          {tasks.map((task) => (
            <TaskItem key={`${task._id}`} task={task} />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
