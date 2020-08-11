import React, {createContext, useContext, useEffect, useState} from 'react';
import {Platform} from 'react-native';
import TcpSocket from 'react-native-tcp-socket';

const ws = new WebSocket('ws://192.168.43.10');

const SocketContext = createContext(null);

const logtag = '[SOCKET]';

const SocketProvider = (props) => {
  const [role, setRole] = useState(Platform.OS === 'ios' ? 'client' : 'server');

  // useEffect(() => {
  //   if (role === 'server') {
  //     runServer();
  //   } else {
  //     runClientConn();
  //   }
  // }, []);

  useEffect(() => {
    // Connection opened
    // ws.addEventListener('open', function (event) {
    //   ws.send('Hello Server!');
    // });

    ws.onopen = () => {
      // connection opened
      ws.send('something'); // send a message
    };

    ws.onmessage = (e) => {
      // a message was received
      console.log(logtag, e.data);
    };

    ws.onerror = (e) => {
      // an error occurred
      console.log(logtag, e.message);
    };

    ws.onclose = (e) => {
      // connection closed
      console.log(logtag, e.code, e.reason);
    };
    return () => {
      ws.close();
      // ws.removeEventListener();
    };
  }, []);

  const runClientConn = () => {
    let options = {port: 5050, host: '0.0.0.0'};
    // Create socket
    const client = TcpSocket.createConnection(options, () => {
      // Write on the socket
      client.write('Hello server!');

      // Close socket
      client.destroy();
    });

    client.on('data', function (data) {
      console.log(logtag, 'message was received', data);
    });

    client.on('error', function (error) {
      console.log(logtag, error);
    });

    client.on('close', function () {
      console.log(logtag, 'Connection closed!');
    });
  };

  const runServer = () => {
    console.log('goin here');
    const server = TcpSocket.createServer(function (socket) {
      socket.on('data', (data) => {
        socket.write('Echo server', data);
      });

      socket.on('error', (error) => {
        console.log(logtag, 'An error ocurred with client socket ', error);
      });

      socket.on('close', (error) => {
        console.log(logtag, 'Closed connection with ', socket.address());
      });
    }).listen({port: 5050, host: '0.0.0.0', reuseAddress: true});

    server.on('error', (error) => {
      console.log(logtag, 'An error ocurred with the server', error);
    });

    server.on('close', () => {
      console.log(logtag, 'Server closed connection');
    });
  };

  return (
    <SocketContext.Provider value={{role}}>
      {props.children}
    </SocketContext.Provider>
  );
};

const useSocket = () => {
  let value = useContext(SocketContext);
  if (value == null) {
    throw new Error('useSocket() called outside of a SocketProvider?');
  }
  return value;
};

export {SocketProvider, useSocket};
