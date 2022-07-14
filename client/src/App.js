import React, { Component } from 'react';
import axios from 'axios';
import './App.css';
import EventList from './components/Event/EventList';
import EventListItem from './components/Event/EventListItem';
import { useState, useEffect } from "react";
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import headerImg from "./images/header.jpeg";



export default function App() {
  const [state, setState] = useState({
    events: [{ name: 'shambs', date: 'asdasd', artistList: [{ name: 'clams casino' }] }]
  })
  useEffect(() => {
    console.log('Event triggered')
    axios.get('/events')
      .then((response) => {
        console.log("response.data", response.data)
        const events = response.data.data
        setState({
          events: events
        });
      })
  }, []);

  // const printState = () => {
  //   console.log(state.events[0])
  //   console.log(Event.first)
  // }

  return (
    <BrowserRouter>
    <div className="App">
      <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand href="/">Festify</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link href="/">Home</Nav.Link>
            <Nav.Link href="#features">User</Nav.Link>
            <Nav.Link href="#pricing">Search</Nav.Link>
          </Nav>
        </Container>
      </Navbar>
      <div>
          <img src={headerImg} className="header-photo" alt="header"/>
          <h2>Get started? Click one of the many festivals or search for your favourite ones!</h2>
        </div>
      {/* <Button onClick={printState} >
        Print state
      </Button> */}
      <Routes>
        <Route path="/events" element={
          <EventList
            events={state.events} />
        }>
        </Route>
        <Route path="/events/:id" element={
          <EventListItem/>
        }>
        </Route>
      </Routes>
    </div>
    </BrowserRouter>
  );
}


