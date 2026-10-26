# Music Player (CodeAlpha Task 4)

A responsive, dark-themed music player built with **HTML5, CSS3, vanilla JavaScript**
and the HTML `<audio>` element. No frameworks, libraries, Node.js or build tools.

Two sample MP3 files are included in the `songs` folder so you can try the player
immediately. Replace them with music you are allowed to use, or add more tracks as
described in "Adding Your Songs" below.

## Features

- Album artwork area (generated gradient, or your own image), song title, artist and duration
- Play, pause, next and previous buttons
- Progress bar that updates while playing, with click, drag and keyboard seeking
- Current time and total duration display
- Volume slider and mute / unmute button
- Clickable playlist with the current song highlighted and an animated equalizer
- Shuffle and repeat (off, all songs, current song)
- Automatic playback of the next song when one finishes
- Friendly handling of missing or broken audio files (marked "Unavailable", with a message)
- Skips unavailable songs automatically during playback
- Space bar play/pause, plus media-key support in browsers that offer it
- Accessible button labels, live status messages and visible keyboard focus
- Responsive layout for desktop, tablet and mobile

## Folder Structure

```
Task-4-Music-Player/
├── index.html
├── style.css
├── script.js
├── README.md
└── songs/
    ├── song1.mp3
    └── song2-sample.mp3
```

## Adding Your Songs

1. Get MP3 files you are allowed to use (music you own or have rights to, or tracks
   with a license that allows your use, such as royalty-free or Creative Commons music).
   Always check each track's license.
2. Copy them into the `songs` folder.
3. Replace the included files, or edit the playlist at the top of `script.js` so each
   `src` value matches a real file in the `songs` folder.
4. Refresh the page.

If a file is missing, the player does not pretend it exists. That song shows as
"Unavailable" and a message explains what to check.

### Editing the playlist

Open `script.js` and change the `tracks` list:

```js
const tracks = [
  {
    title: "My Song",
    artist: "My Artist",
    src: "songs/my-song.mp3",
    colors: ["#7c5cff", "#22d3ee"],
  },
];
```

- `title` and `artist` are shown in the player.
- `src` is the path to the MP3 file, relative to `index.html`.
- `colors` are the two colors of the generated artwork.
- Optional: add `cover: 'covers/my-song.jpg'` (and create a `covers` folder) to show your own artwork.

Add one line per song. Keep file names simple, without unusual symbols.

## Running the Project

1. Open the `Task-4-Music-Player` folder in VS Code.
2. Install the **Live Server** extension (by Ritwick Dey).
3. Right-click `index.html` and choose **Open with Live Server**.

## Keyboard and Controls

| Control              | What it does                                                                |
| -------------------- | --------------------------------------------------------------------------- |
| Play / Pause button  | Starts or pauses the song                                                   |
| Space bar            | Play / pause when no button is focused                                      |
| Previous             | Restarts the song if it has played more than 3 seconds, otherwise goes back |
| Next                 | Plays the next song                                                         |
| Progress bar         | Click, drag, or use the arrow keys to seek                                  |
| Volume slider / mute | Changes the volume or mutes                                                 |
| Shuffle              | Plays songs in random order without repeating until all have played         |
| Repeat               | Cycles: off, repeat all, repeat current song                                |
| Playlist             | Click a song to play it; click the current song to play or pause            |

## Testing Checklist

- Play, pause, next and previous work
- Progress bar moves while playing; clicking or dragging it seeks
- Current time and total duration are correct
- Volume slider and mute work
- Clicking a playlist song plays it and highlights it
- Shuffle picks random songs; repeat modes behave as described
- A song that ends starts the next one automatically
- A missing file shows "Unavailable" and a clear message, and is skipped during playback
- The layout works on a phone-sized screen

## Notes and Troubleshooting

- **Nothing plays:** check the file names and that the files are in the `songs` folder.
  On Windows, make sure the real name is not `song1.mp3.mp3` (show file extensions in File Explorer).
- **Browser blocks autoplay:** browsers only allow sound after you interact with the page.
  Press the play button once.
- **Volume on iPhone/iPad:** iOS does not let web pages change the volume. Use the device buttons.
- **Formats:** this project is written for MP3 files.
- **Publishing online (for example GitHub Pages):** your MP3 files become public. Only publish
  music you have the rights to share. GitHub also limits individual file sizes.

## Technologies

HTML5 audio element, CSS3 (Grid, Flexbox, custom properties, animations), vanilla JavaScript.

## Credits

Created as part of the CodeAlpha Web Development Internship, Task 4.
