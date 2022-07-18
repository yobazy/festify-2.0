import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
// import '../../../src/Event.css'
import Player from './Player';
import '../../../src/Tracks.css'

export default function Tracklist(props) {
  // console.log('tracklist props', props)
  // const [tracklist, setTracklist] = useState([]);
  // const [state, setState] = useState({
  //   tracks: [],
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
  // const [img, setImg] = useState();

  // function handlePlay() {
  //   console.log("HELLLOOO");
  // }

  const listTracks = props.tracks.map((track) => {
    const img = track.album.images[1].url;
    return (
      <div className='track-info'>
      <h3 className='track-name'>{track.name}</h3>
      <img className='track-img' src={img} alt="icons" />
      </div>
    )
  })

  return (
    <div className='tracklist'>
      <ul>{listTracks}</ul>
    </div>
  )
}

// hellloooo 


