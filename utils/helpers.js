// Utils contains helper functions and shared logic.
// Example: standard response formatter, date utilities.

exports.formatDate = (date) => {
    return new Date(date).toISOString();
};
