// Validation middleware for request bodies
const validateSignup = (req, res, next) => {
  const { name, email, password, role } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (!email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    errors.push('Valid email is required');
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (!role || !['student', 'staff', 'security'].includes(role)) {
    errors.push('Valid role (student/staff/security) is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    errors.push('Valid email is required');
  }

  if (!password || password.length < 6) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

const validateLocation = (req, res, next) => {
  // Support both formats: { lat, lng } and { location: { lat, lng } }
  if (req.body && req.body.location && typeof req.body.location === 'object') {
    const { lat, lng } = req.body.location
    // Normalize into root-level fields for downstream middleware/controllers
    if (lat !== undefined) req.body.lat = lat
    if (lng !== undefined) req.body.lng = lng
  }

  const { lat, lng } = req.body;
  const errors = [];

  if (lat === undefined || lat === null || isNaN(lat) || lat < -90 || lat > 90) {
    errors.push('Valid latitude is required (-90 to 90)');
  }

  if (lng === undefined || lng === null || isNaN(lng) || lng < -180 || lng > 180) {
    errors.push('Valid longitude is required (-180 to 180)');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

const validateIncidentReport = (req, res, next) => {
  const { type, description } = req.body;
  const errors = [];

  const validTypes = [
    'harassment', 'theft', 'suspicious_activity', 'vandalism',
    'assault', 'cyber_bullying', 'drug_activity', 'accident', 'other'
  ];

  if (!type || !validTypes.includes(type)) {
    errors.push(`Valid incident type is required: ${validTypes.join(', ')}`);
  }

  if (!description || description.trim().length < 10) {
    errors.push('Description must be at least 10 characters long');
  }

  if (description && description.length > 1000) {
    errors.push('Description cannot exceed 1000 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

module.exports = {
  validateSignup,
  validateLogin,
  validateLocation,
  validateIncidentReport
};
