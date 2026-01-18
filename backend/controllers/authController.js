const User = require('../models/User');
const jwt = require('jsonwebtoken');
const AuditLog = require('../models/AuditLog');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        const { name, email, password, pgName, pgAddress, pgContact, gstin } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user (first user becomes admin)
        const userCount = await User.countDocuments();
        const role = userCount === 0 ? 'admin' : 'staff';

        const user = await User.create({
            name,
            email,
            password,
            role,
            pgName,
            pgAddress,
            pgContact,
            gstin
        });

        if (user) {
            // Log registration - wrap in try-catch to prevent audit log from breaking registration
            try {
                await AuditLog.create({
                    user: user._id,
                    action: 'register',
                    details: { role: user.role },
                    ipAddress: req.ip,
                    userAgent: req.get('User-Agent')
                });
            } catch (auditError) {
                console.warn('Failed to create audit log (non-critical):', auditError.message);
                // Don't fail the registration if audit logging fails
            }

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                pgName: user.pgName,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user email
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isPasswordMatch = await user.matchPassword(password);
        
        if (!isPasswordMatch) {
            // Log failed attempt
            await AuditLog.create({
                user: user._id,
                action: 'login',
                details: { success: false, email },
                ipAddress: req.ip,
                userAgent: req.get('User-Agent')
            });
            
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Log successful login
        await AuditLog.create({
            user: user._id,
            action: 'login',
            details: { success: true },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            pgName: user.pgName,
            pgAddress: user.pgAddress,
            pgContact: user.pgContact,
            gstin: user.gstin,
            token: generateToken(user._id)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.pgName = req.body.pgName || user.pgName;
        user.pgAddress = req.body.pgAddress || user.pgAddress;
        user.pgContact = req.body.pgContact || user.pgContact;
        user.gstin = req.body.gstin || user.gstin;
        user.emailSignature = req.body.emailSignature || user.emailSignature;

        // If password is provided, update it
        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            pgName: updatedUser.pgName,
            pgAddress: updatedUser.pgAddress,
            pgContact: updatedUser.pgContact,
            gstin: updatedUser.gstin,
            emailSignature: updatedUser.emailSignature
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all users (admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update user role (admin only)
// @route   PUT /api/auth/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Cannot change own role
        if (user._id.toString() === req.user.id) {
            return res.status(400).json({ message: 'Cannot change your own role' });
        }

        user.role = req.body.role;
        await user.save();

        res.json({ message: 'User role updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    getUsers,
    updateUserRole
};