import React, { useState } from "react";
import ExcelReader from './ExcelReader';
import axios from 'axios';

const App = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [number, setNumber] = useState("");
  const [sms, setSms] = useState("");
  const [wapp, setWapp] = useState("");
  const [uploading, setUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState(""); // State to hold the video URL

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch("http://localhost:5000/api/generate-video", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, number, sms, wapp }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        return response.json(); // Parse JSON response
      })
      .then((data) => {
        console.log("Video generated successfully");
        alert("Video generated successfully!");
        // Set the video URL to the response (assuming the server streams the video)
        setVideoUrl("http://localhost:5000/api/generate-video");
      })
      .catch((error) => {
        console.error("Error generating video:", error);
        alert("Error generating video");
      });
  };

  const handleExcelData = (excelData) => {
    setUploading(true);

    axios.post("http://localhost:500/api/generate-videos-from-excel", { excelData })
      .then((response) => {
        alert("Videos are being generated from the excel file!");
      })
      .catch((error) => {
        console.error("Error Uploading Excel Data:", error);
        alert("Error generating videos from excel file");
      })
      .finally(() => {
        setUploading(false);
      });
  };

  return (
    <div>
      <h1>Generate Video</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Enter Mobile Number"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Enter SMS"
          value={sms}
          onChange={(e) => setSms(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Enter Whatsapp"
          value={wapp}
          onChange={(e) => setWapp(e.target.value)}
          required
        />
        <button type="submit">Generate Video</button>
      </form>

      {/* Display the generated video if available */}
      {videoUrl && (
        <div>
          <h2>Generated Video</h2>
          <video controls>
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      <hr />
      {/* Excel Upload Section */}
      <h2>Generate Videos from Excel</h2>
      <ExcelReader onFileSubmit={handleExcelData} uploading={uploading} />
    </div>
  );
};

export default App;
