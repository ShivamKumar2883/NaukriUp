
// ResumeModal.jsx
import React from "react";

const ResumeModal = ({ resumeUrl, onClose }) => {
  return (
    <div className="resume-modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        {resumeUrl.endsWith(".pdf") ? (
          <iframe src={resumeUrl} width="100%" height="500px"></iframe>
        ) : (
          <img src={resumeUrl} alt="resume" />
        )}
      </div>
    </div>
  );
};

export default ResumeModal;
