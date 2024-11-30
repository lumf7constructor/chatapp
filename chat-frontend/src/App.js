import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';  // Don't forget to import the CSS file

const socket = io.connect("http://localhost:5000");

function App() {
    const [username, setUsername] = useState('');
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState([]);
    const [users, setUsers] = useState([]);
    const [loggedIn, setLoggedIn] = useState(false);

    const predefinedUsernames = ['Sara', 'Eva', 'Lum'];

    useEffect(() => {
        socket.on('receive_message', (data) => {
            setChat((prev) => [...prev, data]);  // Update chat state with the received message
        });

        socket.on('user_list', (userList) => {
            setUsers(userList);  // Update the user list when someone joins or leaves
        });

        socket.on('username_taken', () => {
            alert("Username is already taken! Choose another.");
            setLoggedIn(false);
        });

        // Clean up the socket listeners when the component unmounts
        return () => {
            socket.off('receive_message');
            socket.off('user_list');
            socket.off('username_taken');
        };
    }, []);

    // Updated sendMessage function
    const sendMessage = () => {
        if (message) {
            const data = { username, message };

            // Add message to the local chat state immediately to show it on the sender's page
            setChat((prev) => [...prev, data]);

            // Emit message to the server
            socket.emit('send_message', data);

            // Clear the input field after sending
            setMessage('');
        }
    };

    const setUserName = () => {
        if (predefinedUsernames.includes(username)) {
            socket.emit('set_username', username);  // Set predefined username
            setLoggedIn(true);
        } else {
            alert("Please choose a valid username from Sara, Eva, or Lum.");
        }
    };

    return (
        <div className="App">
            {!loggedIn ? (
                <div className="join-chat-container">
                    <h2>Select a username:</h2>
                    <div className="username-button-container">
                        {predefinedUsernames.map((name) => (
                            <button
                                key={name}
                                onClick={() => setUsername(name)}
                                disabled={users.includes(name)}
                            >
                                {name}
                            </button>
                        ))}
                    </div>
                    <div>
                        <h3>Selected username: {username}</h3>
                        <button onClick={setUserName}>Join Chat</button>
                    </div>
                </div>
            ) : (
                <div>
                    <div className="welcome-message">
                        <h2>Welcome, {username}!</h2>
                    </div>
                    <div>
                        <h3>Users:</h3>
                        <ul>
                            {users.map((user, index) => (
                                <li key={index}>{user}</li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <input
                            type="text"
                            placeholder="Enter message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <button onClick={sendMessage}>Send</button>
                    </div>
                    <div className="chat-window">
                        <h3>Chat:</h3>
                        <ul>
                            {chat.map((item, index) => (
                                <li key={index}>
                                    <strong>{item.username}:</strong> {item.message}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;

