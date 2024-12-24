import bcrypt from "bcryptjs"
import jwt from 'jsonwebtoken';

import userModel from "../Models/userModel.js";
import transporter from "../config/nodeMailer.js";
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from "../config/emailTemplates.js";

export const register = async (req, res) => {
    console.log("Register API called.");
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        console.log("Missing details:", { name, email, password });
        return res.json({ success: false, message: "Missing details" });
    }

    try {
        console.log("Checking if user exists...");
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            console.log("User already exists:", existingUser);
            return res.json({ success: false, message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("Password hashed successfully.");

        const user = new userModel({ name, email, password: hashedPassword });
        await user.save();
        console.log("User saved successfully.");

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        console.log("Token generated:", token);

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        //return res.json({success:true})
        //sending welcome email to user
        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to LoginGuard ',
            text: `Welcome to LoginGuard website. Your account has been created with email id:${email}`,
            html: "<h3><b>Welcome to <i>LoginGuard<i></b><h3>"

        }
        await transporter.sendMail(mailOption);

        return res.json({ success: true });

    } catch (error) {
        console.error("Error in register:", error);
        return res.json({ success: false, message: error.message });
    }
};
//_______________________________________________________________________________________________________

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.json({ success: false, message: "Email and password are required" });
    }




    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "Invalid email" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        //If password is not matching
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid password" });
        }

        // if password and email match we generate a token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? "none" : "strict",
            //converting 7 days into millisecond and maxAge is the expiring date of cookie
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        return res.json({ success: true });


    } catch (error) {
        res.json({ success: false, message: error.message })

    }

}


export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? "none" : "strict"
        })
        return res.json({ success: true, message: "Logged Out" })

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }

}

export const sendVeriftOtp = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await userModel.findById(userId);

        if (user.isAccountVerified) {
            return res.json({ success: false, message: "Account Already Verified " });
        }
        //Generating otp using math.random and to remove decimal point we have used floor function and then converting it into string

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;

        await user.save();


        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account Verification Otp ',
            //text:`Your OTP is ${otp}. Verify your account using this OTP.`,
            html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email)

        }
        await transporter.sendMail(mailOption);
        return res.json({ success: true, message: `Verification OTP is send on ${user.email}` });


    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const verifyEmail = async (req, res) => {

    const { userId, otp } = req.body;

    if (!userId || !otp) {
        return res.json({ success: false, message: "Missing Details" });
    }
    try {
        const user = await userModel.findById(userId);

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        if (user.verifyOtp == "" || user.verifyOtp !== otp) {
            return res.json({ success: false, message: "Invalid OTP" });
        }

        if (user.verifyOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: "OTP Expired" });
        }
        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;

        await user.save();
        return res.json({ success: true, message: "Email Verified successfully" });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }


}
//Check if user is authenticated 
export const isAuthenticated = async (req, res) => {
    try {
        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}


//Send Password reset otp
export const sendResetOtp = async (req, res) => {
    const { email } = req.body;

    //Checking email is availeble or not
    if (!email) {
        return res.json({ success: false, message: "Email is required" });
    }

    try {

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        //If user is avaleble we generate OTP , save it in database

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;

        await user.save();


        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Password Reset OTP',
            //text:`Your OTP for resetting your password is ${otp}. USe this OTP to proceed with resetting your password`,
            html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email)

        }
        await transporter.sendMail(mailOption);
        return res.json({ success: true, message: `OTP is send on ${user.email}` });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }

}

//Reset User Password
export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.json({ success: false, message: "Email,OTP and new password is required" })

    }
    try {

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        if (user.resetOtp === "" || user.resetOtp !== otp) {
            return res.json({ success: false, message: "Invalid OTP" });
        }
        if (user.resetOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: "OTP Expired" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.resetOtp = "";
        user.resetOtpExpireAt = 0;
        await user.save();
        return res.json({ success: true, message: "Password has been successfully reset" });


    } catch (error) {
        return res.json({ success: false, message: error.message });
    }

}
