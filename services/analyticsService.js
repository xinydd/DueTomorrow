const mongoose = require('mongoose');
const SOSAlert = require('../models/SOSAlert');
const IncidentReport = require('../models/IncidentReport');
const Log = require('../models/Log');

class AnalyticsService {
  // Check if MongoDB is connected
  isMongoConnected() {
    return mongoose.connection.readyState === 1;
  }

  // Get analytics summary
  async getSummary() {
    try {
      if (!this.isMongoConnected()) {
        return {
          totalSOSAlerts: 0,
          totalReports: 0,
          resolvedPercentage: 0,
          averageResponseTime: 0,
          activeAlerts: 0,
          openReports: 0,
          last24Hours: {
            sosAlerts: 0,
            reports: 0
          }
        };
      }

      const now = new Date();
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Get SOS alerts data
      const sosStats = await SOSAlert.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            resolved: {
              $sum: {
                $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0]
              }
            },
            active: {
              $sum: {
                $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
              }
            },
            last24Hours: {
              $sum: {
                $cond: [
                  { $gte: ['$timestamp', last24Hours] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]);

      // Get incident reports data
      const reportStats = await IncidentReport.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            closed: {
              $sum: {
                $cond: [{ $eq: ['$status', 'closed'] }, 1, 0]
              }
            },
            open: {
              $sum: {
                $cond: [{ $eq: ['$status', 'open'] }, 1, 0]
              }
            },
            last24Hours: {
              $sum: {
                $cond: [
                  { $gte: ['$timestamp', last24Hours] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]);

      // Calculate average response time for resolved SOS alerts
      const responseTimeStats = await SOSAlert.aggregate([
        {
          $match: {
            status: 'resolved',
            resolvedAt: { $exists: true }
          }
        },
        {
          $project: {
            responseTime: {
              $subtract: ['$resolvedAt', '$timestamp']
            }
          }
        },
        {
          $group: {
            _id: null,
            avgResponseTime: { $avg: '$responseTime' }
          }
        }
      ]);

      const sosData = sosStats[0] || { total: 0, resolved: 0, active: 0, last24Hours: 0 };
      const reportData = reportStats[0] || { total: 0, closed: 0, open: 0, last24Hours: 0 };
      const responseTimeData = responseTimeStats[0] || { avgResponseTime: 0 };

      const resolvedPercentage = sosData.total > 0 
        ? Math.round((sosData.resolved / sosData.total) * 100) 
        : 0;

      const averageResponseTime = responseTimeData.avgResponseTime 
        ? Math.round(responseTimeData.avgResponseTime / (1000 * 60)) // Convert to minutes
        : 0;

      return {
        totalSOSAlerts: sosData.total,
        totalReports: reportData.total,
        resolvedPercentage,
        averageResponseTime,
        activeAlerts: sosData.active,
        openReports: reportData.open,
        last24Hours: {
          sosAlerts: sosData.last24Hours,
          reports: reportData.last24Hours
        }
      };
    } catch (error) {
      console.error('Error getting analytics summary:', error);
      return {
        totalSOSAlerts: 0,
        totalReports: 0,
        resolvedPercentage: 0,
        averageResponseTime: 0,
        activeAlerts: 0,
        openReports: 0,
        last24Hours: {
          sosAlerts: 0,
          reports: 0
        }
      };
    }
  }

  // Get heatmap data for incidents
  async getHeatmapData(days = 30) {
    try {
      if (!this.isMongoConnected()) {
        return [];
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get SOS alerts with location data
      const sosHeatmap = await SOSAlert.aggregate([
        {
          $match: {
            timestamp: { $gte: startDate },
            location: { $exists: true }
          }
        },
        {
          $group: {
            _id: {
              lat: { $round: ['$location.lat', 2] },
              lng: { $round: ['$location.lng', 2] }
            },
            count: { $sum: 1 },
            type: { $first: 'sos' }
          }
        }
      ]);

      // Get incident reports with location data
      const reportHeatmap = await IncidentReport.aggregate([
        {
          $match: {
            timestamp: { $gte: startDate },
            location: { $exists: true }
          }
        },
        {
          $group: {
            _id: {
              lat: { $round: ['$location.lat', 2] },
              lng: { $round: ['$location.lng', 2] }
            },
            count: { $sum: 1 },
            type: { $first: 'report' }
          }
        }
      ]);

      // Combine and format data
      const heatmapData = [...sosHeatmap, ...reportHeatmap].map(item => ({
        lat: item._id.lat,
        lng: item._id.lng,
        count: item.count,
        type: item.type
      }));

      return heatmapData;
    } catch (error) {
      console.error('Error getting heatmap data:', error);
      return [];
    }
  }

  // Get trends over time
  async getTrends(days = 7) {
    try {
      if (!this.isMongoConnected()) {
        return [];
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const trends = await Log.aggregate([
        {
          $match: {
            timestamp: { $gte: startDate },
            action: { $in: ['sos_triggered', 'report_submitted'] }
          }
        },
        {
          $group: {
            _id: {
              date: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: '$timestamp'
                }
              },
              action: '$action'
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: '$_id.date',
            sosAlerts: {
              $sum: {
                $cond: [{ $eq: ['$_id.action', 'sos_triggered'] }, '$count', 0]
              }
            },
            reports: {
              $sum: {
                $cond: [{ $eq: ['$_id.action', 'report_submitted'] }, '$count', 0]
              }
            }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);

      return trends;
    } catch (error) {
      console.error('Error getting trends:', error);
      return [];
    }
  }
}

module.exports = new AnalyticsService();
