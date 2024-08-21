// next_service/app/components/dashboard.tsx
"use client";

import React, { useState, useEffect } from 'react';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [logs, setLogs] = useState<string[]>([]);

  const handleLogin = async () => {
    setLoading(true);
    setMessage('');
    setLogs([]); // Clear previous logs

    const eventSource = new EventSource('http://localhost:4000/api/remini_login/stream');

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received event:', data);

      // Check if the message is an error
      if (data.isError) {
        eventSource.close();
        setLogs((prevLogs) => [...prevLogs, `<span style="color: red;">${data.message}</span>`]);
        return;
      } else {
        setLogs((prevLogs) => [...prevLogs, data.message]);
        if (data.success){
          eventSource.close();
          setMessage('✅ Operation completed successfully.');
          return;
        }
      }
    };

    eventSource.onerror = (event) => {
      if (eventSource.readyState === EventSource.CLOSED) {
        setMessage('Connection closed. Trying to reconnect...');
      }
    };

    try {
      // Send the POST request to start the operation
      const response = await fetch('http://localhost:4000/api/remini_login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to execute login');
      }

      const data = await response.json();
      setMessage(data.message || 'Login operation started.');
    } catch (error) {
      console.error('Failed to execute login:', error);
      setMessage('Login failed. Unable to reach node_service.');
      eventSource.close(); // Ensure the event source is closed on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pageContainer">      
      <button className="dark_button" style={{ margin: '1rem' }} onClick={handleLogin} disabled={loading}>
        {loading ? 'Logging in...' : 'Send Request to Hero'}
      </button>  
      {logs.length > 0 && (
        <div className="divbox">
          <ul>
            {logs.map((log, index) => (
              <li
                key={index}
                dangerouslySetInnerHTML={{ __html: log }} // Use dangerouslySetInnerHTML to support HTML styling
              ></li>
            ))}
          </ul>
          {message && <p>{message}</p>}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
