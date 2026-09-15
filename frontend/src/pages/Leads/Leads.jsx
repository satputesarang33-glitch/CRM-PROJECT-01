import React, { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api from '../../services/api';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiUserCheck,
  FiDollarSign,
  FiMail,
  FiPhone,
} from 'react-icons/fi';
import {
  setLeads,
  addLead,
  updateLead,
  deleteLead,
  convertLead,
  setLeadSearchTerm,
  setLeadStatusFilter,
  setLeadPriorityFilter,
} from '../../redux/slices/leadSlice';
import { addCustomer } from '../../redux/slices/customerSlice';
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
import {
  formatCurrency,
  formatDate,
  getStatusBadgeClass,
  getPriorityBadgeClass,
  getInitials,
} from '../../utils/helpers';
import { validateEmail, validateRequired } from '../../utils/validation';
import './Leads.css';

const leadStatusOptions = [
  'All',
  'New',
  'Contacted',
  'Qualified',
  'Proposal',
  'Negotiation',
  'Converted',
  'Lost',
];

const priorityOptions = ['All', 'High', 'Medium', 'Low'];

const Leads = () => {
  const dispatch = useDispatch();
  const { leads, searchTerm, statusFilter, priorityFilter } = useSelector(
    (state) => state.leads
  );
  const users = useSelector((state) => state.users.users);

  // Pagination & Sorting
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [sortColumn, setSortColumn] = useState('createdDate');
  const [sortDirection, setSortDirection] = useState('desc');

  // Load real leads from Firebase via Backend API
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const res = await api.get('/leads');
        if (res.data?.data && Array.isArray(res.data.data)) {
          const mapped = res.data.data.map((l) => ({
            ...l,
            createdDate: l.createdAt?._seconds
              ? new Date(l.createdAt._seconds * 1000).toISOString().split('T')[0]
              : l.createdDate || new Date().toISOString().split('T')[0],
          }));
          dispatch(setLeads(mapped));
        }
      } catch (err) {
        console.warn('Backend leads fetch failed, using store:', err.message);
      }
    };
    fetchLeads();
  }, [dispatch]);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [leadToConvert, setLeadToConvert] = useState(null);

  // Form State
  const initialForm = {
    name: '',
    email: '',
    phone: '',
    company: '',
    source: 'Website Form',
    status: 'New',
    priority: 'Medium',
    assignedUser: users[0]?.name || 'David Chen',
    expectedValue: '',
    notes: '',
  };

  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});

  // Filter & Sort
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'All' || lead.status === statusFilter;
      const matchesPriority =
        priorityFilter === 'All' || lead.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [leads, searchTerm, statusFilter, priorityFilter]);

  const sortedLeads = useMemo(() => {
    return [...filteredLeads].sort((a, b) => {
      let aVal = a[sortColumn] ?? '';
      let bVal = b[sortColumn] ?? '';
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredLeads, sortColumn, sortDirection]);

  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedLeads.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedLeads, currentPage, itemsPerPage]);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingLead(null);
    setFormData(initialForm);
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (lead) => {
    setEditingLead(lead);
    setFormData({
      name: lead.name || '',
      email: lead.email || '',
      phone: lead.phone || '',
      company: lead.company || '',
      source: lead.source || 'Website Form',
      status: lead.status || 'New',
      priority: lead.priority || 'Medium',
      assignedUser: lead.assignedUser || users[0]?.name || 'David Chen',
      expectedValue: lead.expectedValue || '',
      notes: lead.notes || '',
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

  const handleSaveLead = (e) => {
    e.preventDefault();

    const errors = {
      name: validateRequired(formData.name, 'Full Name'),
      email: validateEmail(formData.email),
      company: validateRequired(formData.company, 'Company'),
    };

    if (Object.values(errors).some(Boolean)) {
      setFormErrors(errors);
      return;
    }

    const payload = {
      ...formData,
      expectedValue: Number(formData.expectedValue) || 0,
    };

    if (editingLead) {
      dispatch(updateLead({ ...payload, id: editingLead.id }));
      api.put(`/leads/${editingLead.id}`, payload).catch((err) => {
        console.warn('Backend update lead error:', err.message);
      });
      dispatch(
        addToast({
          message: 'Lead updated successfully',
          type: 'success',
        })
      );
    } else {
      const tempId = `lead-${Date.now()}`;
      dispatch(addLead({ ...payload, id: tempId }));
      api.post('/leads', payload).catch((err) => {
        console.warn('Backend create lead error:', err.message);
      });
      dispatch(
        addToast({
          message: 'Lead created successfully',
          type: 'success',
        })
      );
    }

    setIsModalOpen(false);
  };

  // Delete Action
  const handleDeleteConfirm = () => {
    if (leadToDelete) {
      dispatch(deleteLead(leadToDelete.id));
      api.delete(`/leads/${leadToDelete.id}`).catch((err) => {
        console.warn('Backend delete lead error:', err.message);
      });
      dispatch(
        addToast({
          message: 'Lead removed successfully',
          type: 'success',
        })
      );
      setIsDeleteOpen(false);
      setLeadToDelete(null);
    }
  };

  // Convert to Customer Action
  const handleConvertConfirm = () => {
    if (leadToConvert) {
      // 1. Mark lead as converted
      dispatch(convertLead(leadToConvert.id));
      api.post(`/leads/${leadToConvert.id}/convert`).catch((err) => {
        console.warn('Backend convert lead error:', err.message);
      });

      // 2. Add as customer
      const names = (leadToConvert.name || 'New Client').split(' ');
      dispatch(
        addCustomer({
          firstName: names[0] || 'Client',
          lastName: names.slice(1).join(' ') || 'Account',
          name: leadToConvert.name,
          email: leadToConvert.email,
          phone: leadToConvert.phone,
          company: leadToConvert.company,
          status: 'Active',
          source: leadToConvert.source,
          assignedEmployee: leadToConvert.assignedUser,
          notes: `Converted from lead pipeline. Initial value: ₹${leadToConvert.expectedValue}. Notes: ${leadToConvert.notes}`,
          lifetimeValue: leadToConvert.expectedValue,
        })
      );

      dispatch(
        addToast({
          message: `Lead converted! ${leadToConvert.name} is now an Active Customer.`,
          type: 'success',
        })
      );

      setIsConvertOpen(false);
      setLeadToConvert(null);
    }
  };

  // Table Columns
  const columns = [
    {
      header: 'Lead Name',
      accessor: 'name',
      sortable: true,
      render: (_, row) => (
        <div className="lead-name-cell">
          <div className="avatar avatar-sm">{getInitials(row.name)}</div>
          <div>
            <span className="lead-name-text">{row.name}</span>
            <span className="lead-company-text">{row.company}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Contact',
      accessor: 'email',
      render: (_, row) => (
        <div className="contact-cell">
          <span className="contact-line">
            <FiMail className="contact-icon" /> {row.email}
          </span>
          <span className="contact-line">
            <FiPhone className="contact-icon" /> {row.phone}
          </span>
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
      header: 'Priority',
      accessor: 'priority',
      sortable: true,
      render: (val) => (
        <span className={`badge ${getPriorityBadgeClass(val)}`}>{val}</span>
      ),
    },
    {
      header: 'Expected Value',
      accessor: 'expectedValue',
      sortable: true,
      render: (val) => (
        <span className="expected-val-text">{formatCurrency(val)}</span>
      ),
    },
    {
      header: 'Assigned User',
      accessor: 'assignedUser',
      sortable: true,
      render: (val) => <span className="badge badge-neutral">{val}</span>,
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (_, row) => (
        <div className="table-actions-cell" onClick={(e) => e.stopPropagation()}>
          {row.status !== 'Converted' && (
            <button
              className="action-icon-btn convert"
              title="Convert to Customer"
              onClick={() => {
                setLeadToConvert(row);
                setIsConvertOpen(true);
              }}
            >
              <FiUserCheck />
            </button>
          )}
          <button
            className="action-icon-btn edit"
            title="Edit Lead"
            onClick={() => handleOpenEdit(row)}
          >
            <FiEdit2 />
          </button>
          <button
            className="action-icon-btn delete"
            title="Delete Lead"
            onClick={() => {
              setLeadToDelete(row);
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
    <div className="page-container leads-page fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Sales Leads Management</h1>
          <p className="page-subtitle">
            Track, qualify, and convert new inbound and outbound business opportunities
          </p>
        </div>

        <div className="page-actions">
          <Button variant="primary" icon={FiPlus} onClick={handleOpenAdd}>
            Add Lead
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card filter-bar-card">
        <SearchBar
          value={searchTerm}
          onChange={(val) => {
            dispatch(setLeadSearchTerm(val));
            setCurrentPage(1);
          }}
          placeholder="Search leads by name, company, email..."
        />

        <div className="filter-controls-group">
          <Filter
            label="Status"
            value={statusFilter}
            onChange={(val) => {
              dispatch(setLeadStatusFilter(val));
              setCurrentPage(1);
            }}
            options={leadStatusOptions}
          />
          <Filter
            label="Priority"
            value={priorityFilter}
            onChange={(val) => {
              dispatch(setLeadPriorityFilter(val));
              setCurrentPage(1);
            }}
            options={priorityOptions}
          />
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={paginatedLeads}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
        emptyMessage="No sales leads match your filter criteria."
      />

      <Pagination
        currentPage={currentPage}
        totalItems={sortedLeads.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />

      {/* Add / Edit Lead Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLead ? 'Edit Lead' : 'Create New Lead'}
        subtitle="Capture prospect details and estimate pipeline value"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveLead}>
              {editingLead ? 'Update Lead' : 'Save Lead'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveLead} className="lead-modal-form">
          <Input
            label="Full Contact Name"
            name="name"
            placeholder="e.g. Marcus Brody"
            value={formData.name}
            onChange={handleFormChange}
            error={formErrors.name}
            required
          />

          <div className="form-grid-2">
            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="mbrody@company.com"
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
            <Input
              label="Company Name"
              name="company"
              placeholder="e.g. Vanguard Robotics"
              value={formData.company}
              onChange={handleFormChange}
              error={formErrors.company}
              required
            />
            <Input
              label="Expected Value (₹)"
              name="expectedValue"
              type="number"
              placeholder="750000"
              value={formData.expectedValue}
              onChange={handleFormChange}
            />
          </div>

          <div className="form-grid-3">
            <Select
              label="Stage Status"
              name="status"
              value={formData.status}
              onChange={handleFormChange}
              options={[
                'New',
                'Contacted',
                'Qualified',
                'Proposal',
                'Negotiation',
                'Converted',
                'Lost',
              ]}
            />
            <Select
              label="Priority"
              name="priority"
              value={formData.priority}
              onChange={handleFormChange}
              options={['High', 'Medium', 'Low']}
            />
            <Select
              label="Assigned User"
              name="assignedUser"
              value={formData.assignedUser}
              onChange={handleFormChange}
              options={users.map((u) => u.name)}
            />
          </div>

          <Select
            label="Acquisition Source"
            name="source"
            value={formData.source}
            onChange={handleFormChange}
            options={[
              'Website Form',
              'LinkedIn Campaign',
              'Trade Show',
              'Partner Referral',
              'Cold Outreach',
              'Direct Inbound',
            ]}
          />

          <Textarea
            label="Prospect Notes"
            name="notes"
            placeholder="Key client needs, timeline, or pain points..."
            value={formData.notes}
            onChange={handleFormChange}
            rows={3}
          />
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Delete Lead Record"
        message={`Are you sure you want to permanently delete lead ${leadToDelete?.name}?`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setIsDeleteOpen(false);
          setLeadToDelete(null);
        }}
      />

      {/* Convert to Customer Confirmation */}
      <ConfirmDialog
        isOpen={isConvertOpen}
        title="Convert Lead to Customer"
        message={`Do you want to convert ${leadToConvert?.name} from ${leadToConvert?.company} into an official active customer? This will automatically create an Account record.`}
        confirmText="Convert to Customer"
        confirmVariant="success"
        cancelText="Cancel"
        onConfirm={handleConvertConfirm}
        onCancel={() => {
          setIsConvertOpen(false);
          setLeadToConvert(null);
        }}
      />
    </div>
  );
};

export default Leads;
