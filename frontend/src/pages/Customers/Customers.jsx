import React, { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiMail,
  FiPhone,
  FiDownload,
} from 'react-icons/fi';
import {
  addCustomer,
  updateCustomer,
  deleteCustomer,
  setCustomerSearchTerm,
  setCustomerStatusFilter,
} from '../../redux/slices/customerSlice';
import { addToast } from '../../redux/slices/uiSlice';
import Table from '../../components/Table/Table';
import Pagination from '../../components/Pagination/Pagination';
import SearchBar from '../../components/SearchBar/SearchBar';
import Filter from '../../components/Filter/Filter';
import Button from '../../components/Button/Button';
import Modal from '../../components/Modal/Modal';
import Input from '../../components/Input/Input';
import Select from '../../components/Select/Select';
import Textarea from '../../components/Textarea/Textarea';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import { formatDate, getStatusBadgeClass, getInitials } from '../../utils/helpers';
import { validateEmail, validateRequired } from '../../utils/validation';
import './Customers.css';

const Customers = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { customers, searchTerm, statusFilter } = useSelector(
    (state) => state.customers
  );
  const users = useSelector((state) => state.users.users);

  // Pagination & Sorting State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [sortColumn, setSortColumn] = useState('createdDate');
  const [sortDirection, setSortDirection] = useState('desc');

  // Load real customers from Firebase via Backend API
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await api.get('/customers');
        if (res.data?.data && Array.isArray(res.data.data)) {
          const mapped = res.data.data.map((c) => ({
            ...c,
            name: c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Unknown',
            createdDate: c.createdAt?._seconds
              ? new Date(c.createdAt._seconds * 1000).toISOString().split('T')[0]
              : '2026-09-15',
          }));
          dispatch(setCustomers(mapped));
        }
      } catch (err) {
        console.warn('Backend customers fetch returned:', err.message);
      }
    };
    fetchCustomers();
  }, [dispatch]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  // Form State
  const initialFormState = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    address: '',
    city: '',
    state: '',
    country: 'United States',
    website: '',
    source: 'Website Form',
    status: 'Active',
    notes: '',
    assignedEmployee: users[0]?.name || 'David Chen',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});

  // Filter & Sort Logic
  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const matchesSearch =
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.company?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'All' || customer.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [customers, searchTerm, statusFilter]);

  const sortedCustomers = useMemo(() => {
    return [...filteredCustomers].sort((a, b) => {
      let aVal = a[sortColumn] || '';
      let bVal = b[sortColumn] || '';
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredCustomers, sortColumn, sortDirection]);

  // Paginate
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedCustomers.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedCustomers, currentPage, itemsPerPage]);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    setFormData(initialFormState);
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      firstName: customer.firstName || customer.name?.split(' ')[0] || '',
      lastName: customer.lastName || customer.name?.split(' ').slice(1).join(' ') || '',
      email: customer.email || '',
      phone: customer.phone || '',
      company: customer.company || '',
      jobTitle: customer.jobTitle || '',
      address: customer.address || '',
      city: customer.city || '',
      state: customer.state || '',
      country: customer.country || 'United States',
      website: customer.website || '',
      source: customer.source || 'Website Form',
      status: customer.status || 'Active',
      notes: customer.notes || '',
      assignedEmployee: customer.assignedEmployee || users[0]?.name || 'David Chen',
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

  const handleSaveCustomer = async (e) => {
    e.preventDefault();

    const errors = {
      firstName: validateRequired(formData.firstName, 'First Name'),
      lastName: validateRequired(formData.lastName, 'Last Name'),
      email: validateEmail(formData.email),
      company: validateRequired(formData.company, 'Company'),
    };

    const hasError = Object.values(errors).some(Boolean);
    if (hasError) {
      setFormErrors(errors);
      return;
    }

    const payload = {
      ...formData,
      name: `${formData.firstName} ${formData.lastName}`,
    };

    try {
      if (editingCustomer) {
        const res = await api.put(`/customers/${editingCustomer.id}`, payload);
        const updated = res.data?.data || { ...payload, id: editingCustomer.id };
        dispatch(
          updateCustomer({
            ...updated,
            name: `${updated.firstName || ''} ${updated.lastName || ''}`.trim(),
          })
        );
        dispatch(
          addToast({
            message: 'Customer updated successfully in Firestore',
            type: 'success',
          })
        );
      } else {
        const res = await api.post('/customers', payload);
        const created = res.data?.data || payload;
        dispatch(
          addCustomer({
            ...created,
            name: `${created.firstName || ''} ${created.lastName || ''}`.trim(),
          })
        );
        dispatch(
          addToast({
            message: 'Customer created successfully in Firestore',
            type: 'success',
          })
        );
      }
    } catch (err) {
      console.warn('Customer API call failed, falling back to local state:', err);
      if (editingCustomer) {
        dispatch(updateCustomer({ ...payload, id: editingCustomer.id }));
      } else {
        dispatch(addCustomer(payload));
      }
      dispatch(
        addToast({
          message: 'Saved customer locally',
          type: 'info',
        })
      );
    }

    setIsModalOpen(false);
  };

  // Delete Customer Handler
  const handleDeleteConfirm = async () => {
    if (customerToDelete) {
      try {
        await api.delete(`/customers/${customerToDelete.id}`);
        dispatch(deleteCustomer(customerToDelete.id));
        dispatch(
          addToast({
            message: 'Customer deleted successfully from Firestore',
            type: 'success',
          })
        );
      } catch (err) {
        console.warn('Delete customer API call failed:', err);
        dispatch(deleteCustomer(customerToDelete.id));
        dispatch(
          addToast({
            message: 'Deleted customer',
            type: 'info',
          })
        );
      }
      setIsDeleteOpen(false);
      setCustomerToDelete(null);
    }
  };

  // Table Columns Definition
  const columns = [
    {
      header: 'Customer',
      accessor: 'name',
      sortable: true,
      render: (_, row) => (
        <div className="customer-cell-profile">
          <div className="avatar avatar-sm">{getInitials(row.name)}</div>
          <div>
            <span
              className="customer-name-link"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/customers/${row.id}`);
              }}
            >
              {row.name}
            </span>
            <span className="customer-job">{row.jobTitle || 'Executive'}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Company',
      accessor: 'company',
      sortable: true,
    },
    {
      header: 'Contact Info',
      accessor: 'email',
      render: (_, row) => (
        <div className="contact-cell">
          <div className="contact-line">
            <FiMail className="contact-icon" /> {row.email}
          </div>
          <div className="contact-line">
            <FiPhone className="contact-icon" /> {row.phone}
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (val) => (
        <span className={`badge ${getStatusBadgeClass(val)}`}>{val}</span>
      ),
    },
    {
      header: 'Assigned Employee',
      accessor: 'assignedEmployee',
      sortable: true,
      render: (val) => (
        <span className="badge badge-neutral">{val || 'Unassigned'}</span>
      ),
    },
    {
      header: 'Created Date',
      accessor: 'createdDate',
      sortable: true,
      render: (val) => formatDate(val),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (_, row) => (
        <div className="table-actions-cell" onClick={(e) => e.stopPropagation()}>
          <button
            className="action-icon-btn view"
            title="View Details"
            onClick={() => navigate(`/customers/${row.id}`)}
          >
            <FiEye />
          </button>
          <button
            className="action-icon-btn edit"
            title="Edit Customer"
            onClick={() => handleOpenEditModal(row)}
          >
            <FiEdit2 />
          </button>
          <button
            className="action-icon-btn delete"
            title="Delete Customer"
            onClick={() => {
              setCustomerToDelete(row);
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
    <div className="page-container customers-page fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers Directory</h1>
          <p className="page-subtitle">
            Manage your client companies, accounts, and contact relationships
          </p>
        </div>

        <div className="page-actions">
          <Button variant="primary" icon={FiPlus} onClick={handleOpenAddModal}>
            Add Customer
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="card filter-bar-card">
        <SearchBar
          value={searchTerm}
          onChange={(val) => {
            dispatch(setCustomerSearchTerm(val));
            setCurrentPage(1);
          }}
          placeholder="Search by name, company, email..."
        />

        <div className="filter-controls-group">
          <Filter
            label="Status"
            value={statusFilter}
            onChange={(val) => {
              dispatch(setCustomerStatusFilter(val));
              setCurrentPage(1);
            }}
            options={['All', 'Active', 'Inactive']}
          />
        </div>
      </div>

      {/* Customer Data Table */}
      <Table
        columns={columns}
        data={paginatedCustomers}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
        emptyMessage="No customers match your search filters."
        onRowClick={(row) => navigate(`/customers/${row.id}`)}
      />

      <Pagination
        currentPage={currentPage}
        totalItems={sortedCustomers.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />

      {/* Add / Edit Customer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? 'Edit Customer Details' : 'Add New Customer'}
        subtitle="Complete the customer profile and assign account leadership"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveCustomer}>
              {editingCustomer ? 'Update Customer' : 'Create Customer'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveCustomer} className="customer-modal-form">
          <div className="form-grid-2">
            <Input
              label="First Name"
              name="firstName"
              placeholder="e.g. Jonathan"
              value={formData.firstName}
              onChange={handleFormChange}
              error={formErrors.firstName}
              required
            />
            <Input
              label="Last Name"
              name="lastName"
              placeholder="e.g. Sterling"
              value={formData.lastName}
              onChange={handleFormChange}
              error={formErrors.lastName}
              required
            />
          </div>

          <div className="form-grid-2">
            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="j.sterling@company.com"
              value={formData.email}
              onChange={handleFormChange}
              error={formErrors.email}
              required
            />
            <Input
              label="Phone Number"
              name="phone"
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={handleFormChange}
            />
          </div>

          <div className="form-grid-2">
            <Input
              label="Company Name"
              name="company"
              placeholder="e.g. Apex Global Logistics"
              value={formData.company}
              onChange={handleFormChange}
              error={formErrors.company}
              required
            />
            <Input
              label="Job Title"
              name="jobTitle"
              placeholder="e.g. VP of Operations"
              value={formData.jobTitle}
              onChange={handleFormChange}
            />
          </div>

          <div className="form-grid-2">
            <Input
              label="Address"
              name="address"
              placeholder="Street address"
              value={formData.address}
              onChange={handleFormChange}
            />
            <Input
              label="City"
              name="city"
              placeholder="City name"
              value={formData.city}
              onChange={handleFormChange}
            />
          </div>

          <div className="form-grid-3">
            <Input
              label="State / Province"
              name="state"
              placeholder="CA"
              value={formData.state}
              onChange={handleFormChange}
            />
            <Input
              label="Country"
              name="country"
              placeholder="United States"
              value={formData.country}
              onChange={handleFormChange}
            />
            <Input
              label="Website"
              name="website"
              placeholder="https://..."
              value={formData.website}
              onChange={handleFormChange}
            />
          </div>

          <div className="form-grid-3">
            <Select
              label="Acquisition Source"
              name="source"
              value={formData.source}
              onChange={handleFormChange}
              options={[
                'Website Form',
                'LinkedIn Campaign',
                'Trade Show / Event',
                'Partner Referral',
                'Cold Outreach',
                'Direct Inbound',
              ]}
            />
            <Select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleFormChange}
              options={['Active', 'Inactive']}
            />
            <Select
              label="Assigned Employee"
              name="assignedEmployee"
              value={formData.assignedEmployee}
              onChange={handleFormChange}
              options={users.map((u) => u.name)}
            />
          </div>

          <Textarea
            label="Internal Notes"
            name="notes"
            placeholder="Important customer background or notes..."
            value={formData.notes}
            onChange={handleFormChange}
            rows={3}
          />
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Delete Customer Account"
        message={`Are you sure you want to delete ${customerToDelete?.name} (${customerToDelete?.company})? This action will remove all linked records.`}
        confirmText="Yes, Delete Customer"
        cancelText="Cancel"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setIsDeleteOpen(false);
          setCustomerToDelete(null);
        }}
      />
    </div>
  );
};

export default Customers;
