---
title: "Introduction to ONIXPlayer"
description: "Why ONIXLabs built ONIXPlayer: a glass media player for macOS, Windows and Linux with music, video, MIDI and tracker playback, and real-time visualisations."
category: products
order: 3
path: /Documentation/ONIXPlayer/Introduction-To-ONIXPlayer
published: 2026-11-10
---

Media players really came into their own in the early 2000s. They existed before that, of course, but they were brutalist and functional: a list of files, a few buttons, a seek bar. Then came Winamp, and Windows Media Player for Windows XP. Windows Media Player 7 to 10 in particular were fun, energetic and engaging, with skins, visualisations and a sense that playing your music was an experience in itself.

That was a world before streaming. YouTube, Netflix and Amazon Prime Video didn't exist yet, and the media you enjoyed lived on your own computer.

## The Problem: The Fun Went Away

As the years rolled on, streaming became the norm, and other operating systems grew more popular. Each kept a media player of its own, but one by one they drifted back to the brutalist and functional, or grew into media centres like Kodi. Somewhere along the way, the desire to play media on a PC seemed to fade.

For us, it never did. And as we started working across Windows, Linux and macOS every day, we noticed a gap. Cross-platform media players were either free and looked cheap, or cost money and looked only marginally better. In our opinion at least, nothing has ever lived up to Windows Media Player in the early 2000s.

The formats hadn't got any simpler, either. Music arrives as MP3, FLAC, WAV, OGG, M4A, AAC and WMA. Video comes in containers the desktop can't always play natively. MIDI files contain no sound at all, only instructions for a synthesiser, and tracker modules from the Amiga era need a renderer of their own. Each is handled somewhere, by some tool, and rarely by one that's a pleasure to use.

At **ONIXLabs**, we asked a simple question:

> What if a media player could be fun again, on every desktop?

## The Solution: A Simple Mix That Works

So we built one. **ONIXPlayer** is a media player for macOS, Windows and Linux with a slick glass interface, playback for music, video, MIDI and tracker modules, and real-time visualisations that make the music something to watch. It's a simple mix, and it works.

Drop files on the window and they join the playlist, whatever they are. Behind the scenes, ONIXPlayer works out how each one should be played:

- Audio plays directly, with a real-time visualisation filling the window
- Video in a native format plays directly; anything else is transcoded on the fly
- MIDI is synthesised with FluidSynth and a SoundFont of your choice
- Tracker modules are rendered with libopenmpt
- Internet media streams from a URL, or downloads to a location you choose

ONIXPlayer is built with Electron and Angular, and uses FFmpeg for transcoding and metadata. FluidSynth, for MIDI, is optional. A first-run setup wizard detects what's already installed and helps install the rest.

## Design Principles

ONIXPlayer is built on a few key principles:

### Everything in One Place

One window, one playlist and one set of controls for every format. Music, video, MIDI and tracker modules sit side by side in the same playlist, and the same equaliser applies to all of their audio.

### Music Worth Watching

Visualisations are the heart of the player, not an afterthought. Seventeen ship with ONIXPlayer, and every audio-reactive one responds to the music as it plays.

### Out of the Way

Fullscreen controls appear when you move the mouse and hide again on their own. The miniplayer floats above your other windows while you work. When you need the screen clear, **Ctrl/Cmd + D** stops playback, clears the playlist and recent files, and closes the window.

### Smooth on Every Platform

ONIXPlayer runs on macOS (Apple Silicon and Intel), Windows and Linux. Its rendering is tuned so visualisations stay smooth on high-resolution, high-refresh displays, with a frame-rate cap that can be raised or removed in Settings.

## Highlights

Here's a closer look at what ONIXPlayer does:

### Real-Time Visualisations

Seventeen visualisations, grouped as they appear in the menu:

- **Bars & Waves:** Analyzer, Classic, Modern, Plasma, Infinity, Neon, Hawking and Onix
- **Signature:** Reactor and Spotlight
- **Nostalgia:** Twirl, Warp, Ripple, Pulsar and Hallucia
- **Simple:** Logo, Album Art and Blank

They range from a frequency analyser and an oscilloscope-style waveform to Reactor's concentric colour tower, where bass hits flip the swirl and jump the palette. Album Art shows the track's embedded artwork over a blurred copy of itself. Each audio-reactive visualisation can be tuned for sensitivity, trails, line width, glow and more, and switching between them crossfades with a fade, zoom, shrink or blur.

### Audio Playback

ONIXPlayer plays MP3, FLAC, WAV, OGG, M4A, AAC and WMA out of the box. A 10-band graphic equaliser, from 31 Hz to 16 kHz, applies to all audio, including MIDI and video soundtracks, with Flat, Rock, Pop, Jazz, Bass Boost, Vocal and Treble Boost presets.

### Video Playback

ONIXPlayer plays MP4, M4V, MKV, AVI, WebM and MOV. Formats the player can't show natively are transcoded on the fly, choosing the lightest route for each file: serving it directly, copying the video stream into a new container, re-encoding only the audio, or transcoding fully. Hardware encoders are used where they're available, with software encoding as the fallback, and the transcoding quality is selectable.

Video comes with the controls you'd expect: multiple audio tracks with a preferred language, embedded and external subtitles, aspect ratio modes, flipping, and real-time colour adjustments with Vivid, Warm, Cool, Soft, Noir and Night presets.

### MIDI and Tracker Modules

MIDI files are synthesised with FluidSynth using high-quality SoundFonts, and you can install several and switch between them. Tracker modules, including Oktalyzer, MOD, XM, S3M and IT, are rendered with libopenmpt. Both play with full visualisation support.

### Internet Media

Open a URL to stream remote audio and video directly, without downloading it first. Or choose **Download & Play**, pick where the file should be saved, and ONIXPlayer plays it from there once it arrives.

### Playlists

Drag and drop files to build a playlist, then shuffle, repeat, and let it advance from track to track. Playlists save as `.opp` files, and recent files and playlists are a click away.

### Fullscreen and Miniplayer

Double-click for a clean fullscreen view, and press Escape to leave it. The compact miniplayer snaps to screen edges, remembers its position, and can appear automatically when the main window loses focus.

## Summary

**ONIXPlayer** was created because playing media on a computer should still be a pleasure, as it was in the early 2000s, on whichever desktop you use. By bringing music, video, MIDI, tracker modules and internet media into one glass window, and pairing every track with a real-time visualisation, ONIXPlayer makes playing your media simple again, and makes it fun.

It's open source under the MIT License, and runs on macOS, Windows and Linux.
