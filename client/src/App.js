import React, { Component } from 'react';
import axios from 'axios';
import './App.css';
import EventList from './components/Event/EventList';
import { useState, useEffect } from "react";
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import 'bootstrap/dist/css/bootstrap.min.css';
import headerImg from "./images/header.jpeg";


class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      events: [{name:'shambs', date:'asdasd', venue: {name:"Max Bell", location: "YYC"}, artistList:[{name:'clams casino'}]}]
    }
  }

  about = () => {
    axios.get('/about')
    .then((response) => {
      console.log(response.data)

      console.log(response.data.message) // Just the message
      this.setState({
        message: response.data.message
      });
    })
  }
  
  updateEvents = () => {
    console.log('Event triggered')
    axios.get('/events')
    .then((response) => {
      console.log(response.data)
      const events = response.data.data
      this.setState({
        events: events
      });
    })
  }

  printState = () => {
    console.log(this.state.events[0])
    console.log(Event.first)
  }

  render() {
    return (
      <div className="App">
        <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand href="#home">Festify</Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link href="#home">Home</Nav.Link>
            <Nav.Link href="#features">User</Nav.Link>
            <Nav.Link href="#pricing">Search</Nav.Link>
          </Nav>
        </Container>
      </Navbar>
        <div>
          <img src={headerImg} className="header-photo" alt="header"/>
          <h2>Get started? Click one of the many festivals or search for your favourite ones!</h2>
        </div>
        <Button onClick={this.updateEvents} >
          Fetch Data
        </Button>        
        <Button onClick={this.printState} >
          Print state
        </Button>      
        <EventList
          events={this.state.events}/>
      </div>
    );
  }
}

export default App;
