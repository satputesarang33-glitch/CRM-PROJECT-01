import React from 'react';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import './DashboardCard.css';

const DashboardCard = ({
  title,
  value,
  icon: Icon,
  trend, // e.g. "+12.5%" or "-3.2%"
  trendType = 'up', // 'up' | 'down' | 'neutral'
  trendLabel = 'vs last month',
  color = 'primary', // 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple'
  subtitle,
  onClick,
}) => {
  return (
    <div
      className={`dashboard-card card-color-${color} ${onClick ? 'clickable-card' : ''}`}
      onClick={onClick}
    >
      <div className="card-top">
        <div className="card-info">
          <span className="card-title">{title}</span>
          <h3 className="card-value">{value}</h3>
        </div>
        {Icon && (
          <div className="card-icon-wrap">
            <Icon className="card-icon" />
          </div>
        )}
      </div>

      {(trend || subtitle) && (
        <div className="card-bottom">
          {trend && (
            <span className={`card-trend trend-${trendType}`}>
              {trendType === 'up' ? (
                <FiTrendingUp />
              ) : trendType === 'down' ? (
                <FiTrendingDown />
              ) : null}
              {trend}
            </span>
          )}
          {trendLabel && <span className="card-trend-label">{trendLabel}</span>}
          {subtitle && !trend && <span className="card-subtitle">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};

export default DashboardCard;
