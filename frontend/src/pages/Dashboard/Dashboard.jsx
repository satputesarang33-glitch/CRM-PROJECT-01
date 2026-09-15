import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  FiUsers,
  FiTarget,
  FiDollarSign,
  FiTrendingUp,
  FiCheckSquare,
  FiLifeBuoy,
  FiUserPlus,
  FiPercent,
  FiArrowUpRight,
  FiCalendar,
  FiPlus,
} from 'react-icons/fi';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import DashboardCard from '../../components/DashboardCard/DashboardCard';
import Button from '../../components/Button/Button';
import { formatCurrency, formatIndianCompact, formatDate, getStatusBadgeClass } from '../../utils/helpers';
import './Dashboard.css';

// Mock chart data
const revenueMonthlyData = [
  { month: 'Jan', revenue: 42000, target: 40000 },
  { month: 'Feb', revenue: 48000, target: 45000 },
  { month: 'Mar', revenue: 61000, target: 50000 },
  { month: 'Apr', revenue: 58000, target: 55000 },
  { month: 'May', revenue: 74000, target: 60000 },
  { month: 'Jun', revenue: 89000, target: 70000 },
  { month: 'Jul', revenue: 95000, target: 75000 },
];

const customerGrowthData = [
  { month: 'Jan', customers: 24, churn: 2 },
  { month: 'Feb', customers: 38, churn: 1 },
  { month: 'Mar', customers: 56, churn: 3 },
  { month: 'Apr', customers: 72, churn: 4 },
  { month: 'May', customers: 98, churn: 2 },
  { month: 'Jun', customers: 125, churn: 5 },
  { month: 'Jul', customers: 154, churn: 3 },
];

const leadConversionData = [
  { stage: 'Website Visitors', count: 4200 },
  { stage: 'MQLs', count: 860 },
  { stage: 'SQLs', count: 340 },
  { stage: 'Opportunities', count: 145 },
  { stage: 'Won Customers', count: 68 },
];

const pipelineDistribution = [
  { name: 'New', value: 65000, color: '#64748b' },
  { name: 'Qualified', value: 125000, color: '#3b82f6' },
  { name: 'Proposal', value: 130000, color: '#f59e0b' },
  { name: 'Negotiation', value: 110000, color: '#8b5cf6' },
  { name: 'Won', value: 210000, color: '#10b981' },
];

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const customers = useSelector((state) => state.customers.customers);
  const leads = useSelector((state) => state.leads.leads);
  const deals = useSelector((state) => state.deals.deals);
  const tasks = useSelector((state) => state.tasks.tasks);
  const tickets = useSelector((state) => state.tickets.tickets);

  const [dateRange, setDateRange] = useState('This Month');
  const [liveStats, setLiveStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        if (res.data?.data) {
          setLiveStats(res.data.data);
        }
      } catch (err) {
        console.warn('Live stats fetch error:', err.message);
      }
    };
    fetchStats();
  }, []);

  // Compute live metrics from state or backend
  const totalCustomers = liveStats?.totalCustomers ?? customers.length;
  const totalLeads = liveStats?.totalLeads ?? leads.length;
  const totalDeals = liveStats?.totalDeals ?? deals.length;
  const totalRevenue =
    liveStats?.totalRevenue ??
    deals
      .filter((d) => d.stage === 'Won')
      .reduce((acc, curr) => acc + (curr.value || 0), 0);
  const pendingTasks = liveStats?.pendingTasks ?? tasks.filter((t) => t.status !== 'Completed').length;
  const openTickets = liveStats?.openTickets ?? tickets.filter((t) => t.status === 'Open').length;
  const newCustomers = liveStats?.newCustomers ?? customers.filter(
    (c) => new Date(c.createdDate) >= new Date('2024-04-01')
  ).length;
  const conversionRate = liveStats?.conversionRate ?? (totalLeads > 0 ? ((leads.filter((l) => l.status === 'Converted').length / totalLeads) * 100).toFixed(1) : 0);

  return (
    <div className="page-container dashboard-page fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Sales & Operations Dashboard</h1>
          <p className="page-subtitle">
            Welcome back, <strong>{user?.name || 'Alex'}</strong>. Here is your enterprise pipeline overview.
          </p>
        </div>

        <div className="page-actions">
          <div className="date-filter-pill">
            <FiCalendar className="filter-icon" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="dashboard-date-select"
            >
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
              <option value="This Quarter">This Quarter</option>
              <option value="This Year">This Year</option>
            </select>
          </div>

          <Link to="/leads">
            <Button variant="primary" icon={FiPlus}>
              New Lead
            </Button>
          </Link>
        </div>
      </div>

      {/* 8 Metric KPI Cards */}
      <section className="dashboard-cards-grid">
        <DashboardCard
          title="Total Customers"
          value={totalCustomers}
          icon={FiUsers}
          trend="+14.2%"
          trendType="up"
          trendLabel="vs last month"
          color="primary"
        />
        <DashboardCard
          title="Total Leads"
          value={totalLeads}
          icon={FiTarget}
          trend="+8.5%"
          trendType="up"
          trendLabel="vs last month"
          color="info"
        />
        <DashboardCard
          title="Total Deals"
          value={totalDeals}
          icon={FiDollarSign}
          trend="+18.4%"
          trendType="up"
          trendLabel="vs last month"
          color="purple"
        />
        <DashboardCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue || 210000)}
          icon={FiTrendingUp}
          trend="+22.8%"
          trendType="up"
          trendLabel="vs target"
          color="success"
        />
        <DashboardCard
          title="Pending Tasks"
          value={pendingTasks}
          icon={FiCheckSquare}
          trend={pendingTasks > 3 ? 'Action needed' : 'On schedule'}
          trendType={pendingTasks > 3 ? 'down' : 'up'}
          trendLabel=""
          color="warning"
        />
        <DashboardCard
          title="Open Tickets"
          value={openTickets}
          icon={FiLifeBuoy}
          trend={openTickets === 0 ? 'Clear queue' : `${openTickets} unresolved`}
          trendType={openTickets > 0 ? 'down' : 'up'}
          trendLabel=""
          color="danger"
        />
        <DashboardCard
          title="New Customers"
          value={newCustomers}
          icon={FiUserPlus}
          trend="+5 this month"
          trendType="up"
          trendLabel=""
          color="primary"
        />
        <DashboardCard
          title="Conversion Rate"
          value={`${conversionRate}%`}
          icon={FiPercent}
          trend="+3.4%"
          trendType="up"
          trendLabel="industry benchmark: 12%"
          color="success"
        />
      </section>

      {/* 4 Recharts Visualizations */}
      <section className="dashboard-charts-grid">
        {/* Chart 1: Revenue Chart */}
        <div className="card chart-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Revenue Trajectory vs Target</h3>
              <p className="chart-subtitle">Monthly recognized revenue and forecast</p>
            </div>
            <span className="badge badge-success">+24.5% Annual YoY</span>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={290}>
              <AreaChart data={revenueMonthlyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
                <YAxis
                  stroke="var(--text-muted)"
                  fontSize={12}
                  tickFormatter={(val) => formatIndianCompact(val)}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(value), '']}
                  contentStyle={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Recognized Revenue"
                  stroke="var(--primary)"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#revenueGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="target"
                  name="Forecast Target"
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  fill="transparent"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Customer Growth Chart */}
        <div className="card chart-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Customer Growth & Retention</h3>
              <p className="chart-subtitle">Active subscription expansion</p>
            </div>
            <span className="badge badge-primary">Steady Expansion</span>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={290}>
              <LineChart data={customerGrowthData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="customers"
                  name="Active Customers"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#10b981' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="churn"
                  name="Churned Accounts"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#ef4444' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Lead Conversion Funnel */}
        <div className="card chart-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Lead Conversion Funnel</h3>
              <p className="chart-subtitle">Stage transition velocity</p>
            </div>
            <span className="badge badge-info">16.2% Qualified Rate</span>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={290}>
              <BarChart
                data={leadConversionData}
                layout="vertical"
                margin={{ top: 10, right: 20, left: 40, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
                <XAxis type="number" stroke="var(--text-muted)" fontSize={12} />
                <YAxis
                  dataKey="stage"
                  type="category"
                  stroke="var(--text-muted)"
                  fontSize={11}
                  width={90}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                  }}
                />
                <Bar dataKey="count" name="Volume" fill="var(--primary-500)" radius={[0, 6, 6, 0]}>
                  {leadConversionData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#10b981'][index % 5]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Sales Pipeline Distribution */}
        <div className="card chart-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Sales Pipeline by Stage</h3>
              <p className="chart-subtitle">Weighted monetary volume per stage</p>
            </div>
            <span className="badge badge-purple">{formatCurrency(540000)} Pipeline</span>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={290}>
              <PieChart>
                <Pie
                  data={pipelineDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pipelineDistribution.map((entry, index) => (
                    <Cell key={`pipe-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => [formatCurrency(val), 'Value']}
                  contentStyle={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                  }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Recent Deals and Urgent Tasks Section */}
      <section className="dashboard-bottom-grid">
        {/* Recent Deals Widget */}
        <div className="card recent-deals-card">
          <div className="widget-header">
            <div>
              <h3 className="widget-title">Active High-Value Deals</h3>
              <p className="widget-subtitle">Pipeline opportunities requiring closing action</p>
            </div>
            <Link to="/deals" className="widget-link">
              View Pipeline <FiArrowUpRight />
            </Link>
          </div>

          <div className="deals-mini-list">
            {deals.slice(0, 4).map((deal) => (
              <div key={deal.id} className="deal-mini-item">
                <div className="deal-mini-info">
                  <h4 className="deal-mini-name">{deal.name}</h4>
                  <span className="deal-mini-customer">{deal.customer}</span>
                </div>
                <div className="deal-mini-status">
                  <span className={`badge ${getStatusBadgeClass(deal.stage)}`}>
                    {deal.stage}
                  </span>
                  <span className="deal-mini-val">{formatCurrency(deal.value)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Action Items */}
        <div className="card recent-tasks-card">
          <div className="widget-header">
            <div>
              <h3 className="widget-title">Priority Team Tasks</h3>
              <p className="widget-subtitle">Action items due this week</p>
            </div>
            <Link to="/tasks" className="widget-link">
              All Tasks <FiArrowUpRight />
            </Link>
          </div>

          <div className="tasks-mini-list">
            {tasks.slice(0, 4).map((task) => (
              <div key={task.id} className="task-mini-item">
                <div className="task-mini-left">
                  <div className={`status-dot ${task.status === 'Completed' ? 'success' : 'warning'}`} />
                  <div>
                    <p className={`task-mini-title ${task.status === 'Completed' ? 'task-done' : ''}`}>
                      {task.title}
                    </p>
                    <span className="task-mini-due">Due: {formatDate(task.dueDate)}</span>
                  </div>
                </div>
                <span className="badge badge-neutral">{task.assignedUser}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
