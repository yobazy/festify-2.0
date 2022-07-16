import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import '../../../src/Event.css'

export default function TracklistItem() {

  // const [tracklist, setTracklist] = useState({});

  // useEffect(() => {
  //   axios.get(`/tracks`)
  //     .then(result => setTracklist(result.data))
  // }, []);

  // console.log("TRACKLISTITEM", tracklist.tracks);

  return (
    <div className='artist-info'>
      {/* <h1 className='artist-name'>{artistName}</h1>
      <h3 className='track'>{trackList}</h3> */}
    </div>
  )
}


