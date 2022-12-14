import React, { useEffect, useState } from "react";
import "./Stats.css";
import axios from "axios";

const cities = [
  { name: "Onclick", temperature: "50F" },
  { name: "Onclick", temperature: "50F" },
];

const http = axios.create({
  baseURL: "http://localhost:8081",
  headers: {
    "Content-type": "application/json",
  },
});

const Row = (props) => {
  const { name, temperature } = props;
  return (
    <tr>
      <td>{name}</td>
      <td>{temperature}</td>
    </tr>
  );
};

const Table = (props) => {
  const { data } = props;
  return (
    <table>
      <tbody>
        {data.map((row, key) => (
          <Row name={row.name} temperature={row.temperature} key={key} />
        ))}
      </tbody>
    </table>
  );
};

const ProjectData = [
  {
    Project: "LF3",
    Company: 19,
    Course: "Feale",
    Primary_Major: "CS",
    Secondary_Major: "CS",
    Tertiary_Major: "CS",
    Count: 10,
    Select: "btn",
  },
];
const studentData = [
  {
    Project: "LF3",
    Company: 19,
    Course: "Feale",
    Primary_Major: "CS",
    Secondary_Major: "CS",
    Tertiary_Major: "CS",
    Count: 10,
    Select: "btn",
  },
];
const switchData = [];

const Stats = () => {
  const [rows, setRows] = useState(cities);
  const [data, setData] = useState(ProjectData);
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(1);

  console.log(data[0]);

  useEffect(() => {
    const func = async () => {
      const projectList = await http.get("/api/projects");
      setData(
        projectList.data.filter(
          (project) => project.count <= min || project.count >= max
        )
      );
    };

    func();
  }, [min, max]);

  const minHandler = (value) => {
    setMin(parseInt(value));
  };

  const maxHandler = (value) => {
    setMax(parseInt(value));
  };

  return (
    <div>
      <p>Select minimum and maximum team values (inclusive)</p>
      <lable>
        Min Value
        <select onChange={({ target: { value } }) => minHandler(value)}>
          <option value="0">0</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
          <option value="7">7</option>
          <option value="8">8</option>
          <option value="9">9</option>
          <option value="10">10</option>
        </select>
      </lable>
      <lable>
        Max Value
        <select onChange={({ target: { value } }) => maxHandler(value)}>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
          <option value="7">7</option>
          <option value="8">8</option>
          <option value="9">9</option>
          <option value="10">10</option>
        </select>
      </lable>
      <div className="Stat">
        <Table data={rows} />
      </div>
      <div>
        <table>
          <thead>
            <tr>
              {Object.keys(data[0])
                .filter((key) => {
                  switch (key) {
                    case "title":
                    case "company":
                    case "course_name":
                    case "count":
                      return true;
                  }
                  return false;
                })
                .map((key) => {
                  return <th>{key}</th>;
                })}
            </tr>
          </thead>
          <tbody>
            {data.map((project) =>
              Object.keys(project).map((key) => {
                return (
                  <tr key={key}>
                    <td>{project[key]}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <p>Space</p>
        <table>
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Major</th>
              <th>Ip/config</th>
              <th>Preference</th>
            </tr>
          </thead>
          <tbody>
            {studentData.map((project) => {
              Object.keys(project).map((key) => {
                return (
                  //If studentData is empty, display message: "Select a Project!"
                  <tr key={key}>
                    <td>{project[key]}</td>
                  </tr>
                );
              });
            })}
          </tbody>
        </table>
        <p>""</p>

        <table>
          <thead>
            <tr>
              <th>Project</th>
              <th>Company</th>
              <th>Course</th>
              <th>Count</th>
              <th>Preference</th>
            </tr>
          </thead>
          <tbody>
            {switchData.map((val, key) => {
              return (
                <tr key={key}>
                  <td>{val.Project}</td>
                  <td>{val.Company}</td>
                  <td>{val.Course}</td>
                  <td>{val.Primary_Major}</td>
                  <td>{val.Primary_Major}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Stats;
