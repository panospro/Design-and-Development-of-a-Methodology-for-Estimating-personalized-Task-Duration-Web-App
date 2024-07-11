import React, { useState } from 'react';
import Papa from 'papaparse';

export const DataForm = ({ option, onFileUpload }) => {
  const [file, setFile] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!file) {
      setResponseMessage('Please upload a file');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result;
      if (file.name.endsWith('.json')) {
        try {
          const jsonData = JSON.parse(content);
          onFileUpload(jsonData, 'json', setLoading, setResponseMessage);
          clearMessageAfterDelay();
        } catch (error) {
          setResponseMessage('Error parsing JSON file');
        }
      } else if (file.name.endsWith('.csv')) {
        Papa.parse(content, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          transform: (value, column) => {
            if (['assignees', 'categories', 'commits', 'focus_areas', 'labels', 'points'].includes(column)) {
              try {
                const correctedValue = value.replace(/'/g, '"');
                return JSON.parse(correctedValue);
              } catch (error) {
                console.error(`Error parsing JSON for column ${column}:`, error);
                return value;
              }
            }
            return value;
          },
          complete: (result) => {
            onFileUpload(result.data, 'csv', setLoading, setResponseMessage);
            clearMessageAfterDelay();
          },
          error: (error) => {
            setResponseMessage('Error parsing CSV file');
          }
        });
      } else {
        setResponseMessage('Unsupported file format');
      }
    };

    reader.readAsText(file);
  };

  const clearMessageAfterDelay = () => {
    setTimeout(() => {
      setResponseMessage('');
    }, 3000);
  };

  return (
    <div>
      <h1>{option === "task" ? "Tasks to be distributed" : "Task Data"}</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="fileInput">Upload JSON or CSV file:</label>
        <input
          type="file"
          id="fileInput"
          accept=".json,.csv"
          onChange={handleFileChange}
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading && option === "task" ? 'Waiting for task distribution algorithm results...' : loading ? 'Waiting for machine learning results...' : 'Submit'}
        </button>
      </form>
      {responseMessage && <p>{responseMessage}</p>}
    </div>
  );
};
