import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCheckCircle,
  FiLifeBuoy,
} from 'react-icons/fi';
import {
  addTicket,
  updateTicket,
  deleteTicket,
  setTicketStatusFilter,
  setTicketPriorityFilter,
  setTicketSearchTerm,
} from '../../redux/slices/ticketSlice';
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
  formatDate,
  getStatusBadgeClass,
  getPriorityBadgeClass,
} from '../../utils/helpers';
import { validateRequired } from '../../utils/validation';
import './Tickets.css';

const statusOptions = ['All', 'Open', 'In Progress', 'Resolved', 'Closed'];
const priorityOptions = ['All', 'High', 'Medium', 'Low'];

const Tickets = () => {
  const dispatch = useDispatch();
  const { tickets, searchTerm, statusFilter, priorityFilter } = useSelector(
    (state) => state.tickets
  );
  const customers = useSelector((state) => state.customers.customers);
  const users = useSelector((state) => state.users.users);

  // Pagination & Sorting
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [sortColumn, setSortColumn] = useState('updatedDate');
  const [sortDirection, setSortDirection] = useState('desc');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState(null);

  // Form State
  const initialForm = {
    customer: customers[0]?.company || 'Apex Global Logistics',
    subject: '',
    description: '',
    priority: 'Medium',
    status: 'Open',
    assignedAgent: 'Elena Rostova',
  };

  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});

  // Filter & Sort
  const filteredTickets = useMemo(() => {
    return tickets.filter((tk) => {
      const matchesSearch =
        tk.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tk.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tk.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tk.assignedAgent?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'All' || tk.status === statusFilter;
      const matchesPriority =
        priorityFilter === 'All' || tk.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tickets, searchTerm, statusFilter, priorityFilter]);

  const sortedTickets = useMemo(() => {
    return [...filteredTickets].sort((a, b) => {
      let aVal = a[sortColumn] ?? '';
      let bVal = b[sortColumn] ?? '';
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredTickets, sortColumn, sortDirection]);

  const paginatedTickets = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedTickets.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedTickets, currentPage, itemsPerPage]);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleOpenAdd = () => {
    setEditingTicket(null);
    setFormData(initialForm);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ticket) => {
    setEditingTicket(ticket);
    setFormData({
      customer: ticket.customer || '',
      subject: ticket.subject || '',
      description: ticket.description || '',
      priority: ticket.priority || 'Medium',
      status: ticket.status || 'Open',
      assignedAgent: ticket.assignedAgent || 'Elena Rostova',
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

  const handleSaveTicket = (e) => {
    e.preventDefault();

    const errors = {
      subject: validateRequired(formData.subject, 'Ticket Subject'),
      customer: validateRequired(formData.customer, 'Customer Account'),
    };

    if (Object.values(errors).some(Boolean)) {
      setFormErrors(errors);
      return;
    }

    if (editingTicket) {
      dispatch(updateTicket({ ...formData, id: editingTicket.id }));
      dispatch(
        addToast({
          message: 'Ticket updated successfully',
          type: 'success',
        })
      );
    } else {
      dispatch(addTicket(formData));
      dispatch(
        addToast({
          message: 'New support ticket opened',
          type: 'success',
        })
      );
    }

    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (ticketToDelete) {
      dispatch(deleteTicket(ticketToDelete.id));
      dispatch(
        addToast({
          message: `Ticket ${ticketToDelete.id} deleted`,
          type: 'info',
        })
      );
      setIsDeleteOpen(false);
      setTicketToDelete(null);
    }
  };

  const handleQuickResolve = (ticket) => {
    dispatch(updateTicket({ ...ticket, status: 'Resolved' }));
    dispatch(
      addToast({
        message: `Ticket ${ticket.id} marked as Resolved`,
        type: 'success',
      })
    );
  };

  const columns = [
    {
      header: 'Ticket ID',
      accessor: 'id',
      sortable: true,
      width: '110px',
      render: (val) => <span className="ticket-badge-id">{val}</span>,
    },
    {
      header: 'Customer',
      accessor: 'customer',
      sortable: true,
      render: (val) => <strong>{val}</strong>,
    },
    {
      header: 'Subject',
      accessor: 'subject',
      sortable: true,
      render: (_, row) => (
        <div className="ticket-subject-cell">
          <span className="ticket-subject-text">{row.subject}</span>
          <span className="ticket-desc-snippet">{row.description}</span>
        </div>
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
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (val) => (
        <span className={`badge ${getStatusBadgeClass(val)}`}>{val}</span>
      ),
    },
    {
      header: 'Agent',
      accessor: 'assignedAgent',
      sortable: true,
      render: (val) => <span className="badge badge-neutral">{val}</span>,
    },
    {
      header: 'Updated',
      accessor: 'updatedDate',
      sortable: true,
      render: (val) => formatDate(val),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (_, row) => (
        <div className="table-actions-cell" onClick={(e) => e.stopPropagation()}>
          {row.status !== 'Resolved' && row.status !== 'Closed' && (
            <button
              className="action-icon-btn resolve"
              title="Mark as Resolved"
              onClick={() => handleQuickResolve(row)}
            >
              <FiCheckCircle />
            </button>
          )}
          <button
            className="action-icon-btn edit"
            title="Edit Ticket"
            onClick={() => handleOpenEdit(row)}
          >
            <FiEdit2 />
          </button>
          <button
            className="action-icon-btn delete"
            title="Delete Ticket"
            onClick={() => {
              setTicketToDelete(row);
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
    <div className="page-container tickets-page fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Support Tickets & SLA</h1>
          <p className="page-subtitle">
            Customer inquiries, technical escalations, and SLA ticket resolution
          </p>
        </div>

        <div className="page-actions">
          <Button variant="primary" icon={FiPlus} onClick={handleOpenAdd}>
            Create Ticket
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card filter-bar-card">
        <SearchBar
          value={searchTerm}
          onChange={(val) => dispatch(setTicketSearchTerm(val))}
          placeholder="Search tickets by ID, subject, customer, agent..."
        />

        <div className="filter-controls-group">
          <Filter
            label="Status"
            value={statusFilter}
            onChange={(val) => dispatch(setTicketStatusFilter(val))}
            options={statusOptions}
          />
          <Filter
            label="Priority"
            value={priorityFilter}
            onChange={(val) => dispatch(setTicketPriorityFilter(val))}
            options={priorityOptions}
          />
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={paginatedTickets}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
        emptyMessage="No tickets found matching this query."
      />

      <Pagination
        currentPage={currentPage}
        totalItems={sortedTickets.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />

      {/* Add / Edit Ticket Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTicket ? `Edit Ticket ${editingTicket.id}` : 'Open Support Ticket'}
        subtitle="Log issue description, priority urgency, and dispatch agent"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveTicket}>
              {editingTicket ? 'Update Ticket' : 'Create Ticket'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveTicket} className="ticket-modal-form">
          <Input
            label="Subject"
            name="subject"
            placeholder="e.g. Latency issues on webhook receiver"
            value={formData.subject}
            onChange={handleFormChange}
            error={formErrors.subject}
            required
          />

          <div className="form-grid-2">
            <Select
              label="Customer Account"
              name="customer"
              value={formData.customer}
              onChange={handleFormChange}
              options={customers.map((c) => c.company)}
              error={formErrors.customer}
              required
            />
            <Select
              label="Assigned Agent"
              name="assignedAgent"
              value={formData.assignedAgent}
              onChange={handleFormChange}
              options={users.map((u) => u.name)}
            />
          </div>

          <div className="form-grid-2">
            <Select
              label="Priority"
              name="priority"
              value={formData.priority}
              onChange={handleFormChange}
              options={['High', 'Medium', 'Low']}
            />
            <Select
              label="Ticket Status"
              name="status"
              value={formData.status}
              onChange={handleFormChange}
              options={['Open', 'In Progress', 'Resolved', 'Closed']}
            />
          </div>

          <Textarea
            label="Detailed Description"
            name="description"
            placeholder="Include reproduction steps, customer logs, or error codes..."
            value={formData.description}
            onChange={handleFormChange}
            rows={4}
          />
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Delete Support Ticket"
        message={`Are you sure you want to delete ${ticketToDelete?.id}: "${ticketToDelete?.subject}"?`}
        confirmText="Yes, Delete Ticket"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setIsDeleteOpen(false);
          setTicketToDelete(null);
        }}
      />
    </div>
  );
};

export default Tickets;
