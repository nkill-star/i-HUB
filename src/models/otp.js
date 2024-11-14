const bcrypt = require('bcrypt'); // Ensure bcrypt is imported
const saltround = 10; // Define the salt rounds

const verifyOtp = async (req, res) => {
    const { email, otp, password } = req.body;

    // Retrieve the OTP stored for the user
    const storedOtpData = otpStore.get(email);

    // Step 1: Check if the OTP exists and is valid
    if (storedOtpData && storedOtpData.otp === otp && Date.now() < storedOtpData.expiresAt) {
        // OTP is correct and not expired

        // Step 2: Hash the password and create the new user
        const hashedPassword = await bcrypt.hash(password, saltround);
        const newUser = new userSchema({
            email,
            password: hashedPassword,
        });

        // Step 3: Save the new user to the database
        await newUser.save();

        // Step 4: Remove the OTP from memory after successful verification
        otpStore.delete(email);

        // Redirect to login page with success message
        res.render('user/login', { message: 'User created successfully' });
    } else {
        // OTP is invalid or expired
        res.render('otpEmail', { email, message: 'Invalid or expired OTP' });
    }
};

module.exports = { verifyOtp };
