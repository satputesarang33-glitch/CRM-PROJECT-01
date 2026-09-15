import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  FiPhone,
  FiMail,
  FiCalendar,
  FiFileText,
  FiActivity,
  FiPlus,
  FiTrash2,
  FiClock,
  FiUser,
  FiBriefcase,
} from 'react-icons/fi';
import {
  addActivity,
  deleteActivity,
  setActivityTypeFilter,
  setActivitySearchTerm,
} from '../../redux/slices/activitySlice';
import { addToast } from '../../redux/slices/uiSlice';
import SearchBar from '../../components/SearchBar/SearchBar';
import Filter from '../../components/Filter/Filter';
import Button from '../../components/Button/Button';
import Modal from '../../components/Modal/Modal';
import Input from '../../components/Input/Input';
import Select from '../../components/Select/Select';
import Textarea from '../../components/Textarea/Textarea';
import { formatDate } from '../../utils/helpers';
import { validateRequired } from '../../utils/validation';
import './Activities.css';

const typeOptions = ['All', 'Call', 'Email', 'Meeting', 'Follow-up', 'Note'];

const Activities = () => {
  const dispatch = useDispatch();
  const { activities, typeFilter, searchTerm } = useSelector(
    (state) => state.activities
  );
  const customers = useSelector((state) => state.customers.customers);
  const { user } = useSelector((state) => state.auth);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const initialForm = {
    type: 'Call',
    title: '',
    description: '',
    customer: customers[0]?.company || 'Apex Global Logistics',
    duration: '15 mins',
  };

  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});

  // Filter Activities
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const matchesSearch =
        act.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        act.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        act.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        act.user?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType =
        typeFilter === 'All' || act.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [activities, typeFilter, searchTerm]);

  // Group by Period ('Today', 'Yesterday', 'Older')
  const groupedActivities = useMemo(() => {
    const groups = {
      Today: [],
      Yesterday: [],
      Older: [],
    };

    filteredActivities.forEach((act) => {
      const period = act.period || 'Older';
      if (groups[period]) {
        groups[period].push(act);
      } else {
        groups.Older.push(act);
      }
    });

    return groups;
  }, [filteredActivities]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSaveActivity = (e) => {
    e.preventDefault();

    const errors = {
      title: validateRequired(formData.title, 'Activity Title / Subject'),
      customer: validateRequired(formData.customer, 'Customer Account'),
    };

    if (Object.values(errors).some(Boolean)) {
      setFormErrors(errors);
      return;
    }

    dispatch(
      addActivity({
        ...formData,
        user: user?.name || 'Alex Morgan',
      })
    );

    dispatch(
      addToast({
        message: 'New interaction logged on timeline',
        type: 'success',
      })
    );

    setIsModalOpen(false);
    setFormData(initialForm);
  };

  const handleDelete = (id) => {
    dispatch(deleteActivity(id));
    dispatch(
      addToast({
        message: 'Activity log removed',
        type: 'info',
      })
    );
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'Call': return <FiPhone className="act-icon call" />;
      case 'Email': return <FiMail className="act-icon email" />;
      case 'Meeting': return <FiCalendar className="act-icon meeting" />;
      case 'Note': return <FiFileText className="act-icon note" />;
      default: return <FiActivity className="act-icon follow" />;
    }
  };

  return (
    <div className="page-container activities-page fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Activity Feed & Timeline</h1>
          <p className="page-subtitle">
            Comprehensive audit log of calls, meetings, emails, and client interactions
          </p>
        </div>

        <div className="page-actions">
          <Button
            variant="primary"
            icon={FiPlus}
            onClick={() => setIsModalOpen(true)}
          >
            Log Interaction
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card filter-bar-card">
        <SearchBar
          value={searchTerm}
          onChange={(val) => dispatch(setActivitySearchTerm(val))}
          placeholder="Search activity records by subject, client, notes..."
        />

        <div className="filter-controls-group">
          <Filter
            label="Type"
            value={typeFilter}
            onChange={(val) => dispatch(setActivityTypeFilter(val))}
            options={typeOptions}
          />
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="timeline-container">
        {Object.entries(groupedActivities).map(([period, items]) => {
          if (items.length === 0) return null;

          return (
            <div key={period} className="timeline-group">
              <div className="period-divider">
                <span className="period-pill">{period}</span>
                <div className="period-line" />
              </div>

              <div className="period-items-list">
                {items.map((act) => (
                  <div key={act.id} className="timeline-item-card card">
                    <div className="item-marker">
                      <div className="item-icon-circle">
                        {getActivityIcon(act.type)}
                      </div>
                    </div>

                    <div className="item-content-wrap">
                      <div className="item-header">
                        <div className="item-title-col">
                          <div className="item-badge-row">
                            <span
                              className={`badge ${
                                act.type === 'Call'
                                  ? 'badge-info'
                                  : act.type === 'Email'
                                  ? 'badge-primary'
                                  : act.type === 'Meeting'
                                  ? 'badge-warning'
                                  : 'badge-purple'
                              }`}
                            >
                              {act.type}
                            </span>
                            <span className="item-time">
                              <FiClock /> {act.time}
                            </span>
                          </div>
                          <h3 className="item-title">{act.title}</h3>
                        </div>

                        <button
                          className="item-delete-btn"
                          onClick={() => handleDelete(act.id)}
                          title="Delete Activity"
                        >
                          <FiTrash2 />
                        </button>
                      </div>

                      <p className="item-desc">{act.description}</p>

                      <div className="item-footer-meta">
                        <span>
                          <FiBriefcase /> <strong>{act.customer}</strong>
                        </span>
                        <span>
                          <FiUser /> Logged by: {act.user}
                        </span>
                        {act.duration && (
                          <span className="item-duration">
                            Duration: {act.duration}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {filteredActivities.length === 0 && (
          <div className="card empty-activities-box">
            <FiActivity className="empty-icon" />
            <h3>No activities found</h3>
            <p>No logged communications match your active search filter.</p>
          </div>
        )}
      </div>

      {/* Log Activity Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Customer Interaction"
        subtitle="Record touchpoints, phone calls, meetings, or client notes"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveActivity}>
              Record Interaction
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveActivity} className="activity-modal-form">
          <div className="form-grid-2">
            <Select
              label="Activity Type"
              name="type"
              value={formData.type}
              onChange={handleFormChange}
              options={['Call', 'Email', 'Meeting', 'Follow-up', 'Note']}
            />
            <Select
              label="Customer Account"
              name="customer"
              value={formData.customer}
              onChange={handleFormChange}
              options={customers.map((c) => c.company)}
              error={formErrors.customer}
              required
            />
          </div>

          <Input
            label="Subject / Headline"
            name="title"
            placeholder="e.g. Discussed Q4 contract renewal"
            value={formData.title}
            onChange={handleFormChange}
            error={formErrors.title}
            required
          />

          <div className="form-grid-2">
            <Input
              label="Duration"
              name="duration"
              placeholder="e.g. 30 mins"
              value={formData.duration}
              onChange={handleFormChange}
            />
          </div>

          <Textarea
            label="Detailed Summary & Next Steps"
            name="description"
            placeholder="Document client feedback, objections, commitments..."
            value={formData.description}
            onChange={handleFormChange}
            rows={4}
          />
        </form>
      </Modal>
    </div>
  );
};

export default Activities;
