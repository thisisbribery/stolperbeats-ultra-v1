# STOLPERBEATS ULTRA flasher

> **Unofficial, modified firmware. Use it entirely at your own risk.** The author accepts no responsibility for any damage, malfunction, lost patterns or settings, or warranty issues that may result.

Mods by **Bribery** ([@thisisbribery](https://www.instagram.com/thisisbribery/)).

A browser tool that adds alt swing tables and new features to **your own copy** of the official Stolperbeats firmware 163, then flashes it over USB.

**[Open the flasher](https://thisisbribery.github.io/stolperbeats-ultra-v1/)**

No firmware is hosted here. You load the official `_MSM_stolperbeats_hw_rev4-163.bin` from [Making Sound Machines](https://makingsoundmachines.com/firmware/), pick your tables and mods, and the page writes a modified copy in your browser. Nothing is uploaded.

## Swing tables

Any of the four Timing buttons (Trip, Shake, Push, Clave) can play:

- its own factory table, or another button's factory table
- an alt table from the [Stolperbeats visualiser](https://thisisbribery.github.io/stolperbeats_v2/): HOPP, DEEP, SQEZ, CLSTR, FOLD
- your own Timings saved in the visualiser's CREATOR (same browser, they appear under **Yours**)
- a `.timing.json` you upload (the CREATOR's Export, or a Download tables JSON)

Every table must keep the module's rules: whole ticks, 16 to 36 ticks per beat in steps of 4, every step at least 1 tick, and the half bar's 8 steps adding up to 2N. Anything else is refused.

## Mods

| Mod | What it does | Controls |
| --- | --- | --- |
| Ratchets | 1 to 4 hits per step on any track, on whole ticks inside the step | In Pattern Edit, turn **Shuffle** to set the cursor step's ratchet |
| Pitch mode | A MIDI note per step, ±24 semitones (MIDI out only) | In Pattern Edit, hold **Tap** and turn a track's encoder |
| Fill mode | Five levels of fill on Kick, Snare and Hihat 1, on demand | **Linear + Tap** toggles Fill mode (the Shuffle LEDs breathe while it's on). **Tap** fires a fill, hold to keep going. **Hold Tap + turn Shuffle** picks the level |
| Fill CV gate | Pattern CV 6 becomes a Fill gate while Fill mode is on | Rising gate fires a fill, held high keeps it going (on above about 1.5 V, off below about 1 V) |

Ratchets and pitch are saved to `PatternExtNNN.txt` next to each `PatternBankNNN.txt` on the SD card when the module saves (on Stop), and load at power on. The visualiser programs and exports the same format. Fill mode and its level are saved in `MachineState.txt` (needs `WRITE_MACHINE_STATE` on).

## Safety checks

- The input must match the SHA-256 of official firmware 163 (`c04df924…befa34`) and hold the factory Timing tables. Anything else is refused.
- The code mods are checked against the expected SHA-256 for that exact combination (all 12 are in `mods.js`). If they don't match, the download is blocked.
- Table writes are checked to land only inside the Timing tables.
- USB flashing erases only the sectors it needs, reads everything back and compares it byte for byte.

## What's been tested

- Everything has been tested on my own Stolperbeats: all five alt tables, ratchets, pitch, fill mode and the fill CV gate. With all four mods on, the code is byte for byte the build that runs on my module; with Push = DEEP and Clave = SQEZ the whole file is identical to it.
- The only thing not tried on hardware is a build with only some of the mods. Those builds add nothing new: leaving a mod out puts the firmware's own original call back, or flips one of seven small switches in the engine that skips that mod's part. Every combination was checked by running the module's own code in a Cortex-M7 emulator: ratchet hits, MIDI notes, Fill on and off, the CV 6 gate, and fills that play the same in every build.

## Known differences

- Ratchets: in Pattern Edit the Shuffle encoder sets ratchets instead of changing the shuffle.
- Pitch: in Pattern Edit, Tap shows the step's pitch instead of tapping the tempo.
- Fill: Linear + Tap switches Fill mode. While Fill mode is on, tap tempo is off (the tempo encoder still works).

## Rollback

Flash your original `_MSM_stolperbeats_hw_rev4-163.bin` (the page's **Flash official file** button does this). The STM32 bootloader is in ROM, so a bad flash can always be undone.

## Files

- `index.html`: the flasher (no build step, no dependencies)
- `builder.js`: the build logic (tables and mods), shared with the test scripts
- `mods.js`: the added code, the call sites, the switches and the reference hashes
- `assets/`: the coin and icons

## Disclaimer

Stolperbeats is designed and made by [Making Sound Machines](https://makingsoundmachines.com/stolperbeats/), and all rights in the module, its firmware and its documentation remain theirs. STOLPERBEATS ULTRA is an unofficial, community modification for education. It isn't affiliated with, endorsed by or supported by Making Sound Machines. Please don't contact them for help with modified firmware; flash the official firmware first if you need support. Use entirely at your own risk; flashing modified firmware may affect your warranty.
