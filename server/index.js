const express = require('express');
const mysql = require('../database/sqlizeIndex.js');

const app = express();


app.use(express.static(__dirname + '/../client/dist'));
app.get('/instructors/:id', (req, res) => {
  mysql.sequelize.authenticate()
    .then(() => mysql.Join.findAll({ where: { course_id: req.params.id } }))
    .then((data) => {
      const info = [];
      const promises = [];
      data.forEach((inst) => {
        const instructor = ({
          id: inst.dataValues.inst_id,
          instInfo: null,
          courseInfo: null,
        });
        const newPromise = mysql.Instructors.findOne({ where: { id: inst.dataValues.inst_id } })
          .then((instData) => {
            instructor.instInfo = instData;
            return mysql.Join.findAll({ where: { inst_id: inst.dataValues.inst_id } });
          })
          .then(courses => mysql.Courses.findAll({
            where: { id: [courses.map(course => course.course_id)] },
          }))
          .then((courseData) => {
            instructor.courseInfo = courseData;
            info.push(instructor);
          });
        promises.push(newPromise);
      });
      return Promise.all(promises)
        .then(() => res.send(info));
    });
});

app.listen(3000, () => {
  console.log('listening on port 3000');
});
