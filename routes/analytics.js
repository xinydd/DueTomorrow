const express = require('express');
const router = express.Router();
const analyticsService = require('../services/analyticsService');
const { authenticateToken, checkRole } = require('../middleware/auth');
const { generalLimiter } = require('../middleware/rateLimiter');

// Apply rate limiting to all analytics routes
router.use(generalLimiter);

// Get analytics summary - accessible by staff and security
router.get('/summary', authenticateToken, checkRole(['staff', 'security']), async (req, res) => {
  try {
    const summary = await analyticsService.getSummary();
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Analytics summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics summary'
    });
  }
});

// Get heatmap data - accessible by staff and security
router.get('/heatmap', authenticateToken, checkRole(['staff', 'security']), async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const heatmapData = await analyticsService.getHeatmapData(days);
    
    res.json({
      success: true,
      data: heatmapData
    });
  } catch (error) {
    console.error('Heatmap data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch heatmap data'
    });
  }
});

// Get trends over time - accessible by staff and security
router.get('/trends', authenticateToken, checkRole(['staff', 'security']), async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const trends = await analyticsService.getTrends(days);
    
    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    console.error('Trends data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trends data'
    });
  }
});

module.exports = router;
