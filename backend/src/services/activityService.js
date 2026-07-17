const ActivityModel = require('../models/activityModel');

const ActivityService = {
  getTimeline(userId) {
    return ActivityModel.findAllByUserId(userId);
  }
};

module.exports = ActivityService;
