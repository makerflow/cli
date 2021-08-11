const utcToZonedTime = require('date-fns-tz/utcToZonedTime');
const formatDistanceToNowStrict = require('date-fns/formatDistanceToNowStrict');
const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const _ = require('lodash');
const pluralize = require('pluralize')

export default class TodoUtils {

    static buildTimingDescription(events) {
        let createdTimes = events.map(e => e.created_at);
        let latestTime = _.max(createdTimes);
        let latestTimeDescription = formatDistanceToNowStrict(utcToZonedTime(latestTime, timeZone));
        return ` | ${latestTimeDescription}`;
    }

    static getSlackSourceType(todo) {
        let sourceType = '';
        if (todo.type === 'slack_channel') {
            sourceType = 'channel';
        }
        if (todo.type === 'slack_im') {
            sourceType = 'DM';
        }
        if (todo.type === 'slack_mpim') {
            sourceType = 'group DM';
        }
        return sourceType;
    }

    static handleSlackTodo(todo) {
        let thisTodoEvents = todo.events;
        let eventCount = thisTodoEvents.length;
        const sourceCount = new Set(thisTodoEvents.map(e => e.channel_id)).size;
        let sourceType = TodoUtils.getSlackSourceType(todo);
        todo.description = `${pluralize('message', eventCount, true)} in ${sourceCount === 1 ? 'a ' : 'multiple '}${pluralize(sourceType, sourceCount)}`;
        let timingDescription = TodoUtils.buildTimingDescription(thisTodoEvents);
        if (sourceCount > 1) {
            todo.sourceDescription = `${todo.group} | ${pluralize(sourceType, sourceCount, true)}`;
        } else {
            todo.sourceDescription = `${todo.group}`;
        }
        if ( todo.type === 'slack_channel') {
            todo.sourceDescription += ` | ${_.uniq(thisTodoEvents.map(e => `#${e.channel_name}`)).join(", ")}`;
        }
        todo.sourceDescription += timingDescription
    }

    static handlePullRequestTodos(todo) {
        const pr = todo.pr;
        todo.group = `${pr.repository_uuid}_${pr.pullrequest_id}`
        todo.description = `PR #${pr.pullrequest_id}: ${pr.pullrequest_title}`;
        todo.link = pr.link;
        todo.sourceDescription = `${pr.repository_name} | ${pluralize("comments", todo.meta.comments, true)} | ${pluralize("approvals", todo.meta.approvals, true)}`;
    }

    static handleCustomTask(todo) {
        const task = todo.task;
        todo.group = `makerflow_${task.title}`;
        todo.description = task.title;
        todo.sourceDescription = null;
    }

    static enrichTodo(todo) {
        if (typeof todo === "undefined" || todo === null) return null;
        todo.done = false;
        if (todo.type.indexOf("slack") !== -1) {
            TodoUtils.handleSlackTodo(todo);
        }
        if (todo.type === "bitbucket") {
            TodoUtils.handlePullRequestTodos(todo);
        }
        if (todo.type === "github") {
            TodoUtils.handlePullRequestTodos(todo);
        }
        if (todo.sourceType === "makerflow" && todo.type === "makerflow") {
            TodoUtils.handleCustomTask(todo);
        }
        if (todo.sourceType === "makerflow" && todo.type === "onboarding") {
            return null;
        }
        return todo;
    }
}
