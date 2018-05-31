'use strict';

var https = require('https');

var templates = require('./templates.js');

module.exports = function (host, apiKey, accountKey) {

  /**
   * Performs an https request on the WFM API
   * @param  {String}   body   Request body
   * @param  {String}   path   Request path
   * @param  {String}   method HTTP Verb
   * @param  {Function} done   Called with (err, data) where err is null if no error occurred
   */
  function makeApiRequest(body, path, method, done) {

    var options = {
      hostname: host,
      path: path + '?apiKey=' + apiKey + '&accountKey=' + accountKey,
      method: method
    };

    var req = https.request(options, function (res) {
      if (res.statusCode !== 200) {
        done(new Error('WFM ' + options.method + ' Failed - ' + res.statusCode));
      } else {
        var data = '';

        res.on('data', function (chunk) {
          data += chunk;
        });

        res.on('end', function () {
          done(null, data);
        });
      }
    });

    if (body) {
      req.write(body);
    }
    req.end();

    req.on('error', function (e) {
      done(e);
    });

  }

  return {

    /**
     * Returns a timesheet  for particular id
     * @param  {String}   id   Existing WFM Timesheet ID to get
     * @param  {Function} done Callback that will be called with (err, responseData)
     */
    getTimesheet: function (id, done) {
      makeApiRequest(undefined, '/time.api/get' + id, 'GET', done);
    },


    /**
     * Posts a new Timesheet to Workflow Max
     * @param  {String}   jobId   WFM Job ID
     * @param  {String}   taskId  WFM Task ID
     * @param  {String}   staffId WFM Staff ID
     * @param  {[type]}   date    String of date in unix format %Y%m%d e.g. 20081030
     * @param  {Number}   minutes Total minutes in Timesheet
     * @param  {String}   note    Description / comment
     * @param  {Function} done    Callback that will be called with (err, responseData)
     */
    createTimesheet: function (obj, done) {
      var body = templates.timesheets.create({
        jobId: obj.jobId,
        taskId: obj.taskId,
        staffId: obj.staffId,
        date: obj.date,
        minutes: obj.minutes,
        note: obj.note
      });

      makeApiRequest(body, '/time.api/add', 'POST', done);
    },

    /**
     * Puts a Timesheet object to an existing Workflow Max Timesheet
     * @param  {String}   id      Existing WFM Timesheet ID to perform the update against
     * @param  {String}   jobId   WFM Job ID
     * @param  {String}   taskId  WFM Task ID
     * @param  {String}   staffId WFM Staff ID
     * @param  {[type]}   date    String of date in unix format %Y%m%d e.g. 20081030
     * @param  {Number}   minutes Total minutes in Timesheet
     * @param  {String}   note    Description / comment
     * @param  {Function} done    Callback that will be called with (err, responseData)
     */
    updateTimesheet: function (obj, done) {
      var body = templates.timesheets.update({
        id: obj.id,
        jobId: obj.jobId,
        taskId: obj.taskId,
        staffId: obj.staffId,
        date: obj.date,
        minutes: obj.minutes,
        note: obj.note
      });

      makeApiRequest(body, '/time.api/update', 'PUT', done);
    },

    /**
     * Deletes an existing Workflow Max Timesheet
     * @param  {String}   id   Existing WFM Timesheet ID to delete
     * @param  {Function} done Callback that will be called with (err, responseData)
     */
    deleteTimesheet: function (id, done) {
      makeApiRequest(undefined, '/time.api/delete/' + id, 'DELETE', done);
    },

    /**
     * Posts a new JobTask object to Workflow Max
     * taskId refers to a system wide Task e.g. programming - as opposed to a
     * JobTask which is a per Job Task with a Task type
     *
     * Example:
     *
     * Creating a new JobTask 'Fix bug in map' must have a Task of programming
     *
     * @param  {String}   jobId            WFM Job ID
     * @param  {String}   taskId           WFM Task ID - system wide Task type
     * @param  {String}   description      Description of new JobTask
     * @param  {Number}   estimatedMinutes Estimated minutes
     * @param  {Function} done             Callback that will be called with (err, responseData)
     */
    createTask: function (jobId, taskId, description, estimatedMinutes, done) {
      var body = templates.task.create({
        jobId: jobId,
        taskId: taskId,
        description: description,
        estimatedMinutes: estimatedMinutes
      });

      makeApiRequest(body, '/job.api/task', 'POST', done);
    },

    /**
     * Returns a list of current jobs
     * @param  {Function} done Callback that will be called with (err, responseData)
     */
    getCurrentJobs: function (done) {
      makeApiRequest(undefined, '/job.api/tasks', 'GET', done);
    },

    /**
     * Returns a list of tasks for particular job
     * @param  {String}   id   Existing WFM Timesheet ID to delete
     * @param  {Function} done Callback that will be called with (err, responseData)
     */
    getTask: function (id, done) {
      makeApiRequest(undefined, '/task.api/get' + id, 'GET', done);
    },

    /**
     * Returns a list of tasks for particular job
     * @param  {String}   id   Existing WFM Timesheet ID to delete
     * @param  {Function} done Callback that will be called with (err, responseData)
     */
    getStaffMember: function (id, done) {
      makeApiRequest(undefined, '/staff.api/get' + id, 'GET', done);
    },

    /**
     * Get Staff
     * * @param  {Function} done Callback that will be called with (err, responseData)
     */
    getStaff: function (done) {
      makeApiRequest(undefined, '/staff.api/list/', 'GET', done)
    }
  };
};
