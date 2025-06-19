const express = require("express");
const mysql2 = require("mysql2");
const bodyParser = require("body-parser");
require("dotenv").config();
const cors = require("cors");
const nodemailer = require("nodemailer");
const fileUploader = require("express-fileupload");
const path = require("path");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json()); // Add this line to parse JSON bodies

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Start the server
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});

// Middleware setup

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(fileUploader());
app.use("/uploads", express.static(path.join(__dirname, "./public/uploads")));

// MySQL configuration
// const dbConfig = {
//     host: "127.0.0.1",
//     user: "root",
//     password: "A@82059raj",
//     database: "project",
// };

// const dbConfig = {
//     host: "bgtl8q0vhmgxdsvvcxxw-mysql.services.clever-cloud.com",
//     user: "uksfiiksoxvz5fll",
//     password: "e1aQmGi3nNS1Px9AAWTA",
//     database: "bgtl8q0vhmgxdsvvcxxw",
//     keepAliveInitialDelay: 10000,
//     enableKeepAlive: true,
// };

let dbConfig =
  "mysql://avnadmin:AVNS_GAjVnJ3_iwc82Z87m4u@mysql-78551a5-aksh-787b.e.aivencloud.com:13616/defaultdb";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const transporter = nodemailer.createTransport({
  service: "gmail", // Use Gmail service
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address from .env
    pass: process.env.EMAIL_PASS, // Your Gmail App Password from .env
  },
});

const mysql = mysql2.createConnection(dbConfig);

mysql.connect((err) => {
  if (!err) {
    console.log("Connected to database successfully.");
  } else {
    console.error("Database connection error:", err.message);
  }
});

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Routes

// Home route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Signup process
app.get("/signup-process", (req, res) => {
  const { txtEmail, pwd, combo: utype } = req.query;

  const query =
    "INSERT INTO users (email, pwd, utype, status) VALUES (?, ?, ?, 1)";
  mysql.query(query, [txtEmail, pwd, utype], (err) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.send("Signed up successfully!");
    }
  });
});

// Login process
app.post("/login-process", (req, res) => {
  const { txtEmaill: email, txtPwd: pwd } = req.body;

  if (!email || !pwd) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required." });
  }

  // --- Admin Login Logic ---
  if (email === ADMIN_EMAIL) {
    if (pwd === ADMIN_PASSWORD) {
      console.log(`Admin user ${email} logged in.`);
      return res.status(200).json({
        success: true,
        message: "Admin login successful!",
        email: email,
        role: "Admin",
      });
    } else {
      return res
        .status(401)
        .json({ success: false, message: "Invalid admin password." });
    }
  }

  const query = "SELECT * FROM users WHERE email = ? AND pwd = ?";
  mysql.query(query, [email, pwd], (err, result) => {
    if (err) {
      res.status(500).send(err.message);
    } else if (result.length === 0) {
      res.send("Invalid ID or password.");
    } else if (result[0].status === 1) {
      const userType = result[0].utype;
      if (userType === "Client") {
        res.send("Client");
      } else if (userType === "influencer") {
        // Normalize to "Influencer"
        res.send("influencer");
      } else {
        // Handle any other unexpected user types, or send as is if they are valid
        res.send(userType);
      }
    } else {
      res.send("You are blocked.");
    }
  });
});

// Influencer dashboard route
app.get("/influencer-dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public/Infl-Dash.html"));
});

// Profile submission
// Fixed server routes for profile submission and update

app.post("/profile-submit", async (req, res) => {
  console.log("Profile submit endpoint hit");
  console.log("Files:", req.files);
  console.log("Body:", req.body);

  // Check if file was uploaded
  if (!req.files || !req.files.picUpload) {
    return res.status(400).json({ 
      status: "error", 
      message: "Profile picture is required for new profiles." 
    });
  }

  const file = req.files.picUpload;

  // Validate file type
  if (!file.mimetype.startsWith("image/")) {
    return res.status(400).json({ 
      status: "error", 
      message: "Please upload an image file." 
    });
  }

  try {
    // Prepare upload source for Cloudinary
    let uploadSource;
    
    if (file.tempFilePath) {
      // Use file path if available (when using temp files)
      uploadSource = file.tempFilePath;
    } else {
      // Convert buffer to data URI
      const base64Data = file.data.toString('base64');
      uploadSource = `data:${file.mimetype};base64,${base64Data}`;
    }

    // Upload to Cloudinary
    const cloudinaryResult = await cloudinary.uploader.upload(uploadSource, {
      folder: "influencer_profiles",
      resource_type: "image",
      use_filename: true,
      unique_filename: false,
    });

    // Extract form data
    const {
      emailid,
      name,
      gender,
      dob,
      address,
      city,
      contact,
      field,
      insta,
      youtube,
      otherinfo,
    } = req.body;

    // Validate required fields
    if (!emailid || !name || !dob || !address || !city || !contact) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields: emailid, name, dob, address, city, contact are required."
      });
    }

    // Check if profile already exists
    const checkQuery = "SELECT emailid FROM iprofile WHERE emailid = ?";
    mysql.query(checkQuery, [emailid], (checkErr, checkResult) => {
      if (checkErr) {
        console.error("Database check error:", checkErr);
        return res.status(500).json({ 
          status: "error", 
          message: "Database error: " + checkErr.message 
        });
      }

      if (checkResult.length > 0) {
        return res.status(400).json({
          status: "error",
          message: "Profile already exists for this email. Use update instead."
        });
      }

      // Insert new profile
      const insertQuery = `
        INSERT INTO iprofile (emailid, name, gender, dob, address, city, contact, field, insta, youtube, otherinfo, picpath)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        emailid,
        name || '',
        gender || '',
        dob,
        address,
        city,
        contact,
        field || '',
        insta || '',
        youtube || '',
        otherinfo || '',
        cloudinaryResult.secure_url
      ];

      mysql.query(insertQuery, values, (insertErr, insertResult) => {
        if (insertErr) {
          console.error("Database insert error:", insertErr);
          return res.status(500).json({ 
            status: "error", 
            message: "Database error: " + insertErr.message 
          });
        }

        console.log("Profile created successfully for:", emailid);
        res.json({
          status: "success",
          message: "Profile created successfully!",
          picpath: cloudinaryResult.secure_url
        });
      });
    });

  } catch (cloudinaryErr) {
    console.error("Cloudinary upload failed:", cloudinaryErr);
    return res.status(500).json({ 
      status: "error", 
      message: "Image upload failed: " + cloudinaryErr.message 
    });
  }
});

// Fixed profile update route
app.post("/profile-update", async (req, res) => {
  console.log("Profile update endpoint hit");
  console.log("Files:", req.files);
  console.log("Body:", req.body);

  const { emailid } = req.body;

  if (!emailid) {
    return res.status(400).json({ 
      status: "error", 
      message: "Email ID is required for update." 
    });
  }

  let fileUrl = null;

  const performUpdate = async () => {
    try {
      const {
        name,
        gender,
        dob,
        address,
        city,
        contact,
        field,
        insta,
        youtube,
        otherinfo,
      } = req.body;

      // Build dynamic update query
      const fieldsToUpdate = [];
      const params = [];

      // Only update fields that have values
      if (name && name.trim() !== "") {
        fieldsToUpdate.push("name = ?");
        params.push(name.trim());
      }
      
      if (gender && gender.trim() !== "") {
        fieldsToUpdate.push("gender = ?");
        params.push(gender.trim());
      }
      
      if (dob && dob.trim() !== "") {
        fieldsToUpdate.push("dob = ?");
        params.push(dob.trim());
      }
      
      if (address && address.trim() !== "") {
        fieldsToUpdate.push("address = ?");
        params.push(address.trim());
      }
      
      if (city && city.trim() !== "") {
        fieldsToUpdate.push("city = ?");
        params.push(city.trim());
      }
      
      if (contact && contact.trim() !== "") {
        fieldsToUpdate.push("contact = ?");
        params.push(contact.trim());
      }
      
      // Handle field properly
      if (field !== undefined && field !== null && field !== "") {
        fieldsToUpdate.push("field = ?");
        params.push(field.toString().trim());
      }
      
      if (insta && insta.trim() !== "") {
        fieldsToUpdate.push("insta = ?");
        params.push(insta.trim());
      }
      
      if (youtube && youtube.trim() !== "") {
        fieldsToUpdate.push("youtube = ?");
        params.push(youtube.trim());
      }
      
      if (otherinfo && otherinfo.trim() !== "") {
        fieldsToUpdate.push("otherinfo = ?");
        params.push(otherinfo.trim());
      }
      
      // Add picture path if uploaded
      if (fileUrl) {
        fieldsToUpdate.push("picpath = ?");
        params.push(fileUrl);
      }

      if (fieldsToUpdate.length === 0) {
        return res.status(400).json({
          status: "error",
          message: "No valid fields provided for update.",
        });
      }

      // First check if profile exists
      const checkQuery = "SELECT emailid FROM iprofile WHERE emailid = ?";
      mysql.query(checkQuery, [emailid], (checkErr, checkResult) => {
        if (checkErr) {
          console.error("Database check error:", checkErr);
          return res.status(500).json({ 
            status: "error", 
            message: "Database error: " + checkErr.message 
          });
        }

        if (checkResult.length === 0) {
          return res.status(404).json({
            status: "error",
            message: "No profile found with the provided email ID.",
          });
        }

        // Perform update
        const updateQuery = `UPDATE iprofile SET ${fieldsToUpdate.join(", ")} WHERE emailid = ?`;
        params.push(emailid);

        console.log("Update Query:", updateQuery);
        console.log("Parameters:", params);

        mysql.query(updateQuery, params, (updateErr, result) => {
          if (updateErr) {
            console.error("Database update error:", updateErr);
            return res.status(500).json({ 
              status: "error", 
              message: "Database error: " + updateErr.message 
            });
          }

          console.log("Profile updated successfully for:", emailid);
          res.json({
            status: "success",
            message: "Profile updated successfully!",
            picpath: fileUrl || undefined,
          });
        });
      });

    } catch (error) {
      console.error("Update error:", error);
      return res.status(500).json({ 
        status: "error", 
        message: "Update failed: " + error.message 
      });
    }
  };

  // Handle file upload if present
  if (req.files && req.files.picUpload) {
    const file = req.files.picUpload;

    if (!file.mimetype.startsWith("image/")) {
      return res.status(400).json({ 
        status: "error", 
        message: "Please upload an image file." 
      });
    }

    try {
      // Prepare upload source for Cloudinary
      let uploadSource;
      
      if (file.tempFilePath) {
        uploadSource = file.tempFilePath;
      } else {
        // Convert buffer to data URI
        const base64Data = file.data.toString('base64');
        uploadSource = `data:${file.mimetype};base64,${base64Data}`;
      }

      // Upload to Cloudinary
      const cloudinaryResult = await cloudinary.uploader.upload(uploadSource, {
        folder: "influencer_profiles",
        resource_type: "image",
        use_filename: true,
        unique_filename: false,
      });
      
      fileUrl = cloudinaryResult.secure_url;
      await performUpdate();
      
    } catch (cloudinaryErr) {
      console.error("Cloudinary upload failed:", cloudinaryErr);
      return res.status(500).json({ 
        status: "error", 
        message: "Image upload failed: " + cloudinaryErr.message 
      });
    }
  } else {
    // No file to upload, proceed with update
    await performUpdate();
  }
});

// Optional: Add a route to get profile data
app.get("/profile/:emailid", (req, res) => {
  const { emailid } = req.params;
  
  if (!emailid) {
    return res.status(400).json({ 
      status: "error", 
      message: "Email ID is required." 
    });
  }

  const query = "SELECT * FROM iprofile WHERE emailid = ?";
  
  mysql.query(query, [emailid], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ 
        status: "error", 
        message: "Database error: " + err.message 
      });
    }

    if (result.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Profile not found.",
      });
    }

    res.json({
      status: "success",
      data: result[0]
    });
  });
});
// Client Profile Submit
app.post("/client-profile-submit", (req, res) => {
  const { emailid, name, city, state, org, contact } = req.body;

  const query = `
        INSERT INTO cprofile (emailid, name, city, state, org, mobile)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

  mysql.query(query, [emailid, name, city, state, org, contact], (err) => {
    if (err)
      return res.status(500).json({ status: "error", message: err.message });
    res.json({
      status: "success",
      message: "Client profile created successfully!",
    });
  });
});

// Client Profile Update
app.post("/client-profile-update", (req, res) => {
  const { emailid, name, city, state, org, contact } = req.body;

  const query = `
        UPDATE cprofile 
        SET name = ?, city = ?, state = ?, org = ?, mobile = ?
        WHERE emailid = ?
    `;

  const params = [name, city, state, org, contact, emailid];

  mysql.query(query, params, (err) => {
    if (err)
      return res.status(500).json({ status: "error", message: err.message });
    res.json({
      status: "success",
      message: "Client profile updated successfully!",
    });
  });
});

app.post("/event-submit", (req, res) => {
  const { email, eventTitle, eventDate, eventTime, city, venue } = req.body;

  // Validate required fields
  if (!email || !eventTitle || !eventDate || !eventTime || !city || !venue) {
    res.status(400).send("All fields are required.");
    return;
  }

  // SQL query to insert the event into the database
  const query = `
        INSERT INTO events (emailid, events, doe, tos, city, venue)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
  mysql.query(
    query,
    [email, eventTitle, eventDate, eventTime, city, venue],
    (err) => {
      if (err) {
        res.status(500).send(err.message);
      } else {
        res.send("Event posted successfully!");
      }
    }
  );
});

// Fetch events
app.get("/fetch-events", (req, res) => {
  const { email, type } = req.query;

  const query =
    type === "upcoming"
      ? "SELECT * FROM events WHERE emailid = ? AND doe >= CURRENT_DATE()"
      : "SELECT * FROM events WHERE emailid = ? AND doe < CURRENT_DATE()";

  mysql.query(query, [email], (err, results) => {
    if (err) {
      res.status(500).send("Error fetching events.");
    } else {
      res.json(results);
    }
  });
});

// Delete event
app.delete("/delete-event", (req, res) => {
  const { recordid } = req.query;
  if (!recordid) {
    return res.status(400).send("Event ID is required.");
  }

  // Soft delete (keep data but mark as inactive)
  const query = "DELETE FROM events WHERE recordid = ?";
  mysql.query(query, [recordid], (err) => {
    if (err) {
      res.status(500).send("Error deleting event.");
    } else {
      res.send("Event deleted successfully.");
    }
  });
});

app.put("/update-event", (req, res) => {
  const { recordid, events, doe, tos, venue, city } = req.body;

  if (!recordid) {
    return res.status(400).json({ error: "recordid is required." });
  }

  // Build update fields dynamically
  let fields = [];
  let values = [];

  if (events) {
    fields.push("events = ?");
    values.push(events);
  }

  if (doe) {
    fields.push("doe = ?");
    values.push(doe);
  }
  if (tos) {
    fields.push("tos = ?");
    values.push(tos);
  }
  if (venue) {
    fields.push("venue = ?");
    values.push(venue);
  }
  if (city) {
    fields.push("city = ?");
    values.push(city);
  }

  if (fields.length === 0) {
    return res.status(400).json({ error: "No fields to update." });
  }

  const query = `
        UPDATE events
        SET ${fields.join(", ")}
        WHERE recordid = ?
    `;
  values.push(recordid);

  mysql.query(query, values, (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Error updating event." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Event not found." });
    }

    res.json({ message: "Event updated successfully." });
  });
});

// Update password
app.get("/updatePwd", (req, res) => {
  const { txtEmail: email, oldPwd, newPwd, conPwd } = req.query;

  if (newPwd !== conPwd) {
    res.send("Password confirmation does not match.");
    return;
  }

  const query = "SELECT * FROM users WHERE email = ? AND pwd = ?";
  mysql.query(query, [email, oldPwd], (err, result) => {
    if (err) {
      res.status(500).send(err.message);
    } else if (result.length === 0) {
      res.send("Invalid ID or password.");
    } else {
      const updateQuery = "UPDATE users SET pwd = ? WHERE email = ?";
      mysql.query(updateQuery, [newPwd, email], (err, result) => {
        if (err) {
          res.status(500).send(err.message);
        } else if (result.affectedRows === 1) {
          res.send("Password updated successfully.");
        } else {
          res.send("Password update failed.");
        }
      });
    }
  });
});

// Admin dashboard route
app.get("/admin-dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public/admin-dash.html"));
});

// Fetch all users
app.get("/fetch-all", (req, res) => {
  const query = "SELECT * FROM users";
  mysql.query(query, (err, results) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.json(results);
    }
  });
});

// Fetch influencers
app.get("/fetch-infl", (req, res) => {
  const query = "SELECT * FROM iprofile";
  mysql.query(query, (err, results) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.json(results);
    }
  });
});

app.get("/fetch-clients", (req, res) => {
  const query = "SELECT * FROM cprofile";
  mysql.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching client data:", err); // Log error for debugging
      res.status(500).send("Error fetching client data: " + err.message);
    } else {
      res.json(results);
    }
  });
});

app.get("/update-cities", function (req, resp) {
  let fields = req.query.field;

  // normalize to array
  if (!Array.isArray(fields)) {
    fields = fields ? [fields] : [];
  }

  let query = "select distinct city from iprofile";
  let conditions = [];
  let params = [];

  if (fields.length > 0) {
    conditions = fields.map((field) => "field like ?");
    params = fields.map((field) => "%" + field + "%");
    query += " where " + conditions.join(" or ");
  }

  mysql.query(query, params, function (err, resultJsonAry) {
    if (err != null) {
      resp.send(err.message);
      return;
    } else {
      resp.send(resultJsonAry);
    }
  });
});

app.get("/api/client/dashboard-metrics", (req, res) => {
  const clientEmail = req.query.clientEmail;

  if (!clientEmail) {
    return res
      .status(400)
      .json({ status: "error", message: "Client email is required." });
  }

  // Using a single query to fetch client name and count saved influencers
  const query = `
        SELECT
            (SELECT name FROM cprofile WHERE emailid = ?) AS clientName,
            (SELECT COUNT(*) FROM savedinfluencers WHERE cemail = ?) AS savedInfluencerCount
    `;

  mysql.query(query, [clientEmail, clientEmail], (err, results) => {
    if (err) {
      console.error("Error fetching dashboard metrics from DB:", err);
      return res.status(500).json({
        status: "error",
        message: "Internal server error: Could not fetch dashboard metrics.",
      });
    }

    // The result will be an array with one object containing the subquery results
    const data = results[0];
    const clientName = data.clientName || "Client"; // Default if no client profile
    const savedInfluencerCount = data.savedInfluencerCount || 0;

    // Active Collaborations (Placeholder as requested)
    const activeCampaigns = 0;

    res.status(200).json({
      clientName: clientName,
      savedInfluencerCount: savedInfluencerCount,
      activeCampaigns: activeCampaigns,
      message: "Dashboard metrics fetched successfully.",
    });
  });
});

app.get("/infl-finder", function (req, resp) {
  let path = __dirname + "/public/infl-finder.html";
  resp.sendFile(path);
});

// Search influencers
app.get("/search-influencers", (req, res) => {
  const { category, location, name } = req.query;

  let query = "SELECT *, picpath AS pic FROM iprofile WHERE 1=1";
  const params = [];

  if (category) {
    query += " AND field LIKE ?";
    params.push(`%${category}%`);
  }
  if (location) {
    query += " AND city = ?";
    params.push(location);
  }
  if (name) {
    query += " AND name LIKE ?";
    params.push(`%${name}%`);
  }

  mysql.query(query, params, (err, results) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.json(results);
    }
  });
});

app.post("/api/send-contact-email", async (req, res) => {
  const { to, subject, text } = req.body; // 'to' is the influencer's email, 'subject' and 'text' are pre-filled

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("Email credentials not set in .env");
    return res
      .status(500)
      .json({ message: "Server email configuration error." });
  }
  if (!to || !subject || !text) {
    return res.status(400).json({
      message: "Missing required email fields: to, subject, or text.",
    });
  }

  const mailOptions = {
    from: process.env.EMAIL_USER, // Sender's email (your admin email)
    to: to, // Influencer's email
    subject: subject,
    text: text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}`);
    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res
      .status(500)
      .json({ message: "Failed to send email.", error: error.message });
  }
});

app.post("/api/save-influencer", (req, res) => {
  const { cemail, iemail } = req.body;

  // Validate input
  if (!cemail || !iemail) {
    return res.status(400).json({
      status: "error",
      message: "Client email and influencer email are required.",
    });
  }

  // Check if influencer exists
  const checkInfluencerQuery = "SELECT emailid FROM iprofile WHERE emailid = ?";
  mysql.query(checkInfluencerQuery, [iemail], (err, results) => {
    if (err) {
      return res.status(500).json({
        status: "error",
        message: "Database error while checking influencer.",
        details: err.message,
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Influencer not found.",
      });
    }

    // Insert into savedinfluencers table
    const insertQuery =
      "INSERT INTO savedinfluencers (cemail, iemail) VALUES (?, ?)";
    mysql.query(insertQuery, [cemail, iemail], (err, result) => {
      if (err) {
        // Check if it's a duplicate entry error
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(200).json({
            status: "info",
            message: "Influencer already saved.",
          });
        }
        return res.status(500).json({
          status: "error",
          message: "Failed to save influencer.",
          details: err.message,
        });
      }

      res.status(201).json({
        status: "success",
        message: "Influencer saved successfully.",
      });
    });
  });
});

// GET /api/get-saved-influencers - Get all saved influencers for a client
app.get("/api/get-saved-influencers", (req, res) => {
  const { cemail } = req.query;

  if (!cemail) {
    return res.status(400).json({
      status: "error",
      message: "Client email is required.",
    });
  }

  const query = `
        SELECT 
            i.emailid,
            i.name,
            i.gender,
            i.dob,
            i.address,
            i.city,
            i.contact,
            i.field,
            i.insta,
            i.youtube,
            i.otherinfo,
            i.picpath as pic,
            s.saved_at
        FROM savedinfluencers s
        JOIN iprofile i ON s.iemail = i.emailid
        WHERE s.cemail = ?
        ORDER BY s.saved_at DESC
    `;

  mysql.query(query, [cemail], (err, results) => {
    if (err) {
      return res.status(500).json({
        status: "error",
        message: "Failed to retrieve saved influencers.",
        details: err.message,
      });
    }

    res.json(results);
  });
});

// DELETE /api/remove-saved-influencer - Remove a saved influencer
app.delete("/api/remove-saved-influencer", (req, res) => {
  const { cemail, iemail } = req.body;

  if (!cemail || !iemail) {
    return res.status(400).json({
      status: "error",
      message: "Client email and influencer email are required.",
    });
  }

  const deleteQuery =
    "DELETE FROM savedinfluencers WHERE cemail = ? AND iemail = ?";
  mysql.query(deleteQuery, [cemail, iemail], (err, result) => {
    if (err) {
      return res.status(500).json({
        status: "error",
        message: "Failed to remove influencer.",
        details: err.message,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: "info",
        message: "Influencer not found in saved list.",
      });
    }

    res.json({
      status: "success",
      message: "Influencer removed successfully.",
    });
  });
});

// Additional endpoint to check if an influencer is saved
app.get("/api/check-saved-influencer", (req, res) => {
  const { cemail, iemail } = req.query;

  if (!cemail || !iemail) {
    return res.status(400).json({
      status: "error",
      message: "Client email and influencer email are required.",
    });
  }

  const query =
    "SELECT COUNT(*) as count FROM savedinfluencers WHERE cemail = ? AND iemail = ?";
  mysql.query(query, [cemail, iemail], (err, results) => {
    if (err) {
      return res.status(500).json({
        status: "error",
        message: "Database error.",
        details: err.message,
      });
    }

    res.json({
      saved: results[0].count > 0,
    });
  });
});

// Block user
app.get("/block-process", (req, res) => {
  const { email } = req.query;
  const query = "UPDATE users SET status = 0 WHERE email = ?";
  mysql.query(query, [email], (err) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.send("User blocked successfully.");
    }
  });
});

// Resume user
app.get("/resume-process", (req, res) => {
  const { email } = req.query;
  const query = "UPDATE users SET status = 1 WHERE email = ?";
  mysql.query(query, [email], (err) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.send("User resumed successfully.");
    }
  });
});

// Delete user
app.get("/delete-process", (req, res) => {
  const { email } = req.query;
  const query = "DELETE FROM users WHERE email = ?";
  mysql.query(query, [email], (err) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.send("User deleted successfully.");
    }
  });
});
