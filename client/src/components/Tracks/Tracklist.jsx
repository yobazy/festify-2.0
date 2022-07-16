import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import '../../../src/Event.css'

export default function Tracklist(props) {

  const [tracklist, setTracklist] = useState([]);

  useEffect(() => {
    axios.get(`/tracks`)
      .then(result => setTracklist(result.data))
  }, []);

  console.log("TRACKLIST", tracklist.tracks);

  // const listTracks = tracklist.tracks.map((track) => {
  //   return (
  //     <h3>{track.name}</h3>
  //   )
  // })

  return (
    <div className='tracklist'>
      {/* <ul>{listTracks}</ul> */}
    </div>
  )
}


