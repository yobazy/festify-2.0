import React, { Component } from 'react';
import axios from 'axios';
import './App.css';
import EventList from './components/Event/EventList';
import { useState, useEffect } from "react";


class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      events: [{name:'shambs', date:'asdasd'}]
    }
  }

  // fetchData = () => {
  //   axios.get('/api/data') // You can simply make your requests to "/api/whatever you want"
  //   .then((response) => {
  //     // handle success
  //     console.log(response.data) // The entire response from the Rails API

  //     console.log(response.data.message) // Just the message
  //     this.setState({
  //       message: response.data.message
  //     });
  //   }) 
  // }

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
      console.log(response.data.data)
      const events = response.data.data
      this.setState({
        events: events
      });
    })
  }

  printState = () => {
    console.log(this.state.events)
  }

  render() {
    return (
      <div className="App">
        <h1>Festify App</h1>
        <nav>
        <ul>
          <li><a onClick={this.home}>Logo</a></li>
          <li><a>User</a></li>
          <li><a onClick={this.about}>About</a></li>
          <li><a onClick={this.event}>Shambala</a></li>
          <li><a>Search</a></li>
        </ul>
        </nav>
        <div>
          <h2>Get started? Click one of the many festivals or search for your favourite ones!</h2>
        </div>
        <button onClick={this.updateEvents} >
          Fetch Data
        </button>        
        <button onClick={this.printState} >
          Print state
        </button>      
        <EventList
          events={this.state.events}/>
      </div>
    );
  }
}

export default App;
