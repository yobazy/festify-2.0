import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
// import '../../../src/Event.css'
import Player from './Player';
import '../../../src/Tracks.css'

export default function Tracklist(props) {
  console.log(props)
  const listTracks = props.tracks.map((track) => {
    const img = track.album.images[1].url;
    const feats = [];
    const featArtists = track.artists.map((artist) => {
      feats.push(artist['name'])
    })
    const f = feats.join(', ');
    return (
      <div className='track-info'>
        <div className='track-box'>
          <h3 className='track-name'>{track.name}</h3>
          <div className='feat'>
            <h5>Artists:</h5>
            <h5 className='feat'>{f}</h5>
          </div>
        </div>

        <img className='track-img' src={img} alt="icons" />
      </div>
    )
  })

  console.log(props.tracks);

  return (
    <div className='tracklist'>
      <ul className='unordered'> {listTracks}</ul>
    </div>
  )
}

// hellloooo 


