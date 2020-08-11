import React, {useContext, useState, useEffect, useRef} from 'react';
import Realm from 'realm';
import {useAuth} from './AuthProvider';
import {Task, User, Department} from './schemas';
import {ObjectId} from 'bson';

// Create the context that will be provided to descendants of TasksProvider via
// the useTasks hook.
const MemberContext = React.createContext(null);

const MemberProvider = ({children, projectId}) => {
  // Get the user from the AuthProvider context.
  const {user} = useAuth();

  // The tasks list will contain the tasks in the realm when opened.
  const [member, setMember] = useState([]);

  // This realm does not need to be a state variable, because we don't re-render
  // on changing the realm.
  const realmLocalRef = useRef(null);

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
      schema: [User.schema],
    };

    console.log(
      `Attempting to open Realm Local ${projectId} for user ${user.identity} ${
        user.account
      } with config: ${JSON.stringify(config)}...`,
    );

    Realm.open(config)
      .then((openedRealm) => {
        // If this request has been canceled, we should close the realm.

        // Update the realmLocalRef so we can use this opened realm for writing.
        realmLocalRef.current = openedRealm;

        // Read the collection of all Tasks in the realm. Again, thanks to our
        // configuration above, the realm only contains tasks where
        // task._partition == projectId.
        const _member = openedRealm.objects('User');

        // Watch for changes to the tasks collection.
        openedRealm.addListener('change', () => {
          // On change, update the tasks state variable and re-render.
          setMember([..._member]);
        });

        // Set the tasks state variable and re-render.
        setMember([..._member]);
      })
      .catch((error) => console.warn('Failed to open realm Local:', error));

    // Return the cleanup function to be called when the component is unmounted.
    return () => {
      // Update the canceled flag shared between both this callback and the
      // realm open success callback above in case this runs first.

      // If there is an open realm, we must close it.
      const realm = realmLocalRef.current;
      if (realm != null) {
        realm.removeAllListeners();
        realm.close();
        realmLocalRef.current = null;
      }
    };
  }, [user, projectId]); // Declare dependencies list in the second parameter to useEffect().

  const AddMember = (name) => {
    const realm = realmLocalRef.current;

    // Open a write transaction.
    realm.write(() => {
      realm.create('User', new User({name: name, partition: projectId}), true);
    });
  };

  // Render the children within the TaskContext's provider. The value contains
  // everything that should be made available to descendants that use the
  // useTasks hook.
  return (
    <MemberContext.Provider
      value={{
        AddMember,
        member,
        projectId,
      }}>
      {children}
    </MemberContext.Provider>
  );
};

// The useTasks hook can be used by any descendant of the MemberProvider. It
// provides the tasks of the MemberProvider's project and various functions to
// create, update, and delete the tasks in that project.
const useMember = () => {
  const value = useContext(MemberContext);
  if (value == null) {
    throw new Error('useMember() called outside of a MemberProvider?');
  }
  return value;
};

export {MemberProvider, useMember};
