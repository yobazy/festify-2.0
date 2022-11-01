import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';
// import Card from 'react-bootstrap/Card';
import './EventList.css';
import axios from 'axios';
import { DateRangePicker } from 'react-date-range';

export default function EventData(props) {

  return (
    <tbody>
      <tr>
        <th scope="row">Get Together</th>
        <td>Edmonton Expo Centre</td>
        <td>Edmonton AB</td>
        <td>December 20, 2022</td>
      </tr>
    </tbody>
  );
}