import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  FiCalendar,
  FiTrendingUp,
  FiUsers,
  FiAward,
  FiBarChart2,
  FiPieChart,
  FiDownload,
} from 'react-icons/fi';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import Button from '../../components/Button/Button';
import { formatCurrency, formatIndianCompact } from '../../utils/helpers';
import './Reports.css';

// Mock datasets for reports
const salesQuarterlyData = [
  { quarter: 'Q1 2024', wonDeals: 320000, lostDeals: 85000 },
  { quarter: 'Q2 2024', wonDeals: 460000, lostDeals: 92000 },
  { quarter: 'Q3 2024', wonDeals: 580000, lostDeals: 74000 },
  { quarter: 'Q4 2024 (Proj)', wonDeals: 710000, lostDeals: 65000 },
];

const customerAcquisitionSources = [
  { name: 'Website Form', value: 42, color: '#4f46e5' },
  { name: 'LinkedIn Ads', value: 28, color: '#06b6d4' },
  { name: 'Partner Referrals', value: 18, color: '#10b981' },
  { name: 'Direct Inbound', value: 12, color: '#f59e0b' },
];

const employeePerformance = [
  { name: 'Sarah Jenkins', closedWon: 345000, dealsCount: 14, quotaAttainment: 128 },
  { name: 'David Chen', closedWon: 295000, dealsCount: 11, quotaAttainment: 112 },
  { name: 'Marcus Vance', closedWon: 189000, dealsCount: 8, quotaAttainment: 94 },
  { name: 'Alex Morgan', closedWon: 120000, dealsCount: 5, quotaAttainment: 100 },
];

const conversionCohortData = [
  { step: 'Impressions', count: 18500 },
  { step: 'Leads Generated', count: 2400 },
  { step: 'Sales Qualified', count: 860 },
  { step: 'Proposals Sent', count: 320 },
  { step: 'Won Contracts', count: 142 },
];

const Reports = () => {
  const [activeReport, setActiveReport] = useState('sales'); // 'sales' | 'customers' | 'leads' | 'revenue' | 'employees' | 'conversion'
  const [dateFilter, setDateFilter] = useState('This Month');

  const reportTabs = [
    { id: 'sales', label: 'Sales Report', icon: FiTrendingUp },
    { id: 'customers', label: 'Customer Retention', icon: FiUsers },
    { id: 'employees', label: 'Rep Leaderboard', icon: FiAward },
    { id: 'conversion', label: 'Conversion Funnel', icon: FiBarChart2 },
  ];

  return (
    <div className="page-container reports-page fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Executive Analytics & Reports</h1>
          <p className="page-subtitle">
            Comprehensive business intelligence, sales quotas, and acquisition velocity
          </p>
        </div>

        <div className="page-actions">
          <div className="date-filter-pill">
            <FiCalendar className="filter-icon" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="reports-date-select"
            >
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
              <option value="This Year">This Year</option>
              <option value="Custom Date Range">Custom Date Range</option>
            </select>
          </div>

          <Button
            variant="secondary"
            icon={FiDownload}
            onClick={() => window.print()}
          >
            Export PDF / Print
          </Button>
        </div>
      </div>

      {/* Report Switcher Tabs */}
      <div className="reports-tab-bar">
        {reportTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`report-tab-btn ${activeReport === tab.id ? 'active' : ''}`}
              onClick={() => setActiveReport(tab.id)}
            >
              <Icon /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* SALES REPORT VIEW */}
      {activeReport === 'sales' && (
        <div className="report-content-grid">
          <div className="card report-chart-card">
            <div className="chart-header">
              <div>
                <h3 className="chart-title">Won Opportunities vs Lost Deals</h3>
                <p className="chart-subtitle">Quarterly pipeline conversion performance</p>
              </div>
              <span className="badge badge-success">82% Win Ratio</span>
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={salesQuarterlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis dataKey="quarter" stroke="var(--text-muted)" />
                  <YAxis stroke="var(--text-muted)" tickFormatter={(v) => formatIndianCompact(v)} />
                  <Tooltip
                    formatter={(val) => [formatCurrency(val), '']}
                    contentStyle={{
                      backgroundColor: 'var(--card-bg)',
                      borderColor: 'var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="wonDeals" name="Closed Won (₹)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="lostDeals" name="Closed Lost (₹)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card report-summary-card">
            <h3 className="summary-title">Sales Metrics Summary</h3>
            <div className="metrics-list">
              <div className="metric-row">
                <span>Average Deal Size</span>
                <strong>{formatCurrency(84500)}</strong>
              </div>
              <div className="metric-row">
                <span>Average Sales Cycle</span>
                <strong>38 Days</strong>
              </div>
              <div className="metric-row">
                <span>Pipeline Velocity</span>
                <strong className="text-success">+18.5% YoY</strong>
              </div>
              <div className="metric-row">
                <span>Total Booked Revenue</span>
                <strong className="text-primary">{formatCurrency(1360000)}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMERS / ACQUISITION VIEW */}
      {activeReport === 'customers' && (
        <div className="report-content-grid">
          <div className="card report-chart-card">
            <div className="chart-header">
              <div>
                <h3 className="chart-title">Customer Acquisition by Channel</h3>
                <p className="chart-subtitle">Primary channels driving enterprise contract wins</p>
              </div>
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={340}>
                <PieChart>
                  <Pie
                    data={customerAcquisitionSources}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={120}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {customerAcquisitionSources.map((entry, index) => (
                      <Cell key={`source-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [`${val}%`, 'Share']}
                    contentStyle={{
                      backgroundColor: 'var(--card-bg)',
                      borderColor: 'var(--border-color)',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card report-summary-card">
            <h3 className="summary-title">Acquisition Highlights</h3>
            <div className="metrics-list">
              <div className="metric-row">
                <span>Customer Acquisition Cost (CAC)</span>
                <strong>{formatCurrency(4250)}</strong>
              </div>
              <div className="metric-row">
                <span>Lifetime Value (LTV)</span>
                <strong className="text-success">{formatCurrency(168000)}</strong>
              </div>
              <div className="metric-row">
                <span>LTV to CAC Ratio</span>
                <strong className="text-primary">39.5x (Exceptional)</strong>
              </div>
              <div className="metric-row">
                <span>Annual Net Churn Rate</span>
                <strong>1.8%</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REP LEADERBOARD VIEW */}
      {activeReport === 'employees' && (
        <div className="card leaderboard-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Sales Representative Quota Attainment</h3>
              <p className="chart-subtitle">Individual team performance against monthly revenue quotas</p>
            </div>
          </div>

          <div className="leaderboard-table-wrap">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Representative</th>
                  <th>Closed Won (₹)</th>
                  <th>Deals Won</th>
                  <th>Quota Attainment</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {employeePerformance.map((rep, idx) => (
                  <tr key={rep.name}>
                    <td>
                      <span className={`rank-badge ${idx === 0 ? 'top' : ''}`}>
                        #{idx + 1}
                      </span>
                    </td>
                    <td><strong>{rep.name}</strong></td>
                    <td>{formatCurrency(rep.closedWon)}</td>
                    <td>{rep.dealsCount} deals</td>
                    <td>
                      <div className="attainment-bar-wrap">
                        <div className="attainment-bar-track">
                          <div
                            className="attainment-bar-fill"
                            style={{
                              width: `${Math.min(rep.quotaAttainment, 100)}%`,
                              backgroundColor:
                                rep.quotaAttainment >= 100
                                  ? 'var(--success)'
                                  : 'var(--warning)',
                            }}
                          />
                        </div>
                        <span className="attainment-val">{rep.quotaAttainment}%</span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          rep.quotaAttainment >= 100
                            ? 'badge-success'
                            : 'badge-warning'
                        }`}
                      >
                        {rep.quotaAttainment >= 100 ? 'Quota Exceeded' : 'On Track'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONVERSION FUNNEL VIEW */}
      {activeReport === 'conversion' && (
        <div className="card report-chart-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Full Funnel Conversion Progression</h3>
              <p className="chart-subtitle">Lead volume decay across the sales pipeline</p>
            </div>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={conversionCohortData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="step" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                  }}
                />
                <Bar dataKey="count" name="Users / Leads" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
