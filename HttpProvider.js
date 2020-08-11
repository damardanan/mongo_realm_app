import React, {createContext, useContext, useEffect, useState} from 'react';
import {Platform} from 'react-native';
import StaticServer from 'react-native-static-server';
const httpBridge = require('react-native-http-bridge');

const logtag = '[SERVER]';

const HttpContext = createContext(null);

const HttpProvider = (props) => {
  const [role, setRole] = useState('server');

  //   useEffect(() => {
  //     let server = new StaticServer(5000);
  //     // Start the server
  //     server.start().then((url) => {
  //       console.log('Serving at URL', url);
  //     });
  //     // Return the cleanup function to be called when the component is unmounted.
  //     return () => {
  //       server.stop();
  //     };
  //   }, []); // Declare dependencies list in the second parameter to useEffect().

  useEffect(() => {
    console.log('goin here 1');

    // initalize the server (now accessible via localhost:1234)
    httpBridge.start(5561, 'http_service', (request) => {
      console.log('goin here');
      // you can use request.url, request.type and request.postData here
      if (request.type === 'GET' && request.url.split('/')[1] === 'users') {
        httpBridge.respond(
          request.requestId,
          200,
          'application/json',
          '{"message": "OK"}',
        );
      } else {
        httpBridge.respond(
          request.requestId,
          400,
          'application/json',
          '{"message": "Bad Request"}',
        );
      }
    });
    return () => {
      httpBridge.stop();
    };
  }, []);

  return (
    <HttpContext.Provider value={{role}}>{props.children}</HttpContext.Provider>
  );
};

const useHttp = () => {
  const value = useContext(HttpContext);
  if (value == null) {
    throw new Error('useHttp() called outside of a HttpProvider?');
  }
  return value;
};

export {HttpProvider, useHttp};
