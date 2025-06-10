const express = require("express");
const mysql2 = require("mysql2");
const fileUploader = require("express-fileupload");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.json()); // Add this line to parse JSON bodies
const PORT = 2024;

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
const dbConfig = {
    host: "127.0.0.1",
    user: "root",
    password: "A@82059raj",
    database: "project",
};

const mysql = mysql2.createConnection(dbConfig);

mysql.connect((err) => {
    if (!err) {
        console.log("Connected to MySQL database successfully.");
    } else {
        console.error("Database connection error:", err.message);
    }
});

// Routes

// Home route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Signup process
app.get("/signup-process", (req, res) => {
    const { txtEmail, pwd, combo: utype } = req.query;

    const query = "INSERT INTO users (email, pwd, utype, status) VALUES (?, ?, ?, 1)";
    mysql.query(query, [txtEmail, pwd, utype], (err) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.send("Signed up successfully!");
        }
    });
});

// Login process
app.get("/login-process", (req, res) => {
    const { txtEmaill: email, txtPwd: pwd } = req.query;

    const query = "SELECT * FROM users WHERE email = ? AND pwd = ?";
    mysql.query(query, [email, pwd], (err, result) => {
        if (err) {
            res.status(500).send(err.message);
        } else if (result.length === 0) {
            res.send("Invalid ID or password.");
        } else if (result[0].status === 1) {
            res.send(result[0].utype);
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
app.post("/profile-submit", (req, res) => {
    if (!req.files || !req.files.picUpload) {
        return res.status(400).json({ status: "error", message: "No file uploaded." });
    }

    const file = req.files.picUpload;

    if (!file.mimetype.startsWith("image/")) {
        return res.status(400).json({ status: "error", message: "Please upload an image file." });
    }

    const fileName = `${Date.now()}_${file.name}`;
    const uploadPath = path.join(__dirname, "public/uploads", fileName);

    const uploadsDir = path.join(__dirname, "public/uploads");
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    file.mv(uploadPath, (err) => {
        if (err) {
            return res.status(500).json({ status: "error", message: err.message });
        }

        const {
            emailid, name, gender, dob, address, city,
            contact, field, insta, youtube, otherinfo,
        } = req.body;

        const query = `
            INSERT INTO iprofile (emailid, name, gender, dob, address, city, contact, field, insta, youtube, otherinfo, picpath)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        mysql.query(query, [
            emailid, name, gender, dob, address, city,
            contact, field, insta, youtube, otherinfo, fileName
        ], (err) => {
            if (err) {
                return res.status(500).json({ status: "error", message: err.message });
            }
            res.json({ status: "success", message: "Profile created successfully!" });
        });
    });
});

// Influencer Profile Update
app.post("/profile-update", (req, res) => {
    const {
        emailid, name, gender, dob, address, city,
        contact, field, insta, youtube, otherinfo,
    } = req.body;

    let fileName = null;

    const proceedUpdate = () => {
        const query = `
            UPDATE iprofile SET 
                name = ?, gender = ?, dob = ?, address = ?, city = ?, contact = ?, 
                field = ?, insta = ?, youtube = ?, otherinfo = ?
                ${fileName ? ', picpath = ?' : ''}
            WHERE emailid = ?
        `;

        const params = [
            name, gender, dob, address, city, contact,
            field, insta, youtube, otherinfo
        ];

        if (fileName) params.push(fileName);
        params.push(emailid);

        mysql.query(query, params, (err) => {
            if (err) return res.status(500).json({ status: "error", message: err.message });
            res.json({ status: "success", message: "Profile updated successfully!" });
        });
    };

    if (req.files && req.files.picUpload) {
        const file = req.files.picUpload;
        if (!file.mimetype.startsWith("image/")) {
            return res.status(400).json({ status: "error", message: "Please upload an image file." });
        }

        fileName = `${Date.now()}_${file.name}`;
        const uploadPath = path.join(__dirname, "public/uploads", fileName);

        const uploadsDir = path.join(__dirname, "public/uploads");
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        file.mv(uploadPath, (err) => {
            if (err) return res.status(500).json({ status: "error", message: err.message });
            proceedUpdate();
        });
    } else {
        proceedUpdate();
    }
});

// Client Profile Submit
app.post("/client-profile-submit", (req, res) => {
    const { emailid, name, city, state, org, contact } = req.body;

    const query = `
        INSERT INTO cprofile (emailid, name, city, state, org, mobile)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    mysql.query(query, [emailid, name, city, state, org, contact], (err) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        res.json({ status: "success", message: "Client profile created successfully!" });
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
        if (err) return res.status(500).json({ status: "error", message: err.message });
        res.json({ status: "success", message: "Client profile updated successfully!" });
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
    mysql.query(query, [email, eventTitle, eventDate, eventTime, city, venue], (err) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.send("Event posted successfully!");
        }
    });
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
    const { recordid,events, doe, tos, venue, city } = req.body;

    if (!recordid) {
        return res.status(400).json({ error: "recordid is required." });
    }

    // Build update fields dynamically
    let fields = [];
    let values = [];

    if(events){
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
app.get("/fetch-users", (req, res) => {
    const query = "SELECT * FROM iprofile";
    mysql.query(query, (err, results) => {
        if (err) {
            res.status(500).send(err.message);
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
        conditions = fields.map(field => "field like ?");
        params = fields.map(field => '%' + field + '%');
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

app.post('/api/save-influencer', (req, res) => {
    const { cemail, iemail } = req.body;
    
    // Validate input
    if (!cemail || !iemail) {
        return res.status(400).json({
            status: 'error',
            message: 'Client email and influencer email are required.'
        });
    }
    
    // Check if influencer exists
    const checkInfluencerQuery = 'SELECT emailid FROM iprofile WHERE emailid = ?';
    mysql.query(checkInfluencerQuery, [iemail], (err, results) => {
        if (err) {
            return res.status(500).json({
                status: 'error',
                message: 'Database error while checking influencer.',
                details: err.message
            });
        }
        
        if (results.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Influencer not found.'
            });
        }
        
        // Insert into savedinfluencers table
        const insertQuery = 'INSERT INTO savedinfluencers (cemail, iemail) VALUES (?, ?)';
        mysql.query(insertQuery, [cemail, iemail], (err, result) => {
            if (err) {
                // Check if it's a duplicate entry error
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(200).json({
                        status: 'info',
                        message: 'Influencer already saved.'
                    });
                }
                return res.status(500).json({
                    status: 'error',
                    message: 'Failed to save influencer.',
                    details: err.message
                });
            }
            
            res.status(201).json({
                status: 'success',
                message: 'Influencer saved successfully.'
            });
        });
    });
});

// GET /api/get-saved-influencers - Get all saved influencers for a client
app.get('/api/get-saved-influencers', (req, res) => {
    const { cemail } = req.query;
    
    if (!cemail) {
        return res.status(400).json({
            status: 'error',
            message: 'Client email is required.'
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
                status: 'error',
                message: 'Failed to retrieve saved influencers.',
                details: err.message
            });
        }
        
        res.json(results);
    });
});

// DELETE /api/remove-saved-influencer - Remove a saved influencer
app.delete('/api/remove-saved-influencer', (req, res) => {
    const { cemail, iemail } = req.body;
    
    if (!cemail || !iemail) {
        return res.status(400).json({
            status: 'error',
            message: 'Client email and influencer email are required.'
        });
    }
    
    const deleteQuery = 'DELETE FROM savedinfluencers WHERE cemail = ? AND iemail = ?';
    mysql.query(deleteQuery, [cemail, iemail], (err, result) => {
        if (err) {
            return res.status(500).json({
                status: 'error',
                message: 'Failed to remove influencer.',
                details: err.message
            });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: 'info',
                message: 'Influencer not found in saved list.'
            });
        }
        
        res.json({
            status: 'success',
            message: 'Influencer removed successfully.'
        });
    });
});

// Additional endpoint to check if an influencer is saved
app.get('/api/check-saved-influencer', (req, res) => {
    const { cemail, iemail } = req.query;
    
    if (!cemail || !iemail) {
        return res.status(400).json({
            status: 'error',
            message: 'Client email and influencer email are required.'
        });
    }
    
    const query = 'SELECT COUNT(*) as count FROM savedinfluencers WHERE cemail = ? AND iemail = ?';
    mysql.query(query, [cemail, iemail], (err, results) => {
        if (err) {
            return res.status(500).json({
                status: 'error',
                message: 'Database error.',
                details: err.message
            });
        }
        
        res.json({
            saved: results[0].count > 0
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