import express, { json, response } from 'express'
import mysql from 'mysql'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import bcrypt, { hash } from 'bcrypt'
import jwt from 'jsonwebtoken'
import path from 'path'
import multer from 'multer'

const app = express();
app.use(cors(
    {
        origin: ["http://localhost:3000"],
        methods: ["POST", "GET", "PUT", "DELETE"],
        credentials: true
    }
));
app.use(cookieParser());
app.use(express.json());
app.use(express.static('public'));

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "studentreact"
})

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'public/images')
  },
  filename: (req, file, cb) => {
      cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
  }
})

const upload = multer({
  storage: storage
})

con.connect(function(err) {
    if(err) {
        console.log("Error in Connection");
    }else {
        console.log("Connected");
    }
})

const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
    if(!token) {
        return res.json({Error: "You are no Authenticate"});
    } else {
        jwt.verify(token, "jwt-secret-key", (err, decoded) => {
            if(err) return res.json({Error: "Token wrong"});
            req.role = decoded.role;
            req.id = decoded.id;
            next();
        })
    }
};

app.get('/dashboard',verifyUser, (req,res) => {
    return res.json({Status: "Success", role: req.role, id: req.id})
})

app.post('/adminlogin', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    con.query("SELECT * FROM admin WHERE username = ?", [username], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send({ Status: 'Error', Error: 'Something went wrong' });
      }
  
      if (!result.length) {
        return res.send({ Status: 'Error', Error: 'Invalid username or password' });
      }
  
      const hashedPassword = result[0].password;
      bcrypt.compare(password, hashedPassword, (err, response) => {
        if (err) {
          console.log(err);
          return res.status(500).send({ Status: 'Error', Error: 'Something went wrong' });
        }
  
        if (!response) {
          return res.send({ Status: 'Error', Error: 'Invalid username or password' });
        }
  
        const token = jwt.sign({ role: 'admin', id: result[0].id }, 'jwt-secret-key', { expiresIn: '1d' });
        res.cookie('token', token);
        res.send({ Status: 'Success', Data: result, id: result[0].id });
      });
    });
  });

  app.get('/logout', (req, res) => {
    res.clearCookie('token');
    return res.json({Status: "Success"});
})

app.put('/changePassword', verifyUser, (req, res) => {
    const id = req.id; // Accessing the user ID from the request object
    const currentPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword;
  
    // Fetch the user from the database
    const getUserQuery = 'SELECT * FROM admin WHERE id = ?';
    con.query(getUserQuery, [id], (err, result) => {
      if (err) {
        console.log(err);
        return res.json({ Status: 'Error', Error: 'Error in running query' });
      }
  
      if (result.length === 0) {
        return res.json({ Status: 'Error', Error: 'User not found' });
      }
  
      const user = result[0];
  
      // Compare the current password with the one stored in the database
      bcrypt.compare(currentPassword, user.password, (err, passwordMatch) => {
        if (err) {
          console.log(err);
          return res.json({ Status: 'Error', Error: 'Error in comparing passwords' });
        }
  
        if (!passwordMatch) {
          return res.json({ Status: 'Error', Error: 'Current password is incorrect' });
        }
  
        // Hash the new password
        bcrypt.hash(newPassword, 10, (err, hash) => {
          if (err) {
            console.log(err);
            return res.json({ Status: 'Error', Error: 'Error in hashing the new password' });
          }
  
          // Update the user's password in the database
          const updatePasswordQuery = 'UPDATE admin SET password = ? WHERE id = ?';
          con.query(updatePasswordQuery, [hash, id], (err, result) => {
            if (err) {
              console.log(err);
              return res.json({ Status: 'Error', Error: 'Error in updating the password' });
            }
  
            return res.json({ Status: 'Success', Message: 'Password changed successfully' });
          });
        });
      });
    });
  });

app.post('/addClass', (req, res) => {
    const { classname, section } = req.body;
  
    const sql = 'INSERT INTO class (classname, section) VALUES (?, ?)';
    const values = [classname, section ];
    con.query(sql, values, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: 'An error occurred while creating the class.' });
      }
  
      return res.status(200).json({ message: 'class added successfully.' });
    });
  });

  app.get('/manageClass', (req, res) => {
    const sql = "Select * FROM class";
    con.query(sql, (err, result) => {
        if(err) return res.json({Error: "Get Class error in sql"});
        return res.json({Status: "Success", Result: result})
    })
  })

  app.get('/getClass/:id', (req, res) => {
    const id = req.params.id;
    const sql = "Select * FROM class where id = ?";
    con.query(sql, [id], (err, result) => {
        if(err) return res.json({Error: "Get class error in sql"});
        return res.json({Status: "Success", Result: result})
    })
})

app.put('/updateClass/:id', (req, res) => {
    const id = req.params.id;
    const { classname, section } = req.body;
    const sql = "UPDATE class SET classname = ?, section = ? WHERE id = ?";
    const params = [classname, section, id];
    con.query(sql, params, (err, result) => {
      if (err) {
        console.log(err);
        return res.json({ Error: "Update class error in SQL" });
      }
      return res.json({ Status: "Success" });
    });
  });

  app.delete('/deleteClass/:id', (req, res) => {
    const id = req.params.id;
    const sql = "Delete FROM class WHERE id = ?";
    con.query(sql, [id], (err, result) => {
        if(err) return res.json({Error: "Update class error in sql"});
        return res.json({Status: "Success"})
    })
})

  app.get('/getClasses', (req, res) => {
    const sql = 'SELECT * FROM class';
    con.query(sql, (err, result) => {
      if (err) {
        console.error('Get class error in SQL:', err);
        return res.status(500).json({ error: 'An error occurred while fetching class.' });
      }
      return res.status(200).json(result);
    });
  });
  
  app.post('/AddStudent', upload.single('image'), (req, res) => {
    const {
      studentname,
      email,
      classname,
      gender,
      birth,
      studentid,
      father,
      mother,
      contact,
      altcontact,
      address,
      password,
    } = req.body;
  
    // Check if the email already exists in the database
    const emailExistsQuery = 'SELECT id FROM student WHERE email = ?';
    con.query(emailExistsQuery, [email], (err, result) => {
      if (err) {
        console.log(err);
        return res.json({ Status: 'Error', Error: 'Error in running query' });
      }
  
      if (result.length > 0) {
        return res.json({ Status: 'Error', Error: 'Email already exists' });
      }
  
      // Hash the password before inserting into the database
      bcrypt.hash(password, 10, (hashErr, hash) => {
        if (hashErr) {
          console.log(hashErr);
          return res.json({ Status: 'Error', Error: 'Error in hashing password' });
        }
  
        const insertQuery = `
          INSERT INTO student
          (studentname, email, classname, gender, birth, studentid, father, mother, contact, altcontact, address, password, image)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
  
        const values = [
          studentname,
          email,
          classname,
          gender,
          birth,
          studentid,
          father,
          mother,
          contact,
          altcontact,
          address,
          hash, // Insert the hashed password
          req.file ? req.file.filename : '', // Insert the filename
        ];
  
        con.query(insertQuery, values, (insertErr) => {
          if (insertErr) {
            console.log(insertErr);
            return res.json({ Status: 'Error', Error: 'Error inserting student' });
          }
  
          return res.json({ Status: 'Success', Message: 'User added successfully' });
        });
      });
    });
  });

  app.get('/manageStudent', (req, res) => {
    const sql = "SELECT student.*, class.classname FROM student JOIN class ON student.classname = class.id";
    con.query(sql, (err, result) => {
      if (err) {
        console.error('Error in fetching students:', err);
        return res.json({ Status: 'Error', Error: 'An error occurred while fetching students' });
      }
      return res.json({ Status: 'Success', Result: result });
    });
  });
  
  app.delete('/deleteStudent/:id', (req, res) => {
    const id = req.params.id;
    const sql = "Delete FROM student WHERE id = ?";
    con.query(sql, [id], (err, result) => {
        if(err) return res.json({Error: "Update student error in sql"});
        return res.json({Status: "Success"})
    })
})

app.get('/getStudent/:id', (req, res) => {
  const id = req.params.id;
  const sql = "SELECT student.*, class.classname FROM student JOIN class ON student.classname = class.id WHERE student.id = ?";
  con.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error retrieving student details: ', err);
      return res.status(500).json({ error: 'An error occurred while retrieving student details.' });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: 'student not found.' });
    }

    return res.status(200).json({ Status: 'Success', Result: result });
  });
});

app.put('/updateStudent/:id', upload.single('image'), (req, res) => {
  const id = req.params.id;
  const { studentname,
    email,
    classname,
    gender,
    birth,
    studentid,
    father,
    mother,
    contact,
    altcontact,
    address, } = req.body;
  let imagePath = null;

  // Check if a new image file is uploaded
  if (req.file) {
    imagePath = req.file.filename;
  } else {
    // No new file uploaded, use the existing image path
    imagePath = req.body.image;
  }

  const sql = "UPDATE student SET studentname = ?, email = ?, classname = ?, gender = ?, birth = ?, studentid = ?, father = ?, mother = ?, contact = ?, altcontact = ?, address = ?, image = ? WHERE id = ?";
  const params = [studentname,
    email,
    classname,
    gender,
    birth,
    studentid,
    father,
    mother,
    contact,
    altcontact,
    address, imagePath, id];

  con.query(sql, params, (err, result) => {
    if (err) {
      console.log(err);
      return res.json({ Error: "Update student error in SQL" });
    }
    return res.json({ Status: "Success" });
  });
});
  
app.post('/addStudentNotice', (req, res) => {
  const { title, classname, message } = req.body;

  const sql = 'INSERT INTO studentnotice (title, classname, message) VALUES (?, ?, ?)';
  const values = [title, classname, message ];
  con.query(sql, values, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'An error occurred while creating the student_notic.' });
    }

    return res.status(200).json({ message: 'student_notic added successfully.' });
  });
});

app.get('/manageStudentNotice', (req, res) => {
  const sql = "SELECT studentnotice.*, class.classname FROM studentnotice JOIN class ON studentnotice.classname = class.id";
  con.query(sql, (err, result) => {
    if (err) {
      console.error('Error in fetching studentnotices:', err);
      return res.json({ Status: 'Error', Error: 'An error occurred while fetching studentnotices' });
    }
    return res.json({ Status: 'Success', Result: result });
  });
});

app.delete('/deleteStudentNotice/:id', (req, res) => {
  const id = req.params.id;
  const sql = "Delete FROM studentnotice WHERE id = ?";
  con.query(sql, [id], (err, result) => {
      if(err) return res.json({Error: "Update studentnotice error in sql"});
      return res.json({Status: "Success"})
  })
})

app.get('/getStudentNotice/:id', (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM studentnotice WHERE id = ?";
  con.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error fetching student notice:', err);
      return res.status(500).json({ Status: 'Error', Error: 'Error in fetching student notice' });
    }
    return res.json({ Status: 'Success', Result: result });
  });
});

// Update a student notice by ID
app.put('/updateStudentNotice/:id', (req, res) => {
  const id = req.params.id;
  const { title, classname, message } = req.body;
  const sql = "UPDATE studentnotice SET title = ?, classname = ?, message = ? WHERE id = ?";
  const params = [title, classname, message, id];
  con.query(sql, params, (err, result) => {
    if (err) {
      console.error('Error updating student notice:', err);
      return res.status(500).json({ Status: 'Error', Error: 'Error in updating student notice' });
    }
    return res.json({ Status: 'Success' });
  });
});

app.post('/addPublicNotice', (req, res) => {
  const { noticetitle, noticemessage } = req.body;

  const sql = 'INSERT INTO publicnotice (noticetitle, noticemessage) VALUES (?, ?)';
  const values = [noticetitle, noticemessage ];
  con.query(sql, values, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'An error occurred while creating the public_notic.' });
    }

    return res.status(200).json({ message: 'public_notic added successfully.' });
  });
});

app.get('/managePublicNotice', (req, res) => {
  const sql = "Select * FROM publicnotice";
  con.query(sql, (err, result) => {
      if(err) return res.json({Error: "Get publicnotice error in sql"});
      return res.json({Status: "Success", Result: result})
  })
})

app.get('/getPublicNotice/:id', (req, res) => {
  const id = req.params.id;
  const sql = "Select * FROM publicnotice where id = ?";
  con.query(sql, [id], (err, result) => {
      if(err) return res.json({Error: "Get publicnotice error in sql"});
      return res.json({Status: "Success", Result: result})
  })
})

app.put('/updatePublicNotice/:id', (req, res) => {
  const id = req.params.id;
  const { noticetitle, noticemessage } = req.body;
  const sql = "UPDATE publicnotice SET noticetitle = ?, noticemessage = ? WHERE id = ?";
  const params = [noticetitle, noticemessage, id];
  con.query(sql, params, (err, result) => {
    if (err) {
      console.log(err);
      return res.json({ Error: "Update publicnotice error in SQL" });
    }
    return res.json({ Status: "Success" });
  });
});

app.delete('/deletePublicNotice/:id', (req, res) => {
  const id = req.params.id;
  const sql = "Delete FROM publicnotice WHERE id = ?";
  con.query(sql, [id], (err, result) => {
      if(err) return res.json({Error: "Update publicnotice error in sql"});
      return res.json({Status: "Success"})
  })
})

app.get('/searchStudent', (req, res) => {
  const studentname = req.query.studentname;
  const sql = "SELECT * FROM student WHERE studentname LIKE ? OR studentid LIKE ? OR email LIKE ? ";
  const searchQuery = `%${studentname}%`;
  con.query(sql, [searchQuery, searchQuery, searchQuery], (err, result) => {
    if (err) {
      return res.status(500).json({ Error: "Search student error in SQL" });
    }
    return res.status(200).json({ Status: "Success", Result: result });
  });
});

app.post('/searchReport', (req, res) => {
  const { fromdate, todate } = req.body;
  const sql = "SELECT * FROM student WHERE entrydate >= ? AND entrydate <= ?";
  const params = [fromdate, todate];
  con.query(sql, params, (err, result) => {
      if (err) {
          console.log(err);
          return res.status(500).json({ error: 'An error occurred while searching students.' });
      }
      return res.status(200).json(result);
  });
});

app.get('/studentDetail/:id', (req, res) => {
  const id = req.params.id;
  const sql = "SELECT student.*, class.classname as classname_Id, class.section FROM student JOIN class ON student.classname = class.id WHERE student.id = ?";
  con.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error retrieving student details: ', err);
      return res.status(500).json({ error: 'An error occurred while retrieving student details.' });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    return res.status(200).json({ Status: 'Success', Result: result });
  });
});

app.get('/classCount', (req, res) => {
  const sql = "Select count(id) as class from class";
  con.query(sql, (err, result) => {
      if(err) return res.json({Error: 'Error in running query'});
      return res.json(result);
  })
})

app.get('/studentCount', (req, res) => {
  const sql = "Select count(id) as student from student";
  con.query(sql, (err, result) => {
      if(err) return res.json({Error: 'Error in running query'});
      return res.json(result);
  })
})

app.get('/studentNoticeCount', (req, res) => {
  const sql = "Select count(id) as studentnotice from studentnotice";
  con.query(sql, (err, result) => {
      if(err) return res.json({Error: 'Error in running query'});
      return res.json(result);
  })
})

app.get('/publicNoticeCount', (req, res) => {
  const sql = "Select count(id) as publicnotice from publicnotice";
  con.query(sql, (err, result) => {
      if(err) return res.json({Error: 'Error in running query'});
      return res.json(result);
  })
})

app.post('/studentlogin', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  con.query("SELECT * FROM student WHERE email = ?", [email], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send({ Status: 'Error', Error: 'Something went wrong' });
    }

    if (!result.length) {
      return res.send({ Status: 'Error', Error: 'Invalid email or password' });
    }

    const hashedPassword = result[0].password;
    bcrypt.compare(password, hashedPassword, (err, response) => {
      if (err) {
        console.log(err);
        return res.status(500).send({ Status: 'Error', Error: 'Something went wrong' });
      }

      if (!response) {
        return res.send({ Status: 'Error', Error: 'Invalid email or password' });
      }

      const token = jwt.sign({ role: 'student', id: result[0].id }, 'jwt-secret-key', { expiresIn: '1d' });
      res.cookie('token', token);
      res.send({ Status: 'Success', Data: result, id: result[0].id });
    });
  });
});

app.put('/change_Password', verifyUser, (req, res) => {
  const id = req.id; // Accessing the user ID from the request object
  const currentPassword = req.body.currentPassword;
  const newPassword = req.body.newPassword;

  // Fetch the user from the database
  const getUserQuery = 'SELECT * FROM student WHERE id = ?';
  con.query(getUserQuery, [id], (err, result) => {
    if (err) {
      console.log(err);
      return res.json({ Status: 'Error', Error: 'Error in running query' });
    }

    if (result.length === 0) {
      return res.json({ Status: 'Error', Error: 'User not found' });
    }

    const user = result[0];

    // Compare the current password with the one stored in the database
    bcrypt.compare(currentPassword, user.password, (err, passwordMatch) => {
      if (err) {
        console.log(err);
        return res.json({ Status: 'Error', Error: 'Error in comparing passwords' });
      }

      if (!passwordMatch) {
        return res.json({ Status: 'Error', Error: 'Current password is incorrect' });
      }

      // Hash the new password
      bcrypt.hash(newPassword, 10, (err, hash) => {
        if (err) {
          console.log(err);
          return res.json({ Status: 'Error', Error: 'Error in hashing the new password' });
        }

        // Update the user's password in the database
        const updatePasswordQuery = 'UPDATE student SET password = ? WHERE id = ?';
        con.query(updatePasswordQuery, [hash, id], (err, result) => {
          if (err) {
            console.log(err);
            return res.json({ Status: 'Error', Error: 'Error in updating the password' });
          }

          return res.json({ Status: 'Success', Message: 'Password changed successfully' });
        });
      });
    });
  });
});

app.get('/studentProfile', verifyUser, (req, res) => {
  const studentId = req.id; // User's ID from the authenticated token

  const sql = `
    SELECT student.*, class.classname AS classname_Id, class.section
    FROM student
    JOIN class ON student.classname = class.id
    WHERE student.id = ?
  `;

  con.query(sql, [studentId], (err, result) => {
    if (err) {
      console.error('Error retrieving student profile:', err);
      return res.status(500).json({ error: 'An error occurred while retrieving student profile.' });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    return res.status(200).json({ Status: 'Success', Result: result });
  });
});

app.get('/studentNotice', verifyUser, (req, res) => {
  const studentId = req.id; // Authenticated student's ID

  // Retrieve the class of the authenticated student
  const getClassQuery = 'SELECT classname FROM student WHERE id = ?';
  con.query(getClassQuery, [studentId], (err, classResult) => {
    if (err) {
      console.error('Error fetching student class:', err);
      return res.status(500).json({ Status: 'Error', Error: 'An error occurred while fetching student class' });
    }

    if (classResult.length === 0) {
      return res.status(404).json({ Status: 'Error', Error: 'Student not found' });
    }

    const studentClassId = classResult[0].classname;

    // Retrieve student notices for the same class
    const sql = `
      SELECT studentnotice.*, class.classname
      FROM studentnotice
      JOIN class ON studentnotice.classname = class.id
      WHERE studentnotice.classname = ?
    `;

    con.query(sql, [studentClassId], (err, result) => {
      if (err) {
        console.error('Error in fetching studentnotices:', err);
        return res.status(500).json({ Status: 'Error', Error: 'An error occurred while fetching studentnotices' });
      }
      
      return res.json({ Status: 'Success', Result: result });
    });
  });
});

app.listen(8081, () => {
    console.log("Running");
})