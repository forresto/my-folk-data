# folk-tyyppi-lantern's folk-data

This directory holds user data — programs for printed AprilTag cards and local utility programs.

## Directory structure

```
folk-data/
  program/          # Programs tied to printed AprilTag cards (by tag ID)
    0.folk          # Runs when tag 0 is detected; $this == 0
    0.meta.folk     # Optional: geometry override for tag 0
    1.folk
  local-program/    # Utility programs not tied to a specific card
    is-a-knob.folk      # Makes any tag act as a physical knob
    results-table.folk  # Displays a table of entity claims on a card
```

## Printed card programs (`program/N.folk`)

`$this` is the tag ID (integer). The program runs whenever the card is detected.

To make a card act as a knob:
```tcl
# program/0.folk
Claim $this is a knob
```

## Geometry

Default card geometry: `{tagSize 26mm top 46mm right 43mm left 43mm bottom 46mm}`

To override per-card geometry from a program file:
```tcl
Claim tag $this has geometry {tagSize 26mm top 25mm right 25mm left 180mm bottom 120mm}
```

Or from a `program/N.meta.folk` file (same syntax).

Resolved geometry is available as `$tag has resolved geometry /geom/` where `$geom` is a dict
with keys `tagSize left right top bottom width height` — all in meters (not mm).

## Drawing onto cards (canvas API)

Use the `onto $tag` canvas API. Coordinates are in **meters** from the top-left of the card.

```tcl
# Circle centered on card
When $tag has resolved geometry /geom/ {
  set cx [expr {[dict get $geom width] / 2.0}]
  set cy [expr {[dict get $geom height] / 2.0}]
  Wish to draw a circle onto $tag with center [list $cx $cy] radius 0.02 color red
}

# Polygon via line points (no polygon primitive exists)
Wish to draw a line onto $tag with points $pts width 0.003 color green

# Text
Wish to draw text onto $tag with position [list $cx $cy] text "hello" scale 0.01 anchor center color white
```

### Why NOT the old shapes API

`Wish $tag draws a hexagon` — the shapes.folk handler requires `$tag has region`, which is
**never automatically set for printed program cards**. It silently does nothing. Use the
`onto $tag` canvas API instead.

## Physical knob values (`is-a-knob.folk`)

`local-program/is-a-knob.folk` watches for any tag where `Claim /tag/ is a knob` and publishes:

```
knob $tag x $x          # display-normalized, -1.0 to 1.0
knob $tag y $y          # display-normalized, -1.0 to 1.0
knob $tag rotation $rot # radians (atan2), 0 at right, increases clockwise
```

Consuming knob values from another program:
```tcl
When knob 0 x /density/ & knob 1 rotation /angle/ & knob 2 y /scale/ {
  # use $density, $angle, $scale
}
```

The x/y origin is the display center. Values are computed from the camera quad projection
pipeline: `quadLib vertices` → `poseLib project` with display intrinsics → average pixel
position → normalize by display dimensions.

## Pattern matching gotchas

### `When /tag/ is a knob` vs `When tag /tag/ is a knob`

These are completely different patterns:
- `When /tag/ is a knob` — matches `Claim 0 is a knob` (tag ID is first word)
- `When tag /tag/ is a knob` — matches `Claim tag 0 is a knob` (literal "tag" is first word)

## Useful commands

```sh
# Deploy to remote device
make remote FOLK_REMOTE_NODE=folk-tyyppi-lantern.local

# SSH into pi
ssh folk@folk-tyyppi-lantern.local

# Save wifi credentials for future venues
nmcli device wifi connect "VenueSSID" password "venuepassword"

# Watch logs
journalctl -u folk -f

# Find log files
find /tmp/folk* -maxdepth 2 -type f -size +0c -ls 2>/dev/null

# Camera focus (actually mess with LensPosition in ~/folk/builtin-programs/camera/rpi.folk)
sudo systemctl stop folk
rpicam-still --autofocus-mode auto -t 3000 -o photo.jpg
sudo systemctl start folk
v4l2-ctl -d /dev/v4l-subdev3 --set-ctrl=focus_absolute=977
```
