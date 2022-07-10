import React, { Component } from 'react';
import axios from 'axios';
import './App.css';
import EventList from './components/Event/EventList';
import { useState, useEffect } from "react";


class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      message: 'Click the button to load data!'
    }
  }

  fetchData = () => {
    axios.get('/api/data') // You can simply make your requests to "/api/whatever you want"
    .then((response) => {
      // handle success
      console.log(response.data) // The entire response from the Rails API

      console.log(response.data.message) // Just the message
      this.setState({
        message: response.data.message
      });
    }) 
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
  
  event = () => {
    console.log('Event triggered')
    axios.get('/events')
    .then((response) => {
      console.log(response.data.data)
      const events = response.data.data
      console.log(response.data.message) // Just the message
      this.setState({
        message: response.data.message
      });
    })
  }

  // home = () => {
  //   axios.get('/home')
  //   .then((response) => {

  //   }
  // }

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
        <EventList
          events={this.events}/>
        <h1>{ this.state.message }</h1>
        <button onClick={this.fetchData} >
          Fetch Data
        </button>        
      </div>
    );
  }
}

export default App;
