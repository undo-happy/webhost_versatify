const cleanupTask = require('../cleanupTask');

module.exports = async function (context, myTimer) {
    context.log('CleanupTimer triggered', new Date().toISOString());
    try {
        const { message } = await cleanupTask(context);
        context.log(message);
    } catch (err) {
        context.log.error('Cleanup timer failed:', err);
    }
};
