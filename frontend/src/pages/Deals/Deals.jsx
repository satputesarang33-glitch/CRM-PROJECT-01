import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api from '../../services/api';
import {
  FiPlus,
  FiDollarSign,
  FiCalendar,
  FiUser,
  FiPercent,
  FiMove,
  FiTrash2,
} from 'react-icons/fi';
import {
  setDeals,
  addDeal,
  updateDealStage,
  deleteDeal,
  setDealSearchTerm,
} from '../../redux/slices/dealSlice';
import { addToast } from '../../redux/slices/uiSlice';
import { dealStages } from '../../data/deals';
import Button from '../../components/Button/Button';
import SearchBar from '../../components/SearchBar/SearchBar';
import Modal from '../../components/Modal/Modal';
import Input from '../../components/Input/Input';
import Select from '../../components/Select/Select';
import { formatCurrency, formatDate, getInitials } from '../../utils/helpers';
import { validateRequired } from '../../utils/validation';
import './Deals.css';

const Deals = () => {
  const dispatch = useDispatch();
  const { deals, searchTerm } = useSelector((state) => state.deals);
  const customers = useSelector((state) => state.customers.customers);
  const users = useSelector((state) => state.users.users);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [draggedDealId, setDraggedDealId] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);

  // New Deal Form State
  const initialForm = {
    name: '',
    customer: customers[0]?.company || 'Apex Global Logistics',
    value: '',
    stage: 'New',
    probability: 20,
    expectedCloseDate: '',
    assignedSalesperson: users[0]?.name || 'David Chen',
    priority: 'High',
  };

  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});

  // Filter deals
  const filteredDeals = deals.filter((deal) => {
    return (
      deal.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.assignedSalesperson?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Fetch live deals from Firebase via Backend API
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const res = await api.get('/deals');
        if (res.data?.data && Array.isArray(res.data.data)) {
          const mapped = res.data.data.map((d) => ({
            ...d,
            name: d.dealName || d.name || 'Untitled Deal',
            customer: d.customerName || d.customer || 'Enterprise Client',
            stage: d.stage || 'New',
            value: Number(d.value) || 0,
            probability: Number(d.probability) || 20,
          }));
          dispatch(setDeals(mapped));
        }
      } catch (err) {
        console.warn('Backend deals fetch failed, using store:', err.message);
      }
    };
    fetchDeals();
  }, [dispatch]);

  // Drag and Drop handlers
  const handleDragStart = (e, dealId) => {
    setDraggedDealId(dealId);
    e.dataTransfer.setData('text/plain', dealId);
  };

  const handleDragOver = (e, stageId) => {
    e.preventDefault();
    if (dragOverStage !== stageId) {
      setDragOverStage(stageId);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetStage) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('text/plain') || draggedDealId;
    if (dealId) {
      dispatch(updateDealStage({ dealId, newStage: targetStage }));
      api.patch(`/deals/${dealId}/stage`, { stage: targetStage }).catch((err) => {
        console.warn('Backend deal stage update error:', err.message);
      });
      dispatch(
        addToast({
          message: `Deal moved to stage: "${targetStage}"`,
          type: 'success',
        })
      );
    }
    setDraggedDealId(null);
    setDragOverStage(null);
  };

  // Form handlers
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleCreateDeal = (e) => {
    e.preventDefault();

    const errors = {
      name: validateRequired(formData.name, 'Deal Name'),
      customer: validateRequired(formData.customer, 'Customer'),
      value: validateRequired(formData.value, 'Deal Value'),
    };

    if (Object.values(errors).some(Boolean)) {
      setFormErrors(errors);
      return;
    }

    const dealPayload = {
      ...formData,
      dealName: formData.name,
      value: Number(formData.value) || 0,
      probability: Number(formData.probability) || 50,
      expectedCloseDate:
        formData.expectedCloseDate ||
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
    };

    dispatch(addDeal({ ...dealPayload, id: `deal-${Date.now()}` }));
    api.post('/deals', dealPayload).catch((err) => {
      console.warn('Backend create deal error:', err.message);
    });

    dispatch(
      addToast({
        message: 'New deal added to sales pipeline',
        type: 'success',
      })
    );

    setIsAddModalOpen(false);
    setFormData(initialForm);
  };

  const handleDeleteDeal = (dealId, dealName) => {
    dispatch(deleteDeal(dealId));
    api.delete(`/deals/${dealId}`).catch((err) => {
      console.warn('Backend delete deal error:', err.message);
    });
    dispatch(
      addToast({
        message: `Deal "${dealName}" deleted`,
        type: 'info',
      })
    );
  };

  return (
    <div className="page-container deals-page fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Sales Pipeline Kanban</h1>
          <p className="page-subtitle">
            Drag and drop deals across stages to advance your sales pipeline
          </p>
        </div>

        <div className="page-actions">
          <SearchBar
            value={searchTerm}
            onChange={(val) => dispatch(setDealSearchTerm(val))}
            placeholder="Search deals..."
          />
          <Button
            variant="primary"
            icon={FiPlus}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Deal
          </Button>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="kanban-board">
        {dealStages.map((stage) => {
          const stageDeals = filteredDeals.filter(
            (deal) => deal.stage === stage.id
          );
          const stageTotalValue = stageDeals.reduce(
            (acc, curr) => acc + (curr.value || 0),
            0
          );
          const isOver = dragOverStage === stage.id;

          return (
            <div
              key={stage.id}
              className={`kanban-column ${isOver ? 'drag-over' : ''}`}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              {/* Column Header */}
              <div
                className="column-header"
                style={{ borderTopColor: stage.color }}
              >
                <div className="column-title-row">
                  <span className="stage-indicator" style={{ backgroundColor: stage.color }} />
                  <h3 className="column-name">{stage.label}</h3>
                  <span className="column-count">{stageDeals.length}</span>
                </div>
                <div className="column-subtotal">
                  {formatCurrency(stageTotalValue)}
                </div>
              </div>

              {/* Cards Container */}
              <div className="column-cards-list">
                {stageDeals.map((deal) => (
                  <div
                    key={deal.id}
                    className={`deal-card ${draggedDealId === deal.id ? 'is-dragging' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, deal.id)}
                  >
                    <div className="deal-card-top">
                      <span className="deal-customer-badge">
                        {deal.customer}
                      </span>
                      <button
                        className="deal-delete-btn"
                        onClick={() => handleDeleteDeal(deal.id, deal.name)}
                        title="Delete Deal"
                      >
                        <FiTrash2 />
                      </button>
                    </div>

                    <h4 className="deal-card-title">{deal.name}</h4>

                    <div className="deal-card-value">
                      <span>{formatCurrency(deal.value)}</span>
                    </div>

                    <div className="deal-probability-bar">
                      <div className="prob-track">
                        <div
                          className="prob-fill"
                          style={{
                            width: `${deal.probability}%`,
                            backgroundColor: stage.color,
                          }}
                        />
                      </div>
                      <span className="prob-text">{deal.probability}% Win Prob</span>
                    </div>

                    <div className="deal-card-footer">
                      <div className="deal-salesperson">
                        <div className="avatar avatar-sm">
                          {getInitials(deal.assignedSalesperson)}
                        </div>
                        <span className="salesperson-name">
                          {deal.assignedSalesperson}
                        </span>
                      </div>

                      <div className="deal-close-date">
                        <FiCalendar className="date-icon" />
                        <span>{formatDate(deal.expectedCloseDate)}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {stageDeals.length === 0 && (
                  <div className="empty-column-drop">
                    <span>Drop deals here</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Deal Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Sales Opportunity"
        subtitle="Create a new deal and place it into your sales pipeline"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateDeal}>
              Create Deal
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateDeal} className="deal-modal-form">
          <Input
            label="Deal / Project Name"
            name="name"
            placeholder="e.g. Cloud Infrastructure Overhaul"
            value={formData.name}
            onChange={handleFormChange}
            error={formErrors.name}
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
            <Input
              label="Deal Value (₹)"
              name="value"
              type="number"
              placeholder="500000"
              value={formData.value}
              onChange={handleFormChange}
              error={formErrors.value}
              required
            />
          </div>

          <div className="form-grid-2">
            <Select
              label="Pipeline Stage"
              name="stage"
              value={formData.stage}
              onChange={handleFormChange}
              options={dealStages.map((s) => s.id)}
            />
            <Input
              label="Win Probability (%)"
              name="probability"
              type="number"
              min="0"
              max="100"
              placeholder="50"
              value={formData.probability}
              onChange={handleFormChange}
            />
          </div>

          <div className="form-grid-2">
            <Input
              label="Expected Close Date"
              name="expectedCloseDate"
              type="date"
              value={formData.expectedCloseDate}
              onChange={handleFormChange}
            />
            <Select
              label="Assigned Salesperson"
              name="assignedSalesperson"
              value={formData.assignedSalesperson}
              onChange={handleFormChange}
              options={users.map((u) => u.name)}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Deals;
