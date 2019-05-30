CONTENTS:
  LPC-DIRECTIVE INSTANCES & ISOLATE SCOPE
  DIMENSIONS FOR LPC-DIRECTIVE INSTANCES
  BEACH-SCENE MESH CLASS GROUPS AND Z-INDICES


===========================================
LPC-DIRECTIVE INSTANCES & ISOLATE SCOPE
---------------------------------------
Currently we have 4 instances of the lpc-directive.
They are:

  profiles: state/root/profiles/card-templates/settings/card-settings.html

  free: state/root/free-play/free-play_template.html

  tutorial: state/root/tutorial/partialTemplates/default.html

  pract-dir: common-components/practice-directive/practice-directive_template.html

---------------------------------------
Optional isolate scope props for lpc-directive instances.
(NOTE: I definitely don't know what all of these do. I have annotated the ones that I have used. -hc)

  active      x ???
  beach       x
  hideBtn     x legacy - not in use
  probe       x
  rate        x
  reset       x legacy - not in use
  slider      x legacy - not in use
  tutorial    x probably legacy
  type        x
  waveHidden  x

---------------------------  
---------------------------
active: ???
  idk what this does

  Instances:
    free play   active="lpcActive"
    pract-dir   --
    profiles    --
    tutorial    --


  ---------------------------
  beach: T/F  Default: false.
  Flag for lpc-renderer script to create mesh elements.

  false: renderer returns only the wave.
  true: renderer returns the beach scene with Slider, Pause/Play, Reset, etc.

  Instances:
    free play   true
    pract-dir   true
    profiles    false
    tutorial    false


  ---------------------------
  hideBtn: T/F 	(NOT IN USE)
  This seems to be legacy code. There are Show/Hide Wave btns in the lpc-directive template, but they have been commented out. Perhaps they were used to toggle the wave's visibility while in a session. (This is different from the 'waveHidden' prop, which allows users to select 'high tide/isFeedbacking' or 'low tide' mode at the outset of a Quest practice session. )

  Instances:
    free play   --
    pract-dir   true
    profiles    --
    tutorial    --


---------------------------
probe: T/F
  As it relates to the lpc-directive, it seems like 'probe' is used as another word for 'Quiz'. (!probe = 'Quest'). The 'probe' value comes from
  either the words_controller (probe="false") or the auto_controller (probe="true") to the practice-directive.
  During Quiz states, only the rating buttons are returned by the lpc-directive.

  Instances:
    free play   --
    pract-dir   probe="probe"
    profiles    --
    tutorial    --


---------------------------
rate: "isPracticing"
  This is a flag to include the rating buttons. (IMO, the rate btns shouldn't be part of the lpc-directive at all. They are used only by practice-directive instances, and so it would probably make more sense to move them to the practice directive template.)

  Instances:
    free play   --
    pract-dir   rate="isPracticing"
    profiles    --
    tutorial    --

---------------------------
reset: T/F 	(NOT IN USE)

  NOTE: The addition of 'beach' eliminated the need for this prop.
  It used to return the LPC with the reset btn.

  Instances:
    free play   true
    pract-dir   true
    profiles    --
    tutorial    --


---------------------------
slider: T/F 	(NOT IN USE)

  NOTE: The addition of 'beach' eliminated the need for this prop.
  It used to return the LPC with slider.  (default is true)

  Instances:
    free play   true
    pract-dir   true
    profiles    false
    tutorial    false


---------------------------
tutorial: T/F
  I suspect this was originally used for conditional styling - like to make the wave-container small in Tutorial. I do not believe it effects the current lpc-instance, which inherits its size from its containing block in the parent state template.

  Instances:
    free play   false
    pract-dir   false
    profiles    false
    tutorial    true


---------------------------
type: ??? I'm not sure how/if the lpc-directive uses this prop.
  values: 'Syllable' || 'Word'
  These values come from either the words_controller or the auto_controller to the practice-directive. (The practice-directive definitely uses these, but I'm not sure how/if the lpc-directive would use them.)

  Instances:
    free play   --
    pract-dir   type="type"
    profiles    --
    tutorial    --


---------------------------
waveHidden: "isFeedbacking" || "forceWaveHidden"  
(default is "isFeedbacking")
  This value is set in the words_controller config screen.
  'isFeedbacking' means the 'high tide' scene with the wave will load. 'forceWaveHidden' means the 'low tide' scene with the birds & kites will be displayed. In other words, for 'forceWaveHidden' the lpc-directive only returns the rating buttons.

  Instances:
    free play   --
    pract-dir   "forceWaveHidden || isFeedbacking"
    profiles    --
    tutorial    --




===========================================
DIMENSIONS FOR LPC-DIRECTIVE INSTANCES
---------------------------------------
The wave should always be drawn at the 2:1 aspect ratio.
This allows the freqScale value from the AudioPlugin to show on the 0-4500hz section of the spectrum on the canvas. (For example, if you set freqScale = 1, you will see the entire spectrum and not just the speech-relevant frequencies.)

In beachScene, there are 2 sets of dimensions.
dim.canvas = 3:1, holds the entire THREEjs sketch
  col_W * 12, row_H * 4

dim.graph = 2:1, boundaries for the wave drawing
  col_W * 7, row_H * 3.5

To bring out the peaks (stretch the y-axis by 0.5 * row_H), the Audio plugin data's xPos values are mapped (linScaled) to dim.canvas.top and dim.canvas.top, and offset by -0.25 * row_H.

everything was designed on a 12:6 grid of 1024px x 748px
col_W = ~85.33
row_H = 128 (compiled ~124)


===========================================
BEACH-SCENE MESH CLASS GROUPS AND Z-INDICES
---------------------------------------

sliderGroup: 7 in scene
  holds star and needle

---
bubBtnGroup: 6 in scene
  holds pause/play btn meshes

---
graphicsGroup: 2 in scene

  PostLeftGroup: 5 in graphicsGroup
    postSmallGroup: 5
    resetBtnGroup: 7

  PostRight
    fzSignGroup:  7 in graphicsGroup
    ropeGroup:    6 in graphicsGroup
    postBigGroup: 5 in graphicsGroup

  FoamGroup:      4 in graphicsGroup

  RightTailGroup: 3 in graphicsGroup

---
peaksGroup: 1 in scene

---
waveGroup: 0 in scene
