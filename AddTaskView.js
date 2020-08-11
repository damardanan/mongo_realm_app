import React, {useState, useEffect} from 'react';
import {Platform} from 'react-native';
import {Overlay, Input, Button} from 'react-native-elements';
import {Picker} from '@react-native-community/picker';
import {useTasks} from './TasksProvider';
import {useMember} from './MemberProvider';

// The AddTaskView is a button for adding tasks. When the button is pressed, an
// overlay shows up to request user input for the new task name. When the
// "Create" button on the overlay is pressed, the overlay closes and the new
// task is created in the realm.
export function AddTaskView() {
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [pickerUser, setPickerUser] = useState('');
  const [pickerDept, setPickerDept] = useState('');
  const [newTaskName, setNewTaskName] = useState('');

  const {createTask, department, member} = useTasks();
  // const {member} = useMember();

  useEffect(() => {
    if (member.length > 0) {
      setPickerUser(member[0]._id.valueOf().toString());
    }
  }, [member]);

  useEffect(() => {
    if (department.length > 0) {
      setPickerDept(department[0]._id.valueOf().toString());
    }
  }, [department]);

  return (
    <>
      <Overlay
        isVisible={overlayVisible}
        overlayStyle={{width: '90%', height: 550}}
        onBackdropPress={() => setOverlayVisible(false)}>
        <>
          <Input
            placeholder="New Task Name"
            onChangeText={(text) => setNewTaskName(text)}
            autoFocus={true}
          />
          <Picker
            selectedValue={pickerUser}
            style={{height: Platform.OS == 'ios' ? 200 : 50}}
            onValueChange={(itemValue, itemIndex) => setPickerUser(itemValue)}>
            {member.map((item, index) => (
              <Picker.Item
                key={index.toString()}
                label={item.name}
                value={item._id.valueOf().toString()}
              />
            ))}
          </Picker>
          <Picker
            selectedValue={pickerDept}
            style={{height: Platform.OS == 'ios' ? 200 : 50}}
            onValueChange={(itemValue, itemIndex) => setPickerDept(itemValue)}>
            {department.map((item, index) => (
              <Picker.Item
                key={index.toString()}
                label={item.name}
                value={item._id.valueOf().toString()}
              />
            ))}
          </Picker>
          <Button
            title="Create"
            onPress={() => {
              setOverlayVisible(false);

              createTask(newTaskName, pickerUser, pickerDept);
            }}
          />
        </>
      </Overlay>
      <Button
        type="outline"
        title="Add Task"
        onPress={() => {
          setOverlayVisible(true);
        }}
      />
    </>
  );
}
