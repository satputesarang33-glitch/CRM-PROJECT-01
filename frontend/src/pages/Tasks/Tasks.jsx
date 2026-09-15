import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  FiPlus,
  FiCheck,
  FiEdit2,
  FiTrash2,
  FiCalendar,
  FiUser,
  FiBriefcase,
  FiCheckCircle,
} from 'react-icons/fi';
import {
  addTask,
  updateTask,
  deleteTask,
  toggleTaskCompletion,
  setTaskStatusFilter,
  setTaskPriorityFilter,
  setTaskSearchTerm,
} from '../../redux/slices/taskSlice';
import { addToast } from '../../redux/slices/uiSlice';
import SearchBar from '../../components/SearchBar/SearchBar';
import Filter from '../../components/Filter/Filter';
import Button from '../../components/Button/Button';
import Modal from '../../components/Modal/Modal';
import Input from '../../components/Input/Input';
import Select from '../../components/Select/Select';
import Textarea from '../../components/Textarea/Textarea';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import {
  formatDate,
  getStatusBadgeClass,
  getPriorityBadgeClass,
} from '../../utils/helpers';
import { validateRequired } from '../../utils/validation';
import './Tasks.css';

const statusOptions = ['All', 'Pending', 'In Progress', 'Completed'];
const priorityOptions = ['All', 'High', 'Medium', 'Low'];

const Tasks = () => {
  const dispatch = useDispatch();
  const { tasks, searchTerm, statusFilter, priorityFilter } = useSelector(
    (state) => state.tasks
  );
  const customers = useSelector((state) => state.customers.customers);
  const users = useSelector((state) => state.users.users);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Form State
  const initialForm = {
    title: '',
    description: '',
    assignedUser: users[0]?.name || 'David Chen',
    customer: customers[0]?.company || 'Apex Global Logistics',
    priority: 'Medium',
    status: 'Pending',
    dueDate: '',
  };

  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});

  // Filter Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.assignedUser?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'All' || task.status === statusFilter;
      const matchesPriority =
        priorityFilter === 'All' || task.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, searchTerm, statusFilter, priorityFilter]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingTask(null);
    setFormData(initialForm);
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title || '',
      description: task.description || '',
      assignedUser: task.assignedUser || users[0]?.name || 'David Chen',
      customer: task.customer || customers[0]?.company || 'Apex Global Logistics',
      priority: task.priority || 'Medium',
      status: task.status || 'Pending',
      dueDate: task.dueDate || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSaveTask = (e) => {
    e.preventDefault();

    const errors = {
      title: validateRequired(formData.title, 'Task Title'),
      customer: validateRequired(formData.customer, 'Customer Account'),
    };

    if (Object.values(errors).some(Boolean)) {
      setFormErrors(errors);
      return;
    }

    if (editingTask) {
      dispatch(updateTask({ ...formData, id: editingTask.id }));
      dispatch(
        addToast({
          message: 'Task updated successfully',
          type: 'success',
        })
      );
    } else {
      dispatch(
        addTask({
          ...formData,
          dueDate:
            formData.dueDate ||
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
        })
      );
      dispatch(
        addToast({
          message: 'Task created successfully',
          type: 'success',
        })
      );
    }

    setIsModalOpen(false);
  };

  const handleToggle = (taskId) => {
    dispatch(toggleTaskCompletion(taskId));
    dispatch(
      addToast({
        message: 'Task status updated',
        type: 'info',
      })
    );
  };

  const handleDeleteConfirm = () => {
    if (taskToDelete) {
      dispatch(deleteTask(taskToDelete.id));
      dispatch(
        addToast({
          message: 'Task deleted successfully',
          type: 'success',
        })
      );
      setIsDeleteOpen(false);
      setTaskToDelete(null);
    }
  };

  return (
    <div className="page-container tasks-page fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Action Items & Tasks</h1>
          <p className="page-subtitle">
            Manage your daily workflow, sales follow-ups, and deliverables
          </p>
        </div>

        <div className="page-actions">
          <Button variant="primary" icon={FiPlus} onClick={handleOpenAdd}>
            Create Task
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card filter-bar-card">
        <SearchBar
          value={searchTerm}
          onChange={(val) => dispatch(setTaskSearchTerm(val))}
          placeholder="Search tasks by title, customer, assignee..."
        />

        <div className="filter-controls-group">
          <Filter
            label="Status"
            value={statusFilter}
            onChange={(val) => dispatch(setTaskStatusFilter(val))}
            options={statusOptions}
          />
          <Filter
            label="Priority"
            value={priorityFilter}
            onChange={(val) => dispatch(setTaskPriorityFilter(val))}
            options={priorityOptions}
          />
        </div>
      </div>

      {/* Tasks List */}
      <div className="tasks-container">
        {filteredTasks.length === 0 ? (
          <div className="card empty-tasks-box">
            <FiCheckCircle className="empty-icon" />
            <h3>No tasks match your criteria</h3>
            <p>You are all caught up on this filter or no tasks exist yet.</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isDone = task.status === 'Completed';

            return (
              <div
                key={task.id}
                className={`card task-list-card ${isDone ? 'is-completed' : ''}`}
              >
                <div className="task-left">
                  <button
                    className={`task-checkbox ${isDone ? 'checked' : ''}`}
                    onClick={() => handleToggle(task.id)}
                    title={isDone ? 'Mark as Pending' : 'Mark as Completed'}
                  >
                    {isDone && <FiCheck />}
                  </button>

                  <div className="task-details">
                    <h3 className={`task-title ${isDone ? 'strikethrough' : ''}`}>
                      {task.title}
                    </h3>
                    <p className="task-desc">{task.description}</p>

                    <div className="task-meta">
                      <span><FiBriefcase /> {task.customer}</span>
                      <span><FiUser /> {task.assignedUser}</span>
                      <span><FiCalendar /> Due {formatDate(task.dueDate)}</span>
                    </div>
                  </div>
                </div>

                <div className="task-right">
                  <div className="task-tags">
                    <span className={`badge ${getPriorityBadgeClass(task.priority)}`}>
                      {task.priority} Priority
                    </span>
                    <span className={`badge ${getStatusBadgeClass(task.status)}`}>
                      {task.status}
                    </span>
                  </div>

                  <div className="task-actions">
                    <button
                      className="action-icon-btn edit"
                      title="Edit Task"
                      onClick={() => handleOpenEdit(task)}
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      className="action-icon-btn delete"
                      title="Delete Task"
                      onClick={() => {
                        setTaskToDelete(task);
                        setIsDeleteOpen(true);
                      }}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? 'Edit Task' : 'Create New Task'}
        subtitle="Schedule deliverables and assign responsibilities"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveTask}>
              {editingTask ? 'Update Task' : 'Create Task'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveTask} className="task-modal-form">
          <Input
            label="Task Title"
            name="title"
            placeholder="e.g. Schedule Executive Product Demo"
            value={formData.title}
            onChange={handleFormChange}
            error={formErrors.title}
            required
          />

          <div className="form-grid-2">
            <Select
              label="Related Customer"
              name="customer"
              value={formData.customer}
              onChange={handleFormChange}
              options={customers.map((c) => c.company)}
              error={formErrors.customer}
              required
            />
            <Select
              label="Assigned User"
              name="assignedUser"
              value={formData.assignedUser}
              onChange={handleFormChange}
              options={users.map((u) => u.name)}
            />
          </div>

          <div className="form-grid-3">
            <Select
              label="Priority"
              name="priority"
              value={formData.priority}
              onChange={handleFormChange}
              options={['High', 'Medium', 'Low']}
            />
            <Select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleFormChange}
              options={['Pending', 'In Progress', 'Completed']}
            />
            <Input
              label="Due Date"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleFormChange}
            />
          </div>

          <Textarea
            label="Task Description"
            name="description"
            placeholder="Provide context and requirements for this task..."
            value={formData.description}
            onChange={handleFormChange}
            rows={3}
          />
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Delete Task"
        message={`Are you sure you want to delete task "${taskToDelete?.title}"?`}
        confirmText="Yes, Delete Task"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setIsDeleteOpen(false);
          setTaskToDelete(null);
        }}
      />
    </div>
  );
};

export default Tasks;
