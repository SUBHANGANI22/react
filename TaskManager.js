import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, Popover, OverlayTrigger } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { v4 as uuidv4 } from 'uuid';
import './TaskManager.css';
import { FaCalendarAlt } from 'react-icons/fa';


const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');
  const [deadline, setDeadline] = useState(null);
  const [editInput, setEditInput] = useState('');
  const [editDeadline, setEditDeadline] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [sortOrder, setSortOrder] = useState('name');
  const calendarRef = useRef(null);

  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    sortTasks(storedTasks, sortOrder);
    setTasks(storedTasks);
  }, [sortOrder]);

  const addTask = () => {
    if (!input.trim()) {
      alert('Task name is required');
      return;
    }
    if (!deadline) {
      alert('Deadline is required');
      return;
    }
    const newTasks = [...tasks, { id: uuidv4(), task: input, status: 'todo', deadline }];
    sortTasks(newTasks, sortOrder);
    setTasks(newTasks);
    setInput('');
    setDeadline(null);
    saveTasksToLocalStorage(newTasks);
  };

  const saveTask = () => {
    if (!editInput.trim()) {
      alert('Task name is required');
      return;
    }
    if (!editDeadline) {
      alert('Deadline is required');
      return;
    }
    const newTasks = tasks.map(task =>
      task.id === currentTaskId
        ? { ...task, task: editInput, deadline: editDeadline }
        : task
    );
    sortTasks(newTasks, sortOrder);
    setTasks(newTasks);
    setEditInput('');
    setEditDeadline(null);
    setEditMode(false);
    setCurrentTaskId(null);
    saveTasksToLocalStorage(newTasks);
  };

  const cancelEdit = () => {
    setEditInput('');
    setEditDeadline(null);
    setEditMode(false);
    setCurrentTaskId(null);
  };

  const handleDelete = () => {
    const newTasks = tasks.filter(task => task.id !== taskToDelete);
    setTasks(newTasks);
    saveTasksToLocalStorage(newTasks);
    setShowConfirm(false);
    setTaskToDelete(null);
  };

  const handleStatusChange = (id, status) => {
    const newTasks = tasks.map(task =>
      task.id === id
        ? { ...task, status }
        : task
    );
    sortTasks(newTasks, sortOrder);
    setTasks(newTasks);
    saveTasksToLocalStorage(newTasks);
  };

  const handleSort = (e) => {
    setSortOrder(e.target.value);
  };

  const sortTasks = (tasks, criteria) => {
    if (criteria === 'name') {
      tasks.sort((a, b) => (a.task || '').localeCompare(b.task || ''));
    } else if (criteria === 'status') {
      tasks.sort((a, b) => (a.status || '').localeCompare(b.status || ''));
    } else if (criteria === 'date') {
      tasks.sort((a, b) => new Date(a.deadline || 0) - new Date(b.deadline || 0));
    }
  };

  const saveTasksToLocalStorage = (tasks) => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  };

  const getTaskColor = (task) => {
    if (task.status === 'completed') return 'green';
    if (!task.deadline) return 'black';

    const timeDiff = new Date(task.deadline) - new Date();
    if (timeDiff < 12 * 60 * 60 * 1000) return 'red';
    if (timeDiff < 24 * 60 * 60 * 1000) return 'yellow';
    return 'black';
  };

  const DatePickerPopover = ({ date, setDate }) => (
    <Popover id="date-picker-popover" className="custom-popover">
      <Popover.Body>
        <DatePicker
          selected={date}
          onChange={(date) => setDate(date)}
          inline
          calendarClassName="custom-datepicker"
        />
      </Popover.Body>
    </Popover>
  );

  return (
    <div className="container">
      <div className="todo-container" style={{ maxWidth: '500px', margin: 'auto' }}>
        <h1 className="fs-3 text-center">Task</h1>
        {editMode ? (
          <>
            <h3 className="fs-6">Edit Task</h3>
            <div className="mb-4 w-100 d-flex gap-2 justify-content-between d-block">
              <input
                type="text"
                className="form-control py-1 px-2 w-100"
                value={editInput}
                onChange={(e) => setEditInput(e.target.value)}
                placeholder="Edit Task"
              />
              <OverlayTrigger
                trigger="click"
                placement="bottom"
                overlay={<DatePickerPopover date={editDeadline} setDate={setEditDeadline} />}
              >
                <button ref={calendarRef} className="btn btn-light calendar-button">
                  <FaCalendarAlt />
                </button>
              </OverlayTrigger>
              <button className="btn btn-primary py-0" onClick={saveTask}>
                Save
              </button>
              <button className="btn btn-secondary py-0" onClick={cancelEdit}>
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="fs-6">Add Task</h3>
            <div className="mb-4 w-100 d-flex gap-2 justify-content-between d-block">
              <input
                type="text"
                className="form-control py-1 px-2 w-100"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Add Task"
              />
              <OverlayTrigger
                trigger="click"
                placement="bottom"
                overlay={<DatePickerPopover date={deadline} setDate={setDeadline} />}
              >
                <button ref={calendarRef} className="btn btn-light calendar-button">
                  <FaCalendarAlt />
                </button>
              </OverlayTrigger>
              <button className="btn btn-primary py-0" onClick={addTask}>
                Save
              </button>
            </div>
          </>
        )}

        <div className="border rounded-2 p-2">
          <div className="mt-3 d-flex justify-content-between border-bottom">
            <h3 className="fs-6">Task</h3>
            <div>
              <select className="form-select" onChange={handleSort} value={sortOrder}>
                <option value="name">Sort by Name</option>
                <option value="status">Sort by Status</option>
                <option value="date">Sort by Date</option>
              </select>
            </div>
            <h3 className="fs-6">Action</h3>
          </div>
          <ul className="list-unstyled" id="list-container">
            {tasks.map((task) => (
              <li key={task.id}>
                <div className="d-flex justify-content-between align-items-center border-bottom">
                  <p className="p-1 mb-0 w-50 fs-6" style={{ color: getTaskColor(task) }}>
                    {task.task}
                  </p>
                  <select
                    className="w-25 task-status"
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                  >
                    <option value="todo">Todo</option>
                    <option value="in-progress">In progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  <div>
                    <button
                      className="btn btn-sm edit-btn p-0"
                      onClick={() => {
                        setEditInput(task.task);
                        setEditDeadline(new Date(task.deadline));
                        setCurrentTaskId(task.id);
                        setEditMode(true);
                      }}
                    >
                       <i className="fa fa-pencil" aria-hidden="true"></i>
                    </button>
                    <button
                      className="btn btn-sm delete-btn p-0"
                      onClick={() => {
                        setTaskToDelete(task.id);
                        setShowConfirm(true);
                      }}
                    >
                      <i class="fa fa-trash-o" aria-hidden="true"></i>
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this task?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleDelete}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TaskManager;
