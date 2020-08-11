import React, {useState} from 'react';
import {Overlay, Input, Button} from 'react-native-elements';
import {useMember} from './MemberProvider';
import {useTasks} from './TasksProvider';

// The AddTaskView is a button for adding tasks. When the button is pressed, an
// overlay shows up to request user input for the new task name. When the
// "Create" button on the overlay is pressed, the overlay closes and the new
// task is created in the realm.
export function AddMemberView() {
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [memberName, setMemberName] = useState('');

  // const {AddMember} = useMember();
  const {AddMember} = useTasks();

  return (
    <>
      <Overlay
        isVisible={overlayVisible}
        overlayStyle={{width: '90%'}}
        onBackdropPress={() => setOverlayVisible(false)}>
        <>
          <Input
            placeholder="New Member Name"
            onChangeText={(text) => setMemberName(text)}
            autoFocus={true}
          />
          <Button
            title="Create"
            onPress={() => {
              setOverlayVisible(false);

              AddMember(memberName);
            }}
          />
        </>
      </Overlay>
      <Button
        type="outline"
        title="Add Member"
        onPress={() => {
          setOverlayVisible(true);
        }}
      />
    </>
  );
}
