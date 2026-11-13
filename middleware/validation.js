// Validation middleware for adding and updating a locker
function validateLocker(req, res, next) {
  const { name, floor } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({
      error: 'Validation failed: "name" is required and must be a non-empty string.'
    });
  }

  if (floor === undefined || floor === null || typeof floor !== 'number' || !Number.isInteger(floor)) {
    return res.status(400).json({
      error: 'Validation failed: "floor" is required and must be an integer number.'
    });
  }

  // Sanitize input
  req.body.name = name.trim();
  next();
}

// Validation middleware for adding a member
function validateMember(req, res, next) {
  const { name, email } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({
      error: 'Validation failed: Member "name" is required.'
    });
  }

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({
      error: 'Validation failed: A valid "email" is required.'
    });
  }

  req.body.name = name.trim();
  req.body.email = email.trim();
  next();
}

// Validation middleware for creating a locker allotment
function validateAllotment(req, res, next) {
  const { member_id, locker_id } = req.body;

  if (!Number.isInteger(member_id) || !Number.isInteger(locker_id)) {
    return res.status(400).json({
      error: 'Validation failed: Both "member_id" and "locker_id" must be integers.'
    });
  }

  next();
}

module.exports = {
  validateLocker,
  validateMember,
  validateAllotment
};