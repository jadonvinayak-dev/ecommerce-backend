module.exports = (err, req, res, next) => {
    console.error(`[Error Handler] Details: ${err.message}`);
    
    if (err.message.includes('insufficient stock') || err.code === '23514') {
        return res.status(409).json({
            success: false,
            error: err.message || 'Transaction aborted due to stock constraints.'
        });
    }

    return res.status(500).json({
        success: false,
        error: err.message || 'Internal Server Error Architecture Break.'
    });
};
