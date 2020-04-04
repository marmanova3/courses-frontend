import React from "react";
import { FaChalkboardTeacher, FaLaptopCode, FaCalendarCheck, FaClipboardList, FaRegFile } from 'react-icons/fa';
import student_icon from "../../../images/student.svg";
import teacher_icon from "../../../images/teacher.svg";
import admin_icon from "../../../images/admin.svg";

export const getDisplayDateTime = (dateTime, fullVersion) => {
    let dateTimeISOFormat = new Date(dateTime);
    let day = dateTimeISOFormat.getDay();
    let dayFormated = (day < 10 ? '0' + day : day);
    let month = (dateTimeISOFormat.getMonth()+1);
    let monthFormated = (month < 10 ? '0' + month : month);
    let year = (dateTimeISOFormat.getFullYear());
    let hours = dateTimeISOFormat.getHours();
    let hoursFormated = (hours < 10 ? '0' + hours : hours);
    let minutes = dateTimeISOFormat.getMinutes();
    let minutesFormated = (minutes < 10 ? '0' + minutes : minutes);
    let date = dayFormated + '.' + monthFormated + '.';
    let time = hoursFormated + ':' + minutesFormated;

    return fullVersion ? (date+ year + ' ' + time) : date + ' ' + time;
};

export const getIcon = (name) => {
    switch (name) {
        case "Lab":  return <FaLaptopCode  className="icon"/>;
        case "Lecture":  return <FaChalkboardTeacher  className="icon"/>;
        case "Task":   return <FaCalendarCheck  className="icon"/>;
        case "OralExam":
        case "TestTake":
            return <FaClipboardList  className="icon"/>;
        case "Material": return <FaRegFile className="icon"/>;
        case "Student":
            return <img src={student_icon} alt="student" width="20px" height="20px"/>;
        case "Teacher":
            return <img src={teacher_icon} alt="teacher" width="20px" height="20px"/>;
        case "Admin":
            return <img src={admin_icon} alt="admin" width="20px" height="20px"/>;
        default: return ;
    }
};