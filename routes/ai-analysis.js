const express = require('express');
const router = express.Router();

// Store AI analysis results (in production, use a database)
const aiAnalysisHistory = [];

// POST /api/ai-analysis - Store AI camera scan results
router.post('/ai-analysis', async (req, res) => {
  try {
    const {
      userId,
      location,
      analysisResult,
      timestamp,
      safetyScore,
      recommendations
    } = req.body;

    // Validate required fields
    if (!userId || !analysisResult || !safetyScore) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, analysisResult, safetyScore'
      });
    }

    // Create analysis record
    const analysisRecord = {
      id: Date.now().toString(),
      userId,
      location: location || null,
      analysisResult,
      safetyScore,
      recommendations: recommendations || [],
      timestamp: timestamp || new Date().toISOString(),
      status: safetyScore < 60 ? 'low_safety' : safetyScore < 80 ? 'moderate_safety' : 'safe',
      reviewed: false
    };

    // Store the analysis
    aiAnalysisHistory.push(analysisRecord);

    // If safety score is low, trigger immediate alert
    if (safetyScore < 60) {
      // Emit real-time alert to security team
      const io = req.app.get('io');
      if (io) {
        io.emit('ai_safety_alert', {
          type: 'low_safety_score',
          userId,
          location,
          safetyScore,
          recommendations,
          timestamp: analysisRecord.timestamp
        });
      }

      // Log for security monitoring
      console.log(`🚨 AI Safety Alert: User ${userId} detected low safety environment (Score: ${safetyScore})`);
    }

    res.json({
      success: true,
      message: 'AI analysis stored successfully',
      data: {
        analysisId: analysisRecord.id,
        status: analysisRecord.status,
        alertTriggered: safetyScore < 60
      }
    });

  } catch (error) {
    console.error('Error storing AI analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to store AI analysis',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/ai-analysis - Get AI analysis history (for security dashboard)
router.get('/ai-analysis', (req, res) => {
  try {
    const { userId, status, limit = 50 } = req.query;

    let filteredAnalyses = aiAnalysisHistory;

    // Filter by user if specified
    if (userId) {
      filteredAnalyses = filteredAnalyses.filter(analysis => analysis.userId === userId);
    }

    // Filter by status if specified
    if (status) {
      filteredAnalyses = filteredAnalyses.filter(analysis => analysis.status === status);
    }

    // Sort by timestamp (newest first) and limit results
    filteredAnalyses = filteredAnalyses
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: {
        analyses: filteredAnalyses,
        total: filteredAnalyses.length,
        lowSafetyCount: aiAnalysisHistory.filter(a => a.status === 'low_safety').length
      }
    });

  } catch (error) {
    console.error('Error fetching AI analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch AI analysis',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/ai-analysis/stats - Get AI analysis statistics
router.get('/ai-analysis/stats', (req, res) => {
  try {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentAnalyses = aiAnalysisHistory.filter(
      analysis => new Date(analysis.timestamp) >= last24Hours
    );

    const weeklyAnalyses = aiAnalysisHistory.filter(
      analysis => new Date(analysis.timestamp) >= last7Days
    );

    const stats = {
      total: aiAnalysisHistory.length,
      last24Hours: recentAnalyses.length,
      last7Days: weeklyAnalyses.length,
      lowSafetyCount: aiAnalysisHistory.filter(a => a.status === 'low_safety').length,
      averageSafetyScore: aiAnalysisHistory.length > 0 
        ? Math.round(aiAnalysisHistory.reduce((sum, a) => sum + a.safetyScore, 0) / aiAnalysisHistory.length)
        : 0,
      topConcerns: getTopConcerns(aiAnalysisHistory),
      recentAlerts: aiAnalysisHistory
        .filter(a => a.status === 'low_safety')
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5)
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching AI analysis stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch AI analysis statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Helper function to get top safety concerns
function getTopConcerns(analyses) {
  const concernCounts = {};
  
  analyses.forEach(analysis => {
    analysis.recommendations.forEach(rec => {
      // Extract key concern from recommendation
      if (rec.includes('dark')) concernCounts.dark = (concernCounts.dark || 0) + 1;
      if (rec.includes('dim')) concernCounts.dim = (concernCounts.dim || 0) + 1;
      if (rec.includes('corridor')) concernCounts.corridor = (concernCounts.corridor || 0) + 1;
      if (rec.includes('isolated')) concernCounts.isolated = (concernCounts.isolated || 0) + 1;
    });
  });

  return Object.entries(concernCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([concern, count]) => ({ concern, count }));
}

module.exports = router;
