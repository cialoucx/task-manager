const ActivityService = require('../services/activityService');

function getTimeline(req, res, next) {
  try {
    const userId = req.user.id;
    const timeline = ActivityService.getTimeline(userId);
    res.json({ data: timeline, count: timeline.length });
  } catch (err) {
    next(err);
  }
}

module.exports = { getTimeline };
