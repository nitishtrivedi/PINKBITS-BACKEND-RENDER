function errorHandler (err, req, res, next) {

    //Authentication or Token related error
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({message: 'The User is not authorized. Invalid or Expired Token'})
    }

    //Validation Error when wrong upload selected
    if (err.name === 'ValidationError') {
        res.status(401).json({message: err})
    }

    //Generic Error message
    return res.status(500).json({error: err, message: 'Unexpected Error Occured. Check more details in backend'})
}

//Export the module
module.exports = errorHandler;