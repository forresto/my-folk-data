# /upload media and print a program

Implementing this in ~/folk-data as a proof-of-concept first, with a mind to share it to ~/folk/builtin-programs eventually.

* Raster image, animated gif. 
* SVG
* Audio
* Video

## web-upload.folk

Go to your folk on the web /upload from a desktop or phone browser and select a file.

On submitting the form...

The file is saved to ~/folk-data/uploads
  Save as `${md5hash}.${ext}` so the same file contents uploaded twice won't be duplicated in the uploads folder.
  Keep a reference to the original filename.

A new program is created and printed with a reference to the media file
  Print hint from new.folk: `ws.send(tcl`Notify: print code ${code}`);`)
  
Draft printed code:
```folk
Wish $this is upload ... # (key, the unique filename)
Wish $this is labelled "original filename.mp4"
```

The web form shows the printed program AprilTag at the top of the page, making the device a temporary tag.

See web patterns: folk/builtin-programs/web

## is-upload.folk

See folk/builtin-programs/draw/image.folk and gif.folk for drawing an image.
Don't implement video, audio, SVG on the first pass.

## Future ideas

Printed program enhancements
  Light monochrome version of the image with the program.
  For GIF and video files, a grid of frames that fit.
  For audio, a waveform.

Add a text field to the web form that takes a web address. Pass that yt-dlp to extract an mp4.
