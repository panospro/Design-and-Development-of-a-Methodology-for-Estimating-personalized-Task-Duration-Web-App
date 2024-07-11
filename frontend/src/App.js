import { filterTasks } from './utilities/utils.js';
import React, { useState } from 'react';
import './App.css';
import { DataForm, TabPanel, TaskCategorization, PlotProgress, TaskDistribution } from './components/index.js';
import { Box, Typography, Tabs, Tab, Tooltip, IconButton, MenuItem, Select, FormControl, InputLabel, Checkbox, ListItemText} from '@mui/material';
import { Info } from '@mui/icons-material';
import axios from 'axios';

const sampleDataStructure = `
[
  {
    "title": "Title",
    "commits": [
        {
            "commitId": "commit id",
            "message": "commit message",
            "files": [
                {
                    "filename": "commit file change1",
                    "additions": 20,
                    "deletions": 5
                },
                {
                    "filename": "commit file change2",
                    "additions": 19,
                    "deletions": 6
                },
            ]
        }
    ],
    "_id": "id",
    "body": "bluh bluh",
    "labels": [],
    "assignees": [
        "assignee name"
    ],
    "dueDate": "2023-11-30T00:00:00.000Z",
    "points": {
        "total": 3, // (expectedPoints by the manager)
        "done": 0.5, // (burnedPoints by the developer)
    },
    "priority": "high",
    "comments": [],
    "statusEdits": [
        {
            "from": "Backlog",
            "to": "Sprint Planning",
        },
        {
            "from": "Sprint Planning",
            "to": "In Progress",
        },
        {
            "from": "In Progress",
            "to": "Backlog",
        },
        {
            "from": "Backlog",
            "to": "Accepted",
        }
    ],
    "pointsEstimatedEdits": [],
    "pointsBurnedEdits": [
        {
            "anything": "anything" // the length of pointsBurned is important
        }
    ],
    "createdAt": "2023-11-03T13:36:02.702Z",
    "categories": [
        "Feature"
    ],
    "focus_areas": [
        "Frontend"
    ]
  },
  {
    More tasks ... 
  }
]
`

function App() {
  const [fileContent, setFileContent] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [assignees, setAssignees] = useState(new Set());
  const [selectedAssignees, setSelectedAssignees] = useState([]);
  const [taskDistribution, setTaskDistribution] = useState({});
  const baseURL = 'http://127.0.0.1:5000'; // Runs locally, it can run with 'python app.py' as backend in any host provider.

  const handleFileUpload = async (content, fileType, setLoading, setResponseMessage) => {
    const data = filterTasks(content);
    setFileContent(data);
    const uniqueAssignees = new Set(data.flatMap(task => task.assignees));
    setAssignees(uniqueAssignees);
  
    try {
      setLoading(true); // Start loading
      await axios.post(`${baseURL}/delete_model`);
      await axios.post(`${baseURL}/process`, { data, fileType }, { headers: { 'Content-Type': 'application/json' } });
      setResponseMessage('File processed successfully');
    } catch (error) {
      console.error('Error processing data:', error);
      setResponseMessage('Error processing data');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload2 = async (content, fileType, setLoading, setResponseMessage) => {
    const data = filterTasks(content);
    
    try {
      setLoading(true); // Start loading
      const response = await axios.post(`${baseURL}/distribute`, { data, selectedAssignees }, { headers: { 'Content-Type': 'application/json' } });
      setResponseMessage('File processed successfully');
      const distributedTasks = response.data;
      setTaskDistribution(distributedTasks);
    } catch (error) {
      console.error('Error distributing tasks:', error);
      setResponseMessage('Error distributing tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newIndex) => {
    setTabIndex(newIndex);
  };

  const handleAssigneeChange = (event) => {
    const { target: { value }} = event;
    if (value.includes('none')) {
      setSelectedAssignees([]);
    } else {
      setSelectedAssignees(
        typeof value === 'string' ? value.split(',') : value,
      );
    }
  };

  const filteredContent = fileContent ? fileContent.filter(task => 
    selectedAssignees.length === 0 || selectedAssignees.some(assignee => task.assignees.includes(assignee))) : [];

  return (
    <div className="App">
      <Box sx={{ my: 4 }}>
        <DataForm onFileUpload={handleFileUpload} />
        {!fileContent && (
          <>
            <Typography variant="h6">Upload Instructions</Typography>
            <Typography variant="body1" sx={{ marginBottom: '16px' }}>
              Please upload your file. For details on the expected data structure, hover over the info icon: 
              <Tooltip title={<Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>{sampleDataStructure}</Typography>} arrow>
                <IconButton><Info /></IconButton>
              </Tooltip>
            </Typography>
          </>
        )}
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Tabs value={tabIndex} onChange={handleTabChange} aria-label="centered tabs example" centered sx={{ minWidth: '1100px' }}>
            <Tab label="Overview" id="simple-tab-0" aria-controls="simple-tabpanel-0" />
            <Tab label="Performance" id="simple-tab-1" aria-controls="simple-tabpanel-1" />
            <Tab label="Distribution" id="simple-tab-2" aria-controls="simple-tabpanel-2" />
          </Tabs>
        </Box>
        {fileContent && (
          <FormControl sx={{ mt: 2, width: '90%' }}>
            <InputLabel id="assignee-select-label">Select Assignees</InputLabel>
            <Select
              labelId="assignee-select-label"
              id="assignee-select"
              multiple
              value={selectedAssignees}
              label="Filter by Assignee"
              onChange={handleAssigneeChange}
              renderValue={(selected) =>
                selected.length === 0 ? <em>None</em> : selected.join(', ')
              }
            >
              <MenuItem value="none">
                <em>None</em>
              </MenuItem>
              {[...assignees].map((assignee) => (
                <MenuItem key={assignee} value={assignee}>
                  <Checkbox checked={selectedAssignees.indexOf(assignee) > -1} />
                  <ListItemText primary={assignee} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        <TabPanel value={tabIndex} index={0}>
          {filteredContent.length > 0 ? (
            <TaskCategorization data={filteredContent} />
          ) : (
            <Typography>No data available. Please upload a file.</Typography>
          )}
        </TabPanel>
        <TabPanel value={tabIndex} index={1}>
          {filteredContent.length > 0 ? (
            <PlotProgress data={filteredContent} />
          ) : (
            <Typography>No data available. Please upload a file.</Typography>
          )}
        </TabPanel>
        <TabPanel value={tabIndex} index={2} sx={{ padding: 3 }}>
          {
            filteredContent.length > 0 ? (
              selectedAssignees.length > 0 ? (
                <>
                  <div>
                    <DataForm option="task" onFileUpload={handleFileUpload2} />
                  </div>
                  {Object.keys(taskDistribution).length > 0 && <TaskDistribution tasks={taskDistribution} />}
                </>
              ) : (
                <Typography>Please select the assignees, you want to distribute the tasks.</Typography>
              )
            ) : (
              <Typography>No data available. Please upload a file.</Typography>
            )
          }
        </TabPanel>
      </Box>
    </div>
  );
}

export default App;
