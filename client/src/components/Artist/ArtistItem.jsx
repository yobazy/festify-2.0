import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import '../../../src/Event.css'
import Tracklist from '../Tracks/Tracklist';
import TracklistItem from '../Tracks/TrackListItem';
// import artistLink from '../../../src/images/spot-link4.jpeg';
import '../../../src/Artist.css'
import chasingPoster from '../../images/chasing-summer.jpeg';
import EmbedContainer from "react-oembed-container";


export default function Artist(props) {
  // console.log(props);

  let artistGenres = null
  let artistPic = null
  let spotLink = null
  let emptyBox = null
  let evntImg = null
  let playlistEmbed = null

  console.log('check length', Object.keys(props.artistInfo).length !== 0)
  if (Object.keys(props.artistInfo).length !== 0) {
    spotLink = props.artistInfo[0].href
    console.log('spotlink', spotLink)

    artistPic = props.artistInfo[0].images[0].url

    artistGenres = props.artistInfo[0].genres.join(', ');

  }

  else {
    emptyBox = "👈 Click on an artist and check out their tracks!"

    evntImg = chasingPoster;
    
    playlistEmbed ='<iframe style="border-radius:12px" src="https://open.spotify.com/embed/playlist/4OJzv9KUCxcQzjuiR7Klgl?utm_source=generator&theme=0" width="93%" height="380" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>';

    const player = () => {
      return(
      <EmbedContainer markup={playlistEmbed}>
      <div dangerouslySetInnerHTML={{ __html: playlistEmbed }}></div>
    </EmbedContainer>
      )
    }
  }
  
    // const trackPreview = props.tracks[0].preview_url
  

  return (
    <>
    <div className='artist-info'>
      <div className='artist-header'>
        <p className='empty'>{emptyBox}</p>
          {artistPic && <img className='artist-icon' src={artistPic} />}
        {props.artist && 
        <div className='artist-title'>
          <h1 className='artist-name'>
            {props.artist}
          </h1>
          <h2 className='genre-title'>Genres:</h2>
          {artistGenres && 
          <div className='genres'>
            {artistGenres}
          </div>}
        </div>}
      </div>
      <div >
      {playlistEmbed && 
      <EmbedContainer markup={playlistEmbed}>
      <div className="player-container" dangerouslySetInnerHTML={{ __html: playlistEmbed }}></div>
      </EmbedContainer>}
      </div>
      <Tracklist
        tracks={props.tracks} />
    </div>
    <img id="poster2"src={evntImg} />
    </>
  )
}


