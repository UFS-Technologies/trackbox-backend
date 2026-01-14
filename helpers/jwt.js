const jwt = require('jsonwebtoken');
const secret = process.env.jwtSecret;
const { executeTransaction } = require('./sp-caller');

// Cache for token verification results
const tokenCache = new Map();
const TOKEN_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

// User status constants
const USER_STATUS = {
    DELETED: 'DELETED',
    NOT_FOUND: 'NOT_FOUND',
    INVALID_TOKEN: 'INVALID_TOKEN',
    ACTIVE: 'ACTIVE'
};

// Error response helper
const createErrorResponse = (status, message) => ({
    error: { message },
    status
});

function jwtMiddleware() {
    return async (req, res, next) => {
        try {
            const path = req.path || req.url;
            console.log('JWT Check Path:', path);
            // Public routes exemption
            const publicPaths = [
                '/Login/Login_Check', 
                '/Login/Student_Login_Check', 
                '/Login/Check_User_Exist', 
                '/student/Save_student', 
                '/student/login',
                '/teacher/Save_Teacher_Qualification',
                '/teacher/Save_Teacher_Experience',
                '/teacher/Get_Teacher_Qualifications_By_TeacherID',
                '/teacher/Get_Teacher_Experience_By_TeacherID',
                '/teacher/Delete_Teacher_Qualification',
                '/teacher/Delete_Teacher_Experience'
            ];
            
            if (
                publicPaths.includes(path) || 
                path === '/' || 
                path.startsWith('/Login/') ||
                path.startsWith('/teacher/Save_Teacher_Qualification') ||
                path.startsWith('/teacher/Save_Teacher_Experience') ||
                path.startsWith('/teacher/Get_Teacher_Qualifications_By_TeacherID') ||
                path.startsWith('/teacher/Get_Teacher_Experience_By_TeacherID') ||
                path.startsWith('/teacher/Delete_Teacher_Qualification') ||
                path.startsWith('/teacher/Delete_Teacher_Experience') ||
                path.startsWith('/s3/')
            ) {
                console.log('JWT Skip - Public Route:', path);
                return next();
            }

            // Extract token with early validation
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                throw { status: 401, message: 'Unauthorized: Missing or invalid token format' };
            }

            const token = authHeader.split(' ')[1];
            
            // Check token cache first
            const cachedResult = tokenCache.get(token);
            // if (cachedResult && cachedResult.expiry > Date.now()) {
            //     req.userId = cachedResult.userId;
            //     req.isStudent = cachedResult.isStudent;
            //     return next();
            // }

            // Verify JWT token
            let decoded;
            try {
                decoded = jwt.verify(token, secret);
            } catch (jwtError) {
                if (jwtError.name === 'TokenExpiredError') {
                    throw createErrorResponse(401, 'Unauthorized: Token expired');
                }
                throw createErrorResponse(401, 'Unauthorized: Invalid token');
            }

            const userId = decoded.userId || 0;
            const isStudent = decoded.isStudent || 0;

            // Check user status with timeout
            try {
                const [userStatus] = await Promise.race([
                    executeTransaction('check_User', [userId, isStudent, token]),
                    new Promise((_, reject) =>  
                        
                        setTimeout(() => reject(new Error('Database timeout')), 15000)
                    )
                ]);

                console.log('userStatus: ', userStatus);
                if (!userStatus) {
                    throw createErrorResponse(500, 'Invalid response from database');
                }
                // tokenCache.set(token, {
                //     userId,
                //     isStudent,
                //     expiry: Date.now() + TOKEN_CACHE_DURATION
                // });
                // req.userId = userId;
                // req.isStudent = isStudent;
          
         
                // Handle user status
                
                const status = (userStatus?.status || (Array.isArray(userStatus) && userStatus[0]?.status))?.trim();
                console.log('Processed status:', status);

                switch (status) {
                    case USER_STATUS.ACTIVE:
                    case 'ACTIVE':
                    case 'User is active':
                        tokenCache.set(token, {
                            userId,
                            isStudent,
                            expiry: Date.now() + TOKEN_CACHE_DURATION
                        });
                        req.userId = userId;
                        req.isStudent = isStudent;
                        return next();
                 
                    case USER_STATUS.DELETED:
                    case 'DELETED':
                    case 'User is deleted':
                        return res.status(401).json({
                            error: { message: 'Unauthorized: User account has been deleted' }
                        });
                 
                    case USER_STATUS.NOT_FOUND:
                    case 'NOT_FOUND':
                    case 'User not found':
                        return res.status(401).json({
                            error: { message: 'Unauthorized: User not found' }
                        });
                 
                    case USER_STATUS.INVALID_TOKEN:
                    case 'INVALID_TOKEN':
                    case 'Token is invalid':
                        return res.status(401).json({
                            error: { message: 'Unauthorized: Invalid token' }
                        });
                 
                    default:
                        return res.status(500).json({
                            error: { message: `Unknown user status received: ${status}` }
                        });
                 }
            } catch (dbError) {
                console.log('dbError: ', dbError);
                console.error('Database Error:', dbError);
                if (dbError.message === 'Database timeout') {
                    throw createErrorResponse(503, 'Service temporarily unavailable');
                }
                throw createErrorResponse(500, 'Internal server error during user verification');
            }

        } catch (error) {
            // Clean up cache if there's an error
            if (req.headers.authorization) {
                const parts = req.headers.authorization.split(' ');
                if (parts.length > 1) {
                    tokenCache.delete(parts[1]);
                }
            }

            // Log error with request context
            console.error('JWT Middleware Error:', {
                error: error.message || error.error?.message || error,
                status: error.status,
                path: req.path,
                method: req.method,
                timestamp: new Date().toISOString()
            });

            // Send error response
            const status = error.status || 500;
            const message = error.message || (error.error && error.error.message) || 'Internal server error';
            
            return res.status(status).json({ 
                error: { message: message }
            });
        }
    };
}

// Cleanup expired cache entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [token, data] of tokenCache.entries()) {
        if (data.expiry <= now) {
            tokenCache.delete(token);
        }
    }
}, 60000); // Clean up every minute

module.exports = jwtMiddleware;