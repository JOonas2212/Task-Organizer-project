import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue, push, update, remove } from "firebase/database";
import { Box, AppBar, Typography, TextField, Button, Modal, Fade, Backdrop, Grid, Paper, Snackbar, Alert } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; 
import CloseIcon from '@mui/icons-material/Close'; 

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false); 
  const [snackbarOpen, setSnackbarOpen] = useState(false); 

  // Firebase initialization
  const firebaseConfig = {
    apiKey: "AIzaSyANyhv4QEmvovM7lSNO1kOjf5HcouYGDbE",
    authDomain: "task-organizer-finalproject.firebaseapp.com",
    projectId: "task-organizer-finalproject",
    storageBucket: "task-organizer-finalproject.firebasestorage.app",
    messagingSenderId: "897885669901",
    appId: "1:897885669901:web:7c5453a24c9a811016e344"
  };
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);
  const tasksRef = ref(database, 'tasks');

  // Read data from Realtime Database
  useEffect(() => {
    onValue(tasksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Sort tasks by number before displaying
        const tasksArray = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        }));
        tasksArray.sort((a, b) => a.number - b.number);
        setTasks(tasksArray);
      } else {
        setTasks([]);
      }
    });
  }, []);

  // Add a new task (updated to handle Enter key)
  const handleAddTask = (event) => {
    if (event.key === 'Enter' || event.type === 'click') { // Check if Enter key is pressed or button is clicked
      if (newTask.trim() !== "") {
        const newTaskRef = push(tasksRef);
        // Get the next task number
        const nextNumber = tasks.length + 1;
        set(newTaskRef, {
          text: newTask,
          completed: false,
          number: nextNumber
        });
        setNewTask("");
      } else {
        setSnackbarOpen(true); 
      }
    }
  };

  // Hide the prompt after a short delay
  useEffect(() => {
    if (showPrompt) {
      const timeoutId = setTimeout(() => {
        setShowPrompt(false);
      }, 2000); 

      return () => clearTimeout(timeoutId);
    }
  }, [showPrompt]);

  // Delete a task
  const handleDeleteTask = (taskId) => {
    remove(ref(database, `tasks/${taskId}`));
  };

  // Update a task
  const handleUpdateTask = (updatedText, taskId) => {
    update(ref(database, `tasks/${taskId}`), {
      text: updatedText
    });
    setOpenModal(false);
    setEditingTask(null);
  };

  // Open the modal for editing
  const handleOpenModal = (task) => {
    setEditingTask(task);
    setOpenModal(true);
  };

  // Close the modal
  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingTask(null);
  };

  // Mark a task as completed and remove it from the database
  const handleCompleteTask = (taskId) => {
    update(ref(database, `tasks/${taskId}`), {
      completed: !tasks.find(task => task.id === taskId).completed
    })
    .then(() => {
      // Check if the task is now completed
      const task = tasks.find(task => task.id === taskId);
      if (task && task.completed) {
        remove(ref(database, `tasks/${taskId}`));
        // Update the tasks state to trigger a re-render
        setTasks(tasks.filter(task => task.id !== taskId));
      }
    });
  };

  // Filter tasks based on search query
  const filteredTasks = tasks.filter((task) =>
    task.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter completed tasks
  const completedTasks = filteredTasks.filter(task => task.completed);

  // Handle Snackbar close
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#D4DEFF", display: "flex", flexDirection: "column" }}>
      <AppBar
        position="static"
        sx={{
          background: "linear-gradient(90deg, #9C2CF3, #3A49F9)",
          minHeight: "60vh",
          borderBottomLeftRadius: "50px",
          borderBottomRightRadius: "50px",
          display: "flex",
          alignItems: "center",
          paddingTop: "20px",
          flexDirection: "column",
          position: "relative",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "-200px",
            transform: "translateY(-100%)",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            backgroundColor: "rgba(0, 0, 0, 0.1)",
            boxShadow: "0 0 30px rgba(0, 0, 0, 0.15)",
            zIndex: 0,
          }}
        />

<Box
  sx={{
    position: "absolute",
    top: "-10%",
    left: "calc(90% - 100px)",
    transform: "translateY(0%)",
    width: "200px",
    height: "200px",
    borderRadius: "50%",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    boxShadow: "0 0 30px rgba(0, 0, 0, 0.15)",
    zIndex: 0,
  }}
/>

        <Typography
          variant="h5"
          component="div"
          sx={{
            fontFamily: "Poppins, sans-serif",
            color: "#FFFFFF",
            fontWeight: "600",
            marginBottom: "100px",
            zIndex: 1,
          }}
        >
          Task Organizer
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center", gap: "20px" }}>
          <TextField
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search task"
            variant="outlined"
            sx={{
              width: "1082.93px",
              borderRadius: "50px",
              backgroundColor: "#FFFFFF",
              "& .MuiOutlinedInput-root": {
                borderRadius: "50px",
                borderColor: "#E0E0E0",
                "&:hover": {
                  borderColor: "#3A49F9",
                },
                "&.Mui-focused": {
                  borderColor: "#9C2CF3",
                },
              },
              "& .MuiInputBase-input": {
                fontFamily: "Poppins, sans-serif",
                color: "#333333",
              },
            }}
          />
        </Box>

        <Box sx={{ display: "flex", marginTop: "20px", marginRight: "10px", alignItems: "center" }}>
          <TextField
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add new task"
            variant="outlined"
            sx={{
              width: "906.18px",
              borderRadius: "50px",
              backgroundColor: "#FFFFFF",
              "& .MuiOutlinedInput-root": {
                borderRadius: "50px",
                borderColor: "#E0E0E0",
                "&:hover": {
                  borderColor: "#3A49F9",
                },
                "&.Mui-focused": {
                  borderColor: "#9C2CF3",
                },
              },
            }}
            onKeyDown={handleAddTask} 
          />

          <Button
            variant="contained"
            onClick={handleAddTask} 
            sx={{
              height: "60px",
              width: "160px",
              borderRadius: "50px",
              backgroundColor: "#FFFFFF",
              color: "#000000",
              fontFamily: "Poppins, sans-serif",
              fontWeight: "600",
              marginLeft: "11px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              "&:hover": {
                backgroundColor: "#4CAF50",
              },
            }}
          >
            <AddIcon />
            Add Task
          </Button>
        </Box>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={2000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity="error"
            sx={{ width: '100%' }}
          >
            Please enter a task!
          </Alert>
        </Snackbar>
      </AppBar>

      <Box sx={{ marginTop: "20px", padding: "20px" }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{  background: "linear-gradient(90deg, #9C2CF3, #3A49F9)",
        borderRadius: "50px",
        padding: "16px 24px",
        display: "inline-block",
        fontWeight: "550",
        color: "#FFFFFF" }}>
              Tasks
            </Typography>
            <Box>
              {filteredTasks.map((task) => (
                <Paper
                  key={task.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "10px",
                    padding: "15px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E0E0E0",
                    borderRadius: "8px",
                    alignItems: "center",
                    height: "60px",
                  }}
                >
                  <Typography sx={{ fontFamily: "Poppins, sans-serif", fontWeight: "500", fontSize: "18px", color: "#333" }}>
                    {task.number}. {task.text}
                  </Typography>
                  <Box sx={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <Button
                      variant="outlined"
                      onClick={() => handleOpenModal(task)}
                      sx={{
                        color: "#3A49F9",
                        borderColor: "#3A49F9",
                        "&:hover": {
                          backgroundColor: "#9C2CF3",
                          color: "#FFF",
                          borderColor: "#9C2CF3",
                        },
                      }}
                    >
                      <EditIcon />
                      Edit
                    </Button>

                    <Button
                      variant="outlined"
                      onClick={() => handleDeleteTask(task.id)}
                      sx={{
                        color: "#F44336",
                        borderColor: "#F44336",
                        "&:hover": {
                          backgroundColor: "#FF7961",
                          color: "#FFF",
                          borderColor: "#FF7961",
                        },
                      }}
                    >
                      <DeleteIcon />
                      Delete
                    </Button>

                    <Button
                      variant="contained"
                      onClick={() => handleCompleteTask(task.id)}
                      sx={{
                        backgroundColor: "#4CAF50",
                        "&:hover": {
                          backgroundColor: "#45a049",
                        },
                      }}
                    >
                      {task.completed ? <CheckCircleIcon /> : 'Mark Complete'}
                    </Button>
                  </Box>
                </Paper>
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{  background: "linear-gradient(90deg, #9C2CF3, #3A49F9)",
        borderRadius: "50px",
        padding: "16px 24px",
        display: "inline-block",
        fontWeight: "550",
        color: "#FFFFFF" }}>
              Completed Tasks
            </Typography>
            <Box>
              {completedTasks.map((task) => (
                <Paper
                  key={task.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "10px",
                    padding: "15px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E0E0E0",
                    borderRadius: "8px",
                    alignItems: "center",
                    height: "60px",
                    textDecoration: "line-through", 
                    color: "#888", 
                  }}
                >
                  <Typography sx={{ fontFamily: "Poppins, sans-serif", fontWeight: "600", fontSize: "18px", color: "#333" }}>
                    {task.number}. {task.text}
                  </Typography>
                  <Box sx={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <Button
                      variant="outlined"
                      onClick={() => handleOpenModal(task)}
                      sx={{
                        color: "#3A49F9",
                        borderColor: "#3A49F9",
                        "&:hover": {
                          backgroundColor: "#9C2CF3",
                          color: "#FFF",
                          borderColor: "#9C2CF3",
                        },
                      }}
                    >
                      <EditIcon />
                      Edit
                    </Button>

                    <Button
                      variant="outlined"
                      onClick={() => handleDeleteTask(task.id)}
                      sx={{
                        color: "#F44336",
                        borderColor: "#F44336",
                        "&:hover": {
                          backgroundColor: "#FF7961",
                          color: "#FFF",
                          borderColor: "#FF7961",
                        },
                      }}
                    >
                      <DeleteIcon />
                      Delete
                    </Button>
                  </Box>
                </Paper>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Modal
        open={openModal}
        onClose={handleCloseModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={openModal}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "400px",
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: 24,
            }}
          >
            <Typography variant="h6" sx={{ marginBottom: "10px" }}>
              Edit Task
            </Typography>
            <TextField
              fullWidth
              value={editingTask?.text || ""}
              onChange={(e) => setEditingTask({ ...editingTask, text: e.target.value })}
              variant="outlined"
              sx={{
                marginBottom: "20px",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "50px",
                },
              }}
            />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Button
                variant="contained"
                onClick={() => handleUpdateTask(editingTask?.text, editingTask?.id)}
                sx={{
                  backgroundColor: "#3A49F9",
                  "&:hover": {
                    backgroundColor: "#9C2CF3",
                  },
                }}
              >
                Save
              </Button>
              <Button
                variant="outlined"
                onClick={handleCloseModal}
                sx={{
                  color: "#F44336",
                  borderColor: "#F44336",
                  "&:hover": {
                    backgroundColor: "#FF7961",
                    color: "#FFF",
                    borderColor: "#FF7961",
                  },
                }}
              >
              Cancel
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default App;

              