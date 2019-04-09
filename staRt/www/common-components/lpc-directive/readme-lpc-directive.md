LPC-DIRECTIVE INSTANCES & ISOLATE SCOPE
---------------------------------------
Currently we have 4 instances of the lpc-directive.
They are:

  profiles: state/root/profiles/card-templates/settings/card-settings.html

  free: state/root/free-play/free-play_template.html

  tutorial: state/root/tutorial/partialTemplates/default.html

  pract-dir:

  <lpc-directive
   probe="probe"
   slider="true"
   rate="isPracticing"
   reset="true"
   tutorial="false"
   type="type"
   wave-hidden="forceWaveHidden || isFeedbacking"
   hide-btn="true"
   beach="true">
  </lpc-directive>

  ---------------------------
  active: #???

  Instances:
    free play   active="lpcActive"
    pract-dir   --
    profiles    --
    tutorial    --

  ---------------------------
  probe: "probe" ???  idk what this does. probably something w/ the practice-directive

  Instances:
    free play   --
    pract-dir   probe="probe"
    profiles    --
    tutorial    --

  ---------------------------
  slider: T/F 	creates LPC with slider  (default is true)

  Instances:
    free play   true
    pract-dir   true
    profiles    false
    tutorial    false

  ---------------------------
  reset: T/F 		adds Reset Target btn
  TO REMOVE

  Instances:
    free play   true
    pract-dir   --
    profiles    --
    tutorial    --

  ---------------------------
  rate: "isPracticing" ???  idk what this does. practice-directive?

  Instances:
    free play   --
    pract-dir   --
    profiles    --
    tutorial    --

  ---------------------------
  hideBtn: T/F 	adds the Show/Hide Wave btn

  Instances:
    free play   --
    pract-dir   --
    profiles    --
    tutorial    --

  ---------------------------
  waveHidden: "isFeedbacking" idk what this does. practice-directive?

  Instances:
    free play   --
    pract-dir   --
    profiles    --
    tutorial    --


  ---------------------------
  tutorial: T/F
  #??? Perhaps this was originally used for conditional styles - like to make the wave-container small.

  Instances:
    free play   false
    pract-dir   --
    profiles    --
    tutorial    true


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
