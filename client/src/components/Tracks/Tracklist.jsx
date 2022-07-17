import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import '../../../src/Event.css'

export default function Tracklist(props) {
  console.log('tracklist props', props)
  // const [tracklist, setTracklist] = useState([]);
  // const [state, setState] = useState({
    // tracks: [],
  // })

  // useEffect(() => {
  //   // console.log('Event triggered')
  //   axios.get('/tracks')
  //     .then((response) => {
  //       // console.log("response.data", response.data)
  //       const tracks = response.data
  //       console.log(response.data)
  //       setState({
  //         tracks: tracks
  //       });
  //     })
  // }, []);
  const listTracks = props.tracks.map((track) => {
    return (
      <h3>{track.name}</h3>
    )
  })

  return (
    <div className='tracklist'>
      <ul>{listTracks}</ul>
    </div>
  )
}


