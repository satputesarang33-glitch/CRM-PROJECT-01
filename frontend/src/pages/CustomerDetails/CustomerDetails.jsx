import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  FiArrowLeft,
  FiMail,
  FiPhone,
  FiGlobe,
  FiMapPin,
  FiBriefcase,
  FiClock,
  FiDollarSign,
  FiCheckSquare,
  FiLifeBuoy,
  FiFileText,
  FiPlus,
  FiUser,
  FiActivity,
  FiCalendar,
} from 'react-icons/fi';
import Button from '../../components/Button/Button';
import Modal from '../../components/Modal/Modal';
import Input from '../../components/Input/Input';
import Select from '../../components/Select/Select';
import Textarea from '../../components/Textarea/Textarea';
import { addActivity } from '../../redux/slices/activitySlice';
import { addToast } from '../../redux/slices/uiSlice';
import {
  formatCurrency,
  formatDate,
  getStatusBadgeClass,
  getPriorityBadgeClass,
  getInitials,
} from '../../utils/helpers';
import './CustomerDetails.css';

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const customers = useSelector((state) => state.customers.customers);
  const deals = useSelector((state) => state.deals.deals);
  const tasks = useSelector((state) => state.tasks.tasks);
  const tickets = useSelector((state) => state.tickets.tickets);
  const activities = useSelector((state) => state.activities.activities);

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'activities' | 'deals' | 'tasks' | 'tickets' | 'notes'
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);

  // Find customer by id or fallback to first
  const customer =
    customers.find((c) => c.id === id) || customers[0] || {};

  // Filter linked items
  const customerDeals = deals.filter(
    (d) => d.customerId === customer.id || d.customer === customer.company
  );
  const customerTasks = tasks.filter(
    (t) => t.customerId === customer.id || t.customer === customer.company
  );
  const customerTickets = tickets.filter(
    (tk) => tk.customerId === customer.id || tk.customer === customer.company
  );
  const customerActivities = activities.filter(
    (a) => a.customerId === customer.id || a.customer === customer.company
  );

  // New Activity Form State
  const [newActivity, setNewActivity] = useState({
    type: 'Call',
    title: '',
    description: '',
  });

  const handleAddActivity = (e) => {
    e.preventDefault();
    if (!newActivity.title.trim()) return;

    dispatch(
      addActivity({
        ...newActivity,
        customer: customer.company,
        customerId: customer.id,
        user: 'Alex Morgan',
      })
    );

    dispatch(
      addToast({
        message: 'Activity logged successfully',
        type: 'success',
      })
    );

    setNewActivity({ type: 'Call', title: '', description: '' });
    setIsActivityModalOpen(false);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'Call': return <FiPhone className="act-type-icon call" />;
      case 'Email': return <FiMail className="act-type-icon email" />;
      case 'Meeting': return <FiCalendar className="act-type-icon meeting" />;
      case 'Note': return <FiFileText className="act-type-icon note" />;
      default: return <FiActivity className="act-type-icon follow" />;
    }
  };

  return (
    <div className="page-container customer-details-page fade-in">
      {/* Back Link and Action */}
      <div className="details-top-nav">
        <Link to="/customers" className="back-link">
          <FiArrowLeft /> Back to Customers Directory
        </Link>
      </div>

      {/* Customer Header Banner */}
      <div className="card customer-banner-card">
        <div className="banner-left">
          <div className="avatar avatar-lg">{getInitials(customer.name)}</div>
          <div className="banner-info">
            <div className="banner-name-row">
              <h1 className="customer-banner-title">{customer.name}</h1>
              <span className={`badge ${getStatusBadgeClass(customer.status)}`}>
                {customer.status}
              </span>
            </div>
            <p className="customer-banner-role">
              {customer.jobTitle} at <strong>{customer.company}</strong>
            </p>
            <div className="banner-quick-meta">
              <span><FiMapPin /> {customer.city}, {customer.country}</span>
              <span><FiUser /> Rep: {customer.assignedEmployee}</span>
              <span><FiClock /> Added {formatDate(customer.createdDate)}</span>
            </div>
          </div>
        </div>

        <div className="banner-right">
          <div className="banner-stat-box">
            <span className="banner-stat-label">Pipeline Value</span>
            <span className="banner-stat-val">
              {formatCurrency(
                customerDeals.reduce((sum, d) => sum + (d.value || 0), 0) || customer.lifetimeValue || 0
              )}
            </span>
          </div>
          <Button
            variant="primary"
            icon={FiPlus}
            onClick={() => setIsActivityModalOpen(true)}
          >
            Log Activity
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="details-tab-nav">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <FiBriefcase /> Account Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'activities' ? 'active' : ''}`}
          onClick={() => setActiveTab('activities')}
        >
          <FiActivity /> Timeline ({customerActivities.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'deals' ? 'active' : ''}`}
          onClick={() => setActiveTab('deals')}
        >
          <FiDollarSign /> Deals ({customerDeals.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          <FiCheckSquare /> Tasks ({customerTasks.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'tickets' ? 'active' : ''}`}
          onClick={() => setActiveTab('tickets')}
        >
          <FiLifeBuoy /> Tickets ({customerTickets.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          <FiFileText /> Notes
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content-area">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="overview-layout-grid">
            {/* Contact Information */}
            <div className="card info-box">
              <h3 className="box-title">Contact Information</h3>
              <div className="info-list">
                <div className="info-item">
                  <span className="info-label">Direct Email</span>
                  <span className="info-val">
                    <a href={`mailto:${customer.email}`}>{customer.email}</a>
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Phone</span>
                  <span className="info-val">{customer.phone || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Job Title</span>
                  <span className="info-val">{customer.jobTitle || 'Executive'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Assigned Representative</span>
                  <span className="info-val">{customer.assignedEmployee}</span>
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div className="card info-box">
              <h3 className="box-title">Company Information</h3>
              <div className="info-list">
                <div className="info-item">
                  <span className="info-label">Company Name</span>
                  <span className="info-val font-bold">{customer.company}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Website</span>
                  <span className="info-val">
                    <a href={customer.website} target="_blank" rel="noreferrer">
                      {customer.website || 'N/A'}
                    </a>
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Headquarters</span>
                  <span className="info-val">{customer.address}, {customer.city}, {customer.state}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Lead Acquisition Source</span>
                  <span className="info-val">{customer.source}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TIMELINE ACTIVITIES TAB */}
        {activeTab === 'activities' && (
          <div className="card timeline-card">
            <div className="timeline-header">
              <h3 className="box-title">Interaction Timeline</h3>
              <Button
                variant="secondary"
                size="sm"
                icon={FiPlus}
                onClick={() => setIsActivityModalOpen(true)}
              >
                New Entry
              </Button>
            </div>

            {customerActivities.length === 0 ? (
              <p className="no-items-text">No recorded activities for this customer yet.</p>
            ) : (
              <div className="timeline-feed">
                {customerActivities.map((act) => (
                  <div key={act.id} className="timeline-entry">
                    <div className="entry-marker-col">
                      <div className="entry-icon-bubble">
                        {getActivityIcon(act.type)}
                      </div>
                      <div className="entry-line" />
                    </div>

                    <div className="entry-card">
                      <div className="entry-header">
                        <div>
                          <span className={`badge ${act.type === 'Call' ? 'badge-info' : act.type === 'Email' ? 'badge-primary' : 'badge-warning'}`}>
                            {act.type}
                          </span>
                          <h4 className="entry-title">{act.title}</h4>
                        </div>
                        <span className="entry-timestamp">{act.time} ({formatDate(act.date)})</span>
                      </div>
                      <p className="entry-desc">{act.description}</p>
                      <div className="entry-footer">
                        <span>Logged by: <strong>{act.user}</strong></span>
                        {act.duration && <span>Duration: {act.duration}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* DEALS TAB */}
        {activeTab === 'deals' && (
          <div className="card deals-list-card">
            <div className="deals-card-header">
              <h3 className="box-title">Associated Opportunities</h3>
              <Link to="/deals">
                <Button variant="secondary" size="sm">Open Deals Pipeline</Button>
              </Link>
            </div>

            {customerDeals.length === 0 ? (
              <p className="no-items-text">No active deals mapped to this account.</p>
            ) : (
              <div className="deals-grid">
                {customerDeals.map((deal) => (
                  <div key={deal.id} className="deal-detail-box">
                    <div className="deal-box-top">
                      <h4 className="deal-box-name">{deal.name}</h4>
                      <span className={`badge ${getStatusBadgeClass(deal.stage)}`}>
                        {deal.stage}
                      </span>
                    </div>
                    <div className="deal-box-value">{formatCurrency(deal.value)}</div>
                    <div className="deal-box-meta">
                      <span>Win Probability: <strong>{deal.probability}%</strong></span>
                      <span>Target Close: {formatDate(deal.expectedCloseDate)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TASKS TAB */}
        {activeTab === 'tasks' && (
          <div className="card tasks-list-card">
            <h3 className="box-title">Account Action Items</h3>
            {customerTasks.length === 0 ? (
              <p className="no-items-text">No pending tasks for this account.</p>
            ) : (
              <div className="tasks-rows">
                {customerTasks.map((t) => (
                  <div key={t.id} className="task-row-item">
                    <div>
                      <h4 className="task-row-title">{t.title}</h4>
                      <p className="task-row-desc">{t.description}</p>
                      <span className="task-row-due">Due: {formatDate(t.dueDate)}</span>
                    </div>
                    <div className="task-row-badges">
                      <span className={`badge ${getPriorityBadgeClass(t.priority)}`}>
                        {t.priority}
                      </span>
                      <span className={`badge ${getStatusBadgeClass(t.status)}`}>
                        {t.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TICKETS TAB */}
        {activeTab === 'tickets' && (
          <div className="card tickets-list-card">
            <h3 className="box-title">Support & Service Requests</h3>
            {customerTickets.length === 0 ? (
              <p className="no-items-text">No support tickets found for this account.</p>
            ) : (
              <div className="tickets-rows">
                {customerTickets.map((tk) => (
                  <div key={tk.id} className="ticket-row-item">
                    <div>
                      <span className="ticket-id-tag">{tk.id}</span>
                      <h4 className="ticket-row-subj">{tk.subject}</h4>
                      <p className="ticket-row-desc">{tk.description}</p>
                    </div>
                    <div className="ticket-row-meta">
                      <span className={`badge ${getStatusBadgeClass(tk.status)}`}>
                        {tk.status}
                      </span>
                      <span className="ticket-agent">Agent: {tk.assignedAgent}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* NOTES TAB */}
        {activeTab === 'notes' && (
          <div className="card notes-tab-card">
            <h3 className="box-title">Internal Account Notes</h3>
            <div className="note-display-box">
              <p>{customer.notes || 'No confidential notes provided for this account.'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Log Activity Modal */}
      <Modal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        title="Log Customer Activity"
        subtitle={`Record a call, meeting, or email interaction with ${customer.name}`}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsActivityModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddActivity}>
              Save Activity
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddActivity} className="activity-form">
          <Select
            label="Activity Type"
            name="type"
            value={newActivity.type}
            onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value })}
            options={['Call', 'Email', 'Meeting', 'Follow-up', 'Note']}
          />

          <Input
            label="Summary / Title"
            name="title"
            placeholder="e.g. Discussed proposal with decision maker"
            value={newActivity.title}
            onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
            required
          />

          <Textarea
            label="Detailed Interaction Notes"
            name="description"
            placeholder="Key discussion points, customer feedback, next action..."
            value={newActivity.description}
            onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
            rows={4}
          />
        </form>
      </Modal>
    </div>
  );
};

export default CustomerDetails;
