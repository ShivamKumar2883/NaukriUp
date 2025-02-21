// MyApplications.jsx
import React, { useContext, useEffect, useState } from "react";
import { Context } from "../../main";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import ResumeModal from "./ResumeModal";

const MyApplications = () => {
  const { user, isAuthorized } = useContext(Context);
  const [applications, setApplications] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [resumeUrl, setResumeUrl] = useState("");
  const navigateTo = useNavigate();

  useEffect(() => {
    if (!isAuthorized) navigateTo("/");

    try {
      const endpoint = user?.role === "Employer"
        ? "http://localhost:4000/api/v1/application/employer/getall"
        : "http://localhost:4000/api/v1/application/jobseeker/getall";
      
      axios.get(endpoint, { withCredentials: true })
        .then((res) => setApplications(res.data.applications))
        .catch((error) => toast.error(error.response.data.message));
    } catch (error) {
      toast.error("Failed to fetch applications");
    }
  }, [isAuthorized, user, navigateTo]);

  const deleteApplication = (id) => {
    axios.delete(`http://localhost:4000/api/v1/application/delete/${id}`, {
      withCredentials: true,
    })
    .then((res) => {
      toast.success(res.data.message);
      setApplications((prev) => prev.filter((app) => app._id !== id));
    })
    .catch((error) => toast.error(error.response.data.message));
  };

  const openModal = (url) => {
    setResumeUrl(url);
    setModalOpen(true);
  };

  return (
    <section className="my_applications page">
      <div className="container">
        <center><h1>{user?.role === "Job Seeker" ? "My Applications" : "Applications From Job Seekers"}</h1></center>
        {applications.length <= 0 ? (
          <center><h4>No Applications Found</h4></center>
        ) : (
          applications.map((element) => (
            user?.role === "Job Seeker" ? (
              <JobSeekerCard key={element._id} element={element} deleteApplication={deleteApplication} openModal={openModal} />
            ) : (
              <EmployerCard key={element._id} element={element} openModal={openModal} />
            )
          ))
        )}
      </div>
      {modalOpen && <ResumeModal resumeUrl={resumeUrl} onClose={() => setModalOpen(false)} />}
    </section>
  );
};

export default MyApplications;

const JobSeekerCard = ({ element, deleteApplication, openModal }) => (
  <div className="job_seeker_card">
    <div className="detail">
      <p><span>Name:</span> {element.name}</p>
      <p><span>Email:</span> {element.email}</p>
      <p><span>Phone:</span> {element.phone}</p>
      <p><span>Address:</span> {element.address}</p>
      <p><span>CoverLetter:</span> {element.coverLetter}</p>
    </div>
    <ResumeDisplay resume={element.resume} openModal={openModal} />
    <button onClick={() => deleteApplication(element._id)}>Delete Application</button>
  </div>
);

const EmployerCard = ({ element, openModal }) => (
  <div className="job_seeker_card">
    <div className="detail">
      <p><span>Name:</span> {element.name}</p>
      <p><span>Email:</span> {element.email}</p>
      <p><span>Phone:</span> {element.phone}</p>
      <p><span>Address:</span> {element.address}</p>
      <p><span>CoverLetter:</span> {element.coverLetter}</p>
    </div>
    <ResumeDisplay resume={element.resume} openModal={openModal} />
  </div>
);

const ResumeDisplay = ({ resume, openModal }) => (
  <div className="resume">
    {resume.url.endsWith(".pdf") ? (
      <a href={resume.url} target="_blank" rel="noopener noreferrer">View Resume</a>
    ) : (
      <img src={resume.url} alt="resume" onClick={() => openModal(resume.url)} />
    )}
  </div>
);