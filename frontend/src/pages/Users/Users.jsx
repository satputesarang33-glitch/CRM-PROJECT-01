import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiShield,
  FiMail,
  FiPhone,
  FiCheckCircle,
} from 'react-icons/fi';
import {
  addUser,
  updateUser,
  deleteUser,
  setUserRoleFilter,
  setUserSearchTerm,
} from '../../redux/slices/userSlice';
import { addToast } from '../../redux/slices/uiSlice';
import Table from '../../components/Table/Table';
import SearchBar from '../../components/SearchBar/SearchBar';
import Filter from '../../components/Filter/Filter';
import Button from '../../components/Button/Button';
import Modal from '../../components/Modal/Modal';
import Input from '../../components/Input/Input';
import Select from '../../components/Select/Select';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import { formatDate, getInitials } from '../../utils/helpers';
import { validateEmail, validateRequired } from '../../utils/validation';
import './Users.css';

const roleOptions = ['All', 'Admin', 'Manager', 'Sales Agent', 'Support Agent'];

const Users = () => {
  const dispatch = useDispatch();
  const { users, searchTerm, roleFilter } = useSelector((state) => state.users);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Form
  const initialForm = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'Sales Agent',
    department: 'Sales Team',
  };

  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});

  // Filter
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.department?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === 'All' || u.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData(initialForm);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName || user.name.split(' ')[0] || '',
      lastName: user.lastName || user.name.split(' ').slice(1).join(' ') || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'Sales Agent',
      department: user.department || 'Sales Team',
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

  const handleSaveUser = (e) => {
    e.preventDefault();

    const errors = {
      firstName: validateRequired(formData.firstName, 'First Name'),
      lastName: validateRequired(formData.lastName, 'Last Name'),
      email: validateEmail(formData.email),
    };

    if (Object.values(errors).some(Boolean)) {
      setFormErrors(errors);
      return;
    }

    const payload = {
      ...formData,
      name: `${formData.firstName} ${formData.lastName}`,
    };

    if (editingUser) {
      dispatch(updateUser({ ...payload, id: editingUser.id }));
      dispatch(
        addToast({
          message: 'User account updated successfully',
          type: 'success',
        })
      );
    } else {
      dispatch(addUser(payload));
      dispatch(
        addToast({
          message: 'Team member added successfully',
          type: 'success',
        })
      );
    }

    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      dispatch(deleteUser(userToDelete.id));
      dispatch(
        addToast({
          message: `User ${userToDelete.name} removed from workspace`,
          type: 'info',
        })
      );
      setIsDeleteOpen(false);
      setUserToDelete(null);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'Admin': return 'badge-purple';
      case 'Manager': return 'badge-primary';
      case 'Sales Agent': return 'badge-info';
      default: return 'badge-warning';
    }
  };

  const columns = [
    {
      header: 'Team Member',
      accessor: 'name',
      sortable: true,
      render: (_, row) => (
        <div className="user-profile-cell">
          <div className="avatar avatar-sm">{getInitials(row.name)}</div>
          <div>
            <span className="user-full-name">{row.name}</span>
            <span className="user-department">{row.department}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Email Address',
      accessor: 'email',
      sortable: true,
      render: (val) => (
        <span className="contact-line">
          <FiMail className="contact-icon" /> {val}
        </span>
      ),
    },
    {
      header: 'Phone',
      accessor: 'phone',
      render: (val) => (
        <span className="contact-line">
          <FiPhone className="contact-icon" /> {val}
        </span>
      ),
    },
    {
      header: 'Role / Privilege',
      accessor: 'role',
      sortable: true,
      render: (val) => (
        <span className={`badge ${getRoleBadge(val)}`}>
          <FiShield /> {val}
        </span>
      ),
    },
    {
      header: 'Joined Date',
      accessor: 'joinedDate',
      sortable: true,
      render: (val) => formatDate(val),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (_, row) => (
        <div className="table-actions-cell" onClick={(e) => e.stopPropagation()}>
          <button
            className="action-icon-btn edit"
            title="Edit User"
            onClick={() => handleOpenEdit(row)}
          >
            <FiEdit2 />
          </button>
          <button
            className="action-icon-btn delete"
            title="Remove User"
            onClick={() => {
              setUserToDelete(row);
              setIsDeleteOpen(true);
            }}
          >
            <FiTrash2 />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="page-container users-page fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Team Members & Access Control</h1>
          <p className="page-subtitle">
            Manage employee directory, assign system permissions, and configure roles
          </p>
        </div>

        <div className="page-actions">
          <Button variant="primary" icon={FiPlus} onClick={handleOpenAdd}>
            Add Team Member
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card filter-bar-card">
        <SearchBar
          value={searchTerm}
          onChange={(val) => dispatch(setUserSearchTerm(val))}
          placeholder="Search members by name, email, department..."
        />

        <div className="filter-controls-group">
          <Filter
            label="Role"
            value={roleFilter}
            onChange={(val) => dispatch(setUserRoleFilter(val))}
            options={roleOptions}
          />
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={filteredUsers}
        emptyMessage="No team members match the chosen criteria."
      />

      {/* Add / Edit User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Edit Team Member' : 'Add Team Member'}
        subtitle="Specify user identity, department, and assigned CRM role"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveUser}>
              {editingUser ? 'Update User' : 'Save Member'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveUser} className="user-modal-form">
          <div className="form-grid-2">
            <Input
              label="First Name"
              name="firstName"
              placeholder="e.g. David"
              value={formData.firstName}
              onChange={handleFormChange}
              error={formErrors.firstName}
              required
            />
            <Input
              label="Last Name"
              name="lastName"
              placeholder="e.g. Chen"
              value={formData.lastName}
              onChange={handleFormChange}
              error={formErrors.lastName}
              required
            />
          </div>

          <div className="form-grid-2">
            <Input
              label="Corporate Email"
              name="email"
              type="email"
              placeholder="david.chen@nexuscrm.com"
              value={formData.email}
              onChange={handleFormChange}
              error={formErrors.email}
              required
            />
            <Input
              label="Phone"
              name="phone"
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={handleFormChange}
            />
          </div>

          <div className="form-grid-2">
            <Select
              label="System Role"
              name="role"
              value={formData.role}
              onChange={handleFormChange}
              options={['Admin', 'Manager', 'Sales Agent', 'Support Agent']}
            />
            <Input
              label="Department"
              name="department"
              placeholder="e.g. Direct Sales"
              value={formData.department}
              onChange={handleFormChange}
            />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Remove Team Member"
        message={`Are you sure you want to revoke system access for ${userToDelete?.name}?`}
        confirmText="Yes, Remove"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setIsDeleteOpen(false);
          setUserToDelete(null);
        }}
      />
    </div>
  );
};

export default Users;
