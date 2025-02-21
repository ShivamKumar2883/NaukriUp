import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { Application } from "../models/applicationSchema.js";
import { Job } from "../models/jobSchema.js";
import cloudinary from "cloudinary";

// Ensure Cloudinary is correctly configured
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const postApplication = catchAsyncErrors(async (req, res, next) => {
  console.log("Request Body:", req.body);
  console.log("Uploaded Files:", req.files);

  // Restrict Employers from applying
  if (req.user.role === "Employer") {
    return next(new ErrorHandler("Employer not allowed to access this resource.", 400));
  }

  // Ensure resume file is uploaded
  if (!req.files || !req.files.resume) {
    return next(new ErrorHandler("Resume File Required!", 400));
  }

  const { resume } = req.files;

  // Allow resume formats: PDF, DOC, DOCX
  const allowedFormats = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
if (!allowedFormats.includes(resume.mimetype)) {
  return next(
    new ErrorHandler("Invalid file type. Please upload a PNG, JPG, or PDF file.", 400)
  );
}


  // Upload resume to Cloudinary
  const cloudinaryResponse = await cloudinary.v2.uploader.upload(resume.tempFilePath, {
    folder: "resumes",
  });

  if (!cloudinaryResponse || cloudinaryResponse.error) {
    console.error("Cloudinary Error:", cloudinaryResponse.error || "Unknown Cloudinary error");
    return next(new ErrorHandler("Failed to upload Resume to Cloudinary", 500));
  }

  const { name, email, coverLetter, phone, address, jobId } = req.body;

  // Validate required fields
  if ([name, email, coverLetter, phone, address, resume].some((field) => !field)) {
    return next(new ErrorHandler("Please fill all required fields.", 400));
  }

  // Validate Job ID
  if (!jobId) {
    return next(new ErrorHandler("Job not found!", 404));
  }

  const jobDetails = await Job.findById(jobId);
  if (!jobDetails) {
    return next(new ErrorHandler("Job not found!", 404));
  }

  const applicantID = {
    user: req.user._id,
    role: "Job Seeker",
  };

  const employerID = {
    user: jobDetails.postedBy,
    role: "Employer",
  };

  // Save application in the database
  const application = await Application.create({
    name,
    email,
    coverLetter,
    phone,
    address,
    applicantID,
    employerID,
    resume: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
  });

  res.status(200).json({
    success: true,
    message: "Application Submitted!",
    application,
  });
});

// Employer: Get All Applications
export const employerGetAllApplications = catchAsyncErrors(async (req, res, next) => {
  if (req.user.role === "Job Seeker") {
    return next(new ErrorHandler("Job Seeker not allowed to access this resource.", 400));
  }

  const applications = await Application.find({ "employerID.user": req.user._id });

  res.status(200).json({
    success: true,
    applications,
  });
});

// Job Seeker: Get All Applications
export const jobseekerGetAllApplications = catchAsyncErrors(async (req, res, next) => {
  if (req.user.role === "Employer") {
    return next(new ErrorHandler("Employer not allowed to access this resource.", 400));
  }

  const applications = await Application.find({ "applicantID.user": req.user._id });

  res.status(200).json({
    success: true,
    applications,
  });
});

// Job Seeker: Delete Application
export const jobseekerDeleteApplication = catchAsyncErrors(async (req, res, next) => {
  if (req.user.role === "Employer") {
    return next(new ErrorHandler("Employer not allowed to access this resource.", 400));
  }

  const application = await Application.findById(req.params.id);
  if (!application) {
    return next(new ErrorHandler("Application not found!", 404));
  }

  await application.deleteOne();

  res.status(200).json({
    success: true,
    message: "Application Deleted!",
  });
});
