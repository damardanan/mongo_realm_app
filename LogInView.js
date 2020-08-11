import React, {useState, useEffect} from 'react';
import {Button, Text, Input} from 'react-native-elements';
import {useAuth} from './AuthProvider';
import DeviceInfo from 'react-native-device-info';

// This view has an input for email and password and logs in the user when the
// login button is pressed.
export function LogInView() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState();

  const {logIn, registerUser} = useAuth();

  const [authMode, setAuthMode] = useState('Login');
  const [unik, setUnik] = useState({
    uid: null,
    serial: null,
  });

  useEffect(async () => {
    const unikid = await DeviceInfo.getAndroidId();
    const serial = await DeviceInfo.getSerialNumber();
    setUnik({uid: unikid, serial: serial});
  }, []);

  return (
    <>
      <Text h3>{authMode}</Text>
      <Input
        autoCapitalize="none"
        placeholder="email"
        onChangeText={setEmail}
      />
      <Input
        secureTextEntry={true}
        placeholder="password"
        onChangeText={setPassword}
      />
      <Button
        onPress={async () => {
          console.log(`${authMode} button pressed with email ${email}`);
          setError(null);
          try {
            if (authMode === 'Login') {
              await logIn(email, password);
            } else {
              await registerUser(email, password);

              setAuthMode('Login');
            }
          } catch (e) {
            setError(`Operation failed: ${e.message}`);
          }
        }}
        title={authMode}
      />
      <Text>{error}</Text>
      <ToggleAuthModeComponent setAuthMode={setAuthMode} authMode={authMode} />
      <DeviceInfos title={unik.uid} />
      <DeviceInfos title={unik.serial} />
    </>
  );
}

const ToggleAuthModeComponent = ({authMode, setAuthMode}) => {
  if (authMode === 'Login') {
    return (
      <Button
        title="Haven't created an account yet? Register"
        type="outline"
        onPress={async () => {
          setAuthMode('Register');
        }}
      />
    );
  } else {
    return (
      <Button
        title="Have an account already? Login"
        type="outline"
        onPress={async () => {
          setAuthMode('Login');
        }}
      />
    );
  }
};

const DeviceInfos = ({title}) => {
  return <Input value={title} />;
};